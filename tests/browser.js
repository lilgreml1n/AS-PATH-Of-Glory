// Plays the built game in headless Firefox, driven over Firefox's Marionette port (no geckodriver, no npm packages).
// Part A: the untouched index.html with real key presses. Part B: a copy with one added line that exposes game
// state, used for real mouse input, a real-time incident fix, and a bot that plays a whole run by itself.
// Needs Firefox and Node 18+. Takes about 8 minutes. Screenshots go to tests/shots/ (git-ignored).
// Run: node tests/browser.js
const fs = require('fs'), http = require('http'), path = require('path'), { spawn } = require('child_process');
const REPO = process.argv[2] || path.join(__dirname, '..'), OUT = path.join(__dirname, 'shots'), PORT = 8791;
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const index = () => fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
const HOOK = 'requestAnimationFrame(frame);\n})();';
const hooked = () => {
  let s = index();
  if (!s.includes(HOOK)) throw new Error('hook point missing');
  s = s.replace(HOOK, 'globalThis.__ev = s => eval(s);\n' + HOOK);
  return s.replace('<script>', '<script>window.__errs = []; addEventListener("error", e => __errs.push(e.message + " @" + e.lineno)); addEventListener("unhandledrejection", e => __errs.push("rejection: " + e.reason));</script>\n<script>');
};
const server = http.createServer((q, r) => { r.setHeader('content-type', 'text/html; charset=utf-8'); r.end(q.url.startsWith('/hooked') ? hooked() : index()); }).listen(PORT, '127.0.0.1');

// minimal Marionette client: "<length>:<json>" frames over TCP; commands are [0, id, name, params], replies [1, id, error, result]
const net = require('net'), os = require('os');
let sock, buf = Buffer.alloc(0), nextId = 1; const waiting = new Map();
function onData(d) {
  buf = Buffer.concat([buf, d]);
  for (;;) {
    const c = buf.indexOf(58); if (c < 0) return;
    const len = +buf.slice(0, c).toString(); if (buf.length < c + 1 + len) return;
    const msg = JSON.parse(buf.slice(c + 1, c + 1 + len).toString()); buf = buf.slice(c + 1 + len);
    if (Array.isArray(msg) && msg[0] === 1) { const w = waiting.get(msg[1]); waiting.delete(msg[1]); if (w) { if (msg[2]) w.rej(new Error(`${msg[2].error}: ${msg[2].message}`)); else w.res(msg[3]); } }
  }
}
const cmd = (name, params = {}) => new Promise((res, rej) => { const id = nextId++; waiting.set(id, { res, rej }); const j = JSON.stringify([0, id, name, params]); sock.write(`${Buffer.byteLength(j)}:${j}`); });
const connect = () => new Promise((res, rej) => { const s = net.connect(2828, '127.0.0.1'); s.once('connect', () => { sock = s; s.on('data', onData); res(); }); s.once('error', rej); });
const js = async (script, args = []) => (await cmd('WebDriver:ExecuteScript', { script, args })).value;
const shot = async name => { fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from((await cmd('WebDriver:TakeScreenshot', { full: false })).value, 'base64')); };
const nav = url => cmd('WebDriver:Navigate', { url });
const rect = (width, height) => cmd('WebDriver:SetWindowRect', { width, height });
const K = { Enter: '', Left: '', Up: '', Right: '', Down: '', Esc: '' };
// seq: array of ['down'|'up', key] or ['pause', ms]
const keys = seq => cmd('WebDriver:PerformActions', { actions: [{ type: 'key', id: 'kb', actions: seq.map(([t, v]) => t === 'pause' ? { type: 'pause', duration: v } : { type: t === 'down' ? 'keyDown' : 'keyUp', value: v }) }] });
const tap = (k, gap = 60) => [['down', k], ['pause', 40], ['up', k], ['pause', gap]];
const canvasSig = () => js(`const d = document.getElementById('game').toDataURL(); let h = 0; for (let i = 0; i < d.length; i += 97) h = (h * 31 + d.charCodeAt(i)) | 0; return h + ':' + d.length;`);
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info !== '' ? '  [' + info + ']' : ''}`); };

const BOT = `
(function () {
  const ev = window.__ev, W = 960;
  const B = window.__bot = { log: [], t0: performance.now(), sig: '', ticks: 0, events: {}, states: {}, maxWave: 0, shops: 0, buys: 0, games: 0, assists: 0, botErrs: [], held: {}, bombsFired: 0, throws: 0 };
  const seen = new WeakSet();
  const down = (code, key = '') => window.dispatchEvent(new KeyboardEvent('keydown', { code, key }));
  const up = code => window.dispatchEvent(new KeyboardEvent('keyup', { code }));
  const hold = (code, on) => { if (!!B.held[code] === on) return; B.held[code] = on; if (on) down(code); else up(code); };
  const wdx = (a, b) => { let d = b - a; if (d > W / 2) d -= W; if (d < -W / 2) d += W; return d; };
  let lastFlap = 0, lastThrow = 0, lastBomb = 0, lastShop = 0, shopStep = 0, lastEnter = 0, prevState = null, prevCredits = 0;
  B.timer = setInterval(() => { try {
    const now = performance.now(); B.ticks++;
    const s = ev('({ state, paused, wave, lives, score, credits, bombs, bridge, shopT, lanceCap, pops, P: player && { x: player.x, y: player.y, vy: player.vy, g: player.grounded, dead: player.dead, l: player.lances, root: player.root, zerog: player.zerog, grab: !!player.grab, face: player.face, mat: player.mat }, en: enemies.map(e => ({ x: e.x, y: e.y, boss: !!e.boss, st: e.state })), eggs: eggs.map(e => ({ x: e.x, y: e.y })), pk: pickups.map(e => ({ x: e.x, y: e.y })), inc: incidents.map(e => ({ x: e.x, y: e.y })), th: thrown.filter(L => !L.flying).map(e => ({ x: e.x, y: e.y })) })');
    for (const p of s.pops) if (!seen.has(p)) { seen.add(p); const k = p.text.replace(/[+×]?\\d[\\d,.]*/g, '#').trim(); B.events[k] = (B.events[k] || 0) + 1; }
    B.states[s.state] = (B.states[s.state] || 0) + 1; B.maxWave = Math.max(B.maxWave, s.wave);
    const sig = s.state + ' wave ' + s.wave; if (sig !== B.sig) { B.sig = sig; B.log.push(Math.round((now - B.t0) / 1000) + 's ' + sig); }
    if (s.state !== prevState) { if (s.state === 'shop') { B.shops++; shopStep = 0; } if (s.state === 'over') B.games++; prevState = s.state; }
    if (s.state === 'shop' && s.credits < prevCredits) B.buys++;
    prevCredits = s.credits;
    if (s.state !== 'play') { hold('ArrowLeft', false); hold('ArrowRight', false); }
    if (s.state === 'title' || s.state === 'over' || s.state === 'win') { if (now - lastEnter > 700) { lastEnter = now; down('Enter'); } return; }
    if (s.state === 'shop') {
      if (s.shopT < 0.6 || now - lastShop < 300) return;
      lastShop = now;
      if (shopStep < 12) down(shopStep % 2 === 0 ? 'Space' : 'ArrowRight'); else down('Space');
      shopStep++; return;
    }
    const P = s.P; if (!P || P.dead || P.mat > 0 || s.paused) { hold('ArrowLeft', false); hold('ArrowRight', false); return; }
    if (s.lives < 2) { ev('lives = 3'); B.assists++; }
    if (P.grab) { if (now - lastFlap > 60) { lastFlap = now; down('Space'); } return; }
    const fly = s.en.filter(e => e.st === 'fly');
    const near = (list) => { let b = null, bd = 1e9; for (const t of list) { const d = Math.hypot(wdx(P.x, t.x), t.y - P.y); if (d < bd) { bd = d; b = t; } } return b && { ...b, d: bd }; };
    const threat = near(fly);
    let tx = W / 2, ty = 250, stop = false;
    if (threat && (P.root > 0 || threat.d < 230)) {
      const dx = wdx(P.x, threat.x);
      if (P.root > 0) { tx = threat.x; ty = threat.y; }
      else if (P.y > threat.y + 30 && Math.abs(dx) < 80) { tx = P.x - Math.sign(dx || 1) * 220; ty = threat.y - 40; }
      else { tx = threat.x; ty = threat.y - 26; }
    } else {
      const goals = [...s.pk.map(g => ({ ...g, k: 'pk' })), ...s.inc.map(g => ({ ...g, k: 'inc' })), ...s.eggs.map(g => ({ ...g, k: 'egg' })), ...(P.l < s.lanceCap ? s.th.map(g => ({ ...g, k: 'th' })) : [])];
      const g = near(goals) || (threat && { ...threat, k: 'en' });
      if (g) {
        tx = g.x; const dx = Math.abs(wdx(P.x, g.x));
        if (g.k === 'inc') { ty = dx < 16 ? g.y - 19 : g.y - 70; stop = dx < 16; }
        else if (g.k === 'en') ty = g.y - 26; else ty = g.y - 6;
      }
    }
    if (!s.bridge && P.x > 230 && P.x < 730) ty = Math.min(ty, 440);
    const dx = wdx(P.x, tx);
    hold('ArrowLeft', !stop && dx < -10); hold('ArrowRight', !stop && dx > 10);
    if (P.y > ty + 4 && P.vy > -150 && now - lastFlap > 110 && !(stop && P.g)) { lastFlap = now; down('Space'); }
    if (P.l > 1 && now - lastThrow > 700 && fly.some(e => Math.sign(wdx(P.x, e.x)) === P.face && Math.abs(wdx(P.x, e.x)) < 280 && Math.abs(e.y - (P.y - 8)) < 16)) { lastThrow = now; B.throws++; down('KeyW'); }
    if (s.bombs > 0 && now - lastBomb > 4000 && (fly.length >= 3 || fly.some(e => e.boss))) { lastBomb = now; B.bombsFired++; down('KeyS'); }
  } catch (e) { if (B.botErrs.length < 5) B.botErrs.push(e.message); } }, 16);
})();`;

(async () => {
  const prof = path.join(os.homedir(), 'aspath-ff-prof-tmp'); fs.rmSync(prof, { recursive: true, force: true }); fs.mkdirSync(prof);
  const gd = spawn('firefox', ['--marionette', '--headless', '--no-remote', '--profile', prof], { stdio: 'ignore' });
  try {
    let up = false; for (let i = 0; i < 80 && !up; i++) { try { await connect(); up = true; } catch (e) { await sleep(500); } }
    if (!up) throw new Error('could not reach Marionette on port 2828');
    await cmd('WebDriver:NewSession', {});
    await rect(1100, 860);

    // ---------- Part A: untouched index.html, real key presses ----------
    console.log('--- Part A: untouched index.html, real key presses ---');
    await nav(`http://127.0.0.1:${PORT}/index.html`);
    await js(`window.__errs = []; addEventListener('error', e => __errs.push(e.message + ' @' + e.lineno));`);
    await sleep(1500);
    const dom = await js(`return { title: document.title, legend: document.querySelector('.legend').textContent, pad: [...document.querySelectorAll('#pad button')].map(b => b.textContent), font: document.fonts.check('10px "Press Start 2P"') }`);
    check('page loads with its title', dom.title === 'AS-PATH OF GLORY', dom.title);
    check('legend lists the bomb key', /fire bomb/.test(dom.legend));
    check('touch pad has 5 buttons including BOMB', dom.pad.length === 5 && dom.pad.includes('BOMB'), dom.pad.join(','));
    console.log(`INFO  web font loaded: ${dom.font}`);
    const s1 = await canvasSig(); await sleep(700); const s2 = await canvasSig();
    check('title screen is drawn and animating', s1 !== s2 && +s1.split(':')[1] > 20000, `${s1} -> ${s2}`);
    await shot('a1_title');
    await keys(tap(K.Enter)); await sleep(3200);
    await shot('a2_wave1');
    await keys([['down', K.Right], ...tap(' ', 150), ...tap(' ', 150), ...tap(' ', 150), ...tap('w', 200), ['up', K.Right], ['down', K.Left], ...tap(' ', 150), ...tap(' ', 150), ...tap('w', 200), ['up', K.Left]]);
    await shot('a3_moved');
    const s3 = await canvasSig();
    check('game responds after start, steer, flap and throw', s3 !== s2);
    await keys([...'iamacheetah'].flatMap(c => tap(c, 50))); await sleep(300);
    await shot('a4_cheat');
    await keys(tap('s')); await sleep(120);
    await shot('a5_bomb');
    await keys(tap('p')); await sleep(300); await shot('a6_paused'); await keys(tap('p'));
    await keys(tap('m')); await sleep(200); await shot('a7_muted'); await keys(tap('m'));
    await rect(430, 860); await sleep(500); await shot('a8_narrow');
    const scroll = await js(`return { sw: document.documentElement.scrollWidth, iw: innerWidth, cw: document.getElementById('game').getBoundingClientRect().width }`);
    check('narrow window: no horizontal scroll, canvas fits', scroll.sw <= scroll.iw && scroll.cw <= scroll.iw, JSON.stringify(scroll));
    await rect(1100, 860);
    const errsA = await js('return window.__errs');
    check('no JavaScript errors on the untouched build', errsA.length === 0, errsA.join(' | '));

    if (process.env.QUICK) return; // QUICK=1 stops after Part A
    // ---------- Part B: hooked copy, bot plays in real time ----------
    console.log('--- Part B: bot playthrough on a hooked copy (one added line exposes game state) ---');
    await nav(`http://127.0.0.1:${PORT}/hooked.html`);
    await sleep(1200);
    await js(BOT);
    const stat = () => js(`const B = window.__bot, e = window.__ev; return { t: B.ticks, state: e('state'), wave: e('wave'), waveType: e('waveType'), score: e('score'), lives: e('lives'), credits: e('credits'), bombs: e('bombs'), lanceCap: e('lanceCap'), maxWave: B.maxWave, shops: B.shops, buys: B.buys, games: B.games, assists: B.assists, throws: B.throws, bombsFired: B.bombsFired, events: B.events, states: B.states, errs: window.__errs, botErrs: B.botErrs }`);
    const line = (tag, s) => console.log(`INFO  ${tag}: state=${s.state} wave=${s.wave}(${s.waveType}) score=${s.score} lives=${s.lives} credits=${s.credits} bombs=${s.bombs} errs=${s.errs.length}`);
    const play = async (sec, tag, snap) => { await sleep(sec * 1000); if (snap) await shot(snap); const s = await stat(); line(tag, s); return s; };
    // end the current wave now (test aid): the game then runs its own wave-clear, store and next-wave code
    const clearWave = async (asWave, credits) => { await js(`window.__ev(arguments[0])`, [`enemies = []; spawnQueue = []; eggs = []; boxes = []; wyvern = null; waveTime = 2; nextWaveT = 0;${asWave ? ` wave = ${asWave};` : ''}${credits ? ` credits = Math.max(credits, ${credits});` : ''}`]); };
    const waitFor = async (cond, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await js(`return !!window.__ev(arguments[0])`, [cond])) return true; await sleep(150); } return false; };

    // --- real mouse input, before the bot starts ---
    const cr = await js(`const r = document.getElementById('game').getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }`);
    const at = (gx, gy) => ({ x: Math.round(cr.l + gx / 960 * cr.w), y: Math.round(cr.t + gy / 600 * cr.h) });
    const mouseDo = acts => cmd('WebDriver:PerformActions', { actions: [{ type: 'pointer', id: 'm', parameters: { pointerType: 'mouse' }, actions: acts }] });
    const move = (gx, gy) => ({ type: 'pointerMove', origin: 'viewport', duration: 60, ...at(gx, gy) });
    const click = b => [{ type: 'pointerDown', button: b }, { type: 'pause', duration: 50 }, { type: 'pointerUp', button: b }];
    const E = c => js(`return window.__ev(arguments[0])`, [c]);
    const QUIET = `enemies = []; spawnQueue = []; eggs = []; wyvern = null; waveTime = 0; nextWaveT = 999; incidents = []; incidentT = 999; pickups = []; thrown = []; player.dead = false; player.mat = 0; player.inv = 0; player.x = 60; player.y = 521; player.vx = 0; player.vy = 0; player.grounded = true; player.lances = 5; player.throwCd = 0;`;
    await mouseDo([move(480, 300), ...click(0)]);
    check('mouse: a click on the title screen starts the game', await waitFor(`state === 'play' && wave === 1`, 5000));
    await sleep(1200); await E(QUIET); await mouseDo([move(200, 300), move(420, 300)]); await sleep(400);
    check('mouse: rider flies toward a pointer on its right', await E('player.vx') > 20, await E('Math.round(player.vx)'));
    await E(QUIET); await E('player.x = 700'); await mouseDo([move(500, 300), move(300, 300)]); await sleep(400);
    check('mouse: rider flies toward a pointer on its left', await E('player.vx') < -20, await E('Math.round(player.vx)'));
    await E(QUIET); await mouseDo([move(70, 300), move(62, 300), ...click(0)]); await sleep(80);
    check('mouse: left click flaps', await E('player.grounded === false'));
    await sleep(900); await E(QUIET); await mouseDo([move(64, 300), ...click(2)]); await sleep(120);
    check('mouse: right click throws a lance', await E('player.lances') === 4, await E('player.lances'));
    await E(QUIET); await E('bombs = 2'); await mouseDo([move(64, 300), ...click(1)]); await sleep(120);
    check('mouse: middle click fires a bomb', await E('bombs') === 1, await E('bombs'));
    await mouseDo([move(710 + 58 + 30, 575), ...click(0)]); await sleep(120);
    check('mouse: clicking the BOMB counter fires a bomb', await E('bombs') === 0, await E('bombs'));
    await shot('m1_mouse');
    // --- an incident fixed in real time in the browser ---
    await mouseDo([move(480, 20)]); await js(`document.getElementById('game').dispatchEvent(new PointerEvent('pointerleave'))`);
    await E(QUIET); await E('credits = 0; score = 0; spawnIncident(); player.x = incidents[0].x; player.y = incidents[0].y - 19; player.grounded = true;');
    const need = await E('incidents[0].def.t'), want = await E('({ pts: incidents[0].def.pts, cr: incidents[0].def.cr })');
    await sleep(350); await shot('m2_fixing');
    check('incident: standing on it fixes it in real time for the listed reward', await waitFor(`incidents.length === 0 && credits === ${want.cr} && score === ${want.pts}`, need * 1000 + 2500), `${need}s, ${want.pts} pts, ${want.cr} cr`);
    // --- each power-up picked up in the browser ---
    await E(QUIET); await E(`dropPickup(player.x, player.y, 'zerog'); dropPickup(player.x, player.y, 'root'); dropPickup(player.x, player.y, 'bomb');`); await sleep(300); await shot('m3_powerups');
    check('power-ups: all three collected by touch', await E('player.zerog > 0 && player.root > 0 && bombs === 1 && pickups.length === 0'));
    await E('newGame()'); await sleep(300);

    // --- the bot plays a whole run on its own; nothing is skipped or forced ---
    await js(BOT);
    let st; const t0 = Date.now(); const shots = { 20: 'b1_20s', 70: 'b2_70s', 130: 'b3_130s', 200: 'b4_200s', 270: 'b5_270s' }; let shopShot = false, bossShots = {};
    for (;;) {
      await sleep(1000); const t = Math.round((Date.now() - t0) / 1000);
      const q = await js(`const e = window.__ev; return { state: e('state'), wave: e('wave'), boss: e('(enemies.find(x => x.boss) || {}).boss || ""') }`);
      if (q.state === 'shop' && !shopShot) { shopShot = true; await sleep(700); await shot('b_shop'); }
      if (q.boss && !bossShots[q.boss]) { bossShots[q.boss] = 1; await sleep(1500); await shot('b_boss_' + q.boss); }
      if (q.state === 'win' && !bossShots.win) { bossShots.win = 1; await shot('b_win'); }
      if (shots[t]) { await shot(shots[t]); delete shots[t]; }
      if (t % 30 === 0) { st = await stat(); line(`bot ${t}s`, st); }
      if (t >= 400 || (t >= 240 && q.wave >= 17 && q.state === 'play')) break;
    }
    st = await stat();
    const log = await js('return window.__bot.log');
    console.log('TIMELINE  ' + log.join(' | '));
    const sawShopAfter = n => log.some(l => l.endsWith(`shop wave ${n}`));
    check('bot: reached wave 3 (Elon) and the store opened after it', sawShopAfter(3));
    check('bot: store opened after wave 6 (Bill)', sawShopAfter(6));
    check('bot: store opened after wave 9 (Jeff)', sawShopAfter(9));
    check('bot: beat Jensen on wave 12 and saw the victory screen', log.some(l => l.endsWith('win wave 12')));
    check('bot: store opened after victory, then endless mode began', sawShopAfter(12) && log.some(l => l.endsWith('play wave 13')));
    check('bot: no store after non-boss waves', !log.some(l => /shop wave (1|2|4|5|7|8|10|11|13|14|15)$/.test(l)));
    check('bot: bought things in the store', st.buys > 0, `${st.buys} purchases over ${st.shops} visits`);
    console.log(`INFO  bot run: wave ${st.maxWave}, score ${st.score}, throws ${st.throws}, bombs fired ${st.bombsFired}, life top-ups ${st.assists}, games over ${st.games}`);
    console.log('EVENTS  ' + JSON.stringify(st.events));
    // game over, then restart with a real Enter key
    await js(`clearInterval(window.__bot.timer); for (const c of ['ArrowLeft', 'ArrowRight']) window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); window.__ev('state = "play"; paused = false; nextWaveT = 0; lives = 1; player.dead = false; player.mat = 0; player.inv = 0; killPlayer("lance")')`);
    check('game over screen appears', await waitFor(`state === 'over'`)); await sleep(1600); await shot('b_over');
    await keys(tap(K.Enter));
    const fresh = await waitFor(`state === 'play' && wave === 1 && credits === 0 && bombs === 0 && lanceCap === 5`, 6000);
    check('Enter restarts a fresh run', fresh, JSON.stringify(await E('({ state, wave, credits, bombs, lanceCap, overT, paused })')));
    const fin = await stat();
    check('no JavaScript errors during the whole browser session', fin.errs.length === 0, fin.errs.slice(0, 5).join(' | '));
    check('bot itself ran clean', fin.botErrs.length === 0, fin.botErrs.join(' | '));
  } catch (e) { check('driver completed', false, e.message); }
  finally {
    try { await Promise.race([cmd('Marionette:Quit', { flags: ['eForceQuit'] }), sleep(4000)]); } catch (e) { /* ignore */ }
    try { sock.destroy(); } catch (e) { /* ignore */ }
    gd.kill(); server.close(); await sleep(1500); fs.rmSync(prof, { recursive: true, force: true });
    const f = results.filter(r => !r.ok).length;
    console.log(`\n${results.length - f} passed, ${f} failed`);
    process.exit(f ? 1 : 0);
  }
})();

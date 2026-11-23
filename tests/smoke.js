// Headless smoke run of the real game script (src/game.html) with the browser stubbed: no canvas, no audio.
// It checks rules against README.md and plays 240 s of random input. It is not a substitute for playing in a browser.
// Run: node tests/smoke.js
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(process.argv[2] || path.join(__dirname, '..', 'src', 'game.html'), 'utf8');
let js = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
const hook = 'requestAnimationFrame(frame);\n})();';
if (!js.includes(hook)) throw new Error('hook point not found');
js = js.replace(hook, 'globalThis.__ev = s => eval(s);\n})();');

const handlers = {};
const ctxStub = new Proxy({}, { get: (t, k) => k in t ? t[k] : () => ({ addColorStop() {}, width: 40 }), set: (t, k, v) => { t[k] = v; return true; } });
const canvas = () => ({ width: 0, height: 0, getContext: () => ctxStub, focus() {}, addEventListener(n, f) { handlers['cv:' + n] = f; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 600 }) });
const store = {};
Object.assign(globalThis, {
  document: { getElementById: canvas, createElement: canvas, querySelectorAll: () => [] },
  window: globalThis, matchMedia: () => ({ matches: false }),
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; } },
  addEventListener: (n, f) => { handlers[n] = f; },
  requestAnimationFrame: () => {},
});
(0, eval)(js);
const ev = globalThis.__ev;
const key = (code, k) => handlers.keydown({ code, key: k ?? '', repeat: false, preventDefault() {} });
const run = s => { for (let i = 0; i < Math.round(s * 120); i++) ev('update(1/120)'); ev('render()'); };
let pass = 0, fail = 0;
const check = (name, ok, info = '') => { if (ok) pass++; else fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info !== '' ? '  [' + info + ']' : ''}`); };
// quiet arena: no enemies, wave never ends, player parked on the left floor
const quiet = () => ev(`enemies = []; spawnQueue = []; eggs = []; wyvern = null; waveTime = 0; nextWaveT = 999; incidents = []; incidentT = 999; pickups = [];
  player.dead = false; player.mat = 0; player.inv = 0; player.grab = null; player.x = 60; player.y = 540 - 19; player.vx = 0; player.vy = 0; player.grounded = true;`);
const enemyAt = (x, y, tier = 'bounder') => ev(`enemies.push({ tier: '${tier}', x: ${x}, y: ${y}, w: 34, h: 38, vx: 0, vy: 0, face: 1, grounded: false, state: 'fly', t: 0, flapCd: 9, phase: 0, baseY: 300, dir: 1, turnT: 9, noHit: 0, wingT: 0, run: 0 })`);

ev('render()');
check('title renders', ev('state') === 'title');
key('Enter');
check('game starts on wave 1', ev('state') === 'play' && ev('wave') === 1);
run(2);
check('fresh run has 0 credits, 0 bombs, 5 lances', ev('credits') === 0 && ev('bombs') === 0 && ev('player.lances') === 5);

// --- pickups ---
quiet();
ev(`dropPickup(player.x, player.y, 'bomb'); collisions();`);
check('bomb pickup stores 1 bomb', ev('bombs') === 1 && ev('pickups.length') === 0);
ev(`bombs = 3; score = 0; dropPickup(player.x, player.y, 'bomb'); collisions();`);
check('bomb pickup at 3 bombs pays 500 instead', ev('bombs') === 3 && ev('score') === 500);
ev(`dropPickup(player.x, player.y, 'zerog'); collisions();`);
check('Zero-G pickup starts 8 s', ev('player.zerog') === 8);
ev(`dropPickup(player.x, player.y, 'root'); collisions();`);
check('Root Access pickup starts 6 s', ev('player.root') === 6);
run(0.5);
check('timers count down; gravity multiplier is 0.35', Math.abs(ev('player.root') - 5.5) < 0.02 && ev('player.gm') === 0.35);
ev(`dropPickup(300, 200, 'root')`); run(7.8);
check('uncollected pickup still there at 7.8 s', ev('pickups.length') === 1);
run(0.4);
check('uncollected pickup vanishes after 8 s', ev('pickups.length') === 0);
check('buffs expired on time', ev('player.root') === 0 && ev('player.zerog') === 0 && ev('player.gm') === 1);

quiet(); ev(`dropPickup(200, 350, 'bomb')`); run(7);
check('pickup over the floor settles within reach of a grounded player', ev('pickups[0].rest') === true && ev('pickups[0].y') > 515 && ev('pickups[0].y') < 532, ev('pickups[0].y').toFixed(1));
ev('bridge = false; plats = makePlatforms(false); pickups = [];'); ev(`dropPickup(600, 440, 'bomb')`); run(7);
check('pickup over open lava hovers at 480', ev('pickups[0].rest') === true && Math.abs(ev('pickups[0].y') - 480) < 1, ev('pickups[0].y').toFixed(1));
ev('bridge = true; plats = makePlatforms(true); pickups = [];');
// --- Zero-G fall speed ---
quiet(); ev(`player.x = 480; player.y = 200; player.grounded = false; player.vy = 0;`); run(0.25); const vNormal = ev('player.vy');
quiet(); ev(`player.x = 480; player.y = 200; player.grounded = false; player.vy = 0; player.zerog = 8;`); run(0.25); const vZero = ev('player.vy');
check('Zero-G falls at 35% of normal', Math.abs(vZero / vNormal - 0.35) < 0.02, `${vZero.toFixed(1)} vs ${vNormal.toFixed(1)}`);
ev('bridge = false; plats = makePlatforms(false);');
quiet(); ev(`player.zerog = 8; player.x = 480; player.y = 525; player.grounded = false; player.vy = 0; trollCd = 0;`); run(0.05);
check('Zero-G: lava hand does not grab', ev('player.grab') === null && !ev('player.dead'));
quiet(); ev(`player.zerog = 0; player.x = 480; player.y = 525; player.grounded = false; player.vy = 0; trollCd = 0;`); run(0.05);
check('without Zero-G the lava hand grabs (control)', ev('player.grab') !== null);
quiet(); ev(`player.root = 6; player.x = 480; player.y = 570; player.grounded = false; player.vy = 300;`); run(0.2);
check('Root Access: lava still kills', ev('player.dead') === true);
ev('bridge = true; plats = makePlatforms(true); lives = 4; spawnPlayer();');

// --- Root Access ---
quiet(); ev('score = 0; bombs = 0; player.root = 6; player.lances = 0;'); enemyAt(60, 540 - 19 - 20);
ev('collisions()');
check('Root: touching a higher minion defeats it, even unplugged', !ev('player.dead') && ev('enemies[0].gone') === true && ev('score') === 500, ev('score'));
ev('eggs = []; pickups = []; collisions()');
check('Root: that defeat scores once', ev('score') === 500);
quiet(); ev('score = 0; player.root = 0; player.lances = 5;'); enemyAt(60, 540 - 19 - 20);
ev('collisions()');
check('without Root the higher minion wins (control)', ev('player.dead') === true);
ev('lives = 4; spawnPlayer();'); quiet();
ev(`player.root = 6; wyvern = { x: player.x, y: player.y, vx: 0, vy: 0, w: 52, h: 24, face: 1, t: 0 }; collisions();`);
check('Root: Wyvern contact is harmless and the Wyvern survives', !ev('player.dead') && ev('wyvern') !== null);

// --- bomb ---
quiet(); ev('score = 0; bombs = 1; boxes = [{ x: 500, y: 300, w: 16, h: 14, vx: 0, vy: 0, t: 0 }];');
enemyAt(400, 200, 'bounder'); enemyAt(600, 200, 'hunter'); enemyAt(800, 200, 'shadow');
ev(`enemies.push({ tier: 'shadow', x: 300, y: 500, w: 18, h: 22, vx: 0, vy: 0, face: 1, grounded: true, state: 'walker', t: 0, flapCd: 0, noHit: 0, wingT: 0, run: 0 })`);
ev(`spawnEnemy({ boss: 'elon', hp: 5 }); enemies[enemies.length - 1].state = 'fly';`);
key('KeyS'); ev('update(1/120)');
check('bomb: all minions and the walker gone, boss remains', ev('enemies.length') === 1 && ev('enemies[0].boss') === 'elon');
check('bomb: boss loses 1 HP', ev('enemies[0].hp') === 4);
check('bomb: pays 500+750+1500+250 and 500 for the boss hit', ev('score') === 3500, ev('score'));
check('bomb: no dies dropped, packages cleared, bomb spent', ev('eggs.length') === 0 && ev('boxes.length') === 0 && ev('bombs') === 0);
key('KeyS'); ev('update(1/120)');
check('no bomb left: S does nothing', ev('enemies[0].hp') === 4 && ev('score') === 3500);
ev('credits = 0; enemies[0].hp = 1; enemies[0].noHit = 0; hitBoss(enemies[0], 0);');
check('boss defeat pays 5 credits and drops a power-up', ev('credits') === 5 && ev('pickups.length') === 1);

// --- boss last words ---
quiet(); ev(`parting = null; spawnEnemy({ boss: 'elon', hp: 1 }); enemies[0].state = 'fly'; hitBoss(enemies[0], 0);`);
check('Elon has no last words', ev('parting') === null);
quiet(); ev(`spawnEnemy({ boss: 'jensen', hp: 1 }); enemies[0].state = 'fly'; hitBoss(enemies[0], 0);`);
check('defeated Jensen says "I’ll see you back in the boardroom!"', ev('parting && parting.text') === 'I’ll see you back in the boardroom!');
ev('enemies = []'); run(3.6);
check('the last-words bubble clears after 3.5 s', ev('parting') === null);
ev('pickups = []; credits = 0;');

// --- incidents ---
quiet(); ev('score = 0; credits = 0; spawnIncident();');
const need = ev('incidents[0].def.t'), pts = ev('incidents[0].def.pts'), cr = ev('incidents[0].def.cr');
check('incident spawns on a platform', ev('incidents.length') === 1 && ev('plats.some(p => p.y === incidents[0].y && !p.bridge)'));
ev(`player.x = incidents[0].x; player.y = incidents[0].y - 19; player.grounded = true; player.vx = 0;`);
run(need - 0.1);
check('incident not fixed before its time', ev('incidents.length') === 1 && ev('credits') === 0);
run(0.2);
check('incident fixed: documented points and credits, once', ev('incidents.length') === 0 && ev('score') === pts && ev('credits') === cr, `${ev('score')} pts, ${ev('credits')} cr`);
quiet(); ev('score = 0; credits = 0; spawnIncident(); player.x = wrapX(incidents[0].x + 300);'); ev('incidentT = 999');
run(9.8); check('unattended incident still there at 9.8 s', ev('incidents.length') === 1);
run(0.4); check('unattended incident expires after 10 s with no reward or penalty', ev('incidents.length') === 0 && ev('score') === 0 && ev('credits') === 0 && ev('lives') === 4);
quiet(); ev('wave = 1; incidentT = 0;'); run(0.1); ev('incidentT = 0'); run(0.1);
check('waves 1-5: at most 1 incident', ev('incidents.length') === 1);
ev('wave = 6; incidentT = 0;'); run(0.1); ev('incidentT = 0'); run(0.1);
check('wave 6+: at most 2 incidents, on different platforms', ev('incidents.length') === 2 && ev('incidents[0].plat !== incidents[1].plat'));
ev('wave = 1;');

// --- store ---
quiet(); ev('wave = 2; nextWaveT = 0.01;'); run(0.05);
check('no store after wave 2', ev('state') === 'play' && ev('wave') === 3);
quiet(); ev('wave = 3; credits = 34; bombs = 0; lives = 4; lanceCap = 5; player.lances = 5; nextWaveT = 0.01;'); run(0.05);
check('store opens after boss wave 3', ev('state') === 'shop');
key('Space'); check('buy is ignored for the first 0.4 s', ev('credits') === 34);
run(0.5);
key('Space'); check('buy bomb: -4 credits, +1 bomb', ev('credits') === 30 && ev('bombs') === 1);
key('ArrowRight'); key('Enter'); check('buy Zero-G: queued', ev('credits') === 27 && ev('queued.zerog') === true);
key('Enter'); check('second Zero-G refused', ev('credits') === 27 && ev('shopMsg.text') === 'ALREADY QUEUED');
key('KeyD'); key('Space'); check('buy Root Access: queued', ev('credits') === 22 && ev('queued.root') === true);
key('ArrowRight'); key('Space'); check('buy lance slot: carry 6, hold 6', ev('credits') === 16 && ev('lanceCap') === 6 && ev('player.lances') === 6);
key('ArrowRight'); key('Space'); check('buy bridge patch', ev('credits') === 10 && ev('bridgePatch') === true);
key('ArrowRight'); key('Space'); check('buy 1UP: +1 life', ev('credits') === 0 && ev('lives') === 5);
key('Space'); check('1UP refused with 0 credits', ev('lives') === 5 && ev('shopMsg.text') === 'NEED 10 MORE');
handlers['cv:pointerdown']({ clientX: 100, clientY: 200 }); check('click selects an item', ev('shopSel') === 0 && ev('bombs') === 1);
ev('credits = 4'); handlers['cv:pointerdown']({ clientX: 100, clientY: 200 }); check('second click buys it', ev('bombs') === 2 && ev('credits') === 0);
ev('render()');
key('Escape');
check('leaving the store starts wave 4', ev('state') === 'play' && ev('wave') === 4);
check('bridge patch: bridge is present on wave 4', ev('bridge') === true && ev('plats.some(p => p.bridge)'));
check('queued Zero-G and Root Access start with the wave', ev('player.zerog') === 8 && ev('player.root') === 6);
quiet(); ev('nextWaveT = 0.01;'); run(0.05);
check('wave 5: no store, patch used up, bridge melted', ev('state') === 'play' && ev('wave') === 5 && ev('bridge') === false);
ev('player.lances = 0; killPlayer("lance"); lives = 4;'); run(2.2);
check('respawn restores all 6 lances', ev('player.lances') === 6);

// --- mouse ---
const ptr = (type, x, y, button = 0) => handlers['cv:' + type]({ pointerType: 'mouse', clientX: x, clientY: y, button, preventDefault() {} });
ev('newGame()'); quiet(); ptr('pointermove', 400, 300); run(0.3);
check('mouse right of the rider steers right', ev('player.vx') > 20, ev('player.vx').toFixed(0));
quiet(); ev('player.x = 600'); ptr('pointermove', 300, 300); run(0.3);
check('mouse left of the rider steers left', ev('player.vx') < -20, ev('player.vx').toFixed(0));
quiet(); ptr('pointermove', 65, 300); run(0.3);
check('mouse within 14 px of the rider: no steering', ev('player.vx') === 0);
quiet(); ptr('pointermove', 400, 300); key('ArrowLeft'); run(0.3); handlers.keyup({ code: 'ArrowLeft' });
check('a steer key overrides the mouse until it moves again', ev('player.vx') < 0 && ev('mouse.on') === false);
quiet(); ptr('pointermove', 60, 300); ptr('pointerdown', 60, 300, 0); run(0.05);
check('left click flaps', ev('player.grounded') === false && ev('player.vy') < 0);
quiet(); ev('player.lances = 5; player.throwCd = 0;'); ptr('pointerdown', 60, 300, 2); run(0.05);
check('right click throws a lance', ev('player.lances') === 4 && ev('thrown.length') === 1);
quiet(); ev('thrown = []; bombs = 2;'); ptr('pointerdown', 60, 300, 1); run(0.05);
check('middle click fires a bomb', ev('bombs') === 1);
ptr('pointerdown', 710 + 70, 575, 0); run(0.05);
check('clicking the BOMB counter fires a bomb and does not flap', ev('bombs') === 0 && ev('player.grounded') === true);
handlers['cv:pointerdown']({ pointerType: 'touch', clientX: 60, clientY: 300, button: 0, preventDefault() {} }); run(0.05);
check('a touch tap on the screen during a wave still does nothing', ev('player.grounded') === true);
quiet(); ptr('pointermove', 800, 300); ev('lives = 4; spawnPlayer(); enemies = []; spawnQueue = []; nextWaveT = 999; incidentT = 999;'); run(1.5);
check('a resting mouse does not end respawn protection', ev('player.inv') > 2 && ev('player.vx') === 0, ev('player.inv').toFixed(2));
ptr('pointermove', 801, 300); run(0.2);
check('moving the mouse after respawn steers and ends protection', ev('player.inv') === 0 && ev('player.vx') !== 0);
handlers['cv:pointerleave'](); quiet(); run(0.3);
check('pointer leaving the screen stops mouse steering', ev('player.vx') === 0);

// --- cheat ---
quiet(); ev('bombs = 0; score = 0; hiscore = 1000; hiBefore = 1000;'); const mutedBefore = ev('muted');
for (const c of 'iamacheetah') key('Key' + c.toUpperCase(), c);
check('cheat code gives 5 bombs', ev('bombs') === 5 && ev('cheated') === true);
check('cheat code does not toggle mute', ev('muted') === mutedBefore);
ev('addScore(50000, 0, 0)');
check('cheated run does not raise the high score', ev('hiscore') === 1000);
key('KeyM', 'm'); check('M still mutes normally', ev('muted') === !mutedBefore); key('KeyM', 'm');

// --- random play, all systems live ---
ev('newGame()'); let err = null, shops = 0;
try {
  for (const c of 'iamacheetah') key('Key' + c.toUpperCase(), c);
  for (let f = 0; f < 120 * 240; f++) {
    if (Math.random() < 0.05) key(['Space', 'Space', 'Space', 'KeyW', 'KeyS', 'ArrowLeft', 'ArrowRight', 'Enter'][Math.floor(Math.random() * 8)]);
    if (Math.random() < 0.02) handlers.keyup({ code: Math.random() < 0.5 ? 'ArrowLeft' : 'ArrowRight' });
    if (ev('state') === 'shop') shops++;
    if (ev('lives') < 3) ev('lives = 6');
    ev('update(1/120)'); if (f % 4 === 0) ev('render()');
  }
} catch (e) { err = e; }
check('240 s of random play with rendering: no errors', !err, err ? err.stack.split('\n').slice(0, 3).join(' | ') : `reached wave ${ev('wave')}, score ${ev('score')}, credits ${ev('credits')}, store frames ${shops}`);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

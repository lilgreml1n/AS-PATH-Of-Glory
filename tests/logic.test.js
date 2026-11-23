// Unit tests for the pure rules in src/game.html (the block between "// <logic>" and "// </logic>").
// Expected values come from README.md and CONSTITUTION.md, not from running the game.
// Run: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'game.html'), 'utf8');
const m = src.match(/\/\/ <logic>([\s\S]*?)\/\/ <\/logic>/);
assert.ok(m, 'src/game.html must contain a // <logic> … // </logic> block');
const L = new Function(`'use strict'; //${m[1]}
  return { POWERUPS, DROP_CHANCE, PICKUP_LIFE, MAX_BOMBS, ZEROG_G, INCIDENTS, INCIDENT_LIFE, INCIDENT_DECAY, BOSS_CREDITS, LANCE_CAP, STORE,
    waveKind, shopAfter, incidentCap, pickPowerup, rollDrop, fixStep, whyNot };`)();
const item = key => L.STORE.find(i => i.key === key);
const wallet = over => ({ credits: 99, bombs: 0, lanceCap: 5, queued: {}, bridgePatch: false, ...over });

test('wave schedule: bosses on 3, 6, 9 and Jensen on 12', () => {
  assert.deepEqual(L.waveKind(3), { type: 'boss', bosses: ['elon'] });
  assert.deepEqual(L.waveKind(6), { type: 'boss', bosses: ['bill'] });
  assert.deepEqual(L.waveKind(9), { type: 'boss', bosses: ['jeff'] });
  assert.deepEqual(L.waveKind(12), { type: 'final', bosses: ['jensen'] });
});
test('wave schedule: egg waves every 5th wave, survival on 2, 7, 17', () => {
  for (const n of [5, 10, 15, 25]) assert.equal(L.waveKind(n).type, 'egg', `wave ${n}`);
  for (const n of [2, 7, 17]) assert.equal(L.waveKind(n).type, 'survival', `wave ${n}`);
  assert.equal(L.waveKind(1).type, 'standard');
});
test('wave schedule: endless mode has a boss rematch every 4th wave', () => {
  for (const n of [16, 20, 24, 28]) { const k = L.waveKind(n); assert.equal(k.type, 'boss', `wave ${n}`); assert.equal(k.rematch, true); }
  for (const n of [13, 14, 15, 17]) assert.equal(L.waveKind(n).bosses, undefined, `wave ${n}`);
});
test('store opens after every boss wave and only then', () => {
  for (const n of [3, 6, 9, 12, 16, 20]) assert.equal(L.shopAfter(n), true, `wave ${n}`);
  for (const n of [1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 15]) assert.equal(L.shopAfter(n), false, `wave ${n}`);
});
test('power-ups: Zero-G lasts 8 s at 35% gravity, Root Access 6 s, pickups last 8 s, bombs cap at 3', () => {
  assert.equal(L.POWERUPS.zerog.dur, 8);
  assert.equal(L.ZEROG_G, 0.35);
  assert.equal(L.POWERUPS.root.dur, 6);
  assert.equal(L.PICKUP_LIFE, 8);
  assert.equal(L.MAX_BOMBS, 3);
});
test('drops: a minion drops a power-up 12% of the time', () => {
  assert.equal(L.DROP_CHANCE, 0.12);
  assert.equal(L.rollDrop(0.1199, 0), 'bomb');
  assert.equal(L.rollDrop(0.12, 0), null);
  assert.equal(L.rollDrop(0.99, 0), null);
});
test('drops: the three power-ups are equally likely', () => {
  assert.equal(L.pickPowerup(0), 'bomb');
  assert.equal(L.pickPowerup(0.34), 'zerog');
  assert.equal(L.pickPowerup(0.67), 'root');
  assert.equal(L.pickPowerup(0.9999), 'root');
});
test('incidents: 13 tickets with the documented time, points and credits', () => {
  assert.equal(L.INCIDENTS.length, 13);
  const by = n => L.INCIDENTS.find(i => i.name === n);
  assert.deepEqual([by('ARP POISONING').t, by('ARP POISONING').pts, by('ARP POISONING').cr], [1, 500, 1]);
  assert.deepEqual([by('LOW LIGHT LEVELS').t, by('LOW LIGHT LEVELS').pts, by('LOW LIGHT LEVELS').cr], [1, 500, 1]);
  assert.deepEqual([by('ROGUE DHCP SERVER').t, by('ROGUE DHCP SERVER').pts, by('ROGUE DHCP SERVER').cr], [1.5, 750, 2]);
  assert.deepEqual([by('ROUTING LOOP').t, by('ROUTING LOOP').pts, by('ROUTING LOOP').cr], [2, 1000, 3]);
  assert.deepEqual([by('BGP HIJACK').t, by('BGP HIJACK').pts, by('BGP HIJACK').cr], [2.5, 1500, 3]);
  for (const i of L.INCIDENTS) assert.ok(i.fix && i.t >= 1 && i.t <= 2.5 && i.cr >= 1 && i.cr <= 3, i.name);
});
test('incidents: one at a time, two from wave 6; they expire after 10 s', () => {
  assert.equal(L.incidentCap(1), 1);
  assert.equal(L.incidentCap(5), 1);
  assert.equal(L.incidentCap(6), 2);
  assert.equal(L.INCIDENT_LIFE, 10);
});
test('incidents: progress fills while standing, drains at half speed otherwise, and stays in range', () => {
  assert.equal(L.fixStep(0, 2, true, 0.5), 0.5);
  assert.equal(L.fixStep(1.9, 2, true, 0.5), 2);
  assert.equal(L.fixStep(1, 2, false, 0.5), 0.75);
  assert.equal(L.fixStep(0.1, 2, false, 0.5), 0);
});
test('store: documented prices', () => {
  const prices = Object.fromEntries(L.STORE.map(i => [i.key, i.price]));
  assert.deepEqual(prices, { bomb: 4, zerog: 3, root: 5, lance: 6, bridge: 6, life: 10 });
  assert.equal(L.BOSS_CREDITS, 5);
});
test('store: you need enough credits', () => {
  assert.equal(L.whyNot(item('life'), wallet({ credits: 10 })), null);
  assert.equal(L.whyNot(item('life'), wallet({ credits: 9 })), 'NEED 1 MORE');
  assert.equal(L.whyNot(item('zerog'), wallet({ credits: 0 })), 'NEED 3 MORE');
});
test('store: limits — 3 bombs, 7 lances, one queued Zero-G / Root Access / bridge patch', () => {
  assert.equal(L.whyNot(item('bomb'), wallet({ bombs: 2 })), null);
  assert.equal(L.whyNot(item('bomb'), wallet({ bombs: 3 })), 'BOMBS FULL');
  assert.equal(L.LANCE_CAP, 7);
  assert.equal(L.whyNot(item('lance'), wallet({ lanceCap: 6 })), null);
  assert.equal(L.whyNot(item('lance'), wallet({ lanceCap: 7 })), 'MAXED OUT');
  assert.equal(L.whyNot(item('root'), wallet({ queued: { root: true } })), 'ALREADY QUEUED');
  assert.equal(L.whyNot(item('zerog'), wallet({ queued: { root: true } })), null);
  assert.equal(L.whyNot(item('bridge'), wallet({ bridgePatch: true })), 'ALREADY QUEUED');
});

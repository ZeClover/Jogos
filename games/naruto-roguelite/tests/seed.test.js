import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SeedManager, generateSeedString } from '../src/engine/seed.js';

test('mesma seed mestre + mesmo nome de stream = mesma sequência', () => {
  const a = new SeedManager('RUN-SEED-1');
  const b = new SeedManager('RUN-SEED-1');
  const seqA = [a.stream('combat').float(), a.stream('combat').float()];
  const seqB = [b.stream('combat').float(), b.stream('combat').float()];
  assert.deepEqual(seqA, seqB);
});

test('streams diferentes na mesma seed mestre são independentes', () => {
  const manager = new SeedManager('RUN-SEED-2');
  const mapFirst = manager.map.float();
  const combatFirst = manager.combat.float();
  const lootFirst = manager.loot.float();
  const eventFirst = manager.event.float();
  const values = [mapFirst, combatFirst, lootFirst, eventFirst];
  assert.equal(new Set(values).size, values.length, 'streams não deveriam colidir');
});

test('a mesma stream (por nome) é reaproveitada, não recriada, dentro do manager', () => {
  const manager = new SeedManager('RUN-SEED-3');
  const first = manager.map;
  const second = manager.map;
  assert.equal(first, second, 'stream() deve cachear por nome');
  assert.equal(first.callCount, 0);
  first.float();
  assert.equal(manager.map.callCount, 1, 'estado deve persistir entre acessos');
});

test('seeds mestre diferentes produzem sequências diferentes na mesma stream nomeada', () => {
  const a = new SeedManager('SEED-A').stream('loot').float();
  const b = new SeedManager('SEED-B').stream('loot').float();
  assert.notEqual(a, b);
});

test('streams nomeadas customizadas (ex: por boss) funcionam e são determinísticas', () => {
  const a = new SeedManager('RUN-SEED-4').stream('boss:BOSS_ZABUZA_001').float();
  const b = new SeedManager('RUN-SEED-4').stream('boss:BOSS_ZABUZA_001').float();
  assert.equal(a, b);
});

test('generateSeedString produz strings não vazias e plausivelmente únicas', () => {
  const seeds = new Set(Array.from({ length: 20 }, () => generateSeedString()));
  assert.ok(seeds.size > 1, 'deveria gerar seeds variadas');
  for (const seed of seeds) {
    assert.ok(typeof seed === 'string' && seed.length > 0);
  }
});

test('debugState reporta as streams já criadas', () => {
  const manager = new SeedManager('RUN-SEED-5');
  manager.map.float();
  manager.combat.float();
  const state = manager.debugState();
  assert.equal(state.masterSeed, 'RUN-SEED-5');
  const names = state.streams.map((s) => s.name).sort();
  assert.deepEqual(names, ['combat', 'map']);
});

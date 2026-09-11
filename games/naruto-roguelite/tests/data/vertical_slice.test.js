import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../../src/data/catalog/index.js';
import { enemies, bosses } from '../../src/data/index.js';
import { VERTICAL_SLICE_ENCOUNTERS } from '../../src/data/vertical_slice.js';

test('o roteiro do Vertical Slice tem ids únicos', () => {
  const ids = VERTICAL_SLICE_ENCOUNTERS.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('todo enemyId referenciado existe no catálogo de Inimigos ou Bosses', () => {
  for (const encounter of VERTICAL_SLICE_ENCOUNTERS) {
    for (const enemyId of encounter.enemyIds) {
      const exists = enemies.has(enemyId) || bosses.has(enemyId);
      assert.ok(exists, `${encounter.id}: enemyId desconhecido "${enemyId}"`);
    }
  }
});

test('o último encontro é o boss Zabuza, e é o único marcado isBoss', () => {
  const bossEncounters = VERTICAL_SLICE_ENCOUNTERS.filter((e) => e.isBoss);
  assert.equal(bossEncounters.length, 1);
  assert.equal(VERTICAL_SLICE_ENCOUNTERS.at(-1).isBoss, true);
  assert.deepEqual(VERTICAL_SLICE_ENCOUNTERS.at(-1).enemyIds, ['BOSS_ZABUZA_001']);
});

test('todo encontro tem nome e descrição não vazios', () => {
  for (const encounter of VERTICAL_SLICE_ENCOUNTERS) {
    assert.ok(encounter.name?.length > 0, `${encounter.id} sem nome`);
    assert.ok(encounter.description?.length > 0, `${encounter.id} sem descrição`);
  }
});

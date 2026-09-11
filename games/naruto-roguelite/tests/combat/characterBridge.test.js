import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createCombatantFromCharacter, computeSquadCost, isSquadWithinBudget,
} from '../../src/engine/combat/characterBridge.js';
import { POSITIONS } from '../../src/engine/enums.js';

const NARUTO_FIXTURE = {
  id: 'CHAR_FIXTURE_NARUTO_001',
  name: 'Naruto (fixture)',
  squadCost: 2,
  stats: { hpMax: 128, chakraMax: 118, taijutsu: 32 },
  exclusiveResource: { id: 'clones', name: 'Clones', max: 5 },
};

const SASUKE_FIXTURE = {
  id: 'CHAR_FIXTURE_SASUKE_001', name: 'Sasuke (fixture)', squadCost: 2, stats: { hpMax: 105 },
};

test('createCombatantFromCharacter usa o id da ficha por padrão', () => {
  const c = createCombatantFromCharacter(NARUTO_FIXTURE);
  assert.equal(c.id, 'CHAR_FIXTURE_NARUTO_001');
  assert.equal(c.name, 'Naruto (fixture)');
});

test('createCombatantFromCharacter aceita id/posição customizados (para 2 cópias na mesma luta)', () => {
  const c = createCombatantFromCharacter(NARUTO_FIXTURE, { id: 'clone-do-naruto', position: POSITIONS.TRAS });
  assert.equal(c.id, 'clone-do-naruto');
  assert.equal(c.position, POSITIONS.TRAS);
});

test('createCombatantFromCharacter aplica os overrides de stats sobre os defaults', () => {
  const c = createCombatantFromCharacter(NARUTO_FIXTURE);
  assert.equal(c.attributes.hpMax, 128);
  assert.equal(c.attributes.chakraMax, 118);
  assert.equal(c.attributes.taijutsu, 32);
  assert.equal(c.hp, 128);
  assert.equal(c.chakra, 118);
});

test('createCombatantFromCharacter monta o recurso exclusivo quando a ficha tem um', () => {
  const c = createCombatantFromCharacter(NARUTO_FIXTURE);
  assert.deepEqual(c.resource, {
    id: 'clones', name: 'Clones', max: 5, current: 0,
  });
});

test('createCombatantFromCharacter deixa resource null quando a ficha não tem exclusiveResource', () => {
  const c = createCombatantFromCharacter(SASUKE_FIXTURE);
  assert.equal(c.resource, null);
});

test('computeSquadCost soma o custo de esquadrão de todas as fichas', () => {
  assert.equal(computeSquadCost([NARUTO_FIXTURE, SASUKE_FIXTURE]), 4);
});

test('isSquadWithinBudget usa 12 como orçamento padrão', () => {
  const seis = Array.from({ length: 6 }, (_, i) => ({ ...NARUTO_FIXTURE, id: `x${i}`, squadCost: 2 }));
  assert.equal(isSquadWithinBudget(seis), true); // 6*2=12
  seis.push({ ...NARUTO_FIXTURE, id: 'extra', squadCost: 1 });
  assert.equal(isSquadWithinBudget(seis), false); // 13
});

test('isSquadWithinBudget aceita orçamento customizado', () => {
  assert.equal(isSquadWithinBudget([NARUTO_FIXTURE, SASUKE_FIXTURE], 3), false);
  assert.equal(isSquadWithinBudget([NARUTO_FIXTURE, SASUKE_FIXTURE], 4), true);
});

test('createCombatantFromCharacter concede o kit ninja padrão (Marco 10, D025) — igual para qualquer Personagem', () => {
  const naruto = createCombatantFromCharacter(NARUTO_FIXTURE);
  const sasuke = createCombatantFromCharacter(SASUKE_FIXTURE);
  assert.deepEqual(naruto.inventory, sasuke.inventory);
  assert.ok(naruto.inventory.ITEM_KUNAI_BASIC_001 >= 1);
  assert.ok(naruto.inventory.ITEM_SOLDIER_PILL_001 >= 1);
});

test('createCombatantFromCharacter dá inventários independentes por combatente (mutar um não afeta o outro)', () => {
  const a = createCombatantFromCharacter(NARUTO_FIXTURE, { id: 'a' });
  const b = createCombatantFromCharacter(NARUTO_FIXTURE, { id: 'b' });
  a.inventory.ITEM_KUNAI_BASIC_001 = 0;
  assert.notEqual(b.inventory.ITEM_KUNAI_BASIC_001, 0);
});

test('createCombatantFromCharacter soma extraInventory (compras do nó LOJA, Marco 10, D028) por cima do kit fixo', () => {
  const c = createCombatantFromCharacter(NARUTO_FIXTURE, {
    extraInventory: { ITEM_KUNAI_BASIC_001: 3, ITEM_EXPLOSIVE_TAG_001: 1 },
  });
  assert.equal(c.inventory.ITEM_KUNAI_BASIC_001, 2 + 3); // kit fixo já tem 2 Kunai
  assert.equal(c.inventory.ITEM_EXPLOSIVE_TAG_001, 1); // não fazia parte do kit fixo
});

test('createCombatantFromCharacter sem extraInventory se comporta como antes (só o kit fixo)', () => {
  const c = createCombatantFromCharacter(NARUTO_FIXTURE);
  assert.equal(c.inventory.ITEM_KUNAI_BASIC_001, 2);
  assert.equal(c.inventory.ITEM_EXPLOSIVE_TAG_001, undefined);
});

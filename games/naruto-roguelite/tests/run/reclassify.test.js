import { test } from 'node:test';
import assert from 'node:assert/strict';
import { maybeReclassifyNode, reinforceSquad } from '../../src/engine/run/reclassify.js';

const alwaysRng = { chance: () => true };
const neverRng = { chance: () => false };

function missaoNode(rank = 'C') {
  return {
    id: 'NODE_0_0', type: 'MISSAO', rank,
  };
}

test('maybeReclassifyNode sobe 1 rank quando o rng "acerta" a chance', () => {
  const node = missaoNode('C');
  const result = maybeReclassifyNode(node, alwaysRng);
  assert.equal(result.rank, 'B');
  assert.equal(result.reclassified, true);
  assert.equal(result.originalRank, 'C');
});

test('maybeReclassifyNode não muda nada quando o rng "erra" a chance', () => {
  const node = missaoNode('C');
  const result = maybeReclassifyNode(node, neverRng);
  assert.equal(result.rank, 'C');
  assert.equal(result.reclassified, undefined);
});

test('maybeReclassifyNode nunca reclassifica um nó DESCANSO', () => {
  const node = { id: 'NODE_0_0', type: 'DESCANSO' };
  const result = maybeReclassifyNode(node, alwaysRng);
  assert.equal(result.reclassified, undefined);
});

test('maybeReclassifyNode nunca reclassifica um nó Boss (isBoss)', () => {
  const node = {
    id: 'NODE_2_0', type: 'BOSS', isBoss: true, rank: 'A',
  };
  const result = maybeReclassifyNode(node, alwaysRng);
  assert.equal(result.reclassified, undefined);
  assert.equal(result.rank, 'A');
});

test('maybeReclassifyNode não reclassifica de novo um nó já reclassificado (estável entre chamadas)', () => {
  const node = missaoNode('C');
  maybeReclassifyNode(node, alwaysRng);
  const secondCall = maybeReclassifyNode(node, alwaysRng);
  assert.equal(secondCall.rank, 'B'); // não sobe pra A de novo
});

test('maybeReclassifyNode não estoura o topo dos RANKS (EX)', () => {
  const node = missaoNode('EX');
  const result = maybeReclassifyNode(node, alwaysRng);
  assert.equal(result.rank, 'EX');
  assert.equal(result.reclassified, undefined);
});

test('reinforceSquad cura sobreviventes em 25% do hpMax sem passar do máximo', () => {
  const combatants = [
    { hp: 40, attributes: { hpMax: 100 } },
    { hp: 90, attributes: { hpMax: 100 } },
  ];
  reinforceSquad(combatants);
  assert.equal(combatants[0].hp, 65);
  assert.equal(combatants[1].hp, 100);
});

test('reinforceSquad não ressuscita combatentes caídos (hp <= 0)', () => {
  const combatants = [{ hp: 0, attributes: { hpMax: 100 } }];
  reinforceSquad(combatants);
  assert.equal(combatants[0].hp, 0);
});

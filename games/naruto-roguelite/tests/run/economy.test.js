import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ryoForMissionResult, ryoForChronicle, canAfford, buyItem,
} from '../../src/engine/run/economy.js';
import { MISSION_RESULTS } from '../../src/engine/enums.js';

function fixtureRun(ryo = 50) {
  return { ryo, purchasedInventory: {} };
}

test('ryoForMissionResult conhece os 5 MISSION_RESULTS, em ordem decrescente, e 0 para o resto', () => {
  const perfeito = ryoForMissionResult(MISSION_RESULTS.SUCESSO_PERFEITO);
  const sucesso = ryoForMissionResult(MISSION_RESULTS.SUCESSO);
  const parcial = ryoForMissionResult(MISSION_RESULTS.SUCESSO_PARCIAL);
  const falha = ryoForMissionResult(MISSION_RESULTS.FALHA);
  const desastre = ryoForMissionResult(MISSION_RESULTS.DESASTRE);

  assert.ok(perfeito > sucesso);
  assert.ok(sucesso > parcial);
  assert.ok(parcial > falha);
  assert.ok(falha >= desastre);
  assert.equal(desastre, 0);
  assert.equal(ryoForMissionResult('DESCANSO'), 0);
});

test('ryoForChronicle soma o Ryō de todas as entradas', () => {
  const chronicle = [
    { result: MISSION_RESULTS.SUCESSO },
    { result: 'DESCANSO' },
    { result: MISSION_RESULTS.SUCESSO_PERFEITO },
  ];
  const total = ryoForChronicle(chronicle);
  assert.equal(total, ryoForMissionResult(MISSION_RESULTS.SUCESSO) + ryoForMissionResult(MISSION_RESULTS.SUCESSO_PERFEITO));
});

test('ryoForChronicle de uma crônica vazia é 0', () => {
  assert.equal(ryoForChronicle([]), 0);
});

test('canAfford confere se run.ryo cobre o preço', () => {
  const run = fixtureRun(20);
  assert.equal(canAfford(run, 20), true);
  assert.equal(canAfford(run, 21), false);
});

test('buyItem deduz o preço e soma 1 unidade no inventário comprado do personagem', () => {
  const run = fixtureRun(50);
  const ok = buyItem(run, 'CHAR_A', 'ITEM_KUNAI_BASIC_001', 15);
  assert.equal(ok, true);
  assert.equal(run.ryo, 35);
  assert.equal(run.purchasedInventory.CHAR_A.ITEM_KUNAI_BASIC_001, 1);
});

test('buyItem acumula compras repetidas do mesmo item', () => {
  const run = fixtureRun(50);
  buyItem(run, 'CHAR_A', 'ITEM_KUNAI_BASIC_001', 15);
  buyItem(run, 'CHAR_A', 'ITEM_KUNAI_BASIC_001', 15);
  assert.equal(run.purchasedInventory.CHAR_A.ITEM_KUNAI_BASIC_001, 2);
  assert.equal(run.ryo, 20);
});

test('buyItem não faz nada e devolve false sem Ryō suficiente', () => {
  const run = fixtureRun(10);
  const ok = buyItem(run, 'CHAR_A', 'ITEM_KUNAI_BASIC_001', 15);
  assert.equal(ok, false);
  assert.equal(run.ryo, 10);
  assert.deepEqual(run.purchasedInventory, {});
});

test('buyItem mantém inventários separados por personagem', () => {
  const run = fixtureRun(50);
  buyItem(run, 'CHAR_A', 'ITEM_KUNAI_BASIC_001', 15);
  buyItem(run, 'CHAR_B', 'ITEM_ANTIDOTE_001', 20);
  assert.deepEqual(run.purchasedInventory.CHAR_A, { ITEM_KUNAI_BASIC_001: 1 });
  assert.deepEqual(run.purchasedInventory.CHAR_B, { ITEM_ANTIDOTE_001: 1 });
});

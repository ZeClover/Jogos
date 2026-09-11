import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ryoForMissionResult, ryoForChronicle } from '../../src/engine/run/economy.js';
import { MISSION_RESULTS } from '../../src/engine/enums.js';

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

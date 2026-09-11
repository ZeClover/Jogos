import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createReputationState, getReputationValue, reputationLevel,
  adjustReputation, deltaForMissionResult, applyChronicleToReputation,
} from '../../src/engine/progression/reputation.js';
import { MISSION_RESULTS, REPUTATION_LEVELS } from '../../src/engine/enums.js';

test('createReputationState começa vazio; toda facção não vista é Neutra (0)', () => {
  const rep = createReputationState();
  assert.deepEqual(rep, {});
  assert.equal(getReputationValue(rep, 'FACTION_X'), 0);
});

test('reputationLevel mapeia os 5 níveis a partir de limiares provisórios (D026)', () => {
  assert.equal(reputationLevel(-30), REPUTATION_LEVELS[0]); // HOSTIL
  assert.equal(reputationLevel(-10), REPUTATION_LEVELS[1]); // RUIM
  assert.equal(reputationLevel(0), REPUTATION_LEVELS[2]); // NEUTRA
  assert.equal(reputationLevel(10), REPUTATION_LEVELS[3]); // BOA
  assert.equal(reputationLevel(30), REPUTATION_LEVELS[4]); // ALIADA
});

test('adjustReputation soma o delta e satura em [-50, 50]', () => {
  const rep = createReputationState();
  assert.equal(adjustReputation(rep, 'FACTION_X', 8), 8);
  assert.equal(adjustReputation(rep, 'FACTION_X', 100), 50);
  assert.equal(adjustReputation(rep, 'FACTION_X', -200), -50);
});

test('adjustReputation não faz nada sem factionId ou sem delta', () => {
  const rep = createReputationState();
  assert.equal(adjustReputation(rep, null, 10), 0);
  assert.equal(adjustReputation(rep, 'FACTION_X', 0), 0);
  assert.deepEqual(rep, {});
});

test('deltaForMissionResult conhece os 5 MISSION_RESULTS e devolve 0 para o resto (ex: DESCANSO)', () => {
  assert.ok(deltaForMissionResult(MISSION_RESULTS.SUCESSO_PERFEITO) > 0);
  assert.ok(deltaForMissionResult(MISSION_RESULTS.SUCESSO) > 0);
  assert.ok(deltaForMissionResult(MISSION_RESULTS.SUCESSO_PARCIAL) > 0);
  assert.ok(deltaForMissionResult(MISSION_RESULTS.FALHA) < 0);
  assert.ok(deltaForMissionResult(MISSION_RESULTS.DESASTRE) < 0);
  assert.equal(deltaForMissionResult('DESCANSO'), 0);
});

test('applyChronicleToReputation soma o delta de todas as entradas na mesma facção', () => {
  const rep = createReputationState();
  const chronicle = [
    { result: MISSION_RESULTS.SUCESSO },
    { result: 'DESCANSO' },
    { result: MISSION_RESULTS.SUCESSO_PERFEITO },
  ];
  const total = applyChronicleToReputation(rep, chronicle, 'FACTION_SUNA_001');
  assert.equal(total, deltaForMissionResult(MISSION_RESULTS.SUCESSO) + deltaForMissionResult(MISSION_RESULTS.SUCESSO_PERFEITO));
  assert.equal(getReputationValue(rep, 'FACTION_SUNA_001'), total);
});

test('applyChronicleToReputation não muda nada sem factionId', () => {
  const rep = createReputationState();
  const total = applyChronicleToReputation(rep, [{ result: MISSION_RESULTS.SUCESSO }], null);
  assert.equal(total, 0);
  assert.deepEqual(rep, {});
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveMissionResult } from '../../src/engine/run/missionResult.js';

function combatant(hpMax, hp) {
  return { hp, attributes: { hpMax } };
}

test('combate perdido (won=false) é sempre DESASTRE, mesmo com HP alto', () => {
  const result = resolveMissionResult({
    squadBefore: [combatant(100, 100)],
    squadAfter: [combatant(100, 90)],
    won: false,
  });
  assert.equal(result, 'DESASTRE');
});

test('vitória sem baixas e HP alto (>=85%) é SUCESSO_PERFEITO', () => {
  const result = resolveMissionResult({
    squadBefore: [combatant(100, 100), combatant(100, 100)],
    squadAfter: [combatant(100, 90), combatant(100, 90)],
    won: true,
  });
  assert.equal(result, 'SUCESSO_PERFEITO');
});

test('vitória sem baixas e HP médio (>=50%, <85%) é SUCESSO', () => {
  const result = resolveMissionResult({
    squadBefore: [combatant(100, 100), combatant(100, 100)],
    squadAfter: [combatant(100, 60), combatant(100, 60)],
    won: true,
  });
  assert.equal(result, 'SUCESSO');
});

test('vitória sem baixas mas HP baixo (<50%) é SUCESSO_PARCIAL', () => {
  const result = resolveMissionResult({
    squadBefore: [combatant(100, 100), combatant(100, 100)],
    squadAfter: [combatant(100, 20), combatant(100, 20)],
    won: true,
  });
  assert.equal(result, 'SUCESSO_PARCIAL');
});

test('vitória com exatamente 1 baixa é SUCESSO_PARCIAL', () => {
  const result = resolveMissionResult({
    squadBefore: [combatant(100, 100), combatant(100, 100)],
    squadAfter: [combatant(100, 0), combatant(100, 100)],
    won: true,
  });
  assert.equal(result, 'SUCESSO_PARCIAL');
});

test('vitória com 2+ baixas é FALHA', () => {
  const result = resolveMissionResult({
    squadBefore: [combatant(100, 100), combatant(100, 100), combatant(100, 100)],
    squadAfter: [combatant(100, 0), combatant(100, 0), combatant(100, 100)],
    won: true,
  });
  assert.equal(result, 'FALHA');
});

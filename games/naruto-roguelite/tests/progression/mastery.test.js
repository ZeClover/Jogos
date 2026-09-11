import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  xpForMissionResult, levelFromXp, grantMastery, xpToNextLevel, MASTERY_MAX_LEVEL,
} from '../../src/engine/progression/mastery.js';

test('xpForMissionResult segue a graduação (Perfeito > Sucesso > Parcial > Falha > Desastre)', () => {
  const perfeito = xpForMissionResult('SUCESSO_PERFEITO');
  const sucesso = xpForMissionResult('SUCESSO');
  const parcial = xpForMissionResult('SUCESSO_PARCIAL');
  const falha = xpForMissionResult('FALHA');
  const desastre = xpForMissionResult('DESASTRE');
  assert.ok(perfeito > sucesso);
  assert.ok(sucesso > parcial);
  assert.ok(parcial > falha);
  assert.ok(falha > desastre);
  assert.equal(desastre, 0);
});

test('xpForMissionResult devolve 0 para um resultado desconhecido (ex: "DESCANSO")', () => {
  assert.equal(xpForMissionResult('DESCANSO'), 0);
});

test('levelFromXp cresce por faixas de 100 XP até o nível máximo', () => {
  assert.equal(levelFromXp(0), 0);
  assert.equal(levelFromXp(99), 0);
  assert.equal(levelFromXp(100), 1);
  assert.equal(levelFromXp(250), 2);
  assert.equal(levelFromXp(99999), MASTERY_MAX_LEVEL);
});

test('grantMastery cria a entrada do personagem na primeira chamada', () => {
  const mastery = {};
  const { level, leveledUp } = grantMastery(mastery, 'CHAR_X', 50);
  assert.equal(level, 0);
  assert.equal(leveledUp, false);
  assert.deepEqual(mastery.CHAR_X, { xp: 50, level: 0 });
});

test('grantMastery acumula XP entre chamadas e reporta leveledUp só quando o nível sobe', () => {
  const mastery = {};
  grantMastery(mastery, 'CHAR_X', 60);
  const second = grantMastery(mastery, 'CHAR_X', 60); // 120 total -> nível 1
  assert.equal(second.level, 1);
  assert.equal(second.leveledUp, true);
  const third = grantMastery(mastery, 'CHAR_X', 5); // ainda nível 1
  assert.equal(third.leveledUp, false);
});

test('grantMastery ignora XP negativo (não reduz)', () => {
  const mastery = {};
  grantMastery(mastery, 'CHAR_X', 50);
  grantMastery(mastery, 'CHAR_X', -1000);
  assert.equal(mastery.CHAR_X.xp, 50);
});

test('xpToNextLevel devolve a diferença até o próximo limiar, e null no nível máximo', () => {
  const mastery = {};
  grantMastery(mastery, 'CHAR_X', 60);
  assert.equal(xpToNextLevel(mastery.CHAR_X), 40);

  const maxed = { level: MASTERY_MAX_LEVEL, xp: 99999 };
  assert.equal(xpToNextLevel(maxed), null);
});

test('xpToNextLevel funciona com mastery undefined (personagem nunca jogado)', () => {
  assert.equal(xpToNextLevel(undefined), 100);
});

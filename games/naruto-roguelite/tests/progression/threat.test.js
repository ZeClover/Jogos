import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  clampThreatLevel, effectiveAiLevel, effectiveReclassifyChance, THREAT_MIN, THREAT_MAX,
} from '../../src/engine/progression/threat.js';

test('clampThreatLevel limita entre THREAT_MIN e THREAT_MAX', () => {
  assert.equal(clampThreatLevel(-5), THREAT_MIN);
  assert.equal(clampThreatLevel(999), THREAT_MAX);
  assert.equal(clampThreatLevel(10), 10);
});

test('clampThreatLevel arredonda valores fracionários', () => {
  assert.equal(clampThreatLevel(5.6), 6);
});

test('effectiveAiLevel não muda nada abaixo do limiar de Ameaça', () => {
  assert.equal(effectiveAiLevel('BASICA', 0), 'BASICA');
  assert.equal(effectiveAiLevel('BASICA', 7), 'BASICA');
});

test('effectiveAiLevel sobe BASICA->INTERMEDIARIA e INTERMEDIARIA->ELITE no limiar', () => {
  assert.equal(effectiveAiLevel('BASICA', 8), 'INTERMEDIARIA');
  assert.equal(effectiveAiLevel('INTERMEDIARIA', 8), 'ELITE');
});

test('effectiveAiLevel não muda ELITE nem BOSS (já são o teto)', () => {
  assert.equal(effectiveAiLevel('ELITE', 20), 'ELITE');
  assert.equal(effectiveAiLevel('BOSS', 20), 'BOSS');
});

test('effectiveReclassifyChance cresce com o nível de Ameaça e satura em um teto', () => {
  const base = 0.15;
  assert.equal(effectiveReclassifyChance(base, 0), 0.15);
  assert.ok(effectiveReclassifyChance(base, 10) > 0.15);
  assert.ok(effectiveReclassifyChance(base, THREAT_MAX) <= 0.9);
});

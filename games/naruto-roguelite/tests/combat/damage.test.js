import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mitigation, effectiveDefense, computeAccuracy, computeDamage,
} from '../../src/engine/combat/damage.js';

test('mitigation segue Defesa/(Defesa+100)', () => {
  assert.equal(mitigation(100), 0.5);
  assert.equal(mitigation(0), 0);
  assert.ok(Math.abs(mitigation(900) - 0.9) < 1e-9);
});

test('mitigation nunca é negativa mesmo com defesa negativa', () => {
  assert.equal(mitigation(-50), 0);
});

test('effectiveDefense aplica penetração sem ir abaixo de zero', () => {
  assert.equal(effectiveDefense(50, 20), 30);
  assert.equal(effectiveDefense(10, 50), 0);
});

test('computeAccuracy tem piso 20% e teto 100%', () => {
  assert.equal(computeAccuracy({ precisao: 0, evasao: 10000 }), 0.2);
  assert.equal(computeAccuracy({ precisao: 10000, evasao: 0 }), 1);
});

test('computeAccuracy: precisão do atacante sobe a chance, evasão do alvo desce', () => {
  const base = computeAccuracy({ precisao: 0, evasao: 0 });
  assert.ok(computeAccuracy({ precisao: 20, evasao: 0 }) > base);
  assert.ok(computeAccuracy({ precisao: 0, evasao: 20 }) < base);
});

test('computeDamage aplica mitigação de defesa', () => {
  const noDefense = computeDamage({ power: 100, defenseStat: 0 });
  const withDefense = computeDamage({ power: 100, defenseStat: 100 });
  assert.equal(noDefense, 100);
  assert.equal(withDefense, 50); // mitigation(100) = 0.5
});

test('computeDamage: crítico multiplica o dano pós-mitigação', () => {
  const normal = computeDamage({ power: 100, defenseStat: 0, isCrit: false });
  const crit = computeDamage({
    power: 100, defenseStat: 0, isCrit: true, critMultiplier: 1.5,
  });
  assert.equal(crit, Math.round(normal * 1.5));
});

test('computeDamage: guarda (Defender) reduz o dano após crítico/mitigação', () => {
  const withoutGuard = computeDamage({ power: 100, defenseStat: 0 });
  const withGuard = computeDamage({ power: 100, defenseStat: 0, guard: 30 });
  assert.equal(withGuard, withoutGuard - 30);
});

test('computeDamage: penetração reduz a defesa efetiva do alvo', () => {
  const withoutPenetration = computeDamage({ power: 100, defenseStat: 100 });
  const withPenetration = computeDamage({
    power: 100, defenseStat: 100, penetration: 100,
  });
  assert.ok(withPenetration > withoutPenetration);
  assert.equal(withPenetration, 100); // defesa efetiva vira 0 -> sem mitigação
});

test('computeDamage nunca retorna valor negativo', () => {
  const damage = computeDamage({
    power: 10, defenseStat: 0, guard: 9999,
  });
  assert.equal(damage, 0);
});

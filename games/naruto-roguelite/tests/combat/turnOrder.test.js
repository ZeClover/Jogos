import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRngStream } from '../../src/engine/rng.js';
import { createAttributes } from '../../src/engine/combat/attributes.js';
import { createCombatant } from '../../src/engine/combat/combatant.js';
import { computeTurnOrder } from '../../src/engine/combat/turnOrder.js';

function combatant(id, velocidade) {
  return createCombatant({ id, attributes: createAttributes({ velocidade }) });
}

test('computeTurnOrder é determinístico para a mesma seed', () => {
  const combatants = [combatant('a', 10), combatant('b', 15), combatant('c', 8)];
  const orderA = computeTurnOrder(combatants, createRngStream('seed-turno', 'combat')).map((c) => c.id);
  const orderB = computeTurnOrder(combatants, createRngStream('seed-turno', 'combat')).map((c) => c.id);
  assert.deepEqual(orderA, orderB);
});

test('uma diferença grande de Velocidade sempre vence a variação de RNG', () => {
  const fast = combatant('rapido', 100);
  const slow = combatant('lento', 1);
  const rng = createRngStream('seed-gap', 'combat');
  for (let i = 0; i < 50; i += 1) {
    const order = computeTurnOrder([slow, fast], rng, 2).map((c) => c.id);
    assert.deepEqual(order, ['rapido', 'lento'], 'velocidade 100 vs 1 não deveria perder para uma variação de ±2');
  }
});

test('computeTurnOrder não muta o array de entrada', () => {
  const combatants = [combatant('a', 5), combatant('b', 20)];
  const copy = [...combatants];
  computeTurnOrder(combatants, createRngStream('seed-nomut', 'combat'));
  assert.deepEqual(combatants, copy);
});

test('computeTurnOrder devolve os próprios objetos combatente, não cópias', () => {
  const a = combatant('a', 10);
  const [first] = computeTurnOrder([a], createRngStream('seed-identity', 'combat'));
  assert.equal(first, a);
});

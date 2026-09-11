import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAttributes } from '../../src/engine/combat/attributes.js';
import { createCombatant, gainResource, spendResource } from '../../src/engine/combat/combatant.js';

test('createCombatant sem resource deixa combatant.resource null', () => {
  const c = createCombatant({ id: 'a', attributes: createAttributes() });
  assert.equal(c.resource, null);
});

test('createCombatant com resource começa em current: 0', () => {
  const c = createCombatant({
    id: 'a', attributes: createAttributes(), resource: { id: 'clones', name: 'Clones', max: 5 },
  });
  assert.deepEqual(c.resource, {
    id: 'clones', name: 'Clones', max: 5, current: 0,
  });
});

test('gainResource soma sem passar do máximo', () => {
  const c = createCombatant({
    id: 'a', attributes: createAttributes(), resource: { id: 'clones', max: 5 },
  });
  gainResource(c, 2);
  assert.equal(c.resource.current, 2);
  gainResource(c, 10);
  assert.equal(c.resource.current, 5);
});

test('gainResource em combatente sem resource é no-op e devolve 0', () => {
  const c = createCombatant({ id: 'a', attributes: createAttributes() });
  const result = gainResource(c, 5);
  assert.equal(result, 0);
  assert.equal(c.resource, null);
});

test('spendResource gasta quando há o suficiente e devolve true', () => {
  const c = createCombatant({
    id: 'a', attributes: createAttributes(), resource: { id: 'clones', max: 5 },
  });
  gainResource(c, 3);
  assert.equal(spendResource(c, 2), true);
  assert.equal(c.resource.current, 1);
});

test('spendResource sem saldo suficiente não gasta e devolve false', () => {
  const c = createCombatant({
    id: 'a', attributes: createAttributes(), resource: { id: 'clones', max: 5 },
  });
  gainResource(c, 1);
  assert.equal(spendResource(c, 2), false);
  assert.equal(c.resource.current, 1);
});

test('spendResource em combatente sem resource devolve false', () => {
  const c = createCombatant({ id: 'a', attributes: createAttributes() });
  assert.equal(spendResource(c, 1), false);
});

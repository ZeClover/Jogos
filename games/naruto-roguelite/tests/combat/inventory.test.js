import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAttributes } from '../../src/engine/combat/attributes.js';
import { createCombatant, hasItem, consumeItem } from '../../src/engine/combat/combatant.js';

test('createCombatant sem inventory começa com inventário vazio', () => {
  const c = createCombatant({ id: 'a', attributes: createAttributes() });
  assert.deepEqual(c.inventory, {});
});

test('createCombatant com inventory copia o objeto (não referencia o original)', () => {
  const kit = { ITEM_KUNAI_BASIC_001: 2 };
  const c = createCombatant({ id: 'a', attributes: createAttributes(), inventory: kit });
  c.inventory.ITEM_KUNAI_BASIC_001 = 0;
  assert.equal(kit.ITEM_KUNAI_BASIC_001, 2, 'mutar o inventário do combatente não deveria afetar o kit original');
});

test('hasItem devolve true só com quantidade > 0', () => {
  const c = createCombatant({
    id: 'a', attributes: createAttributes(), inventory: { ITEM_X: 1, ITEM_Y: 0 },
  });
  assert.equal(hasItem(c, 'ITEM_X'), true);
  assert.equal(hasItem(c, 'ITEM_Y'), false);
  assert.equal(hasItem(c, 'ITEM_INEXISTENTE'), false);
});

test('consumeItem decrementa 1 unidade e devolve true quando havia estoque', () => {
  const c = createCombatant({ id: 'a', attributes: createAttributes(), inventory: { ITEM_X: 2 } });
  assert.equal(consumeItem(c, 'ITEM_X'), true);
  assert.equal(c.inventory.ITEM_X, 1);
});

test('consumeItem não deixa a quantidade negativa e devolve false sem estoque', () => {
  const c = createCombatant({ id: 'a', attributes: createAttributes(), inventory: { ITEM_X: 0 } });
  assert.equal(consumeItem(c, 'ITEM_X'), false);
  assert.equal(c.inventory.ITEM_X, 0);
});

test('consumeItem em item nunca listado no inventário devolve false', () => {
  const c = createCombatant({ id: 'a', attributes: createAttributes() });
  assert.equal(consumeItem(c, 'ITEM_NUNCA_LISTADO'), false);
});

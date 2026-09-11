import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isOnCooldown, setCooldown, tickCooldowns, resolveJutsuFields,
} from '../../src/engine/combat/jutsu.js';
import { createAttributes } from '../../src/engine/combat/attributes.js';
import { createCombatant } from '../../src/engine/combat/combatant.js';

function combatant() {
  return createCombatant({ id: 'c', attributes: createAttributes() });
}

test('isOnCooldown é false por padrão', () => {
  const c = combatant();
  assert.equal(isOnCooldown(c, 'JUT_X_001'), false);
});

test('setCooldown com rounds > 0 coloca o jutsu em cooldown', () => {
  const c = combatant();
  setCooldown(c, 'JUT_X_001', 3);
  assert.equal(isOnCooldown(c, 'JUT_X_001'), true);
  assert.equal(c.cooldowns.get('JUT_X_001'), 3);
});

test('setCooldown com rounds <= 0 não registra nada', () => {
  const c = combatant();
  setCooldown(c, 'JUT_X_001', 0);
  assert.equal(c.cooldowns.has('JUT_X_001'), false);
});

test('tickCooldowns reduz em 1 e remove ao chegar em zero', () => {
  const c = combatant();
  setCooldown(c, 'JUT_X_001', 2);
  tickCooldowns(c);
  assert.equal(c.cooldowns.get('JUT_X_001'), 1);
  assert.equal(isOnCooldown(c, 'JUT_X_001'), true);
  tickCooldowns(c);
  assert.equal(isOnCooldown(c, 'JUT_X_001'), false);
  assert.equal(c.cooldowns.has('JUT_X_001'), false);
});

test('tickCooldowns lida com múltiplos jutsus independentemente', () => {
  const c = combatant();
  setCooldown(c, 'JUT_A_001', 1);
  setCooldown(c, 'JUT_B_001', 3);
  tickCooldowns(c);
  assert.equal(isOnCooldown(c, 'JUT_A_001'), false);
  assert.equal(c.cooldowns.get('JUT_B_001'), 2);
});

test('resolveJutsuFields sem jutsuDef devolve a action original', () => {
  const action = { type: 'JUTSU', targetId: 'x', power: 10 };
  assert.equal(resolveJutsuFields(action, null), action);
});

test('resolveJutsuFields preenche campos ausentes a partir da ficha do catálogo', () => {
  const jutsuDef = {
    category: 'NINJUTSU', range: 'RANGED', power: 30, cost: 15, accuracy: 0.9, effect: 'DAMAGE', tags: ['TAG_KATON_001'], cooldown: 2,
  };
  const merged = resolveJutsuFields({ type: 'JUTSU', targetId: 'x' }, jutsuDef);
  assert.equal(merged.category, 'NINJUTSU');
  assert.equal(merged.power, 30);
  assert.equal(merged.cost, 15);
  assert.equal(merged.cooldown, 2);
  assert.deepEqual(merged.tags, ['TAG_KATON_001']);
});

test('resolveJutsuFields deixa a action sobrescrever a ficha quando o campo é explícito', () => {
  const jutsuDef = { power: 30, cost: 15 };
  const merged = resolveJutsuFields({
    type: 'JUTSU', targetId: 'x', power: 999,
  }, jutsuDef);
  assert.equal(merged.power, 999, 'campo explícito na action vence o da ficha');
  assert.equal(merged.cost, 15, 'campo ausente na action usa o da ficha');
});

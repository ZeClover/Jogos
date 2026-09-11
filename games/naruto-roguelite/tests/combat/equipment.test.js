import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyEquipmentBonuses } from '../../src/engine/combat/equipment.js';
import { createAttributes } from '../../src/engine/combat/attributes.js';

test('applyEquipmentBonuses soma statBonus de cada item no bloco de atributos', () => {
  const attributes = createAttributes({ taijutsu: 30, velocidade: 20 });
  applyEquipmentBonuses(attributes, [
    { statBonus: [{ attribute: 'taijutsu', amount: 12 }, { attribute: 'velocidade', amount: -3 }] },
  ]);
  assert.equal(attributes.taijutsu, 42);
  assert.equal(attributes.velocidade, 17);
});

test('applyEquipmentBonuses soma vários itens (várias fichas de equipamento) no mesmo atributo', () => {
  const attributes = createAttributes({ taijutsu: 10 });
  applyEquipmentBonuses(attributes, [
    { statBonus: [{ attribute: 'taijutsu', amount: 5 }] },
    { statBonus: [{ attribute: 'taijutsu', amount: 3 }] },
  ]);
  assert.equal(attributes.taijutsu, 18);
});

test('applyEquipmentBonuses não faz nada com lista vazia', () => {
  const attributes = createAttributes({ taijutsu: 10 });
  applyEquipmentBonuses(attributes, []);
  assert.equal(attributes.taijutsu, 10);
});

test('applyEquipmentBonuses ignora item sem statBonus', () => {
  const attributes = createAttributes({ taijutsu: 10 });
  applyEquipmentBonuses(attributes, [{ name: 'sem bônus' }]);
  assert.equal(attributes.taijutsu, 10);
});

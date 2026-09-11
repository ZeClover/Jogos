import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAttributes, PRIMARY_ATTRIBUTE_DEFAULTS, SECONDARY_ATTRIBUTE_DEFAULTS } from '../../src/engine/combat/attributes.js';

test('createAttributes sem overrides usa os defaults primários e secundários', () => {
  const attrs = createAttributes();
  assert.equal(attrs.hpMax, PRIMARY_ATTRIBUTE_DEFAULTS.hpMax);
  assert.equal(attrs.critChance, SECONDARY_ATTRIBUTE_DEFAULTS.critChance);
});

test('createAttributes sobrepõe apenas os campos informados', () => {
  const attrs = createAttributes({ hpMax: 128, chakraMax: 118, taijutsu: 40 });
  assert.equal(attrs.hpMax, 128);
  assert.equal(attrs.chakraMax, 118);
  assert.equal(attrs.taijutsu, 40);
  assert.equal(attrs.ninjutsu, PRIMARY_ATTRIBUTE_DEFAULTS.ninjutsu, 'campos não sobrepostos mantêm o default');
});

test('createAttributes tem todos os 12 atributos primários do doc 01', () => {
  const attrs = createAttributes();
  const primaries = [
    'hpMax', 'chakraMax', 'taijutsu', 'ninjutsu', 'genjutsu', 'defesaFisica',
    'defesaChakra', 'controleChakra', 'velocidade', 'precisao', 'evasao', 'resistenciaMental',
  ];
  for (const field of primaries) {
    assert.ok(field in attrs, `atributo primário ausente: ${field}`);
  }
});

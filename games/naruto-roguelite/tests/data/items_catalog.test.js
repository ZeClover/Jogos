import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../../src/data/catalog/index.js';
import { items, tags } from '../../src/data/index.js';
import { ITEM_DEFINITIONS } from '../../src/data/catalog/items.js';
import { assetManifest } from '../../src/content/asset_manifest.js';
import { isWellFormedId } from '../../src/engine/ids.js';
import { validateEntities, splitByLevel } from '../../src/engine/validators.js';
import { ITEM_CATEGORIES, ITEM_EFFECTS } from '../../src/engine/enums.js';
import { createAttributes } from '../../src/engine/combat/attributes.js';

const COMBAT_ITEMS = ITEM_DEFINITIONS.filter((d) => d.category === 'CONSUMIVEL' || d.category === 'FERRAMENTA');
const EQUIPMENT_ITEMS = ITEM_DEFINITIONS.filter((d) => ['ARMA', 'CORPO', 'ACESSORIO'].includes(d.category));
const KNOWN_ATTRIBUTES = new Set(Object.keys(createAttributes()));

test('o catálogo de Itens foi registrado ao ser importado', () => {
  assert.equal(items.size, ITEM_DEFINITIONS.length);
  assert.equal(ITEM_DEFINITIONS.length, 10, 'lote 01 (6 consumíveis/ferramenta) + lote 04 (4 Armas Lendárias, D029)');
});

test('todo Item tem ID bem formado e categoria conhecida, sem duplicatas', () => {
  const issues = validateEntities(ITEM_DEFINITIONS, {
    requiredFields: ['name', 'category'],
  });
  assert.deepEqual(splitByLevel(issues).errors, []);

  for (const def of ITEM_DEFINITIONS) {
    assert.ok(isWellFormedId(def.id));
    assert.ok(ITEM_CATEGORIES.includes(def.category), `${def.id}: categoria desconhecida "${def.category}"`);
  }
});

test('todo Item de combate (CONSUMIVEL/FERRAMENTA) declara um effect conhecido', () => {
  for (const def of COMBAT_ITEMS) {
    assert.ok(ITEM_EFFECTS.includes(def.effect), `${def.id}: effect desconhecido "${def.effect}"`);
  }
});

test('toda Tag referenciada por um Item existe no catálogo de Tags', () => {
  for (const def of ITEM_DEFINITIONS) {
    for (const tagId of def.tags ?? []) {
      assert.ok(tags.has(tagId), `${def.id}: tag desconhecida "${tagId}"`);
    }
  }
});

test('todo Item de combate (lote 01) já tinha uma entrada P0 real no Asset Manifest desde o Marco 0 (nenhum nome novo inventado)', () => {
  const manifestContentIds = new Set(assetManifest.map((e) => e.contentId));
  for (const def of COMBAT_ITEMS) {
    assert.ok(manifestContentIds.has(def.id), `${def.id}: sem entrada correspondente no Asset Manifest`);
  }
});

test('Item DAMAGE declara combatCategory válida (TAIJUTSU ou NINJUTSU)', () => {
  for (const def of ITEM_DEFINITIONS.filter((d) => d.effect === 'DAMAGE')) {
    assert.ok(['TAIJUTSU', 'NINJUTSU'].includes(def.combatCategory), `${def.id}: combatCategory inválida`);
  }
});

test('todo Item de combate (CONSUMIVEL/FERRAMENTA) tem um price positivo (Marco 10, D028 — vendível no nó LOJA)', () => {
  for (const def of COMBAT_ITEMS) {
    assert.ok(typeof def.price === 'number' && def.price > 0, `${def.id}: price ausente ou inválido`);
  }
});

test('todo Item de Equipamento (ARMA/CORPO/ACESSORIO) declara statBonus não vazio com atributos conhecidos (Marco 10, D029)', () => {
  assert.equal(EQUIPMENT_ITEMS.length, 4, 'lote 04: as 4 primeiras Armas Lendárias citadas no doc 03');
  for (const def of EQUIPMENT_ITEMS) {
    assert.ok(Array.isArray(def.statBonus) && def.statBonus.length > 0, `${def.id}: statBonus ausente ou vazio`);
    for (const { attribute, amount } of def.statBonus) {
      assert.ok(KNOWN_ATTRIBUTES.has(attribute), `${def.id}: atributo desconhecido "${attribute}"`);
      assert.ok(typeof amount === 'number' && amount !== 0, `${def.id}: amount inválido para "${attribute}"`);
    }
  }
});

test('Item de Equipamento não declara effect nem price (ainda sem loja de Armas, D029)', () => {
  for (const def of EQUIPMENT_ITEMS) {
    assert.equal(def.effect, undefined, `${def.id}: não deveria ter effect (não é usado via ACTION_TYPES.ITEM)`);
    assert.equal(def.price, undefined, `${def.id}: não deveria ter price (sem loja de Armas ainda)`);
  }
});

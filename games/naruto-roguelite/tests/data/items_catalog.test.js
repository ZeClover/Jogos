import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../../src/data/catalog/index.js';
import { items, tags } from '../../src/data/index.js';
import { ITEM_DEFINITIONS } from '../../src/data/catalog/items.js';
import { assetManifest } from '../../src/content/asset_manifest.js';
import { isWellFormedId } from '../../src/engine/ids.js';
import { validateEntities, splitByLevel } from '../../src/engine/validators.js';
import { ITEM_CATEGORIES, ITEM_EFFECTS } from '../../src/engine/enums.js';

test('o catálogo de Itens foi registrado ao ser importado', () => {
  assert.equal(items.size, ITEM_DEFINITIONS.length);
  assert.equal(ITEM_DEFINITIONS.length, 6, 'lote 01: os 6 itens já declarados no Asset Manifest do Marco 0');
});

test('todo Item tem ID bem formado, categoria/effect conhecidos, sem duplicatas', () => {
  const issues = validateEntities(ITEM_DEFINITIONS, {
    requiredFields: ['name', 'category', 'effect'],
  });
  assert.deepEqual(splitByLevel(issues).errors, []);

  for (const def of ITEM_DEFINITIONS) {
    assert.ok(isWellFormedId(def.id));
    assert.ok(ITEM_CATEGORIES.includes(def.category), `${def.id}: categoria desconhecida "${def.category}"`);
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

test('todo Item já tinha uma entrada P0 real no Asset Manifest desde o Marco 0 (nenhum nome novo inventado)', () => {
  const manifestContentIds = new Set(assetManifest.map((e) => e.contentId));
  for (const def of ITEM_DEFINITIONS) {
    assert.ok(manifestContentIds.has(def.id), `${def.id}: sem entrada correspondente no Asset Manifest`);
  }
});

test('Item DAMAGE declara combatCategory válida (TAIJUTSU ou NINJUTSU)', () => {
  for (const def of ITEM_DEFINITIONS.filter((d) => d.effect === 'DAMAGE')) {
    assert.ok(['TAIJUTSU', 'NINJUTSU'].includes(def.combatCategory), `${def.id}: combatCategory inválida`);
  }
});

test('todo Item tem um price positivo (Marco 10, D028 — vendível no nó LOJA)', () => {
  for (const def of ITEM_DEFINITIONS) {
    assert.ok(typeof def.price === 'number' && def.price > 0, `${def.id}: price ausente ou inválido`);
  }
});

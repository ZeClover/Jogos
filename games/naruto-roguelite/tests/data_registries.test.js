import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registries, summarizeRegistries } from '../src/data/index.js';
import { CONTENT_ID_PREFIXES } from '../src/engine/enums.js';

test('toda registry usa um prefixo de conteúdo conhecido', () => {
  for (const registry of Object.values(registries)) {
    assert.ok(
      CONTENT_ID_PREFIXES.includes(registry.idPrefix),
      `prefixo desconhecido: ${registry.idPrefix}`,
    );
  }
});

test('Marco 0: registries começam vazias (conteúdo real chega no Marco 3/4)', () => {
  const sizes = summarizeRegistries();
  for (const [name, size] of Object.entries(sizes)) {
    assert.equal(size, 0, `registry "${name}" deveria estar vazia neste marco`);
  }
});

test('summarizeRegistries cobre todas as registries exportadas', () => {
  const sizes = summarizeRegistries();
  assert.deepEqual(Object.keys(sizes).sort(), Object.keys(registries).sort());
});

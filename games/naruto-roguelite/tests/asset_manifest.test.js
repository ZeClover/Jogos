import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  assetManifest, assetBacklogP1, assetManifestIndex, summarizeManifestByStatus,
  placeholderDataUri, resolveAssetSrc,
} from '../src/content/asset_manifest.js';
import { ASSET_ID_PREFIXES, ASSET_STATUSES } from '../src/engine/enums.js';
import { isWellFormedId } from '../src/engine/ids.js';

test('todo Asset ID no manifesto é único', () => {
  const ids = assetManifest.map((e) => e.assetId);
  assert.equal(new Set(ids).size, ids.length, 'há Asset IDs duplicados no manifesto');
});

test('todo Asset ID é bem formado e usa uma categoria conhecida', () => {
  for (const e of assetManifest) {
    assert.ok(isWellFormedId(e.assetId), `Asset ID mal formado: ${e.assetId}`);
    assert.ok(ASSET_ID_PREFIXES.includes(e.category), `categoria desconhecida em ${e.assetId}: ${e.category}`);
    assert.ok(ASSET_STATUSES.includes(e.status), `status desconhecido em ${e.assetId}: ${e.status}`);
  }
});

test('entradas com status prompt_ready têm um prompt visual não vazio', () => {
  for (const e of assetManifest) {
    if (e.status === 'prompt_ready') {
      assert.ok(typeof e.prompt === 'string' && e.prompt.trim().length > 0, `prompt ausente para ${e.assetId}`);
    }
  }
});

test('assetManifestIndex indexa todas as entradas por assetId', () => {
  assert.equal(assetManifestIndex.size, assetManifest.length);
  for (const e of assetManifest) {
    assert.equal(assetManifestIndex.get(e.assetId), e);
  }
});

test('summarizeManifestByStatus soma para o total de entradas', () => {
  const summary = summarizeManifestByStatus();
  const total = Object.values(summary).reduce((a, b) => a + b, 0);
  assert.equal(total, assetManifest.length);
});

test('todas as entradas do manifesto têm arte "generated" desde D034', () => {
  const summary = summarizeManifestByStatus();
  assert.equal(summary.generated ?? 0, assetManifest.length);
  assert.equal(summary.reviewed ?? 0, 0);
  assert.equal(summary.integrated ?? 0, 0);
});

test('placeholderDataUri produz um data URI de SVG', () => {
  const uri = placeholderDataUri('PORTRAIT_CHAR_NARUTO_GENIN_001', 'PORTRAIT');
  assert.ok(uri.startsWith('data:image/svg+xml'));
  assert.ok(uri.includes('PORTRAIT_CHAR_NARUTO_GENIN_001'.replace(/_/g, '_'))); // legenda presente (encoded)
});

test('resolveAssetSrc retorna o caminho real para entradas com arte "generated" (D034)', () => {
  const src = resolveAssetSrc('PORTRAIT_CHAR_NARUTO_GENIN_001');
  assert.equal(src, 'assets/portrait/PORTRAIT_CHAR_NARUTO_GENIN_001.png');
});

test('resolveAssetSrc não quebra para um assetId desconhecido (nunca bloqueia)', () => {
  const src = resolveAssetSrc('PORTRAIT_CHAR_NAOEXISTE_999');
  assert.ok(src.startsWith('data:image/svg+xml'));
});

test('assetBacklogP1 não reutiliza nenhum Asset ID já formal (P0)', () => {
  const formalIds = new Set(assetManifest.map((e) => e.assetId));
  for (const item of assetBacklogP1) {
    assert.ok(!formalIds.has(item.name), `item do backlog P1 colide com um Asset ID formal: ${item.name}`);
  }
});

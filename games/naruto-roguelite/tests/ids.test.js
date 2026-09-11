import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isWellFormedId, isValidId, idPrefix, assetIdFor, nextSequentialId,
  isKnownContentPrefix, isKnownAssetPrefix,
} from '../src/engine/ids.js';

test('isWellFormedId aceita o formato canônico PREFIXO_..._NNN', () => {
  assert.equal(isWellFormedId('CHAR_NARUTO_GENIN_001'), true);
  assert.equal(isWellFormedId('JUT_RASENGAN_001'), true);
  assert.equal(isWellFormedId('BOSS_ZABUZA_001'), true);
});

test('isWellFormedId rejeita formatos inválidos', () => {
  assert.equal(isWellFormedId('char_naruto_genin_001'), false); // minúsculo
  assert.equal(isWellFormedId('CHAR_NARUTO_GENIN'), false); // sem sufixo numérico
  assert.equal(isWellFormedId('CHAR_NARUTO_GENIN_1'), false); // sufixo não é 3 dígitos
  assert.equal(isWellFormedId(''), false);
  assert.equal(isWellFormedId(undefined), false);
  assert.equal(isWellFormedId(123), false);
});

test('idPrefix extrai o primeiro segmento', () => {
  assert.equal(idPrefix('CHAR_NARUTO_GENIN_001'), 'CHAR');
  assert.equal(idPrefix('JUT_KAGE_BUNSHIN_001'), 'JUT');
  assert.equal(idPrefix('sem-prefixo'), null);
});

test('isValidId confere formato E prefixo esperado', () => {
  assert.equal(isValidId('CHAR_NARUTO_GENIN_001', 'CHAR'), true);
  assert.equal(isValidId('CHAR_NARUTO_GENIN_001', 'JUT'), false);
  assert.equal(isValidId('char_naruto_genin_001', 'CHAR'), false);
});

test('isKnownContentPrefix / isKnownAssetPrefix reconhecem os vocabulários da engine', () => {
  assert.equal(isKnownContentPrefix('CHAR'), true);
  assert.equal(isKnownContentPrefix('NAOEXISTE'), false);
  assert.equal(isKnownAssetPrefix('PORTRAIT'), true);
  assert.equal(isKnownAssetPrefix('NAOEXISTE'), false);
});

test('assetIdFor monta Asset ID a partir de categoria + content ID', () => {
  assert.equal(
    assetIdFor('PORTRAIT', 'CHAR_NARUTO_GENIN_001'),
    'PORTRAIT_CHAR_NARUTO_GENIN_001',
  );
});

test('assetIdFor rejeita categoria desconhecida ou contentId mal formado', () => {
  assert.throws(() => assetIdFor('FOTO', 'CHAR_NARUTO_GENIN_001'));
  assert.throws(() => assetIdFor('PORTRAIT', 'naruto'));
});

test('nextSequentialId evita colisão com IDs existentes', () => {
  const existing = ['CHAR_NARUTO_GENIN_001', 'CHAR_NARUTO_GENIN_002'];
  assert.equal(
    nextSequentialId('CHAR', ['naruto', 'genin'], existing),
    'CHAR_NARUTO_GENIN_003',
  );
  assert.equal(
    nextSequentialId('CHAR', ['sasuke', 'genin'], existing),
    'CHAR_SASUKE_GENIN_001',
  );
});

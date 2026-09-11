// Validação e utilitários de ID estável.
// Formato canônico: PREFIXO(_PARTE)*_NNN — ex: CHAR_NARUTO_GENIN_001, JUT_RASENGAN_001.
// IDs nunca mudam por causa de renomeação de display name (ver CANON_RULES.md #50).

import { ASSET_ID_PREFIXES, CONTENT_ID_PREFIXES } from './enums.js';

const ID_PATTERN = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*_\d{3}$/;

/** Confere se `id` segue o formato geral PREFIXO_..._NNN. */
export function isWellFormedId(id) {
  return typeof id === 'string' && ID_PATTERN.test(id);
}

/** Extrai o prefixo (primeiro segmento) de um ID, ex: "CHAR" de "CHAR_NARUTO_GENIN_001". */
export function idPrefix(id) {
  if (typeof id !== 'string') return null;
  const match = id.match(/^([A-Z0-9]+)_/);
  return match ? match[1] : null;
}

/** Confere se `id` é bem formado e começa com o prefixo esperado (ex: "CHAR"). */
export function isValidId(id, expectedPrefix) {
  if (!isWellFormedId(id)) return false;
  return idPrefix(id) === expectedPrefix;
}

/** Confere se o prefixo é um prefixo de conteúdo conhecido (ver enums.js). */
export function isKnownContentPrefix(prefix) {
  return CONTENT_ID_PREFIXES.includes(prefix);
}

/** Confere se o prefixo é um prefixo de asset visual conhecido. */
export function isKnownAssetPrefix(prefix) {
  return ASSET_ID_PREFIXES.includes(prefix);
}

/**
 * Monta um Asset ID a partir de uma categoria visual e do ID do conteúdo,
 * ex: assetIdFor("PORTRAIT", "CHAR_NARUTO_GENIN_001") -> "PORTRAIT_CHAR_NARUTO_GENIN_001".
 */
export function assetIdFor(category, contentId) {
  if (!ASSET_ID_PREFIXES.includes(category)) {
    throw new Error(`Categoria de asset desconhecida: ${category}`);
  }
  if (!isWellFormedId(contentId)) {
    throw new Error(`contentId mal formado: ${contentId}`);
  }
  return `${category}_${contentId}`;
}

/**
 * Gera o próximo ID numerado disponível para um prefixo dado uma lista de IDs já usados.
 * Útil para geração procedural / ferramentas de autoria (Marco 3+).
 */
export function nextSequentialId(prefix, nameParts, existingIds) {
  const base = [prefix, ...nameParts.map((part) => part.toUpperCase())].join('_');
  const used = new Set(existingIds);
  let seq = 1;
  let candidate;
  do {
    candidate = `${base}_${String(seq).padStart(3, '0')}`;
    seq += 1;
  } while (used.has(candidate));
  return candidate;
}

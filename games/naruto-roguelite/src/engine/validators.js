// Validadores data-driven. Não conhecem personagens/jutsus específicos —
// recebem listas de entidades e regras, e devolvem uma lista de issues.
// Ver CANON_RULES.md #51 (Validação) e PROMPT MESTRE #51/#91.

/** @typedef {{ level: 'error'|'warning', code: string, entityId: string|null, message: string }} ValidationIssue */

function issue(level, code, entityId, message) {
  return { level, code, entityId, message };
}

/**
 * Encontra IDs duplicados em uma lista de entidades `{ id, ... }`.
 * Retorna uma issue de erro por ID duplicado (a partir da 2ª ocorrência).
 */
export function findDuplicateIds(entities) {
  const seen = new Set();
  const issues = [];
  for (const entity of entities) {
    const id = entity?.id;
    if (seen.has(id)) {
      issues.push(issue('error', 'DUPLICATE_ID', id, `ID duplicado: ${id}`));
    } else {
      seen.add(id);
    }
  }
  return issues;
}

/** Confere se `entity` possui todos os campos obrigatórios (não undefined/null/''). */
export function findMissingRequiredFields(entity, requiredFields) {
  const issues = [];
  for (const field of requiredFields) {
    const value = entity?.[field];
    const isMissing = value === undefined || value === null
      || (typeof value === 'string' && value.trim() === '');
    if (isMissing) {
      issues.push(issue(
        'error',
        'MISSING_REQUIRED_FIELD',
        entity?.id ?? null,
        `Campo obrigatório ausente: "${field}"`,
      ));
    }
  }
  return issues;
}

/** Confere se todos os valores de `entity[field]` (array) estão em `knownValues` (Set/Array). */
export function findUnknownValues(entity, field, knownValues, code = 'UNKNOWN_VALUE') {
  const known = knownValues instanceof Set ? knownValues : new Set(knownValues);
  const values = entity?.[field] ?? [];
  const issues = [];
  for (const value of values) {
    if (!known.has(value)) {
      issues.push(issue(
        'error',
        code,
        entity?.id ?? null,
        `Valor desconhecido em "${field}": "${value}"`,
      ));
    }
  }
  return issues;
}

/** Tags que nenhum sistema reconhece (ver CANON_RULES.md #14). */
export function findInvalidTags(entity, knownTags, field = 'tags') {
  return findUnknownValues(entity, field, knownTags, 'INVALID_TAG');
}

/** Estados referenciados que não existem no catálogo de Estados. */
export function findInvalidStates(entity, knownStates, field = 'states') {
  return findUnknownValues(entity, field, knownStates, 'INVALID_STATE');
}

/**
 * Confere se os IDs referenciados por `entity[field]` (string ou array de
 * strings) existem em `targetRegistry`.
 */
export function findUnresolvedReferences(entity, field, targetRegistry) {
  const raw = entity?.[field];
  if (raw === undefined || raw === null) return [];
  const ids = Array.isArray(raw) ? raw : [raw];
  const issues = [];
  for (const refId of ids) {
    if (!targetRegistry.has(refId)) {
      issues.push(issue(
        'error',
        'UNRESOLVED_REFERENCE',
        entity?.id ?? null,
        `Referência não resolvida em "${field}": "${refId}"`,
      ));
    }
  }
  return issues;
}

/**
 * Roda um conjunto de regras sobre uma lista de entidades.
 * `rules` = {
 *   requiredFields?: string[],
 *   tagFields?: { field: string, knownTags: Iterable<string> }[],
 *   stateFields?: { field: string, knownStates: Iterable<string> }[],
 *   referenceFields?: { field: string, registry: Registry }[],
 * }
 */
export function validateEntities(entities, rules = {}) {
  const issues = [...findDuplicateIds(entities)];

  for (const entity of entities) {
    if (rules.requiredFields) {
      issues.push(...findMissingRequiredFields(entity, rules.requiredFields));
    }
    for (const { field, knownTags } of rules.tagFields ?? []) {
      issues.push(...findInvalidTags(entity, knownTags, field));
    }
    for (const { field, knownStates } of rules.stateFields ?? []) {
      issues.push(...findInvalidStates(entity, knownStates, field));
    }
    for (const { field, registry } of rules.referenceFields ?? []) {
      issues.push(...findUnresolvedReferences(entity, field, registry));
    }
  }

  return issues;
}

/**
 * Confere se as entradas de asset esperadas para uma entidade existem no
 * Asset Manifest (mesmo que com status "missing"/"placeholder" — o que
 * importa aqui é que a referência exista, não que a arte já esteja pronta).
 */
export function findMissingAssetManifestEntries(entity, expectedAssetIds, manifestIndex) {
  const issues = [];
  for (const assetId of expectedAssetIds) {
    if (!manifestIndex.has(assetId)) {
      issues.push(issue(
        'warning',
        'MISSING_ASSET_MANIFEST_ENTRY',
        entity?.id ?? null,
        `Asset esperado sem entrada no manifesto: "${assetId}"`,
      ));
    }
  }
  return issues;
}

export function splitByLevel(issues) {
  return {
    errors: issues.filter((i) => i.level === 'error'),
    warnings: issues.filter((i) => i.level === 'warning'),
  };
}

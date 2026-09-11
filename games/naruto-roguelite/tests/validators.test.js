import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  findDuplicateIds, findMissingRequiredFields, findInvalidTags, findInvalidStates,
  findUnresolvedReferences, validateEntities, splitByLevel, findMissingAssetManifestEntries,
} from '../src/engine/validators.js';
import { Registry } from '../src/engine/registry.js';

test('findDuplicateIds só reporta a partir da 2ª ocorrência', () => {
  const issues = findDuplicateIds([
    { id: 'JUT_A_001' }, { id: 'JUT_A_001' }, { id: 'JUT_B_001' }, { id: 'JUT_A_001' },
  ]);
  assert.equal(issues.length, 2);
  assert.ok(issues.every((i) => i.code === 'DUPLICATE_ID' && i.entityId === 'JUT_A_001'));
});

test('findMissingRequiredFields detecta undefined, null e string vazia', () => {
  const issues = findMissingRequiredFields(
    { id: 'JUT_A_001', name: '', power: null },
    ['name', 'power', 'cost'],
  );
  const fields = issues.map((i) => i.message);
  assert.equal(issues.length, 3);
  assert.ok(fields.some((m) => m.includes('name')));
  assert.ok(fields.some((m) => m.includes('power')));
  assert.ok(fields.some((m) => m.includes('cost')));
});

test('findMissingRequiredFields não reclama de campos presentes e não vazios', () => {
  const issues = findMissingRequiredFields({ id: 'JUT_A_001', name: 'Rasengan', cost: 0 }, ['name', 'cost']);
  assert.equal(issues.length, 0, 'cost=0 é um valor válido, não "ausente"');
});

test('findInvalidTags aceita tags conhecidas e reporta as desconhecidas', () => {
  const known = ['TAG_KATON_001', 'TAG_AREA_001'];
  const issues = findInvalidTags({ id: 'JUT_A_001', tags: ['TAG_KATON_001', 'TAG_INEXISTENTE_001'] }, known);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].code, 'INVALID_TAG');
});

test('findInvalidStates funciona análogo a findInvalidTags com outro campo', () => {
  const known = ['STATUS_QUEIMANDO_001'];
  const issues = findInvalidStates({ id: 'JUT_A_001', states: ['STATUS_INEXISTENTE_001'] }, known);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].code, 'INVALID_STATE');
});

test('findUnresolvedReferences aceita string única ou array de IDs', () => {
  const registry = new Registry('ENEMY');
  registry.register({ id: 'ENEMY_BANDIT_001' });

  const single = findUnresolvedReferences({ id: 'X', target: 'ENEMY_BANDIT_001' }, 'target', registry);
  assert.equal(single.length, 0);

  const brokenSingle = findUnresolvedReferences({ id: 'X', target: 'ENEMY_FANTASMA_001' }, 'target', registry);
  assert.equal(brokenSingle.length, 1);
  assert.equal(brokenSingle[0].code, 'UNRESOLVED_REFERENCE');

  const array = findUnresolvedReferences(
    { id: 'X', targets: ['ENEMY_BANDIT_001', 'ENEMY_FANTASMA_002'] }, 'targets', registry,
  );
  assert.equal(array.length, 1);
});

test('findUnresolvedReferences não reclama de campo ausente (referência opcional)', () => {
  const registry = new Registry('ENEMY');
  assert.deepEqual(findUnresolvedReferences({ id: 'X' }, 'target', registry), []);
});

test('validateEntities agrega todas as regras e o duplicate check geral', () => {
  const enemyRegistry = new Registry('ENEMY');
  enemyRegistry.register({ id: 'ENEMY_BANDIT_001' });

  const entities = [
    { id: 'JUT_A_001', name: 'Válido', tags: ['TAG_KATON_001'], states: [], target: 'ENEMY_BANDIT_001' },
    { id: 'JUT_A_001', tags: ['TAG_RUIM_001'], states: ['STATUS_RUIM_001'], target: 'ENEMY_FANTASMA_001' },
  ];

  const issues = validateEntities(entities, {
    requiredFields: ['name'],
    tagFields: [{ field: 'tags', knownTags: ['TAG_KATON_001'] }],
    stateFields: [{ field: 'states', knownStates: [] }],
    referenceFields: [{ field: 'target', registry: enemyRegistry }],
  });

  const { errors } = splitByLevel(issues);
  const codes = errors.map((i) => i.code).sort();
  assert.deepEqual(codes, [
    'DUPLICATE_ID', 'INVALID_STATE', 'INVALID_TAG', 'MISSING_REQUIRED_FIELD', 'UNRESOLVED_REFERENCE',
  ].sort());
});

test('splitByLevel separa erros de avisos corretamente', () => {
  const issues = [
    { level: 'error', code: 'A' }, { level: 'warning', code: 'B' }, { level: 'error', code: 'C' },
  ];
  const { errors, warnings } = splitByLevel(issues);
  assert.equal(errors.length, 2);
  assert.equal(warnings.length, 1);
});

test('findMissingAssetManifestEntries reporta assetIds ausentes do manifesto como warning', () => {
  const manifestIndex = new Map([['PORTRAIT_CHAR_NARUTO_GENIN_001', {}]]);
  const issues = findMissingAssetManifestEntries(
    { id: 'CHAR_NARUTO_GENIN_001' },
    ['PORTRAIT_CHAR_NARUTO_GENIN_001', 'FULL_CHAR_NARUTO_GENIN_001'],
    manifestIndex,
  );
  assert.equal(issues.length, 1);
  assert.equal(issues[0].level, 'warning');
  assert.equal(issues[0].code, 'MISSING_ASSET_MANIFEST_ENTRY');
});

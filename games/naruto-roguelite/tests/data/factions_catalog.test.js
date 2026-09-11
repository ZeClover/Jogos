import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../../src/data/catalog/index.js';
import { factions } from '../../src/data/index.js';
import { FACTION_DEFINITIONS } from '../../src/data/catalog/factions.js';
import { isWellFormedId } from '../../src/engine/ids.js';
import { validateEntities, splitByLevel } from '../../src/engine/validators.js';

test('o catálogo de Facções foi registrado ao ser importado', () => {
  assert.equal(factions.size, FACTION_DEFINITIONS.length);
  assert.equal(FACTION_DEFINITIONS.length, 14, 'as 14 facções nomeadas no doc 06');
});

test('toda Facção tem ID bem formado, nome e descrição, sem duplicatas', () => {
  const issues = validateEntities(FACTION_DEFINITIONS, {
    requiredFields: ['name', 'description'],
  });
  assert.deepEqual(splitByLevel(issues).errors, []);

  for (const def of FACTION_DEFINITIONS) {
    assert.ok(isWellFormedId(def.id));
  }
});

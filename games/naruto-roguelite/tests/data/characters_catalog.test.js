import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  characters, passives, jutsus,
} from '../../src/data/index.js';
import { CHARACTER_DEFINITIONS } from '../../src/data/catalog/characters.js';
import { PASSIVE_DEFINITIONS } from '../../src/data/catalog/passives.js';
import { JUTSU_DEFINITIONS } from '../../src/data/catalog/jutsus.js';
import { isWellFormedId } from '../../src/engine/ids.js';
import { validateEntities, splitByLevel } from '../../src/engine/validators.js';
import { RANKS } from '../../src/engine/enums.js';
import { computeSquadCost, isSquadWithinBudget } from '../../src/engine/combat/characterBridge.js';

test('o catálogo de Personagens (Vertical Slice) foi registrado ao ser importado', () => {
  assert.equal(characters.size, CHARACTER_DEFINITIONS.length);
  assert.equal(CHARACTER_DEFINITIONS.length, 4, 'lote do Vertical Slice tem os 4 Genin (doc 12)');
});

test('o catálogo de Passivas foi registrado ao ser importado', () => {
  assert.equal(passives.size, PASSIVE_DEFINITIONS.length);
});

test('todo Personagem tem ID bem formado, rank válido, squadCost 1-12, sem duplicatas', () => {
  const issues = validateEntities(CHARACTER_DEFINITIONS, {
    requiredFields: ['name', 'baseCharacterId', 'version', 'rank', 'squadCost'],
  });
  assert.deepEqual(splitByLevel(issues).errors, []);

  for (const def of CHARACTER_DEFINITIONS) {
    assert.ok(isWellFormedId(def.id));
    assert.ok(RANKS.includes(def.rank), `${def.id}: rank desconhecido "${def.rank}"`);
    assert.ok(def.squadCost >= 1 && def.squadCost <= 12, `${def.id}: squadCost fora de 1-12`);
  }
});

test('todo Personagem tem loadout com reacao definida e ativas não-vazias', () => {
  for (const def of CHARACTER_DEFINITIONS) {
    assert.ok(def.loadout, `${def.id}: sem loadout`);
    assert.ok(def.loadout.reacao, `${def.id}: loadout sem reação`);
    assert.ok(Array.isArray(def.loadout.ativas) && def.loadout.ativas.length > 0, `${def.id}: loadout sem ativas`);
  }
});

test('os 4 Genin usam Kawarimi como reação (doc 12)', () => {
  for (const def of CHARACTER_DEFINITIONS) {
    assert.equal(def.loadout.reacao, 'JUT_KAWARIMI_001', `${def.id}`);
  }
});

test('todo jutsu referenciado em ativas/reacao/suprema do loadout existe no catálogo de Jutsus', () => {
  const jutsuIds = new Set(JUTSU_DEFINITIONS.map((d) => d.id));
  for (const def of CHARACTER_DEFINITIONS) {
    const { ativas, reacao, suprema } = def.loadout;
    for (const jutsuId of ativas) {
      assert.ok(jutsuIds.has(jutsuId), `${def.id}: ativa desconhecida "${jutsuId}"`);
    }
    assert.ok(jutsuIds.has(reacao), `${def.id}: reação desconhecida "${reacao}"`);
    if (suprema) assert.ok(jutsuIds.has(suprema), `${def.id}: suprema desconhecida "${suprema}"`);
  }
});

test('todo Personagem sem suprema catalogada declara pendingSuprema (não fica silenciosamente incompleto)', () => {
  for (const def of CHARACTER_DEFINITIONS) {
    if (!def.loadout.suprema) {
      assert.ok(def.loadout.pendingSuprema, `${def.id}: sem suprema e sem pendingSuprema documentando o motivo`);
    }
  }
});

test('os 4 Genin não têm mais pendingAtivas/pendingSuprema (D032 fechou a pendência D017 #2)', () => {
  for (const def of CHARACTER_DEFINITIONS) {
    assert.equal(def.loadout.pendingAtivas, undefined, `${def.id}: ainda tem pendingAtivas`);
    assert.equal(def.loadout.pendingSuprema, undefined, `${def.id}: ainda tem pendingSuprema`);
    assert.ok(def.loadout.suprema, `${def.id}: sem suprema real`);
  }
});

test('toda passiva referenciada por um Personagem (passiveId ou loadout.passivas) existe no catálogo', () => {
  const passiveIds = new Set(PASSIVE_DEFINITIONS.map((d) => d.id));
  for (const def of CHARACTER_DEFINITIONS) {
    if (def.passiveId) assert.ok(passiveIds.has(def.passiveId), `${def.id}: passiveId desconhecido`);
    for (const passiveId of def.loadout.passivas ?? []) {
      assert.ok(passiveIds.has(passiveId), `${def.id}: passiva desconhecida "${passiveId}" em loadout.passivas`);
    }
  }
});

test('exclusiveResource, quando presente, tem id e max > 0', () => {
  for (const def of CHARACTER_DEFINITIONS) {
    if (def.exclusiveResource) {
      assert.ok(def.exclusiveResource.id);
      assert.ok(def.exclusiveResource.max > 0);
    }
  }
});

test('os 4 Genin do Vertical Slice cabem folgadamente no orçamento padrão de esquadrão (12)', () => {
  assert.equal(computeSquadCost(CHARACTER_DEFINITIONS), 8);
  assert.equal(isSquadWithinBudget(CHARACTER_DEFINITIONS), true);
});

test('Kage Bunshin e Analyze concedem recurso compatível com o exclusiveResource do dono no doc', () => {
  const kageBunshin = jutsus.get('JUT_KAGE_BUNSHIN_001');
  const analyze = jutsus.get('JUT_ANALYZE_SHIKAMARU_001');
  const naruto = characters.get('CHAR_NARUTO_GENIN_001');
  const shikamaru = characters.get('CHAR_SHIKAMARU_GENIN_001');

  assert.ok(kageBunshin.grantsResource, 'Kage Bunshin deveria conceder recurso');
  assert.equal(naruto.exclusiveResource.id, 'clones');
  assert.ok(analyze.grantsResource, 'Analyze deveria conceder recurso');
  assert.equal(shikamaru.exclusiveResource.id, 'planejamento');
});

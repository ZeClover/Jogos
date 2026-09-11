import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../../src/data/catalog/index.js';
import {
  regions, missions, enemies, bosses,
} from '../../src/data/index.js';
import { REGION_DEFINITIONS } from '../../src/data/catalog/regions.js';
import { MISSION_TEMPLATES } from '../../src/data/catalog/missions.js';
import { isWellFormedId } from '../../src/engine/ids.js';
import { MISSION_OBJECTIVE_TYPES, NODE_TYPES } from '../../src/engine/enums.js';

test('o catálogo de Regiões foi registrado ao ser importado', () => {
  assert.equal(regions.size, REGION_DEFINITIONS.length);
  assert.equal(REGION_DEFINITIONS.length, 2, 'País das Ondas (Marco 7) + Floresta da Morte (Marco 9)');
});

test('o catálogo de Templates de Missão foi registrado ao ser importado', () => {
  assert.equal(missions.size, MISSION_TEMPLATES.length);
});

test('Região com pool fixo (sem useGenerator) tem boss/inimigos do pool resolvidos nos catálogos reais', () => {
  for (const region of REGION_DEFINITIONS.filter((r) => !r.useGenerator)) {
    assert.ok(isWellFormedId(region.id));
    assert.ok(bosses.has(region.bossId), `${region.id}: bossId desconhecido "${region.bossId}"`);
    for (const [tier, ids] of Object.entries(region.enemyPoolByTier)) {
      for (const enemyId of ids) {
        assert.ok(enemies.has(enemyId), `${region.id}: enemyId desconhecido "${enemyId}" no tier ${tier}`);
      }
    }
  }
});

test('Região com useGenerator:true tem ID bem formado e NÃO declara enemyPoolByTier/bossId estático', () => {
  for (const region of REGION_DEFINITIONS.filter((r) => r.useGenerator)) {
    assert.ok(isWellFormedId(region.id));
    assert.equal(region.enemyPoolByTier, undefined);
  }
});

test('nodeTypeWeights de toda Região usa só tipos de NODE_TYPES conhecidos', () => {
  for (const region of REGION_DEFINITIONS) {
    for (const entry of region.nodeTypeWeights) {
      assert.ok(NODE_TYPES.includes(entry.type), `${region.id}: tipo de nó desconhecido "${entry.type}"`);
      assert.ok(entry.weight > 0);
    }
  }
});

test('todo Template de Missão tem ID bem formado e objectiveType conhecido', () => {
  for (const template of MISSION_TEMPLATES) {
    assert.ok(isWellFormedId(template.id));
    assert.ok(MISSION_OBJECTIVE_TYPES.includes(template.objectiveType), `${template.id}: objectiveType desconhecido "${template.objectiveType}"`);
    assert.ok(template.name?.length > 0);
    assert.ok(template.description?.length > 0);
  }
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRngStream } from '../../src/engine/rng.js';
import { generateRegionMap, findNode } from '../../src/engine/run/mapGenerator.js';

const FIXTURE_REGION = {
  id: 'REG_FIXTURE_001',
  enemyPoolByTier: {
    COMMON: ['ENEMY_FIXTURE_COMMON_001'],
    VETERAN: ['ENEMY_FIXTURE_VETERAN_001'],
    ELITE: ['ENEMY_FIXTURE_ELITE_001'],
  },
  bossId: 'BOSS_FIXTURE_001',
  nodeTypeWeights: [
    { type: 'MISSAO', weight: 5 },
    { type: 'ELITE', weight: 2 },
    { type: 'DESCANSO', weight: 2 },
  ],
};

function buildMap(seed = 'map-test') {
  return generateRegionMap({ region: FIXTURE_REGION, rng: createRngStream(seed) });
}

test('generateRegionMap termina em uma única camada com 1 nó BOSS', () => {
  const map = buildMap();
  const lastLayer = map.layers.at(-1);
  assert.equal(lastLayer.length, 1);
  assert.equal(lastLayer[0].type, 'BOSS');
  assert.equal(lastLayer[0].isBoss, true);
  assert.deepEqual(lastLayer[0].enemyIds, [FIXTURE_REGION.bossId]);
});

test('generateRegionMap gera ao menos 2 camadas de missão antes do boss', () => {
  const map = buildMap();
  assert.ok(map.layers.length >= 3, 'espera >=2 camadas de missão + 1 camada de boss');
});

test('startNodeIds aponta para os nós da 1ª camada', () => {
  const map = buildMap();
  assert.deepEqual(map.startNodeIds, map.layers[0].map((n) => n.id));
});

test('todo nó (exceto a última camada) tem connectsTo apontando para ids que existem na camada seguinte', () => {
  const map = buildMap();
  for (let i = 0; i < map.layers.length - 1; i += 1) {
    const nextIds = new Set(map.layers[i + 1].map((n) => n.id));
    for (const node of map.layers[i]) {
      assert.ok(node.connectsTo.length >= 1, `${node.id} sem nenhuma aresta`);
      for (const targetId of node.connectsTo) {
        assert.ok(nextIds.has(targetId), `${node.id} conecta a um id inexistente "${targetId}"`);
      }
    }
  }
});

test('todo nó de uma camada (exceto a 1ª) tem ao menos 1 aresta de entrada (nenhum nó órfão/inalcançável)', () => {
  const map = buildMap();
  for (let i = 1; i < map.layers.length; i += 1) {
    const incoming = new Set(map.layers[i - 1].flatMap((n) => n.connectsTo));
    for (const node of map.layers[i]) {
      assert.ok(incoming.has(node.id), `${node.id} não tem nenhuma aresta de entrada`);
    }
  }
});

test('nó MISSAO usa um pool de inimigo do tier sorteado, e nó ELITE usa o pool ELITE', () => {
  const map = buildMap();
  const allEliteIds = new Set(FIXTURE_REGION.enemyPoolByTier.ELITE);
  const allKnownEnemyIds = new Set(Object.values(FIXTURE_REGION.enemyPoolByTier).flat());
  for (const layer of map.layers) {
    for (const node of layer) {
      if (node.type === 'MISSAO') {
        assert.ok(node.enemyIds.length >= 1 && node.enemyIds.length <= 2);
        for (const id of node.enemyIds) assert.ok(allKnownEnemyIds.has(id));
      }
      if (node.type === 'ELITE') {
        for (const id of node.enemyIds) assert.ok(allEliteIds.has(id));
      }
      if (node.type === 'DESCANSO') {
        assert.equal(node.enemyIds, undefined);
      }
    }
  }
});

test('mesma seed produz o mesmo mapa (determinístico)', () => {
  const a = buildMap('same-seed');
  const b = buildMap('same-seed');
  assert.deepEqual(a, b);
});

test('nó LOJA (Marco 10, D028) não tem enemyIds e tem nome próprio, quando sorteado', () => {
  const regionWithLoja = { ...FIXTURE_REGION, nodeTypeWeights: [{ type: 'LOJA', weight: 1 }] };
  const map = generateRegionMap({ region: regionWithLoja, rng: createRngStream('loja-test') });
  const lojaNodes = map.layers.flat().filter((n) => n.type === 'LOJA');
  assert.ok(lojaNodes.length > 0, 'com peso 1 exclusivo, toda camada comum deveria sortear LOJA');
  for (const node of lojaNodes) {
    assert.equal(node.enemyIds, undefined);
    assert.ok(node.name.length > 0);
  }
});

test('seeds diferentes tendem a produzir mapas diferentes', () => {
  const a = buildMap('seed-a');
  const b = buildMap('seed-b');
  assert.notDeepEqual(a, b);
});

test('findNode acha um nó em qualquer camada, e devolve undefined/null para id inexistente', () => {
  const map = buildMap();
  const target = map.layers[1][0];
  assert.equal(findNode(map, target.id), target);
  assert.equal(findNode(map, 'NODE_NAO_EXISTE'), null);
});

test('região com useGenerator:true tem generatedEnemies vazio', () => {
  const map = buildMap();
  assert.deepEqual(map.generatedEnemies, {});
});

const GENERATOR_REGION = {
  id: 'REG_FIXTURE_GEN_001',
  useGenerator: true,
  nodeTypeWeights: [
    { type: 'MISSAO', weight: 5 },
    { type: 'ELITE', weight: 2 },
    { type: 'DESCANSO', weight: 2 },
  ],
  // sem bossId de propósito: capstone deve virar Mini-Boss gerado (D023 #3).
};

function buildGeneratorMap(seed = 'gen-map-test') {
  return generateRegionMap({ region: GENERATOR_REGION, rng: createRngStream(seed) });
}

test('região com useGenerator:true popula generatedEnemies para todo enemyId de nó MISSAO/ELITE/BOSS', () => {
  const map = buildGeneratorMap();
  const allEnemyIds = map.layers.flatMap((layer) => layer.flatMap((node) => node.enemyIds ?? []));
  for (const id of allEnemyIds) {
    assert.ok(map.generatedEnemies[id], `enemyId "${id}" sem ficha gerada correspondente`);
  }
});

test('região com useGenerator:true e sem bossId termina num nó BOSS com Mini-Boss gerado (tier MINI_BOSS, IA ELITE)', () => {
  const map = buildGeneratorMap();
  const bossNode = map.layers.at(-1)[0];
  assert.equal(bossNode.type, 'BOSS');
  assert.equal(bossNode.isBoss, true);
  const bossDef = map.generatedEnemies[bossNode.enemyIds[0]];
  assert.equal(bossDef.tier, 'MINI_BOSS');
  assert.equal(bossDef.aiLevel, 'ELITE');
});

test('região com useGenerator:true não referencia nenhum ID do catálogo estático de Inimigos', () => {
  const map = buildGeneratorMap();
  const allEnemyIds = map.layers.flatMap((layer) => layer.flatMap((node) => node.enemyIds ?? []));
  for (const id of allEnemyIds) {
    assert.ok(id.startsWith('GEN_'), `id "${id}" não parece gerado`);
  }
});

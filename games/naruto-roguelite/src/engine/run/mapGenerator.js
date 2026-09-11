// Gerador de Mapa (Marco 7, CANON_RULES.md — Run/Campanha: "mapa
// ramificado, 2-4 rotas, múltiplos tipos de nó... seed determina mapa").
// Puro e determinístico: a mesma RngStream (SeedManager.map) sempre
// produz o mesmo grafo para a mesma Região. Não conhece combate/UI — só
// monta a estrutura de nós + arestas a partir da ficha de Região (dado,
// src/data/catalog/regions.js). Ver DECISIONS.md D020 para o que fica de
// fora (LOJA/HOSPITAL/TREINO/RECRUTAMENTO/DUNGEON/SEGREDO/EVENTO).

const MISSION_LAYER_COUNT = 2; // camadas de nó comum antes do boss
const NODES_PER_MISSION_LAYER = 2; // "2-4 rotas" — 2 nós por camada com aresta dupla ocasional

const TIER_BY_MISSION_LAYER_WEIGHTS = [
  { item: 'COMMON', weight: 3 },
  { item: 'VETERAN', weight: 2 },
];

const TIER_TO_RANK = {
  COMMON: 'D', VETERAN: 'C', SPECIALIST: 'B', ELITE: 'B',
};

function pickEnemyTier(rng) {
  return rng.weightedPick(TIER_BY_MISSION_LAYER_WEIGHTS);
}

function buildMissaoNode({
  region, layer, index, rng,
}) {
  const tier = pickEnemyTier(rng);
  const pool = region.enemyPoolByTier[tier] ?? region.enemyPoolByTier.COMMON;
  const enemyCount = rng.int(1, 2);
  const enemyIds = Array.from({ length: enemyCount }, () => rng.pick(pool));
  return {
    id: `NODE_${layer}_${index}`,
    type: 'MISSAO',
    layer,
    name: 'Confronto',
    objectiveType: rng.pick(['BATALHA', 'DEFESA']),
    enemyIds,
    rank: TIER_TO_RANK[tier],
  };
}

function buildEliteNode({ region, layer, index }) {
  const eliteIds = region.enemyPoolByTier.ELITE ?? [];
  return {
    id: `NODE_${layer}_${index}`,
    type: 'ELITE',
    layer,
    name: 'Emboscada de Elite',
    objectiveType: 'CACA',
    enemyIds: eliteIds,
    rank: 'B',
  };
}

function buildDescansoNode({ layer, index }) {
  return {
    id: `NODE_${layer}_${index}`, type: 'DESCANSO', layer, name: 'Descanso',
  };
}

function buildNode({
  region, type, layer, index, rng,
}) {
  if (type === 'DESCANSO') return buildDescansoNode({ layer, index });
  if (type === 'ELITE') return buildEliteNode({ region, layer, index });
  return buildMissaoNode({
    region, layer, index, rng,
  });
}

function buildBossNode({ region, layer }) {
  return {
    id: `NODE_${layer}_0`,
    type: 'BOSS',
    layer,
    name: 'Confronto Final',
    objectiveType: 'DUELO',
    enemyIds: [region.bossId],
    rank: 'A',
    isBoss: true,
  };
}

/** Conecta cada nó de `current` a 1-2 nós de `next`, garantindo que todo nó de `next` tenha ao menos 1 entrada. */
function connectLayer(current, next, rng) {
  for (const node of current) {
    node.connectsTo = [];
    if (next.length === 1) {
      node.connectsTo.push(next[0].id);
      continue;
    }
    const primary = rng.pick(next);
    node.connectsTo.push(primary.id);
    if (rng.chance(0.4)) {
      const other = next.find((n) => n.id !== primary.id);
      if (other) node.connectsTo.push(other.id);
    }
  }
  for (const n of next) {
    const hasIncoming = current.some((c) => c.connectsTo.includes(n.id));
    if (!hasIncoming) rng.pick(current).connectsTo.push(n.id);
  }
}

/**
 * Gera o grafo de nós de uma Região: `MISSION_LAYER_COUNT` camadas de nós
 * comuns (MISSAO/ELITE/DESCANSO, sorteados por `region.nodeTypeWeights`)
 * seguidas de uma camada final de 1 nó BOSS. Determinístico para a mesma
 * `rng` (use sempre `seedManager.map`, nunca uma RngStream solta).
 * @param {object} params
 * @param {import('../../data/catalog/regions.js').REGION_DEFINITIONS[number]} params.region
 * @param {import('../rng.js').RngStream} params.rng
 */
export function generateRegionMap({ region, rng }) {
  const layers = [];
  for (let layer = 0; layer < MISSION_LAYER_COUNT; layer += 1) {
    const nodes = [];
    for (let index = 0; index < NODES_PER_MISSION_LAYER; index += 1) {
      const type = rng.weightedPick(region.nodeTypeWeights.map((e) => ({ item: e.type, weight: e.weight })));
      nodes.push(buildNode({
        region, type, layer, index, rng,
      }));
    }
    layers.push(nodes);
  }
  layers.push([buildBossNode({ region, layer: MISSION_LAYER_COUNT })]);

  for (let i = 0; i < layers.length - 1; i += 1) {
    connectLayer(layers[i], layers[i + 1], rng);
  }

  return {
    regionId: region.id,
    layers,
    startNodeIds: layers[0].map((n) => n.id),
  };
}

/** Acha um nó pelo id em qualquer camada do mapa. */
export function findNode(map, nodeId) {
  for (const layer of map.layers) {
    const found = layer.find((n) => n.id === nodeId);
    if (found) return found;
  }
  return null;
}

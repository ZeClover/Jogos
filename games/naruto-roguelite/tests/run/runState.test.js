import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SeedManager } from '../../src/engine/seed.js';
import {
  createRun, availableNodes, resolveNode, spendReinforceDay, findNode,
} from '../../src/engine/run/runState.js';

const FIXTURE_REGION = {
  id: 'REG_FIXTURE_001',
  enemyPoolByTier: { COMMON: ['ENEMY_FIXTURE_001'], VETERAN: ['ENEMY_FIXTURE_002'], ELITE: ['ENEMY_FIXTURE_003'] },
  bossId: 'BOSS_FIXTURE_001',
  nodeTypeWeights: [{ type: 'MISSAO', weight: 5 }, { type: 'ELITE', weight: 2 }, { type: 'DESCANSO', weight: 2 }],
};

function newRun(seed = 'run-test') {
  return createRun({ region: FIXTURE_REGION, seedManager: new SeedManager(seed) });
}

test('createRun começa no dia 1, status IN_PROGRESS, sem nós visitados, Ryō zerado', () => {
  const run = newRun();
  assert.equal(run.day, 1);
  assert.equal(run.status, 'IN_PROGRESS');
  assert.deepEqual(run.visitedNodeIds, []);
  assert.deepEqual(run.chronicle, []);
  assert.deepEqual(run.currentNodeIds, run.map.startNodeIds);
  assert.equal(run.ryo, 0);
});

test('availableNodes devolve os objetos de nó correspondentes a currentNodeIds', () => {
  const run = newRun();
  const nodes = availableNodes(run);
  assert.deepEqual(nodes.map((n) => n.id), run.currentNodeIds);
});

test('resolveNode avança o dia e registra a Crônica', () => {
  const run = newRun();
  const node = availableNodes(run)[0];
  resolveNode(run, node, 'SUCESSO');
  assert.equal(run.day, 2);
  assert.deepEqual(run.visitedNodeIds, [node.id]);
  assert.equal(run.chronicle.length, 1);
  assert.equal(run.chronicle[0].day, 2);
  assert.equal(run.chronicle[0].result, 'SUCESSO');
});

test('resolveNode soma Ryō de acordo com o resultado (economy.js)', () => {
  const run = newRun();
  const node = availableNodes(run)[0];
  resolveNode(run, node, 'SUCESSO_PERFEITO');
  assert.equal(run.ryo, 40);
});

test('resolveNode com resultado DESASTRE marca a run como DEFEAT e não avança currentNodeIds', () => {
  const run = newRun();
  const node = availableNodes(run)[0];
  const before = run.currentNodeIds;
  resolveNode(run, node, 'DESASTRE');
  assert.equal(run.status, 'DEFEAT');
  assert.equal(run.currentNodeIds, before);
});

test('resolveNode em um nó isBoss marca a run como VICTORY', () => {
  const run = newRun();
  const bossNode = run.map.layers.at(-1)[0];
  resolveNode(run, bossNode, 'SUCESSO');
  assert.equal(run.status, 'VICTORY');
});

test('resolveNode em um nó comum avança currentNodeIds para node.connectsTo', () => {
  const run = newRun();
  const node = availableNodes(run)[0];
  resolveNode(run, node, 'SUCESSO');
  assert.deepEqual(run.currentNodeIds, node.connectsTo);
});

test('spendReinforceDay soma 1 dia sem resolver nenhum nó', () => {
  const run = newRun();
  spendReinforceDay(run);
  assert.equal(run.day, 2);
  assert.deepEqual(run.visitedNodeIds, []);
});

test('findNode (re-exportado) acha um nó do mapa da run', () => {
  const run = newRun();
  const node = availableNodes(run)[0];
  assert.equal(findNode(run.map, node.id), node);
});

test('createRun com a mesma seed produz a mesma run inicial (determinístico)', () => {
  const a = newRun('same');
  const b = newRun('same');
  assert.deepEqual(a, b);
});

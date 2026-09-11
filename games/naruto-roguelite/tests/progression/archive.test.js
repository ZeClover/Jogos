import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createArchive, discover, discoverAll, isDiscovered, archiveLabel,
} from '../../src/engine/progression/archive.js';

test('createArchive começa vazio', () => {
  const archive = createArchive();
  assert.deepEqual(archive.discoveredIds, []);
});

test('discover marca um id como descoberto e devolve true na 1ª vez', () => {
  const archive = createArchive();
  assert.equal(discover(archive, 'ENEMY_X'), true);
  assert.equal(isDiscovered(archive, 'ENEMY_X'), true);
});

test('discover é idempotente: devolve false em descobertas repetidas', () => {
  const archive = createArchive();
  discover(archive, 'ENEMY_X');
  assert.equal(discover(archive, 'ENEMY_X'), false);
  assert.equal(archive.discoveredIds.length, 1);
});

test('discover com id nulo/vazio não faz nada e devolve false', () => {
  const archive = createArchive();
  assert.equal(discover(archive, null), false);
  assert.equal(discover(archive, undefined), false);
  assert.equal(archive.discoveredIds.length, 0);
});

test('discoverAll devolve quantos ids eram realmente novos', () => {
  const archive = createArchive();
  discover(archive, 'A');
  const newCount = discoverAll(archive, ['A', 'B', 'C']);
  assert.equal(newCount, 2);
  assert.deepEqual(archive.discoveredIds.sort(), ['A', 'B', 'C']);
});

test('archiveLabel devolve "???" para id não descoberto e o nome real para descoberto', () => {
  const archive = createArchive();
  const registry = { get: (id) => (id === 'ENEMY_X' ? { name: 'Bandido' } : undefined) };

  assert.equal(archiveLabel(archive, 'ENEMY_X', registry), '???');
  discover(archive, 'ENEMY_X');
  assert.equal(archiveLabel(archive, 'ENEMY_X', registry), 'Bandido');
});

test('archiveLabel cai no próprio id se descoberto mas ausente da registry', () => {
  const archive = createArchive();
  discover(archive, 'ENEMY_FANTASMA');
  const registry = { get: () => undefined };
  assert.equal(archiveLabel(archive, 'ENEMY_FANTASMA', registry), 'ENEMY_FANTASMA');
});

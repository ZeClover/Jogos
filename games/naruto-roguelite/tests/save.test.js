import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SaveManager, SaveError, CURRENT_SCHEMA_VERSION, createMemoryStorage,
} from '../src/engine/save.js';

function makeManager(extra = {}) {
  return new SaveManager({ storage: createMemoryStorage(), namespace: 'test-ns', ...extra });
}

test('save/load faz round-trip preservando os dados', () => {
  const manager = makeManager();
  manager.save('run', { day: 4, flags: ['saved_suna_ninja'] });
  const loaded = manager.load('run');
  assert.deepEqual(loaded.data, { day: 4, flags: ['saved_suna_ninja'] });
  assert.equal(loaded.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.ok(typeof loaded.savedAt === 'string' && loaded.savedAt.length > 0);
});

test('load retorna null quando não há save no slot', () => {
  const manager = makeManager();
  assert.equal(manager.load('run'), null);
});

test('has/delete funcionam corretamente', () => {
  const manager = makeManager();
  assert.equal(manager.has('account'), false);
  manager.save('account', { legacy: 10 });
  assert.equal(manager.has('account'), true);
  manager.delete('account');
  assert.equal(manager.has('account'), false);
  assert.equal(manager.load('account'), null);
});

test('slots diferentes ("account" vs "run") não colidem', () => {
  const manager = makeManager();
  manager.save('account', { legacy: 1 });
  manager.save('run', { day: 1 });
  assert.deepEqual(manager.load('account').data, { legacy: 1 });
  assert.deepEqual(manager.load('run').data, { day: 1 });
});

test('namespaces diferentes não colidem no mesmo storage', () => {
  const storage = createMemoryStorage();
  const a = new SaveManager({ storage, namespace: 'game-a' });
  const b = new SaveManager({ storage, namespace: 'game-b' });
  a.save('run', { owner: 'a' });
  b.save('run', { owner: 'b' });
  assert.deepEqual(a.load('run').data, { owner: 'a' });
  assert.deepEqual(b.load('run').data, { owner: 'b' });
});

test('load lança SaveError em JSON corrompido', () => {
  const storage = createMemoryStorage();
  storage.setItem('test-ns:run', '{ isso não é json');
  const manager = new SaveManager({ storage, namespace: 'test-ns' });
  assert.throws(() => manager.load('run'), SaveError);
});

test('load aplica migrações em cadeia até a versão atual', () => {
  const storage = createMemoryStorage();
  storage.setItem('test-ns:run', JSON.stringify({
    schemaVersion: 0,
    savedAt: '2020-01-01T00:00:00.000Z',
    data: { day: 1 },
  }));
  const manager = new SaveManager({
    storage,
    namespace: 'test-ns',
    migrations: {
      0: (data) => ({ ...data, migratedFromV0: true }),
    },
  });
  const loaded = manager.load('run');
  assert.equal(loaded.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.deepEqual(loaded.data, { day: 1, migratedFromV0: true });
});

test('load lança SaveError quando falta uma migração no meio da cadeia', () => {
  const storage = createMemoryStorage();
  storage.setItem('test-ns:run', JSON.stringify({
    schemaVersion: 0,
    savedAt: '2020-01-01T00:00:00.000Z',
    data: {},
  }));
  const manager = new SaveManager({ storage, namespace: 'test-ns', migrations: {} });
  assert.throws(() => manager.load('run'), SaveError);
});

test('createMemoryStorage funciona como um localStorage mínimo', () => {
  const storage = createMemoryStorage();
  assert.equal(storage.getItem('x'), null);
  storage.setItem('x', 'y');
  assert.equal(storage.getItem('x'), 'y');
  storage.removeItem('x');
  assert.equal(storage.getItem('x'), null);
});

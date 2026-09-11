import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  Registry, DuplicateIdError, InvalidIdError,
} from '../src/engine/registry.js';

test('register aceita entidade com ID válido e a torna recuperável', () => {
  const registry = new Registry('CHAR');
  const naruto = { id: 'CHAR_NARUTO_GENIN_001', name: 'Naruto' };
  registry.register(naruto);
  assert.equal(registry.get('CHAR_NARUTO_GENIN_001'), naruto);
  assert.equal(registry.has('CHAR_NARUTO_GENIN_001'), true);
  assert.equal(registry.size, 1);
});

test('register rejeita ID com prefixo errado', () => {
  const registry = new Registry('CHAR');
  assert.throws(
    () => registry.register({ id: 'JUT_RASENGAN_001' }),
    InvalidIdError,
  );
});

test('register rejeita ID mal formado', () => {
  const registry = new Registry('CHAR');
  assert.throws(() => registry.register({ id: 'naruto' }), InvalidIdError);
});

test('register rejeita ID duplicado', () => {
  const registry = new Registry('CHAR');
  registry.register({ id: 'CHAR_NARUTO_GENIN_001' });
  assert.throws(
    () => registry.register({ id: 'CHAR_NARUTO_GENIN_001' }),
    DuplicateIdError,
  );
});

test('registerAll registra em lote e preserva a ordem', () => {
  const registry = new Registry('JUT');
  const result = registry.registerAll([
    { id: 'JUT_A_001' },
    { id: 'JUT_B_001' },
  ]);
  assert.equal(registry.size, 2);
  assert.deepEqual(result.map((e) => e.id), ['JUT_A_001', 'JUT_B_001']);
});

test('registerAll para no primeiro erro (não registra parcialmente em silêncio)', () => {
  const registry = new Registry('JUT');
  assert.throws(() => registry.registerAll([
    { id: 'JUT_A_001' },
    { id: 'JUT_A_001' }, // duplicado
    { id: 'JUT_C_001' },
  ]));
  assert.equal(registry.size, 1, 'o primeiro item válido deve ter sido registrado antes do erro');
  assert.equal(registry.has('JUT_C_001'), false);
});

test('all() retorna todas as entidades registradas', () => {
  const registry = new Registry('ITEM');
  registry.registerAll([{ id: 'ITEM_A_001' }, { id: 'ITEM_B_001' }]);
  assert.deepEqual(registry.all().map((e) => e.id).sort(), ['ITEM_A_001', 'ITEM_B_001']);
});

test('get retorna undefined para ID não registrado', () => {
  const registry = new Registry('BOSS');
  assert.equal(registry.get('BOSS_NAOEXISTE_001'), undefined);
  assert.equal(registry.has('BOSS_NAOEXISTE_001'), false);
});

test('clear esvazia a registry', () => {
  const registry = new Registry('BOSS');
  registry.register({ id: 'BOSS_ZABUZA_001' });
  registry.clear();
  assert.equal(registry.size, 0);
});

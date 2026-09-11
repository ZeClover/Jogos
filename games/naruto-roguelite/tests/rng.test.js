import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  hashString, mulberry32, createRngStream, RngStream,
} from '../src/engine/rng.js';

test('hashString é determinística para a mesma string', () => {
  assert.equal(hashString('naruto-roguelite'), hashString('naruto-roguelite'));
});

test('hashString distingue strings diferentes (casos conhecidos)', () => {
  assert.notEqual(hashString('seed-a'), hashString('seed-b'));
  assert.notEqual(hashString('seed-a::map'), hashString('seed-a::combat'));
});

test('mulberry32 com a mesma seed produz a mesma sequência', () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  const seqA = Array.from({ length: 10 }, () => a());
  const seqB = Array.from({ length: 10 }, () => b());
  assert.deepEqual(seqA, seqB);
});

test('mulberry32 com seeds diferentes produz sequências diferentes', () => {
  const a = mulberry32(1);
  const b = mulberry32(2);
  assert.notEqual(a(), b());
});

test('mulberry32 sempre produz floats em [0, 1)', () => {
  const next = mulberry32(1234);
  for (let i = 0; i < 200; i += 1) {
    const value = next();
    assert.ok(value >= 0 && value < 1, `valor fora de [0,1): ${value}`);
  }
});

test('RngStream.int respeita os limites inclusivos', () => {
  const rng = createRngStream('seed-int', 'test');
  for (let i = 0; i < 200; i += 1) {
    const value = rng.int(3, 7);
    assert.ok(value >= 3 && value <= 7, `fora do intervalo: ${value}`);
    assert.ok(Number.isInteger(value));
  }
});

test('RngStream.pick sempre retorna um elemento do array', () => {
  const rng = createRngStream('seed-pick', 'test');
  const options = ['a', 'b', 'c'];
  for (let i = 0; i < 50; i += 1) {
    assert.ok(options.includes(rng.pick(options)));
  }
});

test('RngStream.pick lança em array vazio', () => {
  const rng = createRngStream('seed-pick-empty', 'test');
  assert.throws(() => rng.pick([]));
});

test('RngStream.weightedPick nunca escolhe entradas de peso zero', () => {
  const rng = createRngStream('seed-weighted', 'test');
  const entries = [{ item: 'nunca', weight: 0 }, { item: 'sempre', weight: 10 }];
  for (let i = 0; i < 100; i += 1) {
    assert.equal(rng.weightedPick(entries), 'sempre');
  }
});

test('RngStream.weightedPick rejeita soma de pesos <= 0', () => {
  const rng = createRngStream('seed-weighted-zero', 'test');
  assert.throws(() => rng.weightedPick([{ item: 'a', weight: 0 }]));
});

test('RngStream.shuffle preserva os elementos (é uma permutação)', () => {
  const rng = createRngStream('seed-shuffle', 'test');
  const original = [1, 2, 3, 4, 5, 6, 7, 8];
  const shuffled = rng.shuffle(original);
  assert.deepEqual([...shuffled].sort(), [...original].sort());
  assert.deepEqual(original, [1, 2, 3, 4, 5, 6, 7, 8], 'não deve mutar o array original');
});

test('createRngStream aceita seed textual e é determinística', () => {
  const a = createRngStream('minha-seed', 'combat');
  const b = createRngStream('minha-seed', 'combat');
  assert.equal(a.float(), b.float());
});

test('RngStream conta chamadas em callCount', () => {
  const rng = new RngStream(1, 'contador');
  assert.equal(rng.callCount, 0);
  rng.float();
  rng.float();
  assert.equal(rng.callCount, 2);
});

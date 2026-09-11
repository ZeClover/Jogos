import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../../src/data/catalog/index.js';
import { createRngStream } from '../../src/engine/rng.js';
import { generateEnemy, generateMiniBoss } from '../../src/engine/generator/enemyGenerator.js';
import { ENEMY_TIERS, AI_LEVELS } from '../../src/engine/enums.js';

test('generateEnemy lança para um rank sem âncora de stats conhecida', () => {
  assert.throws(() => generateEnemy({ rank: 'BOSS', rng: createRngStream('x') }));
});

test('generateEnemy devolve um tier/aiLevel válidos (vocabulário conhecido)', () => {
  const def = generateEnemy({ rank: 'VETERAN', rng: createRngStream('x') });
  assert.ok(ENEMY_TIERS.includes(def.tier));
  assert.ok(AI_LEVELS.includes(def.aiLevel));
  assert.equal(def.tier, 'VETERAN');
});

test('generateEnemy marca `generated: true` e nunca registra na Registry `enemies`', async () => {
  const { enemies } = await import('../../src/data/index.js');
  const before = enemies.size;
  const def = generateEnemy({ rank: 'COMMON', rng: createRngStream('x') });
  assert.equal(def.generated, true);
  assert.equal(enemies.size, before);
  assert.equal(enemies.has(def.id), false);
});

test('generateEnemy nunca concede jutsu/loadout — só stats (nenhum golpe especial inventado)', () => {
  const def = generateEnemy({ rank: 'ELITE', rng: createRngStream('x') });
  assert.equal(def.loadout, undefined);
});

test('generateEnemy aplica o bônus de Natureza a exatamente um atributo (+15% sobre a âncora)', () => {
  // rng "espião": sempre escolhe o primeiro item de cada pick/int -> Natureza determinística (Katon -> taijutsu).
  const spyRng = {
    pick: (arr) => arr[0], int: (min) => min,
  };
  const def = generateEnemy({ rank: 'COMMON', rng: spyRng });
  assert.ok(def.name.includes('Katon'));
  assert.equal(def.stats.taijutsu, Math.round(12 * 1.15));
});

test('generateEnemy é determinístico para a mesma RngStream/seed', () => {
  const a = generateEnemy({ rank: 'SPECIALIST', rng: createRngStream('same') });
  const b = generateEnemy({ rank: 'SPECIALIST', rng: createRngStream('same') });
  assert.deepEqual(a, b);
});

test('generateMiniBoss usa o tier MINI_BOSS com stats maiores que ELITE e IA genérica (sem perfil bespoke)', () => {
  const rng = createRngStream('mini-boss-test');
  const miniBoss = generateMiniBoss({ rng });
  const elite = generateEnemy({ rank: 'ELITE', rng: createRngStream('mini-boss-test') });
  assert.equal(miniBoss.tier, 'MINI_BOSS');
  assert.equal(miniBoss.aiLevel, 'ELITE');
  assert.ok(miniBoss.stats.hpMax > elite.stats.hpMax);
});

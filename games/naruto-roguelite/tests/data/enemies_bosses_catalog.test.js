import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../../src/data/catalog/jutsus.js'; // popula `jutsus` antes de validar o loadout de Zabuza abaixo
import {
  enemies, bosses, jutsus,
} from '../../src/data/index.js';
import { ENEMY_DEFINITIONS } from '../../src/data/catalog/enemies.js';
import { BOSS_DEFINITIONS } from '../../src/data/catalog/bosses.js';
import { isWellFormedId } from '../../src/engine/ids.js';
import { validateEntities, splitByLevel } from '../../src/engine/validators.js';
import { AI_LEVELS, ENEMY_TIERS } from '../../src/engine/enums.js';
import { BOSS_AI_PROFILES } from '../../src/engine/combat/ai.js';

test('o catálogo de Inimigos (País das Ondas) foi registrado ao ser importado', () => {
  assert.equal(enemies.size, ENEMY_DEFINITIONS.length);
  assert.equal(ENEMY_DEFINITIONS.length, 4, 'doc 15 P0 lista 4 arquétipos de inimigo');
});

test('o catálogo de Bosses foi registrado ao ser importado', () => {
  assert.equal(bosses.size, BOSS_DEFINITIONS.length);
  assert.equal(BOSS_DEFINITIONS.length, 1, 'primeiro boss do Vertical Slice: Zabuza');
});

test('todo Inimigo tem ID bem formado, tier/aiLevel válidos, sem duplicatas', () => {
  const issues = validateEntities(ENEMY_DEFINITIONS, {
    requiredFields: ['name', 'tier', 'aiLevel'],
  });
  assert.deepEqual(splitByLevel(issues).errors, []);

  for (const def of ENEMY_DEFINITIONS) {
    assert.ok(isWellFormedId(def.id));
    assert.ok(ENEMY_TIERS.includes(def.tier), `${def.id}: tier desconhecido "${def.tier}"`);
    assert.ok(AI_LEVELS.includes(def.aiLevel), `${def.id}: aiLevel desconhecido "${def.aiLevel}"`);
    assert.ok(def.aiLevel !== 'BOSS', `${def.id}: inimigo comum não deveria usar aiLevel BOSS`);
  }
});

test('Bandido/Mercenário (não-ninja) têm chakraMax baixo/zero', () => {
  const bandido = ENEMY_DEFINITIONS.find((d) => d.id === 'ENEMY_WAVES_BANDIT_001');
  assert.equal(bandido.stats.chakraMax, 0);
});

test('Zabuza tem ID bem formado, tier BOSS, aiLevel BOSS e um aiProfile cadastrado', () => {
  const zabuza = BOSS_DEFINITIONS[0];
  assert.ok(isWellFormedId(zabuza.id));
  assert.equal(zabuza.tier, 'BOSS');
  assert.equal(zabuza.aiLevel, 'BOSS');
  assert.ok(typeof BOSS_AI_PROFILES[zabuza.aiProfile] === 'function', 'aiProfile precisa apontar para uma função real em ai.js');
});

test('Zabuza tem ao menos 3 fases com hpRange cobrindo 0-100% sem furos nem sobreposição', () => {
  const zabuza = BOSS_DEFINITIONS[0];
  assert.ok(zabuza.phases.length >= 3);

  const sorted = [...zabuza.phases].sort((a, b) => a.hpRange[0] - b.hpRange[0]);
  assert.equal(sorted[0].hpRange[0], 0, 'a fase mais baixa precisa começar em 0% HP');
  assert.equal(sorted.at(-1).hpRange[1], 1, 'a fase mais alta precisa ir até 100% HP');
  for (let i = 1; i < sorted.length; i += 1) {
    assert.equal(sorted[i - 1].hpRange[1], sorted[i].hpRange[0], `furo/sobreposição entre fases ${i - 1} e ${i}`);
  }
});

test('toda fase de Zabuza tem telegraph (CANON_RULES #83 — leitura antes do comportamento)', () => {
  for (const phase of BOSS_DEFINITIONS[0].phases) {
    assert.ok(typeof phase.telegraph === 'string' && phase.telegraph.length > 10, `fase ${phase.id} sem telegraph`);
  }
});

test('Zabuza declara fraquezas mecânicas, não só flavor text', () => {
  const zabuza = BOSS_DEFINITIONS[0];
  assert.ok(zabuza.weaknesses.length >= 1);
});

test('o jutsu do loadout de Zabuza (Kirigakure) existe no catálogo de Jutsus', () => {
  const zabuza = BOSS_DEFINITIONS[0];
  for (const jutsuId of zabuza.loadout.ativas) {
    assert.ok(jutsus.has(jutsuId), `jutsu desconhecido no loadout de Zabuza: ${jutsuId}`);
  }
});

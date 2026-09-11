import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  tags, statuses, reactions, jutsus,
} from '../../src/data/index.js';
import {
  TAG_DEFINITIONS, TAG_CATEGORIES,
} from '../../src/data/catalog/tags.js';
import {
  STATUS_DEFINITIONS, STATUS_CATEGORIES,
} from '../../src/data/catalog/statuses.js';
import { REACTION_DEFINITIONS } from '../../src/data/catalog/reactions.js';
import { JUTSU_DEFINITIONS } from '../../src/data/catalog/jutsus.js';
import { isWellFormedId } from '../../src/engine/ids.js';
import { validateEntities, splitByLevel } from '../../src/engine/validators.js';
import {
  RANKS, JUTSU_CATEGORIES, JUTSU_EFFECTS, JUTSU_RANGES, ACTION_SLOTS,
} from '../../src/engine/enums.js';

test('o catálogo de Tags foi registrado na Registry ao ser importado', () => {
  assert.equal(tags.size, TAG_DEFINITIONS.length);
  for (const def of TAG_DEFINITIONS) assert.equal(tags.get(def.id), def);
});

test('o catálogo de Estados foi registrado na Registry ao ser importado', () => {
  assert.equal(statuses.size, STATUS_DEFINITIONS.length);
});

test('o catálogo de Reações foi registrado na Registry ao ser importado', () => {
  assert.equal(reactions.size, REACTION_DEFINITIONS.length);
});

test('todas as Tags têm ID bem formado e categoria conhecida, sem duplicatas', () => {
  const issues = validateEntities(TAG_DEFINITIONS, {
    requiredFields: ['name', 'category'],
  });
  assert.deepEqual(splitByLevel(issues).errors, []);
  for (const def of TAG_DEFINITIONS) {
    assert.ok(isWellFormedId(def.id));
    assert.ok(TAG_CATEGORIES.includes(def.category), `categoria desconhecida: ${def.category}`);
  }
});

test('todos os Estados têm os campos exigidos por CANON_RULES (duração/stacks/categoria/remoção)', () => {
  const issues = validateEntities(STATUS_DEFINITIONS, {
    requiredFields: ['name', 'category', 'removal'],
  });
  assert.deepEqual(splitByLevel(issues).errors, []);
  for (const def of STATUS_DEFINITIONS) {
    assert.ok(isWellFormedId(def.id));
    assert.ok(STATUS_CATEGORIES.includes(def.category), `categoria desconhecida: ${def.category}`);
    assert.ok(['TEMPO', 'CURA', 'ACAO_ALVO'].includes(def.removal));
    assert.equal(typeof def.stacks, 'boolean');
    assert.ok(Number.isInteger(def.maxStacks) && def.maxStacks >= 1);
    assert.ok(Number.isInteger(def.baseDuration) && def.baseDuration >= 1);
    assert.equal(typeof def.controlType, 'boolean');
    if (def.dot) {
      assert.ok(['hp', 'chakra'].includes(def.dot.stat));
      assert.ok(def.dot.percentPerStack > 0);
    }
  }
});

test('Estados que empilham (stacks: true) têm maxStacks > 1', () => {
  for (const def of STATUS_DEFINITIONS) {
    if (def.stacks) assert.ok(def.maxStacks > 1, `${def.id} marca stacks:true mas maxStacks <= 1`);
  }
});

test('toda Reação referencia um Estado gatilho, uma Tag gatilho e um Estado resultado que existem', () => {
  const statusIds = new Set(STATUS_DEFINITIONS.map((d) => d.id));
  const tagIds = new Set(TAG_DEFINITIONS.map((d) => d.id));

  for (const reaction of REACTION_DEFINITIONS) {
    assert.ok(isWellFormedId(reaction.id));
    assert.ok(statusIds.has(reaction.triggerStateId), `${reaction.id}: triggerStateId desconhecido`);
    assert.ok(tagIds.has(reaction.triggerTagId), `${reaction.id}: triggerTagId desconhecido`);
    assert.ok(statusIds.has(reaction.resultStateId), `${reaction.id}: resultStateId desconhecido`);
    assert.equal(typeof reaction.guaranteedApply, 'boolean');
    if (!reaction.guaranteedApply) {
      assert.ok(typeof reaction.chance === 'number' && reaction.chance > 0 && reaction.chance <= 1);
    }
  }
});

test('não há Reação com ID duplicado', () => {
  const issues = validateEntities(REACTION_DEFINITIONS, {});
  assert.deepEqual(splitByLevel(issues).errors, []);
});

test('o catálogo de Jutsus (Vertical Slice) foi registrado na Registry ao ser importado', () => {
  assert.equal(jutsus.size, JUTSU_DEFINITIONS.length);
  assert.equal(JUTSU_DEFINITIONS.length, 12, 'lote do Vertical Slice tem 12 jutsus (doc 13)');
});

test('todo Jutsu tem ID bem formado, rank/categoria/efeito/alcance válidos, sem duplicatas', () => {
  const issues = validateEntities(JUTSU_DEFINITIONS, {
    requiredFields: ['name', 'rank', 'category', 'range', 'cost'],
  });
  assert.deepEqual(splitByLevel(issues).errors, []);

  for (const def of JUTSU_DEFINITIONS) {
    assert.ok(isWellFormedId(def.id));
    assert.ok(RANKS.includes(def.rank), `${def.id}: rank desconhecido "${def.rank}"`);
    assert.ok(JUTSU_CATEGORIES.includes(def.category), `${def.id}: categoria desconhecida "${def.category}"`);
    assert.ok(JUTSU_RANGES.includes(def.range), `${def.id}: alcance desconhecido "${def.range}"`);
    assert.ok(def.cost >= 0);
    if (def.effect) assert.ok(JUTSU_EFFECTS.includes(def.effect), `${def.id}: efeito desconhecido "${def.effect}"`);
    if (def.slot) assert.ok(Object.values(ACTION_SLOTS).includes(def.slot), `${def.id}: slot desconhecido "${def.slot}"`);
    if (def.cooldown !== undefined) assert.ok(def.cooldown >= 0);
  }
});

test('toda Tag referenciada por um Jutsu existe no catálogo de Tags', () => {
  const tagIds = new Set(TAG_DEFINITIONS.map((d) => d.id));
  for (const def of JUTSU_DEFINITIONS) {
    for (const tagId of def.tags ?? []) {
      assert.ok(tagIds.has(tagId), `${def.id}: tag desconhecida "${tagId}"`);
    }
  }
});

test('todo Estado referenciado por appliesStates de um Jutsu existe no catálogo de Estados', () => {
  const statusIds = new Set(STATUS_DEFINITIONS.map((d) => d.id));
  for (const def of JUTSU_DEFINITIONS) {
    for (const spec of def.appliesStates ?? []) {
      assert.ok(statusIds.has(spec.stateId), `${def.id}: Estado desconhecido "${spec.stateId}" em appliesStates`);
    }
  }
});

test('Jutsus com effect DAMAGE têm power definido; HEAL também', () => {
  for (const def of JUTSU_DEFINITIONS) {
    if (def.effect === 'DAMAGE' || def.effect === 'HEAL') {
      assert.ok(typeof def.power === 'number', `${def.id}: effect ${def.effect} deveria ter power numérico`);
    }
  }
});

test('Kawarimi está catalogado como reação, no slot REACAO', () => {
  const kawarimi = JUTSU_DEFINITIONS.find((d) => d.id === 'JUT_KAWARIMI_001');
  assert.ok(kawarimi);
  assert.equal(kawarimi.effect, 'ARM_REACTION');
  assert.equal(kawarimi.slot, ACTION_SLOTS.REACAO);
});

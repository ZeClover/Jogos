// Integração do catálogo real de Jutsus (Vertical Slice, doc 13) com o
// motor de combate — cada jutsu é exercitado via a mesma trilha que a UI
// real usaria (`action.jutsuId`), não fixtures reescritas à mão.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../../src/data/catalog/index.js';
import {
  statuses, reactions, jutsus,
} from '../../src/data/index.js';
import { SeedManager } from '../../src/engine/seed.js';
import { createAttributes } from '../../src/engine/combat/attributes.js';
import { createCombatant } from '../../src/engine/combat/combatant.js';
import { CombatState } from '../../src/engine/combat/state.js';
import { resolveAction } from '../../src/engine/combat/actions.js';
import { hasState, tryApplyState } from '../../src/engine/combat/effects.js';
import { ACTION_TYPES, POSITIONS, ACTION_SLOTS } from '../../src/engine/enums.js';

const ALWAYS_HIT = { precisao: 10000, evasao: 0 };
const NEVER_CRIT = { critChance: 0 };

function fighter(id, overrides = {}, position = POSITIONS.FRENTE) {
  return createCombatant({ id, position, attributes: createAttributes(overrides) });
}

function fakeState(teamA, teamB, seed = 'jutsu-integration') {
  const all = [...teamA, ...teamB];
  return {
    combatants: new Map(all.map((c) => [c.id, c])),
    rng: new SeedManager(seed).combat,
    teamAIds: teamA.map((c) => c.id),
    teamBIds: teamB.map((c) => c.id),
    statusCatalog: statuses,
    reactionCatalog: reactions.all(),
    jutsuCatalog: jutsus,
    sideIds(id) {
      return this.teamAIds.includes(id) ? this.teamAIds : this.teamBIds;
    },
  };
}

test('UNKNOWN_JUTSU quando jutsuId não existe no catálogo', () => {
  const actor = fighter('a');
  const target = fighter('b');
  const state = fakeState([actor], [target]);
  const result = resolveAction(state, actor, {
    type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_NAO_EXISTE_001', targetId: 'b',
  });
  assert.equal(result.applied, false);
  assert.equal(result.reason, 'UNKNOWN_JUTSU');
});

test('Rasengan: dano cheio mesmo com o alvo defendendo (quebra guarda)', () => {
  const actor = fighter('a', {
    ...ALWAYS_HIT, ...NEVER_CRIT, chakraMax: 100,
  });
  const target = fighter('b', { defesaChakra: 0 });
  target.guard = 999; // simula Defender já usado
  const state = fakeState([actor], [target]);

  const result = resolveAction(state, actor, {
    type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_RASENGAN_001', targetId: 'b',
  });

  assert.equal(result.applied, true);
  assert.equal(result.damage, 65, 'Power 65 sem mitigação (defesa 0) e sem desconto de guarda (quebra guarda)');
  assert.equal(actor.chakra, 100 - 28);
});

test('Katon: Gōkakyū tenta aplicar Queimando ao acertar', () => {
  const actor = fighter('a', {
    ...ALWAYS_HIT, ...NEVER_CRIT, chakraMax: 100,
  });
  const target = fighter('b', { resistenciaEstado: 0, defesaChakra: 0 });
  const state = fakeState([actor], [target]);

  const result = resolveAction(state, actor, {
    type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_KATON_GOKAKYU_001', targetId: 'b',
  });

  assert.equal(result.applied, true);
  assert.equal(result.damage, 36);
  assert.equal(result.appliedStates.length, 1);
  assert.equal(result.appliedStates[0].stateId, 'STATUS_QUEIMANDO_001');
});

test('Kagemane tenta Imobilizar o alvo (dano 0)', () => {
  const actor = fighter('a', { ...ALWAYS_HIT, ...NEVER_CRIT, chakraMax: 100 });
  const target = fighter('b', { resistenciaEstado: 0 });
  const state = fakeState([actor], [target]);

  const result = resolveAction(state, actor, {
    type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_KAGEMANE_001', targetId: 'b',
  });

  assert.equal(result.applied, true);
  assert.equal(result.damage, 0);
  assert.ok(hasState(target, 'STATUS_IMOBILIZADO_001'));
});

test('Kawarimi arma uma reação no slot REACAO e evita o próximo golpe single-target', () => {
  const defensor = fighter('defensor', { chakraMax: 100 });
  const atacante = fighter('atacante', { ...ALWAYS_HIT, ...NEVER_CRIT, taijutsu: 999 });
  const state = fakeState([defensor], [atacante]);

  const armar = resolveAction(state, defensor, {
    type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_KAWARIMI_001', targetId: 'defensor',
  });
  assert.equal(armar.applied, true);
  assert.ok(defensor.pendingReaction);

  const golpe = resolveAction(state, atacante, {
    type: ACTION_TYPES.ATAQUE_BASICO, targetId: 'defensor',
  });
  assert.equal(golpe.applied, true);
  assert.equal(golpe.evaded, true);
  assert.equal(defensor.hp, defensor.attributes.hpMax, 'Kawarimi deveria ter evitado todo o dano');
  assert.equal(defensor.pendingReaction, null, 'a reação é consumida no uso');
});

test('Kawarimi consome o orçamento do slot REACAO, não o PRINCIPAL', () => {
  const defensor = fighter('defensor', { chakraMax: 100 });
  const state = fakeState([defensor], [fighter('inimigo')]);

  resolveAction(state, defensor, {
    type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_KAWARIMI_001', targetId: 'defensor',
  });

  assert.equal(defensor.actionBudget[ACTION_SLOTS.REACAO], 0);
  assert.equal(defensor.actionBudget[ACTION_SLOTS.PRINCIPAL], 1, 'Principal continua livre');
});

test('Kawarimi falha contra AoE e enquanto o defensor está Imobilizado', () => {
  const defensor = fighter('defensor', { chakraMax: 100 });
  const state = fakeState([defensor], [fighter('inimigo')]);
  resolveAction(state, defensor, {
    type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_KAWARIMI_001', targetId: 'defensor',
  });
  assert.ok(defensor.pendingReaction);

  tryApplyState(defensor, statuses.get('STATUS_IMOBILIZADO_001'), { guaranteed: true, rng: state.rng });

  const golpe = resolveAction(state, state.combatants.get('inimigo'), {
    type: ACTION_TYPES.ATAQUE_BASICO, targetId: 'defensor',
  });
  assert.equal(golpe.evaded, undefined, 'Imobilizado impede o uso da reação armada');
  assert.ok(defensor.pendingReaction, 'a reação continua armada, não foi consumida');
});

test('Kai limpa Estados com remoção CURA (ex: Selado) do alvo', () => {
  const curandeiro = fighter('curandeiro', { chakraMax: 100 });
  const state = fakeState([curandeiro], [fighter('inimigo')]);
  tryApplyState(curandeiro, statuses.get('STATUS_SELADO_001'), { guaranteed: true, rng: state.rng });
  assert.ok(hasState(curandeiro, 'STATUS_SELADO_001'));

  const result = resolveAction(state, curandeiro, {
    type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_KAI_001', targetId: 'curandeiro',
  });

  assert.equal(result.applied, true);
  assert.deepEqual(result.removedStates, ['STATUS_SELADO_001']);
  assert.equal(hasState(curandeiro, 'STATUS_SELADO_001'), false);
});

test('Kai não remove Estados sem remoção CURA (ex: Queimando)', () => {
  const curandeiro = fighter('curandeiro', { chakraMax: 100 });
  const state = fakeState([curandeiro], [fighter('inimigo')]);
  tryApplyState(curandeiro, statuses.get('STATUS_QUEIMANDO_001'), { guaranteed: true, rng: state.rng });

  resolveAction(state, curandeiro, {
    type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_KAI_001', targetId: 'curandeiro',
  });

  assert.ok(hasState(curandeiro, 'STATUS_QUEIMANDO_001'), 'Queimando não é removível por Kai');
});

test('First Aid cura o alvo (aliado ou o próprio ator)', () => {
  const medica = fighter('medica', { chakraMax: 100, hpMax: 100 });
  medica.hp = 50;
  const state = fakeState([medica], [fighter('inimigo')]);

  const result = resolveAction(state, medica, {
    type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_FIRST_AID_001', targetId: 'medica',
  });

  assert.equal(result.applied, true);
  assert.equal(result.healed, 14);
  assert.equal(medica.hp, 64);
});

test('cooldown: um jutsu com cooldown > 0 fica indisponível até ele zerar', () => {
  const a = fighter('a', {
    ...ALWAYS_HIT, ...NEVER_CRIT, chakraMax: 200, velocidade: 100,
  });
  const b = fighter('b', { hpMax: 500, velocidade: 1 });
  const state = new CombatState({
    teamA: [a],
    teamB: [b],
    seedManager: new SeedManager('cooldown-test'),
    statusCatalog: statuses,
    reactionCatalog: reactions.all(),
    jutsuCatalog: jutsus,
  });

  const first = state.applyAction('a', {
    type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_SHISHI_RENDAN_001', targetId: 'b',
  });
  assert.equal(first.applied, true);
  state.applyAction('b', { type: ACTION_TYPES.DEFENDER });

  // round 2: shishi rendan (CD4) ainda deve estar em cooldown
  assert.equal(state.round, 2);
  const second = resolveAction(state, a, {
    type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_SHISHI_RENDAN_001', targetId: 'b',
  });
  assert.equal(second.applied, false);
  assert.equal(second.reason, 'ON_COOLDOWN');
});

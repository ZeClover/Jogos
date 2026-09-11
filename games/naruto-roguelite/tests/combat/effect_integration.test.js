// Integração do Effect Engine (Marco 2) com o combate (Marco 1), usando o
// catálogo real de Tags/Estados/Reações — não fixtures — para provar que
// os dados publicados em src/data/catalog realmente funcionam através de
// CombatState/resolveAction.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../../src/data/catalog/index.js';
import { statuses, reactions } from '../../src/data/index.js';
import { SeedManager } from '../../src/engine/seed.js';
import { createAttributes } from '../../src/engine/combat/attributes.js';
import { createCombatant } from '../../src/engine/combat/combatant.js';
import { CombatState } from '../../src/engine/combat/state.js';
import { resolveAction } from '../../src/engine/combat/actions.js';
import { hasState, getActiveState, tryApplyState } from '../../src/engine/combat/effects.js';
import { ACTION_TYPES, POSITIONS } from '../../src/engine/enums.js';

const ALWAYS_HIT = { precisao: 10000, evasao: 0 };
const NEVER_CRIT = { critChance: 0 };
const ALWAYS_HIT_RNG_SEED = 'effect-integration';

function fighter(id, overrides = {}, position = POSITIONS.FRENTE) {
  return createCombatant({ id, position, attributes: createAttributes(overrides) });
}

function newState(teamA, teamB, seed = ALWAYS_HIT_RNG_SEED) {
  return new CombatState({
    teamA, teamB, seedManager: new SeedManager(seed), statusCatalog: statuses, reactionCatalog: reactions.all(),
  });
}

test('JUTSU com appliesStates aplica o Estado ao acertar', () => {
  const actor = fighter('atacante', { ...ALWAYS_HIT, ...NEVER_CRIT, chakraMax: 100 });
  const target = fighter('alvo', { resistenciaEstado: 0 }, POSITIONS.FRENTE);
  const state = newState([actor], [target]);

  const result = state.applyAction('atacante', {
    type: ACTION_TYPES.JUTSU,
    targetId: 'alvo',
    category: 'NINJUTSU',
    power: 20,
    cost: 10,
    range: 'RANGED',
    tags: ['TAG_KATON_001'],
    appliesStates: [{ stateId: 'STATUS_QUEIMANDO_001', chance: 1, guaranteed: true }],
  });

  assert.equal(result.applied, true);
  assert.equal(result.appliedStates.length, 1);
  assert.equal(result.appliedStates[0].applied, true);
  assert.ok(hasState(target, 'STATUS_QUEIMANDO_001'));
});

test('Estado aplicado por JUTSU causa dano contínuo no fim da rodada', () => {
  const actor = fighter('a', {
    ...ALWAYS_HIT, ...NEVER_CRIT, chakraMax: 100, velocidade: 100,
  });
  const target = fighter('b', { hpMax: 100, velocidade: 1 }, POSITIONS.FRENTE);
  const state = newState([actor], [target]);

  state.applyAction('a', {
    type: ACTION_TYPES.JUTSU,
    targetId: 'b',
    category: 'NINJUTSU',
    power: 0,
    cost: 5,
    range: 'RANGED',
    appliesStates: [{
      stateId: 'STATUS_QUEIMANDO_001', chance: 1, guaranteed: true, stacks: 1,
    }],
  });
  state.applyAction('b', { type: ACTION_TYPES.DEFENDER });

  // Rodada 1 terminou -> tickStates rodou -> Queimando (8%/stack de hpMax) causou dano.
  assert.equal(state.round, 2);
  assert.equal(target.hp, 92);
});

test('Molhado + tag Raiton dispara a Reação Eletrificação', () => {
  const actor = fighter('a', { ...ALWAYS_HIT, ...NEVER_CRIT, chakraMax: 100 });
  const target = fighter('b', { resistenciaEstado: 0 }, POSITIONS.FRENTE);
  const state = newState([actor], [target]);

  tryApplyState(target, statuses.get('STATUS_MOLHADO_001'), { guaranteed: true, rng: state.rng });

  const result = state.applyAction('a', {
    type: ACTION_TYPES.JUTSU,
    targetId: 'b',
    category: 'NINJUTSU',
    power: 5,
    cost: 5,
    range: 'RANGED',
    tags: ['TAG_RAITON_001'],
  });

  assert.ok(result.reactions.length >= 1);
  assert.ok(result.reactions.some((r) => r.reactionId === 'REACTION_ELETRIFICACAO_001'));
  assert.ok(hasState(target, 'STATUS_ELETRIFICADO_001'));
});

test('sem o Estado Molhado, a tag Raiton sozinha não dispara a Reação', () => {
  const actor = fighter('a', { ...ALWAYS_HIT, ...NEVER_CRIT, chakraMax: 100 });
  const target = fighter('b', {}, POSITIONS.FRENTE);
  const state = newState([actor], [target]);

  const result = state.applyAction('a', {
    type: ACTION_TYPES.JUTSU,
    targetId: 'b',
    category: 'NINJUTSU',
    power: 5,
    cost: 5,
    range: 'RANGED',
    tags: ['TAG_RAITON_001'],
  });

  assert.equal(result.reactions.length, 0);
  assert.equal(hasState(target, 'STATUS_ELETRIFICADO_001'), false);
});

test('Desequilibrado + tag Impacto dispara Derrubado', () => {
  const actor = fighter('a', { ...ALWAYS_HIT, ...NEVER_CRIT, chakraMax: 100 });
  const target = fighter('b', {}, POSITIONS.FRENTE);
  const state = newState([actor], [target]);
  tryApplyState(target, statuses.get('STATUS_DESEQUILIBRADO_001'), { guaranteed: true, rng: state.rng });

  state.applyAction('a', {
    type: ACTION_TYPES.JUTSU,
    targetId: 'b',
    category: 'TAIJUTSU',
    power: 5,
    cost: 5,
    range: 'RANGED',
    tags: ['TAG_IMPACTO_001'],
  });

  assert.ok(hasState(target, 'STATUS_DERRUBADO_001'));
});

test('atacar um alvo Imobilizado concede bônus de acerto/crítico (via resolveAction)', () => {
  // precisão/evasão neutras para conseguir observar o efeito do bônus na prática:
  // usamos duas seeds idênticas, uma com o alvo Imobilizado e outra sem, e
  // conferimos que a chance efetiva (logada por um rng espião) é maior com o Estado.
  const chances = [];
  const spyRng = {
    chance: (p) => { chances.push(p); return true; },
    int: () => 0,
  };

  const actor = fighter('a', { precisao: 0 });
  const targetFree = fighter('b', { evasao: 0 }, POSITIONS.FRENTE);
  const targetImobilizado = fighter('c', { evasao: 0 }, POSITIONS.FRENTE);
  targetImobilizado.states.push({
    stateId: 'STATUS_IMOBILIZADO_001', stacks: 1, duration: 2, sourceId: null,
  });

  const fakeState = {
    combatants: new Map([[actor.id, actor], [targetFree.id, targetFree], [targetImobilizado.id, targetImobilizado]]),
    rng: spyRng,
    statusCatalog: statuses,
    reactionCatalog: reactions.all(),
    sideIds(id) {
      return id === actor.id ? [actor.id] : [targetFree.id, targetImobilizado.id];
    },
  };

  resolveAction(fakeState, actor, { type: ACTION_TYPES.ATAQUE_BASICO, targetId: targetFree.id });
  resolveAction(fakeState, actor, { type: ACTION_TYPES.ATAQUE_BASICO, targetId: targetImobilizado.id, slot: 'RAPIDA' });

  // cada ataque chama rng.chance() duas vezes: acerto e depois crítico.
  const [accuracyFree, critFree, accuracyImobilizado, critImobilizado] = chances;
  assert.equal(chances.length, 4);
  assert.ok(accuracyImobilizado > accuracyFree, 'acerto contra Imobilizado deveria ser maior');
  assert.ok(critImobilizado > critFree, 'crítico contra Imobilizado deveria ser maior');
});

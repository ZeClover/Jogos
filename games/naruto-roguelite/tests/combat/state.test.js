import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SeedManager } from '../../src/engine/seed.js';
import { createAttributes } from '../../src/engine/combat/attributes.js';
import { createCombatant } from '../../src/engine/combat/combatant.js';
import { CombatState } from '../../src/engine/combat/state.js';
import { ACTION_TYPES, ACTION_SLOTS, POSITIONS } from '../../src/engine/enums.js';

const ALWAYS_HIT = { precisao: 10000, evasao: 0 };
const NEVER_CRIT = { critChance: 0 };

function fighter(id, overrides = {}, position = POSITIONS.FRENTE) {
  return createCombatant({ id, position, attributes: createAttributes(overrides) });
}

function newState(teamA, teamB, seed = 'combat-state-test') {
  return new CombatState({ teamA, teamB, seedManager: new SeedManager(seed) });
}

test('um combate 1v1 progride round a round até a morte de um lado', () => {
  const a = fighter('a', {
    ...ALWAYS_HIT, ...NEVER_CRIT, taijutsu: 50, defesaFisica: 0, velocidade: 100,
  });
  const b = fighter('b', {
    taijutsu: 0, hpMax: 100, defesaFisica: 0, velocidade: 1,
  });
  const state = newState([a], [b]);

  assert.equal(state.round, 1);
  assert.equal(state.currentActorId(), 'a', 'velocidade 100 vs 1 deveria colocar "a" primeiro');

  const hit1 = state.applyAction('a', { type: ACTION_TYPES.ATAQUE_BASICO, targetId: 'b' });
  assert.equal(hit1.applied, true);
  assert.equal(b.hp, 50);

  assert.equal(state.currentActorId(), 'b');
  state.applyAction('b', { type: ACTION_TYPES.ATAQUE_BASICO, targetId: 'a' });
  assert.equal(a.hp, a.attributes.hpMax, 'taijutsu 0 não deveria causar dano');

  // round 1 termina, round 2 começa automaticamente
  assert.equal(state.round, 2);
  assert.equal(state.isCombatOver(), false);
  assert.equal(state.currentActorId(), 'a');

  const hit2 = state.applyAction('a', { type: ACTION_TYPES.ATAQUE_BASICO, targetId: 'b' });
  assert.equal(hit2.applied, true);
  assert.equal(b.hp, 0);
  assert.equal(state.isCombatOver(), true);
  assert.equal(state.winner(), 'A');
  assert.equal(state.currentActorId(), null, 'ninguém mais joga depois do combate acabar');
});

test('applyAction lança se chamado fora da vez do ator', () => {
  const a = fighter('a', { velocidade: 100 });
  const b = fighter('b', { velocidade: 1 });
  const state = newState([a], [b]);
  assert.throws(() => state.applyAction('b', { type: ACTION_TYPES.DEFENDER }));
});

test('applyAction lança depois que o combate já terminou', () => {
  const a = fighter('a', {
    ...ALWAYS_HIT, ...NEVER_CRIT, taijutsu: 9999, velocidade: 100,
  });
  const b = fighter('b', { hpMax: 10, velocidade: 1 });
  const state = newState([a], [b]);

  state.applyAction('a', { type: ACTION_TYPES.ATAQUE_BASICO, targetId: 'b' });
  assert.equal(state.isCombatOver(), true);
  assert.throws(() => state.applyAction('b', { type: ACTION_TYPES.DEFENDER }));
});

test('ação inválida (aplicada=false) não avança o turno', () => {
  const a = fighter('a', { chakraMax: 5, velocidade: 100 });
  const b = fighter('b', { velocidade: 1 });
  const state = newState([a], [b]);

  const fail = state.applyAction('a', {
    type: ACTION_TYPES.JUTSU, targetId: 'b', cost: 999, power: 1,
  });
  assert.equal(fail.applied, false);
  assert.equal(state.currentActorId(), 'a', 'ainda deveria ser a vez de "a"');
});

test('guarda de Defender é resetada no início da rodada seguinte', () => {
  const a = fighter('a', { defesaFisica: 40, velocidade: 100 });
  const b = fighter('b', { velocidade: 1 });
  const state = newState([a], [b]);

  state.applyAction('a', { type: ACTION_TYPES.DEFENDER });
  assert.equal(a.guard, 12);
  state.applyAction('b', { type: ACTION_TYPES.DEFENDER });

  assert.equal(state.round, 2);
  assert.equal(a.guard, 0, 'guarda deveria resetar na nova rodada');
});

test('orçamento de ação reseta a cada rodada', () => {
  const a = fighter('a', { velocidade: 100 });
  const b = fighter('b', { velocidade: 1 });
  const state = newState([a], [b]);

  state.applyAction('a', { type: ACTION_TYPES.DEFENDER });
  assert.equal(a.actionBudget[ACTION_SLOTS.PRINCIPAL], 0);
  state.applyAction('b', { type: ACTION_TYPES.DEFENDER });

  assert.equal(state.round, 2);
  assert.equal(a.actionBudget[ACTION_SLOTS.PRINCIPAL], 1, 'orçamento deveria resetar na nova rodada');
});

test('Chakra regenera no fim da rodada conforme regenChakra', () => {
  const a = fighter('a', {
    chakraMax: 100, regenChakra: 15, eficiencia: 0, velocidade: 100,
  });
  a.chakra = 40;
  const b = fighter('b', { velocidade: 1 });
  const state = newState([a], [b]);

  state.applyAction('a', { type: ACTION_TYPES.DEFENDER });
  state.applyAction('b', { type: ACTION_TYPES.DEFENDER });

  assert.equal(state.round, 2);
  assert.equal(a.chakra, 55);
});

test('regeneração de Chakra nunca ultrapassa o máximo', () => {
  const a = fighter('a', { chakraMax: 100, regenChakra: 50, velocidade: 100 });
  a.chakra = 90;
  const b = fighter('b', { velocidade: 1 });
  const state = newState([a], [b]);

  state.applyAction('a', { type: ACTION_TYPES.DEFENDER });
  state.applyAction('b', { type: ACTION_TYPES.DEFENDER });

  assert.equal(state.round, 2);
  assert.equal(a.chakra, 100);
});

test('o log registra início/fim de rodada, ações e o fim do combate', () => {
  const a = fighter('a', {
    ...ALWAYS_HIT, ...NEVER_CRIT, taijutsu: 9999, velocidade: 100,
  });
  const b = fighter('b', { hpMax: 10, velocidade: 1 });
  const state = newState([a], [b]);

  state.applyAction('a', { type: ACTION_TYPES.ATAQUE_BASICO, targetId: 'b' });

  const types = state.log.map((e) => e.type);
  assert.deepEqual(types, ['ROUND_START', 'ACTION', 'COMBAT_END']);
  assert.equal(state.log.at(-1).winner, 'A');
});

test('CombatState exige ao menos 1 combatente em cada time', () => {
  const a = fighter('a');
  assert.throws(() => new CombatState({ teamA: [], teamB: [a], seedManager: new SeedManager('x') }));
  assert.throws(() => new CombatState({ teamA: [a], teamB: [], seedManager: new SeedManager('x') }));
});

test('a mesma seed produz o mesmo desfecho de combate (reprodutibilidade)', () => {
  function run() {
    const a = fighter('a', { taijutsu: 30, velocidade: 20 });
    const b = fighter('b', { taijutsu: 25, velocidade: 18 });
    const state = newState([a], [b], 'seed-reproduzivel');
    let guard = 0;
    while (!state.isCombatOver() && guard < 200) {
      const actorId = state.currentActorId();
      const targetId = actorId === 'a' ? 'b' : 'a';
      state.applyAction(actorId, { type: ACTION_TYPES.ATAQUE_BASICO, targetId });
      guard += 1;
    }
    return { winner: state.winner(), rounds: state.round, log: state.log.length };
  }

  const first = run();
  const second = run();
  assert.deepEqual(first, second);
});

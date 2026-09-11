// Integração de ponta a ponta dos Marcos 1-5: personagem real + boss real
// + Effect Engine + Jutsus + IA, tudo através de CombatState — nenhum
// fixture reescrito à mão. É o teste mais próximo de "o Vertical Slice
// funcionando" que existe até o Marco 6 propriamente dito.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../../src/data/catalog/index.js';
import {
  statuses, reactions, jutsus, characters, bosses,
} from '../../src/data/index.js';
import { SeedManager } from '../../src/engine/seed.js';
import { createCombatantFromCharacter } from '../../src/engine/combat/characterBridge.js';
import { createCombatantFromBoss } from '../../src/engine/combat/enemyBridge.js';
import { CombatState } from '../../src/engine/combat/state.js';
import { chooseAction } from '../../src/engine/combat/ai.js';
import { hasState } from '../../src/engine/combat/effects.js';
import { ACTION_TYPES, POSITIONS } from '../../src/engine/enums.js';

function newFight(seed) {
  const narutoDef = characters.get('CHAR_NARUTO_GENIN_001');
  const zabuzaDef = bosses.get('BOSS_ZABUZA_001');
  const naruto = createCombatantFromCharacter(narutoDef, { id: 'naruto', position: POSITIONS.FRENTE });
  const zabuza = createCombatantFromBoss(zabuzaDef, { id: 'zabuza', position: POSITIONS.FRENTE });

  const state = new CombatState({
    teamA: [naruto],
    teamB: [zabuza],
    seedManager: new SeedManager(seed),
    statusCatalog: statuses,
    reactionCatalog: reactions.all(),
    jutsuCatalog: jutsus,
  });

  return {
    state, naruto, zabuza, zabuzaDef,
  };
}

/** Naruto joga um plano fixo simples: Rasengan sempre que o Chakra alcançar, senão Ataque Básico. */
function narutoAction(naruto) {
  if (naruto.chakra >= 28) {
    return { type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_RASENGAN_001', targetId: 'zabuza' };
  }
  return { type: ACTION_TYPES.ATAQUE_BASICO, targetId: 'zabuza' };
}

test('Naruto (personagem real) vs Zabuza (boss real, IA) chega a um resultado em tempo finito', () => {
  const {
    state, naruto, zabuza,
  } = newFight('boss-fight-1');

  let guard = 0;
  while (!state.isCombatOver() && guard < 300) {
    const actorId = state.currentActorId();
    const action = actorId === naruto.id
      ? narutoAction(naruto)
      : chooseAction(state, zabuza, { level: 'BOSS', bossId: 'BOSS_ZABUZA_001' });
    const result = state.applyAction(actorId, action);
    if (!result.applied) {
      // Fallback determinístico caso a ação preferida falhe (ex: sem Chakra) — nunca trava o loop.
      state.applyAction(actorId, { type: ACTION_TYPES.ATAQUE_BASICO, targetId: actorId === naruto.id ? 'zabuza' : 'naruto' });
    }
    guard += 1;
  }

  assert.equal(state.isCombatOver(), true, 'o combate deveria terminar antes do guard de segurança');
  assert.ok(['A', 'B'].includes(state.winner()));
});

test('Zabuza fica Oculto ao entrar na Fase 2 durante um combate real', () => {
  const {
    state, naruto, zabuza,
  } = newFight('boss-fight-mist');

  let sawOculto = false;
  let guard = 0;
  while (!state.isCombatOver() && guard < 300 && !sawOculto) {
    const actorId = state.currentActorId();
    const action = actorId === naruto.id
      ? narutoAction(naruto)
      : chooseAction(state, zabuza, { level: 'BOSS', bossId: 'BOSS_ZABUZA_001' });
    const result = state.applyAction(actorId, action);
    if (!result.applied) {
      state.applyAction(actorId, { type: ACTION_TYPES.ATAQUE_BASICO, targetId: actorId === naruto.id ? 'zabuza' : 'naruto' });
    }
    if (hasState(zabuza, 'STATUS_OCULTO_001')) sawOculto = true;
    guard += 1;
  }

  assert.equal(sawOculto, true, 'em 300 turnos, Zabuza deveria eventualmente entrar na Fase 2 e usar Kirigakure');
});

test('o mesmo par de seeds produz o mesmo desfecho (reprodutibilidade ponta a ponta)', () => {
  function run(seed) {
    const {
      state, naruto, zabuza,
    } = newFight(seed);
    let guard = 0;
    while (!state.isCombatOver() && guard < 300) {
      const actorId = state.currentActorId();
      const action = actorId === naruto.id
        ? narutoAction(naruto)
        : chooseAction(state, zabuza, { level: 'BOSS', bossId: 'BOSS_ZABUZA_001' });
      const result = state.applyAction(actorId, action);
      if (!result.applied) {
        state.applyAction(actorId, { type: ACTION_TYPES.ATAQUE_BASICO, targetId: actorId === naruto.id ? 'zabuza' : 'naruto' });
      }
      guard += 1;
    }
    return {
      winner: state.winner(), round: state.round, log: state.log.length,
    };
  }

  const a = run('boss-fight-repro');
  const b = run('boss-fight-repro');
  assert.deepEqual(a, b);
});

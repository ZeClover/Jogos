// Integração de ponta a ponta do 3º boss (Marco 9, Suna): personagem
// real + boss real (Escorpião do Deserto) + Effect Engine + Jutsus + IA,
// tudo através de CombatState — mesmo padrão de
// serpente_fight_integration.test.js (Marco 9, 2º Ato).
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
  const escorpiaoDef = bosses.get('BOSS_ESCORPIAO_DESERTO_001');
  const naruto = createCombatantFromCharacter(narutoDef, { id: 'naruto', position: POSITIONS.FRENTE });
  const escorpiao = createCombatantFromBoss(escorpiaoDef, { id: 'escorpiao', position: POSITIONS.FRENTE });

  const state = new CombatState({
    teamA: [naruto],
    teamB: [escorpiao],
    seedManager: new SeedManager(seed),
    statusCatalog: statuses,
    reactionCatalog: reactions.all(),
    jutsuCatalog: jutsus,
  });

  return { state, naruto, escorpiao };
}

function narutoAction(naruto) {
  if (naruto.chakra >= 28) {
    return { type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_RASENGAN_001', targetId: 'escorpiao' };
  }
  return { type: ACTION_TYPES.ATAQUE_BASICO, targetId: 'escorpiao' };
}

test('Naruto (personagem real) vs Escorpião do Deserto (boss real, IA) chega a um resultado em tempo finito', () => {
  const { state, naruto, escorpiao } = newFight('escorpiao-fight-1');

  let guard = 0;
  while (!state.isCombatOver() && guard < 300) {
    const actorId = state.currentActorId();
    const action = actorId === naruto.id
      ? narutoAction(naruto)
      : chooseAction(state, escorpiao, { level: 'BOSS', bossId: 'BOSS_ESCORPIAO_DESERTO_001' });
    const result = state.applyAction(actorId, action);
    if (!result.applied) {
      state.applyAction(actorId, { type: ACTION_TYPES.ATAQUE_BASICO, targetId: actorId === naruto.id ? 'escorpiao' : 'naruto' });
    }
    guard += 1;
  }

  assert.equal(state.isCombatOver(), true, 'o combate deveria terminar antes do guard de segurança');
  assert.ok(['A', 'B'].includes(state.winner()));
});

test('Escorpião aplica Paralisado (Ferroada Paralisante) durante um combate real ao entrar na Fase 2', () => {
  const { state, naruto, escorpiao } = newFight('escorpiao-try-2');

  let sawParalisado = false;
  let guard = 0;
  while (!state.isCombatOver() && guard < 300 && !sawParalisado) {
    const actorId = state.currentActorId();
    const action = actorId === naruto.id
      ? narutoAction(naruto)
      : chooseAction(state, escorpiao, { level: 'BOSS', bossId: 'BOSS_ESCORPIAO_DESERTO_001' });
    const result = state.applyAction(actorId, action);
    if (!result.applied) {
      state.applyAction(actorId, { type: ACTION_TYPES.ATAQUE_BASICO, targetId: actorId === naruto.id ? 'escorpiao' : 'naruto' });
    }
    if (hasState(naruto, 'STATUS_PARALISADO_001')) sawParalisado = true;
    guard += 1;
  }

  assert.equal(sawParalisado, true, 'em 300 turnos, o Escorpião deveria eventualmente entrar na Fase 2 e usar Ferroada Paralisante');
});

test('o mesmo seed produz o mesmo desfecho (reprodutibilidade ponta a ponta)', () => {
  function run(seed) {
    const { state, naruto, escorpiao } = newFight(seed);
    let guard = 0;
    while (!state.isCombatOver() && guard < 300) {
      const actorId = state.currentActorId();
      const action = actorId === naruto.id
        ? narutoAction(naruto)
        : chooseAction(state, escorpiao, { level: 'BOSS', bossId: 'BOSS_ESCORPIAO_DESERTO_001' });
      const result = state.applyAction(actorId, action);
      if (!result.applied) {
        state.applyAction(actorId, { type: ACTION_TYPES.ATAQUE_BASICO, targetId: actorId === naruto.id ? 'escorpiao' : 'naruto' });
      }
      guard += 1;
    }
    return { winner: state.winner(), round: state.round, log: state.log.length };
  }

  const a = run('escorpiao-fight-repro');
  const b = run('escorpiao-fight-repro');
  assert.deepEqual(a, b);
});

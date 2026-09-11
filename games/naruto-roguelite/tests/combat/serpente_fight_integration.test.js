// Integração de ponta a ponta do 2º boss (Marco 9): personagem real +
// boss real (Serpente da Floresta da Morte) + Effect Engine + Jutsus +
// IA, tudo através de CombatState — mesmo padrão de
// boss_fight_integration.test.js (Marco 5, Zabuza).
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
  const serpenteDef = bosses.get('BOSS_SERPENTE_FLORESTA_001');
  const naruto = createCombatantFromCharacter(narutoDef, { id: 'naruto', position: POSITIONS.FRENTE });
  const serpente = createCombatantFromBoss(serpenteDef, { id: 'serpente', position: POSITIONS.FRENTE });

  const state = new CombatState({
    teamA: [naruto],
    teamB: [serpente],
    seedManager: new SeedManager(seed),
    statusCatalog: statuses,
    reactionCatalog: reactions.all(),
    jutsuCatalog: jutsus,
  });

  return { state, naruto, serpente };
}

function narutoAction(naruto) {
  if (naruto.chakra >= 28) {
    return { type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_RASENGAN_001', targetId: 'serpente' };
  }
  return { type: ACTION_TYPES.ATAQUE_BASICO, targetId: 'serpente' };
}

test('Naruto (personagem real) vs Serpente (boss real, IA) chega a um resultado em tempo finito', () => {
  const { state, naruto, serpente } = newFight('serpente-fight-1');

  let guard = 0;
  while (!state.isCombatOver() && guard < 300) {
    const actorId = state.currentActorId();
    const action = actorId === naruto.id
      ? narutoAction(naruto)
      : chooseAction(state, serpente, { level: 'BOSS', bossId: 'BOSS_SERPENTE_FLORESTA_001' });
    const result = state.applyAction(actorId, action);
    if (!result.applied) {
      state.applyAction(actorId, { type: ACTION_TYPES.ATAQUE_BASICO, targetId: actorId === naruto.id ? 'serpente' : 'naruto' });
    }
    guard += 1;
  }

  assert.equal(state.isCombatOver(), true, 'o combate deveria terminar antes do guard de segurança');
  assert.ok(['A', 'B'].includes(state.winner()));
});

test('Serpente aplica Imobilizado (Constrição Sufocante) durante um combate real ao entrar na Fase 2', () => {
  const { state, naruto, serpente } = newFight('serpente-try-3');

  let sawImobilizado = false;
  let guard = 0;
  while (!state.isCombatOver() && guard < 300 && !sawImobilizado) {
    const actorId = state.currentActorId();
    const action = actorId === naruto.id
      ? narutoAction(naruto)
      : chooseAction(state, serpente, { level: 'BOSS', bossId: 'BOSS_SERPENTE_FLORESTA_001' });
    const result = state.applyAction(actorId, action);
    if (!result.applied) {
      state.applyAction(actorId, { type: ACTION_TYPES.ATAQUE_BASICO, targetId: actorId === naruto.id ? 'serpente' : 'naruto' });
    }
    if (hasState(naruto, 'STATUS_IMOBILIZADO_001')) sawImobilizado = true;
    guard += 1;
  }

  assert.equal(sawImobilizado, true, 'em 300 turnos, a Serpente deveria eventualmente entrar na Fase 2 e usar Constrição Sufocante');
});

test('o mesmo seed produz o mesmo desfecho (reprodutibilidade ponta a ponta)', () => {
  function run(seed) {
    const { state, naruto, serpente } = newFight(seed);
    let guard = 0;
    while (!state.isCombatOver() && guard < 300) {
      const actorId = state.currentActorId();
      const action = actorId === naruto.id
        ? narutoAction(naruto)
        : chooseAction(state, serpente, { level: 'BOSS', bossId: 'BOSS_SERPENTE_FLORESTA_001' });
      const result = state.applyAction(actorId, action);
      if (!result.applied) {
        state.applyAction(actorId, { type: ACTION_TYPES.ATAQUE_BASICO, targetId: actorId === naruto.id ? 'serpente' : 'naruto' });
      }
      guard += 1;
    }
    return { winner: state.winner(), round: state.round, log: state.log.length };
  }

  const a = run('serpente-fight-repro');
  const b = run('serpente-fight-repro');
  assert.deepEqual(a, b);
});

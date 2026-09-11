// IA inimiga (Marco 5). Ver CANON_RULES.md #82: níveis básica/
// intermediária/elite/boss; avançada usa foco (mirar o alvo mais
// fraco), proteção (Defender), posicionamento (recuar para Trás) e
// bosses têm perfil próprio, não genérico (CANON_RULES #30 — boss
// precisa de identidade/mecânica, não só números maiores).
//
// A IA só lê o que `CombatState` expõe publicamente (HP/Chakra/posição/
// Estados de combatentes vivos) — nunca informação que um jogador não
// veria também (CANON_RULES #82, "IA não pode saber o que não deveria").
//
// `chooseAction` devolve UMA ação (ou `null` se não há alvo vivo) — quem
// está no controle do combate chama `state.applyAction(actor.id, ação)`,
// igual a um humano/teste faria. Nenhuma lógica de turno mora aqui.

import { ACTION_TYPES, POSITIONS } from '../enums.js';
import { isAlive } from './combatant.js';
import { hasState, OCULTO_STATE_ID } from './effects.js';

const RETREAT_HP_THRESHOLD = 0.3;

function aliveEnemyIds(state, actorId) {
  return state.enemySideIds(actorId).filter((id) => isAlive(state.combatants.get(id)));
}

function hpPercent(actor) {
  return actor.hp / actor.attributes.hpMax;
}

/** Foco: sempre mira quem está com menos HP (não é % — HP absoluto, como um jogador vê na barra). */
function lowestHpTarget(state, enemyIds) {
  return enemyIds.reduce((lowestId, id) => {
    const c = state.combatants.get(id);
    const lowest = state.combatants.get(lowestId);
    return c.hp < lowest.hp ? id : lowestId;
  });
}

function basicaAction(state, actor, enemyIds) {
  return { type: ACTION_TYPES.ATAQUE_BASICO, targetId: enemyIds[0] };
}

function intermediariaAction(state, actor, enemyIds) {
  if (hpPercent(actor) < RETREAT_HP_THRESHOLD && actor.actionBudget.PRINCIPAL > 0) {
    return { type: ACTION_TYPES.DEFENDER };
  }
  return { type: ACTION_TYPES.ATAQUE_BASICO, targetId: lowestHpTarget(state, enemyIds) };
}

function eliteAction(state, actor, enemyIds) {
  if (hpPercent(actor) < RETREAT_HP_THRESHOLD) {
    if (actor.position !== POSITIONS.TRAS) {
      return { type: ACTION_TYPES.MOVER, position: POSITIONS.TRAS };
    }
    return { type: ACTION_TYPES.DEFENDER };
  }
  return { type: ACTION_TYPES.ATAQUE_BASICO, targetId: lowestHpTarget(state, enemyIds) };
}

const GENERIC_STRATEGIES = {
  BASICA: basicaAction,
  INTERMEDIARIA: intermediariaAction,
  ELITE: eliteAction,
};

// --- Perfis de Boss ---------------------------------------------------
//
// Cada boss tem comportamento próprio (não genérico), definido aqui por
// enquanto — não há um segundo boss ainda para justificar um formato de
// dado abstrato para "padrões de fase". Ver DECISIONS.md D018.

const ZABUZA_MIST_JUTSU_ID = 'JUT_KIRIGAKURE_NO_JUTSU_001';
const ZABUZA_MIST_CHAKRA_COST = 15;

/**
 * Zabuza Momochi — 3 fases por %HP (ver src/data/catalog/bosses.js):
 * Fase 1 (100-60%) ataque direto; Fase 2 (60-25%) usa Kirigakure para
 * ficar Oculto assim que possível; Fase 3 (<25%, "Desespero") ataque
 * constante, sem defesa.
 */
function zabuzaAction(state, actor, enemyIds) {
  const pct = hpPercent(actor);
  const targetId = lowestHpTarget(state, enemyIds);

  const inMistPhase = pct > 0.25 && pct <= 0.6;
  const canCastMist = !hasState(actor, OCULTO_STATE_ID)
    && !actor.cooldowns.has(ZABUZA_MIST_JUTSU_ID)
    && actor.chakra >= ZABUZA_MIST_CHAKRA_COST;

  if (inMistPhase && canCastMist) {
    return { type: ACTION_TYPES.JUTSU, jutsuId: ZABUZA_MIST_JUTSU_ID, targetId: actor.id };
  }

  return { type: ACTION_TYPES.ATAQUE_BASICO, targetId };
}

export const BOSS_AI_PROFILES = {
  BOSS_ZABUZA_001: zabuzaAction,
};

/**
 * Escolhe a próxima ação de `actor`.
 * @param {import('./state.js').CombatState} state
 * @param {object} actor - o combatente da vez (`state.combatants.get(actorId)`).
 * @param {{ level: 'BASICA'|'INTERMEDIARIA'|'ELITE'|'BOSS', bossId?: string }} options
 * @returns {object|null} uma action pronta para `state.applyAction`, ou `null` sem inimigos vivos.
 */
export function chooseAction(state, actor, { level, bossId } = {}) {
  const enemyIds = aliveEnemyIds(state, actor.id);
  if (!enemyIds.length) return null;

  if (level === 'BOSS') {
    const profile = BOSS_AI_PROFILES[bossId];
    if (!profile) throw new Error(`chooseAction: sem perfil de IA para o boss "${bossId}"`);
    return profile(state, actor, enemyIds);
  }

  const strategy = GENERIC_STRATEGIES[level];
  if (!strategy) throw new Error(`chooseAction: nível de IA desconhecido "${level}"`);
  return strategy(state, actor, enemyIds);
}

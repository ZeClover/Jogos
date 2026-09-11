// Handlers de ação de combate. Cada handler recebe (state, actor, action) e
// devolve um resultado `{ applied, success?, reason?, ...detalhes }`:
//
// - `applied: false` -> a ação não foi validada (alvo inválido, fora de
//   alcance, Chakra insuficiente, orçamento de ação esgotado...); o turno
//   NÃO é consumido, quem está jogando pode tentar outra ação.
// - `applied: true`  -> a ação foi de fato jogada (mesmo que tenha
//   errado o alvo); o turno É consumido.
//
// Escopo do Marco 1 (Combate Mínimo): ATAQUE_BASICO, JUTSU (genérico, sem
// Tags/Estados — isso é Effect Engine, Marco 2), DEFENDER, MOVER, TROCAR.
// ITEM/PREPARAR/INTERAGIR dependem de sistemas que ainda não existem (Itens,
// prep-time de jutsu real, Missões) — ficam como stub explícito
// NOT_IMPLEMENTED_YET em vez de um comportamento inventado pela metade.

import { ACTION_SLOTS, ACTION_TYPES, POSITIONS } from '../enums.js';
import { isAlive, applyDamage } from './combatant.js';
import { isValidRangeTarget } from './positions.js';
import {
  CATEGORY_TO_DEFENSE_FIELD, CATEGORY_TO_PENETRATION_FIELD,
  computeAccuracy, rollHit, rollCrit, computeDamage,
} from './damage.js';

function resolveAttack({
  state, actor, target, range, category, power, guard,
}) {
  const enemyTeam = state.sideIds(target.id).map((id) => state.combatants.get(id));
  if (!isValidRangeTarget({
    actor, target, range, enemyTeam,
  })) {
    return { applied: false, reason: 'OUT_OF_RANGE' };
  }

  const accuracy = computeAccuracy({
    precisao: actor.attributes.precisao,
    evasao: target.attributes.evasao,
  });
  if (!rollHit(accuracy, state.rng)) {
    return {
      applied: true, success: false, hit: false, targetId: target.id,
    };
  }

  const isCrit = rollCrit(actor.attributes.critChance, state.rng);
  const defenseField = CATEGORY_TO_DEFENSE_FIELD[category];
  const penetrationField = CATEGORY_TO_PENETRATION_FIELD[category];
  const damage = computeDamage({
    power,
    defenseStat: target.attributes[defenseField],
    penetration: actor.attributes[penetrationField],
    guard,
    isCrit,
    critMultiplier: actor.attributes.critMultiplier,
  });
  applyDamage(target, damage);

  return {
    applied: true,
    success: true,
    hit: true,
    isCrit,
    damage,
    targetId: target.id,
    targetHp: target.hp,
  };
}

function handleAtaqueBasico(state, actor, action) {
  const target = state.combatants.get(action.targetId);
  if (!target || !isAlive(target)) return { applied: false, reason: 'INVALID_TARGET' };
  return resolveAttack({
    state,
    actor,
    target,
    range: 'MELEE',
    category: 'TAIJUTSU',
    power: actor.attributes.taijutsu,
    guard: target.guard,
  });
}

function handleJutsu(state, actor, action) {
  const target = state.combatants.get(action.targetId);
  if (!target || !isAlive(target)) return { applied: false, reason: 'INVALID_TARGET' };

  const category = action.category ?? 'NINJUTSU';
  if (!CATEGORY_TO_DEFENSE_FIELD[category]) {
    return { applied: false, reason: 'INVALID_CATEGORY' };
  }

  const rawCost = Math.max(0, action.cost ?? 0);
  const cost = Math.round(rawCost * (1 - Math.min(1, Math.max(0, actor.attributes.eficiencia))));
  if (actor.chakra < cost) return { applied: false, reason: 'INSUFFICIENT_CHAKRA' };

  const range = action.range ?? 'RANGED';
  const enemyTeam = state.sideIds(target.id).map((id) => state.combatants.get(id));
  if (!isValidRangeTarget({
    actor, target, range, enemyTeam,
  })) {
    return { applied: false, reason: 'OUT_OF_RANGE' };
  }

  actor.chakra -= cost;

  const accuracy = computeAccuracy({
    baseAccuracy: action.accuracy ?? 0.9,
    precisao: actor.attributes.precisao,
    evasao: target.attributes.evasao,
  });
  if (!rollHit(accuracy, state.rng)) {
    return {
      applied: true, success: false, hit: false, chakraSpent: cost, targetId: target.id,
    };
  }

  const isCrit = rollCrit(actor.attributes.critChance, state.rng);
  const defenseField = CATEGORY_TO_DEFENSE_FIELD[category];
  const penetrationField = CATEGORY_TO_PENETRATION_FIELD[category];
  const damage = computeDamage({
    power: action.power ?? 0,
    defenseStat: target.attributes[defenseField],
    penetration: actor.attributes[penetrationField],
    guard: target.guard,
    isCrit,
    critMultiplier: actor.attributes.critMultiplier,
  });
  applyDamage(target, damage);

  return {
    applied: true,
    success: true,
    hit: true,
    isCrit,
    damage,
    chakraSpent: cost,
    targetId: target.id,
    targetHp: target.hp,
  };
}

function handleDefender(state, actor) {
  actor.guard = Math.round(actor.attributes.defesaFisica * 0.3);
  return { applied: true, success: true, guard: actor.guard };
}

function handleMover(state, actor, action) {
  if (!Object.values(POSITIONS).includes(action.position)) {
    return { applied: false, reason: 'INVALID_POSITION' };
  }
  if (action.position === actor.position) {
    return { applied: false, reason: 'ALREADY_IN_POSITION' };
  }
  actor.position = action.position;
  return { applied: true, success: true, position: actor.position };
}

function handleTrocar(state, actor, action) {
  const ally = state.combatants.get(action.allyId);
  if (!ally || ally.id === actor.id || !isAlive(ally)) {
    return { applied: false, reason: 'INVALID_ALLY' };
  }
  const sameSide = state.sideIds(actor.id).includes(ally.id);
  if (!sameSide) return { applied: false, reason: 'INVALID_ALLY' };

  const actorPosition = actor.position;
  actor.position = ally.position;
  ally.position = actorPosition;
  return {
    applied: true, success: true, actorPosition: actor.position, allyPosition: ally.position,
  };
}

function notImplementedYet() {
  return { applied: false, reason: 'NOT_IMPLEMENTED_YET' };
}

const HANDLERS = {
  [ACTION_TYPES.ATAQUE_BASICO]: handleAtaqueBasico,
  [ACTION_TYPES.JUTSU]: handleJutsu,
  [ACTION_TYPES.DEFENDER]: handleDefender,
  [ACTION_TYPES.MOVER]: handleMover,
  [ACTION_TYPES.TROCAR]: handleTrocar,
  [ACTION_TYPES.ITEM]: notImplementedYet,
  [ACTION_TYPES.PREPARAR]: notImplementedYet,
  [ACTION_TYPES.INTERAGIR]: notImplementedYet,
};

/** Dispatcher: valida orçamento de ação do slot e delega ao handler do tipo. */
export function resolveAction(state, actor, action) {
  const handler = HANDLERS[action?.type];
  if (!handler) return { applied: false, reason: 'UNKNOWN_ACTION_TYPE' };

  const slot = action.slot ?? ACTION_SLOTS.PRINCIPAL;
  if (!(slot in actor.actionBudget) || actor.actionBudget[slot] <= 0) {
    return { applied: false, reason: 'ACTION_SLOT_EXHAUSTED' };
  }

  const result = handler(state, actor, action);
  if (result.applied) actor.actionBudget[slot] -= 1;
  return result;
}

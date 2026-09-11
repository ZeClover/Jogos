// Handlers de ação de combate. Cada handler recebe (state, actor, action) e
// devolve um resultado `{ applied, success?, reason?, ...detalhes }`:
//
// - `applied: false` -> a ação não foi validada (alvo inválido, fora de
//   alcance, Chakra insuficiente, orçamento de ação esgotado...); o turno
//   NÃO é consumido, quem está jogando pode tentar outra ação.
// - `applied: true`  -> a ação foi de fato jogada (mesmo que tenha
//   errado o alvo); o turno É consumido.
//
// Escopo do Marco 1 (Combate Mínimo): ATAQUE_BASICO, JUTSU, DEFENDER, MOVER,
// TROCAR. ITEM/PREPARAR/INTERAGIR dependem de sistemas que ainda não
// existem (Itens, prep-time de jutsu real, Missões) — ficam como stub
// explícito NOT_IMPLEMENTED_YET em vez de um comportamento inventado pela
// metade.
//
// Marco 2 (Effect Engine) acrescenta: bônus de acerto/crítico contra
// Imobilizado (D015), e JUTSU passa a aceitar `tags` (natureza/estilo/
// efeito da técnica) e `appliesStates` (Estados que tenta aplicar ao
// acertar) — que também disparam Reações quando o alvo já tem o Estado
// gatilho certo. ATAQUE_BASICO não tem jutsu por trás (D012), então não
// carrega tags/appliesStates.

import { ACTION_SLOTS, ACTION_TYPES, POSITIONS } from '../enums.js';
import { isAlive, applyDamage } from './combatant.js';
import { isValidRangeTarget } from './positions.js';
import {
  CATEGORY_TO_DEFENSE_FIELD, CATEGORY_TO_PENETRATION_FIELD,
  computeAccuracy, rollHit, rollCrit, computeDamage,
} from './damage.js';
import { attackerBonusFromTargetStates, tryApplyState, resolveReactions } from './effects.js';

function resolveAttack({
  state, actor, target, range, category, power, guard, baseAccuracy = 0.9,
}) {
  const enemyTeam = state.sideIds(target.id).map((id) => state.combatants.get(id));
  if (!isValidRangeTarget({
    actor, target, range, enemyTeam,
  })) {
    return { applied: false, reason: 'OUT_OF_RANGE' };
  }

  const { accuracyBonus, critBonus } = attackerBonusFromTargetStates(target);
  const accuracy = computeAccuracy({
    baseAccuracy: baseAccuracy + accuracyBonus,
    precisao: actor.attributes.precisao,
    evasao: target.attributes.evasao,
  });
  if (!rollHit(accuracy, state.rng)) {
    return {
      applied: true, success: false, hit: false, targetId: target.id,
    };
  }

  const isCrit = rollCrit(actor.attributes.critChance + critBonus, state.rng);
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

/** Aplica os `appliesStates` de um jutsu e resolve Reações, só chamado quando a ação acertou. */
function applyJutsuEffects({
  state, actor, target, action,
}) {
  const appliedStates = [];
  for (const spec of action.appliesStates ?? []) {
    const def = state.statusCatalog?.get(spec.stateId);
    if (!def) {
      appliedStates.push({ stateId: spec.stateId, applied: false, reason: 'UNKNOWN_STATE' });
      continue;
    }
    const outcome = tryApplyState(target, def, {
      chance: spec.chance ?? 1,
      stacks: spec.stacks ?? 1,
      duration: spec.duration,
      guaranteed: spec.guaranteed ?? false,
      sourceId: actor.id,
      rng: state.rng,
    });
    appliedStates.push(outcome);
  }

  const reactions = resolveReactions({
    reactionCatalog: state.reactionCatalog,
    statusCatalog: state.statusCatalog,
    target,
    incomingTags: action.tags ?? [],
    sourceId: actor.id,
    rng: state.rng,
  });

  return { appliedStates, reactions };
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

  const { accuracyBonus, critBonus } = attackerBonusFromTargetStates(target);
  const accuracy = computeAccuracy({
    baseAccuracy: (action.accuracy ?? 0.9) + accuracyBonus,
    precisao: actor.attributes.precisao,
    evasao: target.attributes.evasao,
  });
  if (!rollHit(accuracy, state.rng)) {
    return {
      applied: true, success: false, hit: false, chakraSpent: cost, targetId: target.id,
    };
  }

  const isCrit = rollCrit(actor.attributes.critChance + critBonus, state.rng);
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

  const { appliedStates, reactions } = applyJutsuEffects({
    state, actor, target, action,
  });

  return {
    applied: true,
    success: true,
    hit: true,
    isCrit,
    damage,
    chakraSpent: cost,
    targetId: target.id,
    targetHp: target.hp,
    appliedStates,
    reactions,
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

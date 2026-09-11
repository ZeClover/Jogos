// Handlers de ação de combate. Cada handler recebe (state, actor, action) e
// devolve um resultado `{ applied, success?, reason?, ...detalhes }`:
//
// - `applied: false` -> a ação não foi validada (alvo inválido, fora de
//   alcance, Chakra insuficiente, orçamento de ação esgotado, jutsu em
//   cooldown...); o turno NÃO é consumido, quem está jogando pode tentar
//   outra ação.
// - `applied: true`  -> a ação foi de fato jogada (mesmo que tenha
//   errado o alvo, ou sido evitada por Kawarimi); o turno É consumido.
//
// Marco 1: ATAQUE_BASICO, JUTSU, DEFENDER, MOVER, TROCAR. ITEM/PREPARAR/
// INTERAGIR ficam como stub NOT_IMPLEMENTED_YET (dependem de sistemas
// futuros — Itens, Missões).
//
// Marco 2 (Effect Engine): bônus de acerto/crítico contra Imobilizado,
// JUTSU aceita `tags`/`appliesStates` que também disparam Reações.
//
// Marco 3 (Jutsus): JUTSU aceita `jutsuId` (ficha real do catálogo,
// mesclada com a ação via `resolveJutsuFields` — cooldown incluído) e
// `effect` (DAMAGE default | HEAL | CLEANSE | ARM_REACTION | UTILITY, ver
// DECISIONS.md D016). Ataques single-target (ATAQUE_BASICO e JUTSU do tipo
// DAMAGE) agora podem ser evitados por uma reação armada (Kawarimi).
//
// Marco 4 (Personagens): um cast de JUTSU bem-sucedido (`result.success`)
// que carrega `grantsResource` na ficha do catálogo soma ao recurso
// exclusivo do próprio ator (Clones, Planejamento...), ver DECISIONS.md D017.

import {
  ACTION_SLOTS, ACTION_TYPES, POSITIONS, JUTSU_EFFECTS,
} from '../enums.js';
import {
  isAlive, applyDamage, applyHeal, gainResource,
} from './combatant.js';
import { isValidRangeTarget } from './positions.js';
import {
  CATEGORY_TO_DEFENSE_FIELD, CATEGORY_TO_PENETRATION_FIELD,
  computeAccuracy, rollHit, rollCrit, computeDamage,
} from './damage.js';
import {
  attackerBonusFromTargetStates, tryApplyState, resolveReactions,
  tryEvadeWithReaction, armReaction, cleanseCurableStates,
} from './effects.js';
import { isOnCooldown, setCooldown, resolveJutsuFields } from './jutsu.js';

function resolveAttack({
  state, actor, target, range, category, power, guard, baseAccuracy = 0.9, inevitable = false,
}) {
  const sideMembers = state.sideIds(target.id).map((id) => state.combatants.get(id));
  if (!isValidRangeTarget({
    actor, target, range, sideMembers,
  })) {
    return { applied: false, reason: 'OUT_OF_RANGE' };
  }

  if (tryEvadeWithReaction(target, { range, inevitable })) {
    return {
      applied: true, success: false, hit: false, evaded: true, targetId: target.id,
    };
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

/** Aplica os `appliesStates` de um jutsu e resolve Reações. */
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
  const jutsuDef = action.jutsuId ? state.jutsuCatalog?.get(action.jutsuId) : null;
  if (action.jutsuId && !jutsuDef) return { applied: false, reason: 'UNKNOWN_JUTSU' };
  const effective = resolveJutsuFields(action, jutsuDef);

  const target = state.combatants.get(effective.targetId);
  if (!target || !isAlive(target)) return { applied: false, reason: 'INVALID_TARGET' };

  if (action.jutsuId && isOnCooldown(actor, action.jutsuId)) {
    return { applied: false, reason: 'ON_COOLDOWN' };
  }

  const effectType = effective.effect ?? 'DAMAGE';
  if (!JUTSU_EFFECTS.includes(effectType)) {
    return { applied: false, reason: 'INVALID_EFFECT' };
  }

  const category = effective.category ?? 'NINJUTSU';
  if (effectType === 'DAMAGE' && !CATEGORY_TO_DEFENSE_FIELD[category]) {
    return { applied: false, reason: 'INVALID_CATEGORY' };
  }

  const rawCost = Math.max(0, effective.cost ?? 0);
  const cost = Math.round(rawCost * (1 - Math.min(1, Math.max(0, actor.attributes.eficiencia))));
  if (actor.chakra < cost) return { applied: false, reason: 'INSUFFICIENT_CHAKRA' };

  const range = effective.range ?? 'RANGED';
  const sideMembers = state.sideIds(target.id).map((id) => state.combatants.get(id));
  if (!isValidRangeTarget({
    actor, target, range, sideMembers,
  })) {
    return { applied: false, reason: 'OUT_OF_RANGE' };
  }

  actor.chakra -= cost;
  if (action.jutsuId) setCooldown(actor, action.jutsuId, effective.cooldown ?? 0);

  let result;
  if (effectType === 'DAMAGE') {
    const attack = resolveAttack({
      state,
      actor,
      target,
      range,
      category,
      power: effective.power ?? 0,
      guard: effective.ignoresGuard ? 0 : target.guard,
      baseAccuracy: effective.accuracy ?? 0.9,
      inevitable: effective.inevitable ?? false,
    });
    let appliedStates = [];
    let reactions = [];
    if (attack.success) {
      ({ appliedStates, reactions } = applyJutsuEffects({
        state, actor, target, action: effective,
      }));
    }
    result = {
      ...attack, chakraSpent: cost, appliedStates, reactions,
    };
  } else if (effectType === 'HEAL') {
    const mustRoll = effective.accuracy !== undefined && effective.accuracy < 1;
    const hit = mustRoll ? rollHit(effective.accuracy, state.rng) : true;
    if (!hit) {
      result = {
        applied: true, success: false, hit: false, chakraSpent: cost, targetId: target.id,
      };
    } else {
      const healAmount = effective.power ?? 0;
      const targetHp = applyHeal(target, healAmount);
      result = {
        applied: true, success: true, hit: true, healed: healAmount, targetHp, chakraSpent: cost, targetId: target.id,
      };
    }
  } else if (effectType === 'CLEANSE') {
    const removedStates = cleanseCurableStates(target, state.statusCatalog);
    result = {
      applied: true, success: true, removedStates, chakraSpent: cost, targetId: target.id,
    };
  } else if (effectType === 'ARM_REACTION') {
    armReaction(actor, { jutsuId: action.jutsuId ?? null, sourceId: actor.id });
    result = {
      applied: true, success: true, armed: true, chakraSpent: cost, targetId: target.id,
    };
  } else {
    // UTILITY: só aplica appliesStates/Reações (ex: buff em si mesmo), sem dano/cura/limpeza.
    const { appliedStates, reactions } = applyJutsuEffects({
      state, actor, target, action: effective,
    });
    result = {
      applied: true, success: true, appliedStates, reactions, chakraSpent: cost, targetId: target.id,
    };
  }

  if (result.success && jutsuDef?.grantsResource) {
    result.resourceGained = gainResource(actor, jutsuDef.grantsResource.amount);
  }

  return result;
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

/**
 * O slot padrão de uma ação é PRINCIPAL, a menos que a própria `action` diga
 * outro (`action.slot`) ou — para JUTSU com `jutsuId` — a ficha do catálogo
 * já designe um (ex: Kawarimi é REACAO). Resolvido aqui, antes de checar o
 * orçamento, para não depender do handler já ter mesclado os campos.
 */
function resolveActionSlot(state, action) {
  if (action.slot) return action.slot;
  if (action.type === ACTION_TYPES.JUTSU && action.jutsuId) {
    return state.jutsuCatalog?.get(action.jutsuId)?.slot ?? ACTION_SLOTS.PRINCIPAL;
  }
  return ACTION_SLOTS.PRINCIPAL;
}

/** Dispatcher: valida orçamento de ação do slot e delega ao handler do tipo. */
export function resolveAction(state, actor, action) {
  const handler = HANDLERS[action?.type];
  if (!handler) return { applied: false, reason: 'UNKNOWN_ACTION_TYPE' };

  const slot = resolveActionSlot(state, action);
  if (!(slot in actor.actionBudget) || actor.actionBudget[slot] <= 0) {
    return { applied: false, reason: 'ACTION_SLOT_EXHAUSTED' };
  }

  const result = handler(state, actor, action);
  if (result.applied) actor.actionBudget[slot] -= 1;
  return result;
}

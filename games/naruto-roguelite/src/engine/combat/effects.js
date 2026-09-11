// Effect Engine (Marco 2): aplica/tica/remove Estados de forma genérica a
// partir dos dados do catálogo (src/data/catalog/statuses.js) — nenhuma
// lógica aqui conhece "Queimando" ou "Imobilizado" por nome, exceto a
// única exceção documentada em DECISIONS.md D015 (bônus de acerto/crítico
// contra Imobilizado, citado explicitamente no doc de design).
//
// Um combatente (ver combatant.js) carrega:
//   states               ActiveState[] — instâncias em curso
//   controlApplications  Map<stateId, number> — quantas vezes cada Estado
//                        de categoria CONTROLE já foi aplicado nesta luta,
//                        para a resistência adaptativa (CANON_RULES #31).
//
// @typedef {{ stateId: string, stacks: number, duration: number, sourceId: string|null }} ActiveState

/** ID canônico do Estado Imobilizado — única exceção "hardcoded" do motor (ver D015). */
export const IMOBILIZADO_STATE_ID = 'STATUS_IMOBILIZADO_001';

/** Bônus de acerto/crítico ao atacar um alvo Imobilizado (doc 01, citado literalmente). */
export const IMOBILIZADO_ATTACK_BONUS = Object.freeze({ accuracyBonus: 0.15, critBonus: 0.15 });

/** Curva de resistência adaptativa a controle: 100% / 70% / 40% / imune (CANON_RULES #31). */
const CONTROL_RESISTANCE_CURVE = [1, 0.7, 0.4, 0];

function controlResistanceMultiplier(previousApplications) {
  const index = Math.min(previousApplications, CONTROL_RESISTANCE_CURVE.length - 1);
  return CONTROL_RESISTANCE_CURVE[index];
}

export function getActiveState(combatant, stateId) {
  return combatant.states.find((s) => s.stateId === stateId) ?? null;
}

export function hasState(combatant, stateId) {
  return getActiveState(combatant, stateId) !== null;
}

/**
 * Tenta aplicar um Estado a `combatant`. `catalogEntry` é a definição de
 * `src/data/catalog/statuses.js` (ou um fixture equivalente em teste).
 * Aplica resistência (atributo `resistenciaEstado` + curva adaptativa de
 * controle) a menos que `guaranteed: true`. Empilha/estende se o Estado já
 * estiver ativo e `catalogEntry.stacks` permitir.
 *
 * @returns {{ applied: boolean, reason?: string, stateId: string }}
 */
export function tryApplyState(combatant, catalogEntry, {
  chance = 1, stacks = 1, duration, sourceId = null, rng, guaranteed = false,
} = {}) {
  let effectiveChance = Math.min(1, Math.max(0, chance));

  if (!guaranteed) {
    const resistPct = Math.min(1, Math.max(0, combatant.attributes.resistenciaEstado ?? 0) / 100);
    effectiveChance *= (1 - resistPct);

    if (catalogEntry.controlType) {
      const previous = combatant.controlApplications.get(catalogEntry.id) ?? 0;
      effectiveChance *= controlResistanceMultiplier(previous);
    }

    if (!rng.chance(effectiveChance)) {
      return { applied: false, reason: 'RESISTED', stateId: catalogEntry.id };
    }
  }

  if (catalogEntry.controlType) {
    const previous = combatant.controlApplications.get(catalogEntry.id) ?? 0;
    combatant.controlApplications.set(catalogEntry.id, previous + 1);
  }

  const existing = getActiveState(combatant, catalogEntry.id);
  const appliedDuration = duration ?? catalogEntry.baseDuration;
  if (existing) {
    if (catalogEntry.stacks) {
      existing.stacks = Math.min(catalogEntry.maxStacks, existing.stacks + stacks);
    }
    existing.duration = Math.max(existing.duration, appliedDuration);
  } else {
    combatant.states.push({
      stateId: catalogEntry.id,
      stacks: Math.min(stacks, catalogEntry.maxStacks ?? 1),
      duration: appliedDuration,
      sourceId,
    });
  }

  return { applied: true, stateId: catalogEntry.id };
}

/** Remove um Estado imediatamente (ex: futura ação de limpeza tipo Kai). Devolve se havia algo a remover. */
export function removeState(combatant, stateId) {
  const before = combatant.states.length;
  combatant.states = combatant.states.filter((s) => s.stateId !== stateId);
  return combatant.states.length !== before;
}

/**
 * Fim de rodada: aplica dano/dreno de Estados com `dot`, reduz duração em 1
 * e remove os que expiraram. `statusCatalog` é um Map/Registry com `.get(id)`
 * — se omitido, os Estados só têm a duração reduzida (sem DoT).
 */
export function tickStates(combatant, statusCatalog) {
  const events = [];

  for (const active of combatant.states) {
    const def = statusCatalog?.get(active.stateId);
    if (def?.dot) {
      const base = def.dot.stat === 'chakra' ? combatant.attributes.chakraMax : combatant.attributes.hpMax;
      const amount = Math.round(base * (def.dot.percentPerStack / 100) * active.stacks);
      if (def.dot.stat === 'chakra') {
        combatant.chakra = Math.max(0, combatant.chakra - amount);
      } else {
        combatant.hp = Math.max(0, combatant.hp - amount);
      }
      events.push({
        type: 'DOT', stateId: active.stateId, stat: def.dot.stat, amount, targetId: combatant.id,
      });
    }
  }

  for (const active of combatant.states) active.duration -= 1;

  const expired = combatant.states.filter((s) => s.duration <= 0);
  combatant.states = combatant.states.filter((s) => s.duration > 0);
  for (const exp of expired) {
    events.push({ type: 'STATE_EXPIRED', stateId: exp.stateId, targetId: combatant.id });
  }

  return events;
}

/**
 * Resolve Reações: para cada entrada do catálogo cujo `triggerStateId` está
 * ativo em `target` e cuja `triggerTagId` está em `incomingTags`, aplica
 * `resultStateId`. Limitado a `maxReactions` disparos por chamada (evita
 * loops — CANON_RULES #13).
 */
export function resolveReactions({
  reactionCatalog, statusCatalog, target, incomingTags, sourceId = null, rng, maxReactions = 4,
}) {
  const events = [];
  if (!reactionCatalog?.length || !incomingTags?.length) return events;

  for (const reaction of reactionCatalog) {
    if (events.length >= maxReactions) break;
    if (!hasState(target, reaction.triggerStateId)) continue;
    if (!incomingTags.includes(reaction.triggerTagId)) continue;

    const def = statusCatalog?.get(reaction.resultStateId);
    if (!def) continue;

    const outcome = tryApplyState(target, def, {
      chance: reaction.chance ?? 1,
      guaranteed: reaction.guaranteedApply ?? false,
      sourceId,
      rng,
    });

    events.push({
      type: 'REACTION', reactionId: reaction.id, targetId: target.id, outcome,
    });
  }

  return events;
}

/** Modificadores de acerto/crítico que os Estados ativos do alvo concedem ao atacante. */
export function attackerBonusFromTargetStates(target) {
  if (hasState(target, IMOBILIZADO_STATE_ID)) return IMOBILIZADO_ATTACK_BONUS;
  return { accuracyBonus: 0, critBonus: 0 };
}

// --- Reação armada (Kawarimi e afins) — Marco 3 ---------------------------
//
// Kawarimi (doc 01/13) não é uma Reação no sentido do catálogo acima (não
// depende de um Estado gatilho) — é uma ação que o próprio combatente joga
// no seu turno para "armar" uma esquiva, que dispara automaticamente contra
// o próximo golpe elegível antes do seu próximo turno. Isso encaixa no
// motor pull-based sem precisar de um mecanismo de interrupção de verdade:
// armar consome o slot/Chakra na hora; disparar só verifica um sinalizador.

/** Arma uma reação de esquiva (ex: Kawarimi) — consumida pelo próximo golpe elegível. */
export function armReaction(combatant, { jutsuId = null, sourceId = null } = {}) {
  combatant.pendingReaction = { jutsuId, sourceId };
}

/**
 * Se `target` tem uma reação armada e o golpe recebido é elegível para
 * evasão (não é área, não é inevitável, e o alvo não está Imobilizado —
 * "falha contra certos AoE, inevitáveis e enquanto Imobilizado", doc 01),
 * consome a reação e devolve true (o golpe é evitado). Caso contrário,
 * não mexe em nada e devolve false.
 */
export function tryEvadeWithReaction(target, { range, inevitable = false } = {}) {
  if (!target.pendingReaction) return false;
  if (range === 'AREA') return false;
  if (inevitable) return false;
  if (hasState(target, IMOBILIZADO_STATE_ID)) return false;

  target.pendingReaction = null;
  return true;
}

/** Remove todos os Estados ativos cuja definição marca `removal: 'CURA'` (ex: Kai). */
export function cleanseCurableStates(combatant, statusCatalog) {
  const removed = [];
  for (const active of combatant.states) {
    const def = statusCatalog?.get(active.stateId);
    if (def?.removal === 'CURA') removed.push(active.stateId);
  }
  for (const stateId of removed) removeState(combatant, stateId);
  return removed;
}

// Ponte entre fichas de Jutsu (dado, src/data/catalog/jutsus.js) e o motor
// de ações genérico (actions.js). Cobre cooldown — o único aspecto de
// jutsu que depende de "qual jutsu é este" em vez de só "que tipo de
// efeito ele tem" (isso já é resolvido pelos campos genéricos da ação,
// ver actions.js).

/** @typedef {import('../types.js').Jutsu} JutsuDefinition */

export function isOnCooldown(combatant, jutsuId) {
  return (combatant.cooldowns.get(jutsuId) ?? 0) > 0;
}

export function setCooldown(combatant, jutsuId, rounds) {
  if (rounds > 0) combatant.cooldowns.set(jutsuId, rounds);
}

/** Fim de rodada: reduz todos os cooldowns em 1 (piso 0) e remove os zerados. */
export function tickCooldowns(combatant) {
  for (const [jutsuId, remaining] of combatant.cooldowns) {
    const next = remaining - 1;
    if (next <= 0) combatant.cooldowns.delete(jutsuId);
    else combatant.cooldowns.set(jutsuId, next);
  }
}

/**
 * Monta os campos efetivos de uma ação JUTSU a partir da ficha do
 * catálogo (`jutsuDef`) com override pontual de `action` (útil em testes,
 * ou para variações momentâneas tipo upgrades de run — Marco 8). Campos
 * ausentes em ambos caem no default do próprio handler em actions.js.
 */
export function resolveJutsuFields(action, jutsuDef) {
  if (!jutsuDef) return action;
  return {
    ...action,
    category: action.category ?? jutsuDef.category,
    range: action.range ?? jutsuDef.range,
    power: action.power ?? jutsuDef.power,
    cost: action.cost ?? jutsuDef.cost,
    accuracy: action.accuracy ?? jutsuDef.accuracy,
    effect: action.effect ?? jutsuDef.effect,
    tags: action.tags ?? jutsuDef.tags,
    appliesStates: action.appliesStates ?? jutsuDef.appliesStates,
    ignoresGuard: action.ignoresGuard ?? jutsuDef.ignoresGuard,
    slot: action.slot ?? jutsuDef.slot,
    cooldown: action.cooldown ?? jutsuDef.cooldown,
  };
}

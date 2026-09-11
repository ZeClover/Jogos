// Fórmulas de dano/defesa/acerto — transcritas de
// docs/design/01_COMBATE_TAGS_ESTADOS_REACOES.md:
//   "Defesa usa diminishing returns: Defesa/(Defesa+100).
//    Acerto base ~90%, bounded 20–100%. Crítico base 5%, dano crítico 150%."
//
// Mapeamento categoria -> atributo de defesa: o próprio doc 01 separa
// "Defesa de Chakra" de "Resistência Mental" na lista de atributos, então
// Ninjutsu mitiga por Defesa de Chakra e Genjutsu por Resistência Mental
// (não pela mesma stat) — ver DECISIONS.md D012.
export const CATEGORY_TO_DEFENSE_FIELD = Object.freeze({
  TAIJUTSU: 'defesaFisica',
  NINJUTSU: 'defesaChakra',
  GENJUTSU: 'resistenciaMental',
});

export const CATEGORY_TO_PENETRATION_FIELD = Object.freeze({
  TAIJUTSU: 'penetracaoFisica',
  NINJUTSU: 'penetracaoChakra',
  GENJUTSU: 'penetracaoChakra',
});

/** Fração do dano mitigada por uma defesa efetiva (diminishing returns). */
export function mitigation(defense) {
  const d = Math.max(0, defense);
  return d / (d + 100);
}

/** Defesa após aplicar penetração (nunca abaixo de 0). */
export function effectiveDefense(defenseStat, penetration = 0) {
  return Math.max(0, defenseStat - Math.max(0, penetration));
}

/**
 * Chance de acerto, limitada a [20%, 100%]. `precisao`/`evasao` são
 * atributos secundários em pontos, não frações.
 */
export function computeAccuracy({ baseAccuracy = 0.9, precisao = 0, evasao = 0 }) {
  const raw = baseAccuracy + (precisao - evasao) / 100;
  return Math.min(1, Math.max(0.2, raw));
}

export function rollHit(accuracy, rng) {
  return rng.chance(accuracy);
}

export function rollCrit(critChance, rng) {
  return rng.chance(critChance);
}

/**
 * Dano final pós-mitigação, crítico e guarda (Defender). Nunca negativo.
 * `power` já é o valor de saída da técnica (ex: Rasengan Power 65) — ver
 * DECISIONS.md D012 para o que multiplica isso no Marco 1.
 */
export function computeDamage({
  power, defenseStat, penetration = 0, guard = 0, isCrit = false, critMultiplier = 1.5,
}) {
  const defense = effectiveDefense(defenseStat, penetration);
  const afterMitigation = power * (1 - mitigation(defense));
  const afterCrit = isCrit ? afterMitigation * critMultiplier : afterMitigation;
  const afterGuard = afterCrit - Math.max(0, guard);
  return Math.max(0, Math.round(afterGuard));
}

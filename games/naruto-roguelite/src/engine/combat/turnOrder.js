// Ordem de turno: "Velocidade + modificadores + pequena variação RNG"
// (CANON_RULES.md #Combate). Recalculada a cada rodada (buffs/debuffs de
// Velocidade entre rodadas mudam a ordem). A ordem sempre precisa ser
// exponível ao jogador — por isso computeTurnOrder devolve a lista já
// ordenada, não só os ids.

/**
 * @param {object[]} combatants - combatentes vivos a ordenar.
 * @param {import('../rng.js').RngStream} rng - stream de combate (determinística).
 * @param {number} [variation] - amplitude da variação aleatória (±variation).
 */
export function computeTurnOrder(combatants, rng, variation = 2) {
  const scored = combatants.map((c) => ({
    combatant: c,
    score: c.attributes.velocidade + rng.int(-variation, variation),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.map((entry) => entry.combatant);
}

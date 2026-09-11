// Reclassificação de rank de missão (Marco 7, CANON_RULES.md — Missões:
// "Reclassificação de rank é possível (C pode virar A); jogador escolhe
// continuar, recuar ou pedir reforço"). Ver DECISIONS.md D020 para como
// as 3 escolhas do doc foram mapeadas para mecânica real sem inventar um
// sistema de reforços/NPCs que ainda não existe.
import { RANKS } from '../enums.js';

const DEFAULT_RECLASSIFY_CHANCE = 0.15;
const REINFORCE_HEAL_PERCENT = 0.25;

/**
 * Sorteia se `node` é reclassificado um rank acima (mutação em memória —
 * chamar só UMA vez por nó, ao entrar nele, para o resultado ficar
 * estável entre re-renders). Nós DESCANSO e BOSS nunca reclassificam
 * (Descanso não é missão; Boss já é o topo do rank da Região).
 */
export function maybeReclassifyNode(node, rng, chance = DEFAULT_RECLASSIFY_CHANCE) {
  if (node.type === 'DESCANSO' || node.isBoss || node.reclassified) return node;
  if (!rng.chance(chance)) return node;

  const currentIndex = RANKS.indexOf(node.rank);
  if (currentIndex < 0 || currentIndex >= RANKS.length - 1) return node;

  node.originalRank = node.rank;
  node.rank = RANKS[currentIndex + 1];
  node.reclassified = true;
  return node;
}

/** "Pedir reforço" (D020): cura o esquadrão em `REINFORCE_HEAL_PERCENT` do HP máximo, sem desfazer a reclassificação — o custo é 1 dia extra no calendário (ver runState.js). */
export function reinforceSquad(combatants, percent = REINFORCE_HEAL_PERCENT) {
  for (const c of combatants) {
    if (c.hp <= 0) continue;
    c.hp = Math.min(c.attributes.hpMax, Math.round(c.hp + c.attributes.hpMax * percent));
  }
  return combatants;
}

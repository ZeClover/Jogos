// Posicionamento Frente/Centro/Trás e alcance (CANON_RULES.md #Combate:
// "Jutsus possuem alcance. Movimento... precisam reconhecer essas linhas.").
//
// Sem grid tático completo: alcance MELEE só pode mirar a linha mais à
// frente do time inimigo que ainda tem alguém vivo (a "linha de frente"
// muda dinamicamente conforme personagens caem); RANGED mira qualquer
// linha; SELF só mira o próprio ator.

import { POSITIONS } from '../enums.js';
import { isAlive } from './combatant.js';

const LINE_ORDER = [POSITIONS.FRENTE, POSITIONS.CENTRO, POSITIONS.TRAS];

/** Primeira linha (na ordem Frente->Centro->Trás) que ainda tem alguém vivo. */
export function frontmostOccupiedLine(combatants) {
  for (const line of LINE_ORDER) {
    if (combatants.some((c) => c.position === line && isAlive(c))) return line;
  }
  return null;
}

/**
 * Confere se `target` é um alvo válido para uma ação de `actor` com o
 * alcance dado, considerando o time inimigo de `target` (`enemyTeam`, os
 * combatentes do lado oposto ao de `actor`).
 */
export function isValidRangeTarget({
  actor, target, range, enemyTeam,
}) {
  if (range === 'SELF') return target.id === actor.id;
  if (range === 'RANGED' || range === 'ALL') return true;
  if (range === 'MELEE') {
    const frontLine = frontmostOccupiedLine(enemyTeam);
    return frontLine !== null && target.position === frontLine;
  }
  throw new Error(`isValidRangeTarget: alcance desconhecido "${range}"`);
}

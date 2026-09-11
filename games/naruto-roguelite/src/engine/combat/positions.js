// Posicionamento Frente/Centro/Trás e alcance (CANON_RULES.md #Combate:
// "Jutsus possuem alcance. Movimento... precisam reconhecer essas linhas.").
//
// Sem grid tático completo:
// - MELEE só pode mirar a linha mais à frente do lado do alvo que ainda
//   tem alguém vivo (a "linha de frente" muda dinamicamente conforme
//   personagens caem);
// - RANGED mira qualquer linha inimiga;
// - AREA (Marco 3) é como RANGED — um alvo nomeado só, resolução
//   multi-alvo simultânea fica para quando houver necessidade real (ver
//   DECISIONS.md) — a diferença é só semântica: fica marcado como "efeito
//   de área" para outras regras (ex: Kawarimi falha contra AoE);
// - ALLY (Marco 3) mira qualquer combatente vivo do mesmo lado do ator,
//   incluindo ele mesmo (cura/suporte);
// - SELF só mira o próprio ator.

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
 * alcance dado. `sideMembers` é a lista de combatentes do MESMO lado que
 * `target` (para MELEE, usado para achar a linha de frente; para ALLY,
 * usado para confirmar que `actor` está nesse mesmo lado).
 */
export function isValidRangeTarget({
  actor, target, range, sideMembers,
}) {
  if (range === 'SELF') return target.id === actor.id;
  if (range === 'RANGED' || range === 'AREA' || range === 'ALL') return true;
  if (range === 'ALLY') return sideMembers.some((c) => c.id === actor.id);
  if (range === 'MELEE') {
    const frontLine = frontmostOccupiedLine(sideMembers);
    return frontLine !== null && target.position === frontLine;
  }
  throw new Error(`isValidRangeTarget: alcance desconhecido "${range}"`);
}

// Graduação de resultado de missão (Marco 7, CANON_RULES.md — Missões:
// "Resultados graduais... Falha não precisa encerrar a run"). Puro: só lê
// o estado do esquadrão antes/depois do combate, não conhece CombatState
// nem UI. A fórmula abaixo é provisória (mesmo espírito de D012/D017) —
// nenhum doc dá limiares exatos de HP% por resultado; revisável no
// Marco 9 sem mudar a arquitetura (ver DECISIONS.md D020).
import { MISSION_RESULTS } from '../enums.js';

/**
 * @param {object} params
 * @param {{hp:number, attributes:{hpMax:number}}[]} params.squadBefore - combatentes ANTES do combate (para hpMax e contagem).
 * @param {{hp:number}[]} params.squadAfter - os MESMOS combatentes (mesma ordem/ids) DEPOIS do combate.
 * @param {boolean} params.won - `state.winner() === 'A'` do combate resolvido.
 */
export function resolveMissionResult({ squadBefore, squadAfter, won }) {
  if (!won) return MISSION_RESULTS.DESASTRE;

  const maxTotal = squadBefore.reduce((sum, c) => sum + c.attributes.hpMax, 0);
  const totalAfter = squadAfter.reduce((sum, c) => sum + Math.max(0, c.hp), 0);
  const fallen = squadAfter.filter((c) => c.hp <= 0).length;
  const hpRatio = maxTotal > 0 ? totalAfter / maxTotal : 0;

  if (fallen === 0 && hpRatio >= 0.85) return MISSION_RESULTS.SUCESSO_PERFEITO;
  if (fallen === 0 && hpRatio >= 0.5) return MISSION_RESULTS.SUCESSO;
  if (fallen <= 1) return MISSION_RESULTS.SUCESSO_PARCIAL;
  return MISSION_RESULTS.FALHA;
}

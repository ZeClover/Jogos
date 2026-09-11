// Reputação de Facção (Marco 9, docs/design/06_EVENTOS_RELACOES_FACCOES_
// NARRATIVA.md — "Reputação de facção: Hostil/Desconfiada/Neutra/
// Favorável/Aliada"). Mesmo espírito de mastery.js/threat.js: função
// pura, plana, serializável, sem conhecer UI/CombatState/catálogo de
// Facções (só recebe um `factionId` string). O vocabulário de nível usa
// REPUTATION_LEVELS (enums.js, já canonizado desde o Marco 0); os
// limiares numéricos e os deltas por resultado de missão abaixo são
// provisórios (o doc não dá números) — mesmo espírito de D020 #2
// (limiares de resultado de missão) — ver DECISIONS.md D026.
import { REPUTATION_LEVELS, MISSION_RESULTS } from '../enums.js';

const MIN_REPUTATION = -50;
const MAX_REPUTATION = 50;

const RESULT_DELTA = Object.freeze({
  [MISSION_RESULTS.SUCESSO_PERFEITO]: 8,
  [MISSION_RESULTS.SUCESSO]: 5,
  [MISSION_RESULTS.SUCESSO_PARCIAL]: 2,
  [MISSION_RESULTS.FALHA]: -3,
  [MISSION_RESULTS.DESASTRE]: -8,
});

/** `{ [factionId]: number }`, plano e serializável — ausente = 0 (Neutra). */
export function createReputationState() {
  return {};
}

export function getReputationValue(reputation, factionId) {
  return reputation[factionId] ?? 0;
}

/** Mapeia um valor numérico para um dos 5 REPUTATION_LEVELS. Limiares provisórios (D026). */
export function reputationLevel(value) {
  if (value <= -20) return REPUTATION_LEVELS[0]; // HOSTIL
  if (value <= -5) return REPUTATION_LEVELS[1]; // RUIM
  if (value < 5) return REPUTATION_LEVELS[2]; // NEUTRA
  if (value < 20) return REPUTATION_LEVELS[3]; // BOA
  return REPUTATION_LEVELS[4]; // ALIADA
}

/** Ajusta e devolve o novo valor, sujeito a [-50, 50]. Sem efeito se `factionId`/`delta` forem falsy. */
export function adjustReputation(reputation, factionId, delta) {
  if (!factionId || !delta) return getReputationValue(reputation, factionId);
  const next = Math.min(MAX_REPUTATION, Math.max(MIN_REPUTATION, getReputationValue(reputation, factionId) + delta));
  reputation[factionId] = next;
  return next;
}

/** Delta de reputação para um MISSION_RESULTS (0 para resultados sem entrada, ex: `'DESCANSO'`). */
export function deltaForMissionResult(result) {
  return RESULT_DELTA[result] ?? 0;
}

/**
 * Aplica todos os resultados de uma Crônica (`run.chronicle`, runState.js)
 * à reputação de UMA facção — a Região da Run tem, no máximo, 1 facção
 * associada (D026), então toda missão completada nela afeta essa mesma
 * facção. Devolve o delta total aplicado (0 se `factionId` for null).
 */
export function applyChronicleToReputation(reputation, chronicle, factionId) {
  if (!factionId) return 0;
  let total = 0;
  for (const entry of chronicle) {
    const delta = deltaForMissionResult(entry.result);
    if (!delta) continue;
    total += delta;
    adjustReputation(reputation, factionId, delta);
  }
  return total;
}

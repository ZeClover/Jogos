// Estado de progressão de CONTA (Marco 8) — separado do estado de Run
// (Marco 7, runState.js): sobrevive entre runs via SaveManager (Marco 0)
// no slot "account" (CANON_RULES #43 — "save da conta" distinto de "save
// da run"). Serializável em JSON puro.
import { createArchive, discoverAll } from './archive.js';
import { grantMastery, xpForMissionResult } from './mastery.js';
import { createReputationState, applyChronicleToReputation } from './reputation.js';

export function createAccountState() {
  return {
    mastery: {},
    archive: createArchive(),
    reputation: createReputationState(),
    threatUnlocked: false,
    victories: 0,
    runsPlayed: 0,
  };
}

/**
 * Aplica o fim de uma Run ao estado de conta: XP de Maestria para cada
 * membro do esquadrão (soma dos resultados de todos os nós de missão da
 * Crônica), descoberta de todo id encontrado (inimigos/bosses/região), e
 * — só em vitória — libera Ameaça (PROMPT MESTRE §38) e soma 1 vitória.
 * @param {object} account - de `createAccountState()` (mutado em memória).
 * @param {object} params
 * @param {{result:string}[]} params.chronicle - `run.chronicle` (runState.js).
 * @param {string[]} params.squadIds - Content IDs dos personagens que participaram.
 * @param {string[]} params.encounteredIds - enemyId/bossId encontrados durante a run.
 * @param {string} [params.regionId]
 * @param {string} [params.factionId] - facção associada à Região da Run (Marco 9, D026); reputação só muda se presente.
 * @param {boolean} params.won
 */
export function applyRunEnd(account, {
  chronicle, squadIds, encounteredIds, regionId, factionId, won,
}) {
  const missionXp = chronicle.reduce((sum, entry) => sum + xpForMissionResult(entry.result), 0);
  const leveledUp = [];
  for (const characterId of squadIds) {
    const { leveledUp: didLevelUp, level } = grantMastery(account.mastery, characterId, missionXp);
    if (didLevelUp) leveledUp.push({ characterId, level });
  }

  const discoveredCount = discoverAll(account.archive, [...encounteredIds, regionId].filter(Boolean));
  const reputationDelta = applyChronicleToReputation(account.reputation, chronicle, factionId);

  account.runsPlayed += 1;
  if (won) {
    account.victories += 1;
    account.threatUnlocked = true;
  }

  return {
    leveledUp, discoveredCount, missionXp, reputationDelta,
  };
}

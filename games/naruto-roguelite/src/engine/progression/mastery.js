// Maestria por versão de personagem (Marco 8, PROMPT MESTRE §37 /
// CANON_RULES.md — Economia e Progressão: "Maestria é por versão de
// personagem, ganha jogando, nunca comprada"). Fornece principalmente
// CONHECIMENTO (revela entradas do Arquivo Ninja, ver archive.js) — não
// concede poder mecânico extra: os 4 Genin do Vertical Slice só têm 1
// passiva catalogada no total (Cabeça-Dura, Marco 4) e nenhuma
// alternativa/skin com ficha real; inventar o que cada nível de Maestria
// "destrava" mecanicamente fabricaria conteúdo sem base (CANON_RULES
// #30/#79) — ver DECISIONS.md D022.

const XP_PER_MISSION_RESULT = {
  SUCESSO_PERFEITO: 30,
  SUCESSO: 20,
  SUCESSO_PARCIAL: 10,
  FALHA: 5,
  DESASTRE: 0,
};

export const MASTERY_MAX_LEVEL = 5;
const XP_PER_LEVEL = 100; // nível N exige N*100 XP acumulado (provisório, ver D022)

/** XP de Maestria concedido por um resultado de missão (MISSION_RESULTS). Número provisório, mesmo espírito de D012/D017/D020. */
export function xpForMissionResult(result) {
  return XP_PER_MISSION_RESULT[result] ?? 0;
}

export function levelFromXp(xp) {
  return Math.min(MASTERY_MAX_LEVEL, Math.floor(xp / XP_PER_LEVEL));
}

/**
 * Soma `xpAmount` à Maestria de `characterId` em `mastery` (mutado em
 * memória — `mastery` é um objeto plano `{ [characterId]: {xp, level} }`,
 * parte do `accountState` serializável).
 * @returns {{level: number, leveledUp: boolean}}
 */
export function grantMastery(mastery, characterId, xpAmount) {
  const current = mastery[characterId] ?? { xp: 0, level: 0 };
  const xp = current.xp + Math.max(0, xpAmount);
  const level = levelFromXp(xp);
  const leveledUp = level > current.level;
  mastery[characterId] = { xp, level };
  return { level, leveledUp };
}

/** XP que falta para o próximo nível, ou `null` se já no nível máximo. */
export function xpToNextLevel(characterMastery) {
  const level = characterMastery?.level ?? 0;
  if (level >= MASTERY_MAX_LEVEL) return null;
  return (level + 1) * XP_PER_LEVEL - (characterMastery?.xp ?? 0);
}

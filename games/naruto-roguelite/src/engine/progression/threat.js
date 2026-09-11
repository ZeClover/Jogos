// Ameaça (Marco 8, PROMPT MESTRE §38): "Após a primeira vitória: liberar
// níveis de Ameaça... dificuldade deve aumentar principalmente via IA;
// composição; mecânicas; modificadores; economia; bosses. Não apenas
// HP/dano" (CANON_RULES — Economia e Progressão). Com só 1 boss e 4
// arquétipos de inimigo comum no catálogo (Marco 5), as duas alavancas
// reais já existentes na engine são reaproveitadas em vez de inventar um
// sistema de modificador de combate novo: o NÍVEL DE IA (ai.js) e a
// CHANCE DE RECLASSIFICAÇÃO de missão (reclassify.js, Marco 7) — ver
// DECISIONS.md D022.
export const THREAT_MIN = 0;
export const THREAT_MAX = 20;

const AI_LEVEL_UPGRADE = { BASICA: 'INTERMEDIARIA', INTERMEDIARIA: 'ELITE' };
const AI_UPGRADE_THRESHOLD = 8; // Ameaça >= 8: inimigos comuns "sobem" 1 nível de IA
const RECLASSIFY_BONUS_PER_LEVEL = 0.01; // +1 ponto percentual de chance de reclassificação por nível de Ameaça
const RECLASSIFY_CHANCE_CAP = 0.9;

export function clampThreatLevel(level) {
  return Math.min(THREAT_MAX, Math.max(THREAT_MIN, Math.round(level)));
}

/** Nível de IA efetivo de um inimigo comum sob um dado nível de Ameaça. Bosses (aiLevel BOSS) nunca sobem — já usam o próprio perfil bespoke. */
export function effectiveAiLevel(baseAiLevel, threatLevel) {
  if (threatLevel < AI_UPGRADE_THRESHOLD) return baseAiLevel;
  return AI_LEVEL_UPGRADE[baseAiLevel] ?? baseAiLevel;
}

/** Chance de reclassificação de missão efetiva sob um dado nível de Ameaça. */
export function effectiveReclassifyChance(baseChance, threatLevel) {
  return Math.min(RECLASSIFY_CHANCE_CAP, baseChance + threatLevel * RECLASSIFY_BONUS_PER_LEVEL);
}

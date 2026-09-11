// Vocabulários canônicos compartilhados por toda a engine.
// Ver docs/design/01_COMBATE_TAGS_ESTADOS_REACOES.md, 04_RUN_MAPA_MISSOES_REGIOES.md,
// 06_EVENTOS_RELACOES_FACCOES_NARRATIVA.md e CANON_RULES.md.

export const RANKS = Object.freeze([
  'E', 'D', 'C', 'B', 'A', 'S', 'KINJUTSU', 'EX',
]);

export const POSITIONS = Object.freeze({
  FRENTE: 'FRENTE',
  CENTRO: 'CENTRO',
  TRAS: 'TRAS',
});

export const ACTION_TYPES = Object.freeze({
  JUTSU: 'JUTSU',
  ATAQUE_BASICO: 'ATAQUE_BASICO',
  DEFENDER: 'DEFENDER',
  ITEM: 'ITEM',
  PREPARAR: 'PREPARAR',
  MOVER: 'MOVER',
  TROCAR: 'TROCAR',
  INTERAGIR: 'INTERAGIR',
});

export const ACTION_SLOTS = Object.freeze({
  PRINCIPAL: 'PRINCIPAL',
  RAPIDA: 'RAPIDA',
  REACAO: 'REACAO',
});

export const MISSION_RESULTS = Object.freeze({
  SUCESSO_PERFEITO: 'SUCESSO_PERFEITO',
  SUCESSO: 'SUCESSO',
  SUCESSO_PARCIAL: 'SUCESSO_PARCIAL',
  FALHA: 'FALHA',
  DESASTRE: 'DESASTRE',
});

export const REPUTATION_LEVELS = Object.freeze([
  'HOSTIL', 'RUIM', 'NEUTRA', 'BOA', 'ALIADA',
]);

export const RELATIONSHIP_LEVELS = Object.freeze([
  'HOSTIL', 'TENSA', 'NEUTRA', 'BOA', 'FORTE',
]);

export const ACT_NAMES = Object.freeze([
  'FORMACAO', 'ASCENSAO', 'MUNDO_SHINOBI', 'CRISE', 'GUERRA_CATASTROFE',
]);

// RNG streams centralizadas — nunca crie um novo gerador Math.random() solto.
export const RNG_STREAMS = Object.freeze({
  MAP: 'map',
  COMBAT: 'combat',
  LOOT: 'loot',
  EVENT: 'event',
});

// Prefixos de ID para conteúdo (entidades de dados). Ver docs/design/10_ROADMAP_TECNICO.md
// e 09_BALANCEAMENTO_E_GERADOR.md. Estender esta lista é uma decisão de baixo risco;
// registrar em DECISIONS.md quando fizer sentido.
export const CONTENT_ID_PREFIXES = Object.freeze([
  'CHAR', 'JUT', 'ITEM', 'BOSS', 'REG', 'EVENT', 'ENEMY', 'STATUS',
  'PASSIVE', 'REACTION', 'TAG', 'FACTION', 'MISSION', 'SUMMON',
  'ENDING', 'ACHIEVEMENT', 'FIELD',
]);

// Prefixos de ID para assets visuais (ver docs/design/15_BIBLIOTECA_PROMPTS_VISUAIS_P0_P1.md).
// Combinam-se com o ID do conteúdo que representam, ex: PORTRAIT_CHAR_NARUTO_GENIN_001.
export const ASSET_ID_PREFIXES = Object.freeze([
  'PORTRAIT', 'FULL', 'COMBAT', 'ICON', 'ART', 'BG', 'UI',
]);

export const ASSET_STATUSES = Object.freeze([
  'missing', 'placeholder', 'prompt_ready', 'generated', 'reviewed', 'integrated',
]);

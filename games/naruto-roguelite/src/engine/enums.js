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

// Orçamento de ações por rodada (CANON_RULES.md — Combate): 1 Principal,
// até 1 Rápida, até 1 Reação. Resetado no início de cada rodada.
export const ACTION_BUDGET_PER_ROUND = Object.freeze({
  [ACTION_SLOTS.PRINCIPAL]: 1,
  [ACTION_SLOTS.RAPIDA]: 1,
  [ACTION_SLOTS.REACAO]: 1,
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

// Vocabulário de fichas de Jutsu (Marco 3). Ver docs/design/02 e
// 11_TEMPLATES_FICHAS.md, e CANON_RULES.md #Jutsus.
export const JUTSU_CATEGORIES = Object.freeze([
  'TAIJUTSU', 'NINJUTSU', 'GENJUTSU', 'DEFESA', 'ESPECIAL',
]);

// Efeito mecânico de uma ação JUTSU (não é um campo do doc original — é a
// forma como o Marco 3 organiza "o que a ficha realmente faz" dentro do
// motor genérico; ver DECISIONS.md D016).
export const JUTSU_EFFECTS = Object.freeze([
  'DAMAGE', 'HEAL', 'CLEANSE', 'ARM_REACTION', 'UTILITY',
]);

export const JUTSU_RANGES = Object.freeze([
  'MELEE', 'RANGED', 'AREA', 'ALLY', 'SELF',
]);

// Efeito mecânico de um Item consumível (Marco 10, mesmo espírito de
// JUTSU_EFFECTS/D016) — `RESTORE_CHAKRA` é exclusivo de Item: nenhum
// Jutsu do catálogo restaura Chakra ainda, ver DECISIONS.md D025.
export const ITEM_EFFECTS = Object.freeze([
  'DAMAGE', 'HEAL', 'RESTORE_CHAKRA', 'CLEANSE', 'UTILITY',
]);

// Níveis de IA inimiga (Marco 5). Ver CANON_RULES.md #82 — avançada usa
// foco, proteção, posicionamento; bosses têm perfil próprio (ai.js).
export const AI_LEVELS = Object.freeze([
  'BASICA', 'INTERMEDIARIA', 'ELITE', 'BOSS',
]);

// Tiers de inimigo/boss (docs/design/05_INIMIGOS_ELITES_BOSSES.md).
export const ENEMY_TIERS = Object.freeze([
  'COMMON', 'VETERAN', 'SPECIALIST', 'ELITE', 'MINI_BOSS', 'BOSS',
  'ACT_BOSS', 'FINAL_BOSS', 'SUPERBOSS', 'SPECIAL_ENCOUNTER',
]);

// Tipos de nó de mapa (Marco 7, CANON_RULES.md — Run/Campanha: "múltiplos
// tipos de nó"). Vocabulário completo do doc citado como meta; só MISSAO/
// ELITE/BOSS/DESCANSO têm mecânica real implementada por ora — os demais
// dependem de sistemas que ainda não existem (Itens/Economia para
// LOJA/HOSPITAL, Eventos para EVENTO/SEGREDO, Progressão para
// TREINO/RECRUTAMENTO) e ficam de fora do vocabulário até terem base real,
// em vez de virar um tipo de nó "capenga" sem efeito (ver DECISIONS.md D020).
export const NODE_TYPES = Object.freeze([
  'MISSAO', 'ELITE', 'BOSS', 'DESCANSO',
]);

// Tipos de objetivo de missão (docs/design/04_RUN_MAPA_MISSOES_REGIOES.md —
// "nunca apenas mate todos"). Vocabulário completo e fechado do doc; só um
// subconjunto tem Template de Missão real cadastrado até um marco que
// implemente mecânica não-combate (infiltração/furto/etc) de verdade — ver
// DECISIONS.md D020, mesmo padrão do D015 #1 (catálogo completo, mecânica
// seletiva).
export const MISSION_OBJECTIVE_TYPES = Object.freeze([
  'ESCOLTA', 'CAPTURA', 'ASSASSINATO', 'RESGATE', 'INFILTRACAO', 'ESPIONAGEM',
  'RECONHECIMENTO', 'DEFESA', 'SOBREVIVENCIA', 'SABOTAGEM', 'RECUPERACAO',
  'INVESTIGACAO', 'CACA', 'FUGA', 'DUELO', 'PROTECAO', 'BATALHA', 'INVASAO',
  'INTERCEPTACAO', 'RASTREAMENTO',
]);

// Categorias de Item (Marco 10, docs/design/03_ITENS_EQUIPAMENTOS_ECONOMIA.md).
// Vocabulário completo do doc; só CONSUMIVEL tem mecânica real via
// ACTION_TYPES.ITEM por ora — ARMA/CORPO/ACESSORIO (equipamento
// persistente, recalculando atributos) e os demais (scrolls, summoning/
// transformation/boss items, loot especial) ficam para quando houver um
// sistema de equipar/loadout real — ver DECISIONS.md D025.
export const ITEM_CATEGORIES = Object.freeze([
  'ARMA', 'FERRAMENTA', 'CORPO', 'ACESSORIO', 'CONSUMIVEL', 'SCROLL',
  'SUMMONING_ITEM', 'TRANSFORMATION_ITEM', 'BOSS_ITEM', 'SPECIAL_LOOT', 'MISSION_LOOT',
]);

// Status de uma Run em andamento (Marco 7).
export const RUN_STATUSES = Object.freeze({
  IN_PROGRESS: 'IN_PROGRESS',
  VICTORY: 'VICTORY',
  DEFEAT: 'DEFEAT',
});

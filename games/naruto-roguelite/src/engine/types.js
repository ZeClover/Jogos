// Definições de tipo (JSDoc) das entidades de dados centrais. Este arquivo
// não exporta código em runtime — existe para dar intellisense/checagem leve
// em editores e documentar o "formato de ficha" que Registry/validators
// esperam. Ver docs/design/11_TEMPLATES_FICHAS.md para os templates oficiais
// completos; os campos abaixo são o subconjunto que a engine efetivamente lê.
//
// Decisão (DECISIONS.md D001): sem TypeScript/bundler — JSDoc + validadores
// em runtime cobrem o que este projeto precisa sem adicionar build step.

/**
 * @typedef {object} CharacterVersion
 * @property {string} id - ex: "CHAR_NARUTO_GENIN_001"
 * @property {string} baseCharacterId - agrupador de versões do mesmo personagem (ex: "NARUTO")
 * @property {string} name
 * @property {string} version - ex: "Genin"
 * @property {number} squadCost - custo de esquadrão (orçamento padrão de equipe ~12)
 * @property {string} rank
 * @property {string[]} [role] - papel narrativo/tático (ex: ["Pressão","Dano","Setup"])
 * @property {object} stats - overrides parciais de createAttributes() — HP, Chakra, Taijutsu, Ninjutsu, Genjutsu, DefesaFisica, DefesaChakra, ControleChakra, Velocidade, Precisao, Evasao, ResistenciaMental
 * @property {string[]} [tags]
 * @property {{ id: string, name?: string, max: number }} [exclusiveResource] - ex: Clones do Naruto
 * @property {{ ativas: string[], pendingAtivas?: string[], reacao: string, suprema: string|null, pendingSuprema?: string, passivas: string[] }} loadout -
 *   `ativas`/`suprema` só contêm IDs de jutsus já catalogados; `pendingAtivas`/
 *   `pendingSuprema` são nomes de jutsus citados no design mas ainda sem ficha (ver DECISIONS.md D017)
 * @property {string} [passiveId]
 * @property {string} [evolutionNotes] - referências a versões/transformações futuras, não fabricadas ainda
 */

/**
 * @typedef {object} Jutsu
 * @property {string} id - ex: "JUT_RASENGAN_001"
 * @property {string} name
 * @property {string} rank
 * @property {string} category
 * @property {string} [subcategory]
 * @property {string} [nature]
 * @property {string[]} tags
 * @property {number} cost
 * @property {number} [power]
 * @property {number} [accuracy]
 * @property {string} [range]
 * @property {string} [target]
 * @property {number} [prep]
 * @property {number} [cooldown]
 * @property {string[]} [inflictsStates]
 * @property {string[]} [conditions]
 */

/**
 * @typedef {object} Passive
 * @property {string} id - ex: "PASSIVE_CABECA_DURA_001"
 * @property {string} name
 * @property {string} [description]
 * @property {object|null} effect - null enquanto a mecânica não for definida (ver DECISIONS.md D017)
 */

/**
 * @typedef {object} StatusEffect
 * @property {string} id - ex: "STATUS_QUEIMANDO_001"
 * @property {string} name
 * @property {string} category
 * @property {number} [maxStacks]
 * @property {boolean} stacks
 * @property {number} [baseDuration]
 * @property {string} [removal]
 */

/**
 * @typedef {object} Reaction
 * @property {string} id - ex: "REACTION_ELETRIFICACAO_001"
 * @property {string[]} triggerStates - ex: ["STATUS_MOLHADO_001"]
 * @property {string[]} triggerTags - ex: ["TAG_RAITON_001"]
 * @property {string} resultStateId
 */

/**
 * @typedef {object} Item
 * @property {string} id - ex: "ITEM_KUNAI_BASIC_001"
 * @property {string} name
 * @property {string} category
 * @property {string} [slot]
 * @property {string} [rarity]
 */

/**
 * @typedef {object} BossPhase
 * @property {string} id
 * @property {string} name
 * @property {[number, number]} hpRange - fração de HP máximo [min, max) em que a fase está ativa
 * @property {string} telegraph - o que o jogador vê/lê antes do comportamento da fase (CANON_RULES #83)
 * @property {string} [behaviorNote] - resumo do padrão de IA da fase (a lógica real mora em ai.js)
 */

/**
 * @typedef {object} Boss
 * @property {string} id - ex: "BOSS_ZABUZA_001"
 * @property {string} name
 * @property {string} tier - ver ENEMY_TIERS em enums.js
 * @property {string} aiLevel - sempre "BOSS" (ver AI_LEVELS)
 * @property {string} aiProfile - chave em `BOSS_AI_PROFILES` (ai.js)
 * @property {object} stats - overrides parciais de createAttributes()
 * @property {{ ativas: string[], reacao: string|null, suprema: string|null, passivas: string[] }} [loadout]
 * @property {BossPhase[]} phases
 * @property {string[]} [weaknesses] - fraquezas MECÂNICAS (CANON_RULES #30), não só flavor text
 */

/**
 * @typedef {object} Enemy
 * @property {string} id - ex: "ENEMY_WAVES_BANDIT_001"
 * @property {string} name
 * @property {string} tier - ver ENEMY_TIERS em enums.js
 * @property {string} aiLevel - ver AI_LEVELS em enums.js
 * @property {object} stats - overrides parciais de createAttributes()
 * @property {{ ativas: string[], reacao: string|null, suprema: string|null, passivas: string[] }} [loadout]
 */

/**
 * @typedef {object} Region
 * @property {string} id - ex: "REG_WAVES_001"
 * @property {string} name
 * @property {string} act
 */

/**
 * @typedef {object} AssetManifestEntry
 * @property {string} assetId - ex: "PORTRAIT_CHAR_NARUTO_GENIN_001"
 * @property {string} contentId - ex: "CHAR_NARUTO_GENIN_001"
 * @property {string} category - PORTRAIT | FULL | COMBAT | ICON | ART | BG | UI
 * @property {string} path - caminho relativo esperado do arquivo final
 * @property {'P0'|'P1'|'P2'} priority
 * @property {'missing'|'placeholder'|'prompt_ready'|'generated'|'reviewed'|'integrated'} status
 * @property {string} [prompt] - prompt visual completo (ver Style Bible)
 */

export {};

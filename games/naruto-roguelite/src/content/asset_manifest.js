// Asset Manifest — ver CANON_RULES.md #60/#61/#69 e
// docs/design/15_BIBLIOTECA_PROMPTS_VISUAIS_P0_P1.md (fonte destas entradas).
//
// Duas listas, de propósito diferente:
//
// - `assetManifest`: entradas P0 formais, com Asset ID estável (o doc já
//   define o ID exato) e prompt visual completo transcrito do documento.
//   São as entradas que "existem" no sentido do PROMPT MESTRE #60.
//
// - `assetBacklogP1`: itens P1 do documento, que só têm nome (sem Asset ID
//   nem prompt completo definidos ainda). Não inventamos um ID estável aqui
//   — isso seria decidir prematuramente um ID de conteúdo que ainda não foi
//   sequer autorado (ver CANON_RULES.md #50). Viram entradas formais quando
//   o conteúdo correspondente for criado (personagem, região, etc.).
//
// D034 (ver DECISIONS.md): o usuário enviou as 127 imagens deste manifesto,
// geradas fora desta sessão a partir dos prompts já registrados abaixo (ou,
// para os itens que só tinham nome no backlog P1, gerada por conta própria
// seguindo o mesmo esquema de Asset ID). Nenhuma imagem foi gerada por mim
// (PROMPT MESTRE #63) — GENERATED_ASSET_IDS só registra o que chegou pronto.
// Todo o resto continua "prompt_ready" (P0, prompt pronto) ou "missing" (P1,
// só o nome existe).

/** @typedef {import('../engine/types.js').AssetManifestEntry} AssetManifestEntry */

const STYLE_NOTE = 'Seguir Style Bible Visual (docs/design/14_STYLE_BIBLE_VISUAL.md): '
  + 'anime premium, line-art limpa, cel shading controlado, sem fotorrealismo, sem chibi.';

// Asset IDs cujo arquivo real já está em `assets/<categoria>/<assetId>.png`
// (recebidos do usuário — D034). Um Set estático em vez de checar o
// filesystem porque este módulo roda também no navegador (dev console).
const GENERATED_ASSET_IDS = new Set([
  'PORTRAIT_CHAR_NARUTO_GENIN_001', 'FULL_CHAR_NARUTO_GENIN_001', 'COMBAT_CHAR_NARUTO_GENIN_001',
  'PORTRAIT_CHAR_SASUKE_GENIN_001', 'FULL_CHAR_SASUKE_GENIN_001', 'COMBAT_CHAR_SASUKE_GENIN_001',
  'PORTRAIT_CHAR_SAKURA_GENIN_001', 'FULL_CHAR_SAKURA_GENIN_001', 'COMBAT_CHAR_SAKURA_GENIN_001',
  'PORTRAIT_CHAR_SHIKAMARU_GENIN_001', 'FULL_CHAR_SHIKAMARU_GENIN_001', 'COMBAT_CHAR_SHIKAMARU_GENIN_001',
  'PORTRAIT_BOSS_ZABUZA_001', 'ART_BOSS_ZABUZA_001', 'ICON_BOSS_ZABUZA_001',
  'ICON_JUT_KAGE_BUNSHIN_001', 'ART_JUT_KAGE_BUNSHIN_001',
  'ICON_JUT_RASENGAN_001', 'ART_JUT_RASENGAN_001',
  'ICON_JUT_KATON_GOKAKYU_001', 'ART_JUT_KATON_GOKAKYU_001',
  'ICON_JUT_CHIDORI_001', 'ART_JUT_CHIDORI_SASUKE_GENIN_001',
  'ICON_JUT_KAGEMANE_001', 'ART_JUT_KAGEMANE_001',
  'ICON_JUT_KAWARIMI_001',
  'BG_WAVES_ROAD_001', 'BG_WAVES_BRIDGE_001', 'BG_WAVES_BRIDGE_MIST_001', 'BG_WAVES_FOREST_001',
  'COMBAT_ENEMY_WAVES_BANDIT_001', 'COMBAT_ENEMY_WAVES_MERCENARY_001',
  'COMBAT_ENEMY_KIRI_NINJA_001', 'COMBAT_ENEMY_KIRI_ELITE_001',
  'ICON_ITEM_KUNAI_BASIC_001', 'ICON_ITEM_SHURIKEN_BASIC_001', 'ICON_ITEM_SMOKE_BOMB_001',
  'ICON_ITEM_EXPLOSIVE_TAG_001', 'ICON_ITEM_SOLDIER_PILL_001', 'ICON_ITEM_ANTIDOTE_001',
  'ICON_STATUS_BURNING_001', 'ICON_STATUS_WET_001', 'ICON_STATUS_ELECTRIFIED_001',
  'ICON_STATUS_BLEEDING_001', 'ICON_STATUS_IMMOBILIZED_001', 'ICON_STATUS_STUNNED_001',
  'ICON_STATUS_EXPOSED_001', 'ICON_STATUS_OFF_BALANCE_001', 'ICON_STATUS_HIDDEN_001',
  'ICON_STATUS_FOCUSED_001',
  'ART_EVENT_INJURED_NINJA_ROAD_001',
  'UI_FRAME_CHARACTER_CARD_001', 'UI_FRAME_JUTSU_BUTTON_001', 'UI_FRAME_BOSS_HP_001',
  'UI_FRAME_TOOLTIP_001', 'UI_NODE_MISSION_001', 'UI_NODE_ELITE_001', 'UI_NODE_BOSS_001',
  'UI_NODE_EVENT_001', 'UI_NODE_SHOP_001', 'UI_NODE_HOSPITAL_001', 'UI_NODE_TRAINING_001',
  'UI_NODE_SECRET_001', 'UI_RESOURCE_CHAKRA_001', 'UI_RESOURCE_HP_001', 'UI_RESOURCE_GUARD_001',
  'UI_RESOURCE_RYO_001',
  // --- P1 promovidos a formais nesta entrega (D034) -----------------------
  'PORTRAIT_CHAR_KAKASHI_JONIN_001', 'PORTRAIT_CHAR_INO_GENIN_001', 'PORTRAIT_CHAR_CHOJI_GENIN_001',
  'PORTRAIT_CHAR_HINATA_GENIN_001', 'PORTRAIT_CHAR_KIBA_GENIN_001', 'PORTRAIT_CHAR_SHINO_GENIN_001',
  'PORTRAIT_CHAR_ROCK_LEE_GENIN_001', 'PORTRAIT_CHAR_NEJI_GENIN_001', 'PORTRAIT_CHAR_TENTEN_GENIN_001',
  'PORTRAIT_CHAR_GUY_JONIN_001', 'PORTRAIT_CHAR_GAARA_EXAM_001', 'PORTRAIT_CHAR_TEMARI_EXAM_001',
  'PORTRAIT_CHAR_KANKURO_EXAM_001', 'PORTRAIT_CHAR_HAKU_001', 'PORTRAIT_CHAR_KABUTO_CLASSIC_001',
  'PORTRAIT_CHAR_OROCHIMARU_CLASSIC_001', 'PORTRAIT_CHAR_ITACHI_AKATSUKI_001',
  'PORTRAIT_CHAR_KISAME_AKATSUKI_001', 'PORTRAIT_CHAR_JIRAIYA_CLASSIC_001',
  'BG_REGION_KONOHA_001', 'BG_REGION_FOREST_DEATH_001', 'BG_REGION_SUNA_001',
  'BG_REGION_KIRI_001', 'BG_REGION_AME_001', 'BG_REGION_ORO_LAB_001',
  'EFFECT_SHARINGAN_1T_001', 'EFFECT_SHARINGAN_2T_001', 'EFFECT_BYAKUGAN_001',
  'EFFECT_CURSED_SEAL_STAGE1_001', 'EFFECT_GAARA_SAND_ARMOR_001', 'EFFECT_EIGHT_GATES_BASIC_001',
  'EFFECT_AKIMICHI_EXPANSION_001', 'EFFECT_ABURAME_SWARM_001', 'EFFECT_INUZUKA_SYNC_001',
  'ICON_ELEMENT_KATON_001', 'ICON_ELEMENT_SUITON_001', 'ICON_ELEMENT_FUTON_001',
  'ICON_ELEMENT_RAITON_001', 'ICON_ELEMENT_DOTON_001',
  'ICON_STATUS_FROZEN_001', 'ICON_STATUS_POISONED_001', 'ICON_STATUS_MARKED_001',
  'ICON_STATUS_BROKEN_001', 'ICON_STATUS_CONFUSED_001', 'ICON_STATUS_AFRAID_001',
  'ICON_STATUS_SEALED_001', 'ICON_STATUS_CHAKRA_DISRUPTED_001', 'ICON_STATUS_PROTECTED_001',
  'ICON_STATUS_KNOCKED_DOWN_001',
  'UI_RARITY_C_001', 'UI_RARITY_B_001', 'UI_RARITY_A_001', 'UI_RARITY_S_001',
  'UI_RARITY_SS_001', 'UI_RARITY_EX_001',
  'UI_BG_ROULETTE_001', 'UI_EFFECT_CHARACTER_REVEAL_001',
  'UI_BG_RUN_MAP_001',
  'ICON_FACTION_KONOHA_001', 'ICON_FACTION_KIRI_001',
]);

function entry({
  assetId, contentId = null, category, priority, prompt, note,
}) {
  const hasArt = GENERATED_ASSET_IDS.has(assetId);
  return {
    assetId,
    contentId,
    category,
    path: `assets/${category.toLowerCase()}/${assetId}.png`,
    priority,
    status: hasArt ? 'generated' : (prompt ? 'prompt_ready' : 'missing'),
    prompt: prompt ? `${prompt} ${STYLE_NOTE}` : undefined,
    note,
  };
}

export const assetManifest = [
  // --- P0 — Personagens do Vertical Slice --------------------------------
  entry({
    assetId: 'PORTRAIT_CHAR_NARUTO_GENIN_001',
    contentId: 'CHAR_NARUTO_GENIN_001',
    category: 'PORTRAIT',
    priority: 'P0',
    prompt: 'Naruto Uzumaki durante o início de Naruto clássico, aproximadamente 12 anos, '
      + 'portrait anime premium para videogame tático, cabeça e torso superior, visão levemente '
      + 'em 3/4, cabelo loiro espetado, olhos azuis vivos, três marcas características em cada '
      + 'bochecha, bandana de Konoha corretamente posicionada, roupa clássica laranja e azul da '
      + 'fase Genin, expressão determinada e competitiva com sorriso confiante, proporções '
      + 'juvenis corretas, line-art limpa e expressiva, cel shading controlado, silhueta '
      + 'extremamente legível, iluminação limpa, fundo transparente, sem texto, sem watermark, '
      + 'não representar Naruto adolescente ou adulto, não usar roupa Shippuden.',
  }),
  entry({
    assetId: 'FULL_CHAR_NARUTO_GENIN_001',
    contentId: 'CHAR_NARUTO_GENIN_001',
    category: 'FULL',
    priority: 'P0',
    prompt: 'Naruto Uzumaki Genin, aproximadamente 12 anos, corpo inteiro, anime tactical RPG '
      + 'character illustration, roupa clássica laranja e azul, bandana da Folha, sandálias '
      + 'ninja, bolsa de ferramentas, postura energética, um punho levantado, expressão '
      + 'confiante, fundo transparente, sem clones, sem Rasengan.',
  }),
  entry({
    assetId: 'COMBAT_CHAR_NARUTO_GENIN_001',
    contentId: 'CHAR_NARUTO_GENIN_001',
    category: 'COMBAT',
    priority: 'P0',
    prompt: 'Naruto Genin em pose de combate dinâmica, roupa clássica, uma mão preparando selo '
      + 'ninja, movimento energético, anime game combat artwork, cel shading, fundo simples.',
  }),
  entry({
    assetId: 'PORTRAIT_CHAR_SASUKE_GENIN_001',
    contentId: 'CHAR_SASUKE_GENIN_001',
    category: 'PORTRAIT',
    priority: 'P0',
    prompt: 'Sasuke Uchiha durante Naruto clássico, aproximadamente 12 anos, portrait anime '
      + 'premium, cabelo preto espetado, olhos escuros sem Sharingan ativo, camisa azul de gola '
      + 'alta, símbolo Uchiha, bandana de Konoha, expressão séria, fundo transparente, sem '
      + 'Chidori, Mangekyō ou roupa Shippuden.',
  }),
  entry({
    assetId: 'FULL_CHAR_SASUKE_GENIN_001',
    contentId: 'CHAR_SASUKE_GENIN_001',
    category: 'FULL',
    priority: 'P0',
    prompt: 'Sasuke Genin corpo inteiro, roupa azul clássica, shorts claros, bandana, bolsa '
      + 'ninja, símbolo Uchiha, postura precisa com kunai, fundo transparente.',
  }),
  entry({
    assetId: 'COMBAT_CHAR_SASUKE_GENIN_001',
    contentId: 'CHAR_SASUKE_GENIN_001',
    category: 'COMBAT',
    priority: 'P0',
    prompt: 'Sasuke Genin em postura ofensiva rápida, kunai na mão, outra mão começando selo, '
      + 'anime tactical RPG combat illustration.',
  }),
  entry({
    assetId: 'PORTRAIT_CHAR_SAKURA_GENIN_001',
    contentId: 'CHAR_SAKURA_GENIN_001',
    category: 'PORTRAIT',
    priority: 'P0',
    prompt: 'Sakura Haruno Naruto clássico, aproximadamente 12 anos, cabelo rosa curto, olhos '
      + 'verdes, roupa vermelha clássica, bandana Konoha, expressão inteligente e determinada, '
      + 'fundo transparente, sem visual Shippuden ou Byakugō.',
  }),
  entry({
    assetId: 'FULL_CHAR_SAKURA_GENIN_001',
    contentId: 'CHAR_SAKURA_GENIN_001',
    category: 'FULL',
    priority: 'P0',
    prompt: 'Sakura Genin full-body, roupa clássica, shorts, kunai, postura defensiva e atenta, '
      + 'fundo transparente.',
  }),
  entry({
    assetId: 'COMBAT_CHAR_SAKURA_GENIN_001',
    contentId: 'CHAR_SAKURA_GENIN_001',
    category: 'COMBAT',
    priority: 'P0',
    prompt: 'Sakura Genin em pose de suporte tático, kunai em uma mão e Chakra discreto na '
      + 'outra, sem força monstruosa de versões futuras.',
  }),
  entry({
    assetId: 'PORTRAIT_CHAR_SHIKAMARU_GENIN_001',
    contentId: 'CHAR_SHIKAMARU_GENIN_001',
    category: 'PORTRAIT',
    priority: 'P0',
    prompt: 'Shikamaru Nara Naruto clássico, aproximadamente 12 anos, cabelo preso '
      + 'característico, expressão entediada e inteligente, roupa clássica, bandana Konoha, '
      + 'fundo transparente, sem colete Chūnin.',
  }),
  entry({
    assetId: 'FULL_CHAR_SHIKAMARU_GENIN_001',
    contentId: 'CHAR_SHIKAMARU_GENIN_001',
    category: 'FULL',
    priority: 'P0',
    prompt: 'Shikamaru Genin corpo inteiro, postura relaxada, roupa clássica, sombra sutil sob '
      + 'os pés, fundo transparente.',
  }),
  entry({
    assetId: 'COMBAT_CHAR_SHIKAMARU_GENIN_001',
    contentId: 'CHAR_SHIKAMARU_GENIN_001',
    category: 'COMBAT',
    priority: 'P0',
    prompt: 'Shikamaru Genin em postura estratégica, mãos em selo, sombra estendendo-se pelo '
      + 'chão, expressão focada.',
  }),

  // --- P0 — Zabuza (primeiro boss) ----------------------------------------
  entry({
    assetId: 'PORTRAIT_BOSS_ZABUZA_001',
    contentId: 'BOSS_ZABUZA_001',
    category: 'PORTRAIT',
    priority: 'P0',
    prompt: 'Zabuza Momochi no arco País das Ondas, portrait anime premium para boss, '
      + 'bandagens no rosto, bandana de Kiri riscada, olhar ameaçador, leve névoa, cel shading '
      + 'dramático.',
  }),
  entry({
    assetId: 'ART_BOSS_ZABUZA_001',
    contentId: 'BOSS_ZABUZA_001',
    category: 'ART',
    priority: 'P0',
    prompt: 'Zabuza segurando Kubikiribōchō, névoa densa, câmera baixa, postura brutal de '
      + 'espadachim assassino, roupa clássica, água e partículas sutis, sem outros '
      + 'personagens.',
  }),
  entry({
    assetId: 'ICON_BOSS_ZABUZA_001',
    contentId: 'BOSS_ZABUZA_001',
    category: 'ICON',
    priority: 'P0',
    prompt: 'Close-up de Zabuza, bandagens, olhar ameaçador, névoa estilizada, legível pequeno.',
  }),

  // --- P0 — Jutsus do Vertical Slice --------------------------------------
  entry({
    assetId: 'ICON_JUT_KAGE_BUNSHIN_001',
    contentId: 'JUT_KAGE_BUNSHIN_001',
    category: 'ICON',
    priority: 'P0',
    prompt: 'Naruto Genin fazendo selo ninja, duas silhuetas idênticas surgindo em fumaça '
      + 'branca, composição simples e legível, sem texto.',
  }),
  entry({
    assetId: 'ART_JUT_KAGE_BUNSHIN_001',
    contentId: 'JUT_KAGE_BUNSHIN_001',
    category: 'ART',
    priority: 'P0',
    prompt: 'Naruto Genin executando Kage Bunshin, várias cópias surgindo em fumaça, cena '
      + 'energética, sem Rasengan.',
  }),
  entry({
    assetId: 'ICON_JUT_RASENGAN_001',
    contentId: 'JUT_RASENGAN_001',
    category: 'ICON',
    priority: 'P0',
    prompt: 'Mão juvenil segurando esfera compacta de Chakra azul giratório, fundo escuro '
      + 'simples.',
  }),
  entry({
    assetId: 'ART_JUT_RASENGAN_001',
    contentId: 'JUT_RASENGAN_001',
    category: 'ART',
    priority: 'P0',
    prompt: 'Naruto Genin avançando com Rasengan, Chakra azul comprimido, expressão '
      + 'determinada, sem Rasenshuriken.',
  }),
  entry({
    assetId: 'ICON_JUT_KATON_GOKAKYU_001',
    contentId: 'JUT_KATON_GOKAKYU_001',
    category: 'ICON',
    priority: 'P0',
    prompt: 'Grande esfera de fogo laranja-avermelhada, compacta, legível, fundo escuro.',
  }),
  entry({
    assetId: 'ART_JUT_KATON_GOKAKYU_001',
    contentId: 'JUT_KATON_GOKAKYU_001',
    category: 'ART',
    priority: 'P0',
    prompt: 'Sasuke Genin executando Gōkakyū, enorme bola de fogo, luz quente refletindo na '
      + 'roupa azul.',
  }),
  entry({
    assetId: 'ICON_JUT_CHIDORI_001',
    contentId: 'JUT_CHIDORI_001',
    category: 'ICON',
    priority: 'P0',
    prompt: 'Mão envolta em relâmpagos azuis/brancos intensos, energia perfurante.',
  }),
  entry({
    assetId: 'ART_JUT_CHIDORI_SASUKE_GENIN_001',
    contentId: 'JUT_CHIDORI_001',
    category: 'ART',
    priority: 'P0',
    prompt: 'Sasuke Genin correndo com Chidori, Sharingan inicial ativo, roupa clássica azul, '
      + 'sem Mangekyō/Shippuden.',
  }),
  entry({
    assetId: 'ICON_JUT_KAGEMANE_001',
    contentId: 'JUT_KAGEMANE_001',
    category: 'ICON',
    priority: 'P0',
    prompt: 'Sombra negra fina conectando duas silhuetas pelo chão.',
  }),
  entry({
    assetId: 'ART_JUT_KAGEMANE_001',
    contentId: 'JUT_KAGEMANE_001',
    category: 'ART',
    priority: 'P0',
    prompt: 'Shikamaru Genin com selo ninja, sombra longa prendendo oponente fora de foco.',
  }),
  entry({
    assetId: 'ICON_JUT_KAWARIMI_001',
    contentId: 'JUT_KAWARIMI_001',
    category: 'ICON',
    priority: 'P0',
    prompt: 'Tronco de madeira substituindo instantaneamente pessoa em fumaça branca e folhas.',
  }),

  // --- P0 — Cenários (País das Ondas) -------------------------------------
  entry({
    assetId: 'BG_WAVES_ROAD_001',
    contentId: 'REG_WAVES_001',
    category: 'BG',
    priority: 'P0',
    prompt: 'Estrada úmida no País das Ondas, floresta densa e enevoada, atmosfera silenciosa '
      + 'e ameaçadora, sem pessoas.',
  }),
  entry({
    assetId: 'BG_WAVES_BRIDGE_001',
    contentId: 'REG_WAVES_001',
    category: 'BG',
    priority: 'P0',
    prompt: 'Grande ponte em construção, água fria, céu nublado, andaimes, espaço central para '
      + 'combate.',
  }),
  entry({
    assetId: 'BG_WAVES_BRIDGE_MIST_001',
    contentId: 'REG_WAVES_001',
    category: 'BG',
    priority: 'P0',
    prompt: 'Mesma ponte tomada por névoa densa de Kiri.',
  }),
  entry({
    assetId: 'BG_WAVES_FOREST_001',
    contentId: 'REG_WAVES_001',
    category: 'BG',
    priority: 'P0',
    prompt: 'Floresta úmida, árvores altas, musgo, poças, neblina baixa.',
  }),

  // --- P0 — Inimigos genéricos ---------------------------------------------
  entry({
    assetId: 'COMBAT_ENEMY_WAVES_BANDIT_001',
    contentId: 'ENEMY_WAVES_BANDIT_001',
    category: 'COMBAT',
    priority: 'P0',
    prompt: 'Bandido mercenário, roupa improvisada, arma simples, sem bandana ninja.',
  }),
  entry({
    assetId: 'COMBAT_ENEMY_WAVES_MERCENARY_001',
    contentId: 'ENEMY_WAVES_MERCENARY_001',
    category: 'COMBAT',
    priority: 'P0',
    prompt: 'Mercenário profissional, proteção leve, kunai/espada curta.',
  }),
  entry({
    assetId: 'COMBAT_ENEMY_KIRI_NINJA_001',
    contentId: 'ENEMY_KIRI_NINJA_001',
    category: 'COMBAT',
    priority: 'P0',
    prompt: 'Ninja genérico de Kiri, tons frios, equipamento furtivo, sem copiar personagem '
      + 'canônico.',
  }),
  entry({
    assetId: 'COMBAT_ENEMY_KIRI_ELITE_001',
    contentId: 'ENEMY_KIRI_ELITE_001',
    category: 'COMBAT',
    priority: 'P0',
    prompt: 'Elite de Kiri, espada, proteção melhor, cicatriz/máscara parcial, não parecer '
      + 'Zabuza.',
  }),

  // --- P0 — Itens iniciais --------------------------------------------------
  entry({
    assetId: 'ICON_ITEM_KUNAI_BASIC_001',
    contentId: 'ITEM_KUNAI_BASIC_001',
    category: 'ICON',
    priority: 'P0',
    prompt: 'Kunai clássico, metal escuro, fundo transparente.',
  }),
  entry({
    assetId: 'ICON_ITEM_SHURIKEN_BASIC_001',
    contentId: 'ITEM_SHURIKEN_BASIC_001',
    category: 'ICON',
    priority: 'P0',
    prompt: 'Shuriken de quatro pontas, fundo transparente.',
  }),
  entry({
    assetId: 'ICON_ITEM_SMOKE_BOMB_001',
    contentId: 'ITEM_SMOKE_BOMB_001',
    category: 'ICON',
    priority: 'P0',
    prompt: 'Bomba ninja de fumaça compacta.',
  }),
  entry({
    assetId: 'ICON_ITEM_EXPLOSIVE_TAG_001',
    contentId: 'ITEM_EXPLOSIVE_TAG_001',
    category: 'ICON',
    priority: 'P0',
    prompt: 'Selo explosivo em papel com inscrições estilizadas sem texto real.',
  }),
  entry({
    assetId: 'ICON_ITEM_SOLDIER_PILL_001',
    contentId: 'ITEM_SOLDIER_PILL_001',
    category: 'ICON',
    priority: 'P0',
    prompt: 'Pílulas militares ninja em embalagem simples.',
  }),
  entry({
    assetId: 'ICON_ITEM_ANTIDOTE_001',
    contentId: 'ITEM_ANTIDOTE_001',
    category: 'ICON',
    priority: 'P0',
    prompt: 'Frasco pequeno protegido por tecido/metal com líquido medicinal.',
  }),

  // --- P0 — Ícones de Estado -------------------------------------------------
  // Nomes em inglês vêm do documento fonte (código interno de ícone); o Estado
  // canônico correspondente (doc 01) vai entre parênteses em `note`. Sem
  // contentId ainda: o catálogo formal de Estados nasce no Marco 2.
  ...[
    ['BURNING', 'chama', 'Queimando'],
    ['WET', 'gota', 'Molhado'],
    ['ELECTRIFIED', 'raio', 'Eletrificado'],
    ['BLEEDING', 'corte com gota', 'Sangrando'],
    ['IMMOBILIZED', 'restrição', 'Imobilizado'],
    ['STUNNED', 'impacto', 'Atordoado'],
    ['EXPOSED', 'alvo com escudo quebrado', 'Exposto'],
    ['OFF_BALANCE', 'silhueta inclinada', 'Desequilibrado'],
    ['HIDDEN', 'silhueta na névoa', 'Oculto'],
    ['FOCUSED', 'olho em alvo', 'Focado'],
  ].map(([code, desc, canonicalPt]) => entry({
    assetId: `ICON_STATUS_${code}_001`,
    category: 'ICON',
    priority: 'P0',
    prompt: `Ícone de estado: ${desc}, composição simples e legível em tamanho pequeno, fundo `
      + 'transparente, sem texto.',
    note: `Ícone do Estado canônico "${canonicalPt}" (ver docs/design/01_COMBATE_TAGS_ESTADOS_REACOES.md).`,
  })),

  // --- P0 — Evento ------------------------------------------------------------
  entry({
    assetId: 'ART_EVENT_INJURED_NINJA_ROAD_001',
    category: 'ART',
    priority: 'P0',
    prompt: 'Ninja de Suna ferido sentado contra árvore em estrada úmida, sem gore, atmosfera '
      + 'ambígua, espaço para diálogo.',
    note: 'Arte do evento de abertura sugerido no Resumo Canônico; entidade EVENT_ formal a criar no Marco 7.',
  }),

  // --- P0 — UI --------------------------------------------------------------
  ...[
    ['UI_FRAME_CHARACTER_CARD_001', 'Frame de carta ninja/pergaminho moderno.'],
    ['UI_FRAME_JUTSU_BUTTON_001', 'Botão horizontal com espaço de ícone/nome/custo.'],
    ['UI_FRAME_BOSS_HP_001', 'Boss bar em estilo ninja dossier.'],
    ['UI_FRAME_TOOLTIP_001', 'Tooltip legível.'],
    ['UI_NODE_MISSION_001', 'Ícone de nó de mapa: pergaminho.'],
    ['UI_NODE_ELITE_001', 'Ícone de nó de mapa: kunais cruzadas.'],
    ['UI_NODE_BOSS_001', 'Ícone de nó de mapa: máscara rachada.'],
    ['UI_NODE_EVENT_001', 'Ícone de nó de mapa: pergaminho misterioso.'],
    ['UI_NODE_SHOP_001', 'Ícone de nó de mapa: bolsa de suprimentos.'],
    ['UI_NODE_HOSPITAL_001', 'Ícone de nó de mapa: bandagem com chakra.'],
    ['UI_NODE_TRAINING_001', 'Ícone de nó de mapa: poste de treino com shuriken.'],
    ['UI_NODE_SECRET_001', 'Ícone de nó de mapa: selo oculto.'],
    ['UI_RESOURCE_CHAKRA_001', 'Ícone de recurso: gota espiral azul.'],
    ['UI_RESOURCE_HP_001', 'Ícone de recurso: vitalidade.'],
    ['UI_RESOURCE_GUARD_001', 'Ícone de recurso: escudo ninja.'],
    ['UI_RESOURCE_RYO_001', 'Ícone de recurso: moedas.'],
  ].map(([assetId, prompt]) => entry({
    assetId, category: 'UI', priority: 'P0', prompt,
  })),

  // --- P1 promovidos a formais (D034 — arte chegou antes do prompt) --------
  // Estes itens só tinham nome em `assetBacklogP1`. O usuário enviou a arte
  // já usando o próprio esquema de Asset ID do backlog, então a entrada vira
  // formal agora — sem inventar conteúdo novo (CANON_RULES.md #50): o nome e
  // o grupo já estavam declarados, só o Asset ID e o registro formal são
  // novos. `prompt` fica de fora porque não foi eu que gerei a imagem.
  ...[
    ['PORTRAIT_CHAR_KAKASHI_JONIN_001', null, 'Personagens P1 — Kakashi Jōnin.'],
    ['PORTRAIT_CHAR_INO_GENIN_001', null, 'Personagens P1 — Ino.'],
    ['PORTRAIT_CHAR_CHOJI_GENIN_001', null, 'Personagens P1 — Chōji.'],
    ['PORTRAIT_CHAR_HINATA_GENIN_001', null, 'Personagens P1 — Hinata.'],
    ['PORTRAIT_CHAR_KIBA_GENIN_001', null, 'Personagens P1 — Kiba.'],
    ['PORTRAIT_CHAR_SHINO_GENIN_001', null, 'Personagens P1 — Shino.'],
    ['PORTRAIT_CHAR_ROCK_LEE_GENIN_001', null, 'Personagens P1 — Rock Lee.'],
    ['PORTRAIT_CHAR_NEJI_GENIN_001', null, 'Personagens P1 — Neji.'],
    ['PORTRAIT_CHAR_TENTEN_GENIN_001', null, 'Personagens P1 — Tenten.'],
    ['PORTRAIT_CHAR_GUY_JONIN_001', null, 'Personagens P1 — Guy.'],
    ['PORTRAIT_CHAR_GAARA_EXAM_001', null, 'Personagens P1 — Gaara Exam.'],
    ['PORTRAIT_CHAR_TEMARI_EXAM_001', null, 'Personagens P1 — Temari.'],
    ['PORTRAIT_CHAR_KANKURO_EXAM_001', null, 'Personagens P1 — Kankurō.'],
    ['PORTRAIT_CHAR_HAKU_001', null, 'Personagens P1 — Haku.'],
    ['PORTRAIT_CHAR_KABUTO_CLASSIC_001', null, 'Personagens P1 — Kabuto.'],
    ['PORTRAIT_CHAR_OROCHIMARU_CLASSIC_001', null, 'Personagens P1 — Orochimaru.'],
    ['PORTRAIT_CHAR_ITACHI_AKATSUKI_001', null, 'Personagens P1 — Itachi.'],
    ['PORTRAIT_CHAR_KISAME_AKATSUKI_001', null, 'Personagens P1 — Kisame.'],
    ['PORTRAIT_CHAR_JIRAIYA_CLASSIC_001', null, 'Personagens P1 — Jiraiya.'],
  ].map(([assetId, contentId, note]) => entry({
    assetId,
    contentId,
    category: 'PORTRAIT',
    priority: 'P1',
    note: `${note} Personagem ainda não tem entidade CHAR_ formal no catálogo (src/data/catalog/characters.js).`,
  })),

  ...[
    ['BG_REGION_KONOHA_001', null, 'Regiões P1 — Konoha.'],
    ['BG_REGION_FOREST_DEATH_001', 'REG_FLORESTA_DA_MORTE_001', 'Regiões P1 — Floresta da Morte.'],
    ['BG_REGION_SUNA_001', 'REG_SUNA_001', 'Regiões P1 — Suna.'],
    ['BG_REGION_KIRI_001', null, 'Regiões P1 — Kiri.'],
    ['BG_REGION_AME_001', null, 'Regiões P1 — Ame.'],
    ['BG_REGION_ORO_LAB_001', null, 'Regiões P1 — Laboratório Orochimaru.'],
  ].map(([assetId, contentId, note]) => entry({
    assetId,
    contentId,
    category: 'BG',
    priority: 'P1',
    note: contentId
      ? note
      : `${note} Região ainda não tem entidade REG_ formal no catálogo (src/data/catalog/regions.js).`,
  })),

  ...[
    ['EFFECT_SHARINGAN_1T_001', 'Transformações P1 — Sharingan 1 tomoe.'],
    ['EFFECT_SHARINGAN_2T_001', 'Transformações P1 — Sharingan 2 tomoe.'],
    ['EFFECT_BYAKUGAN_001', 'Transformações P1 — Byakugan.'],
    ['EFFECT_CURSED_SEAL_STAGE1_001', 'Transformações P1 — Selo Amaldiçoado Stage 1.'],
    ['EFFECT_GAARA_SAND_ARMOR_001', 'Transformações P1 — Armadura de Areia (Gaara).'],
    ['EFFECT_EIGHT_GATES_BASIC_001', 'Transformações P1 — Oito Portões (básico).'],
    ['EFFECT_AKIMICHI_EXPANSION_001', 'Transformações P1 — Expansão Akimichi.'],
    ['EFFECT_ABURAME_SWARM_001', 'Transformações P1 — Enxame Aburame.'],
    ['EFFECT_INUZUKA_SYNC_001', 'Transformações P1 — Sincronia Inuzuka.'],
  ].map(([assetId, note]) => entry({
    assetId,
    category: 'ART',
    priority: 'P1',
    note: `${note} Transformação/passiva ainda sem mecânica formal implementada.`,
  })),

  ...[
    ['ICON_ELEMENT_KATON_001', 'TAG_KATON_001', 'Katon'],
    ['ICON_ELEMENT_SUITON_001', 'TAG_SUITON_001', 'Suiton'],
    ['ICON_ELEMENT_FUTON_001', 'TAG_FUTON_001', 'Fūton'],
    ['ICON_ELEMENT_RAITON_001', 'TAG_RAITON_001', 'Raiton'],
    ['ICON_ELEMENT_DOTON_001', 'TAG_DOTON_001', 'Doton'],
  ].map(([assetId, contentId, name]) => entry({
    assetId,
    contentId,
    category: 'ICON',
    priority: 'P1',
    note: `Elementos P1 — ícone de natureza Chakra "${name}" (ver src/data/catalog/tags.js).`,
  })),

  ...[
    ['ICON_STATUS_FROZEN_001', 'Congelado'],
    ['ICON_STATUS_POISONED_001', null],
    ['ICON_STATUS_MARKED_001', 'Marcado'],
    ['ICON_STATUS_BROKEN_001', 'Quebrado'],
    ['ICON_STATUS_CONFUSED_001', 'Confuso'],
    ['ICON_STATUS_AFRAID_001', 'Medo'],
    ['ICON_STATUS_SEALED_001', 'Selado'],
    ['ICON_STATUS_CHAKRA_DISRUPTED_001', 'Chakra Perturbado'],
    ['ICON_STATUS_PROTECTED_001', 'Protegido'],
    ['ICON_STATUS_KNOCKED_DOWN_001', 'Derrubado'],
  ].map(([assetId, canonicalPt]) => entry({
    assetId,
    category: 'ICON',
    priority: 'P1',
    note: canonicalPt
      ? `Status extras P1 — ícone do Estado canônico "${canonicalPt}" (ver src/data/catalog/statuses.js).`
      : 'Status extras P1 — nome do backlog original sem Estado canônico correspondente em '
        + 'src/data/catalog/statuses.js; ícone sem uso mecânico definido ainda.',
  })),

  ...[
    ['UI_RARITY_C_001', 'C'], ['UI_RARITY_B_001', 'B'], ['UI_RARITY_A_001', 'A'],
    ['UI_RARITY_S_001', 'S'], ['UI_RARITY_SS_001', 'SS'], ['UI_RARITY_EX_001', 'EX'],
  ].map(([assetId, rank]) => entry({
    assetId,
    category: 'UI',
    priority: 'P1',
    note: `Molduras de Raridade P1 — moldura de rank "${rank}" (RANKS em src/engine/enums.js; `
      + '"SS" não faz parte do vocabulário canônico de RANKS ainda).',
  })),

  entry({
    assetId: 'UI_BG_ROULETTE_001',
    category: 'UI',
    priority: 'P1',
    note: 'Roleta P1 — pergaminho cerimonial + selos + Chakra. Tela de roleta ainda não implementada.',
  }),
  entry({
    assetId: 'UI_EFFECT_CHARACTER_REVEAL_001',
    category: 'UI',
    priority: 'P1',
    note: 'Roleta P1 — efeito de reveal de personagem. Tela de roleta ainda não implementada.',
  }),
  entry({
    assetId: 'UI_BG_RUN_MAP_001',
    category: 'UI',
    priority: 'P1',
    note: 'Mapa P1 — fundo estilizado do mapa da Run.',
  }),

  // --- Ícones de Facção (conteúdo já existe desde o Marco 9/D026, mas não
  // tinha entrada no Asset Manifest ainda) -----------------------------------
  entry({
    assetId: 'ICON_FACTION_KONOHA_001',
    contentId: 'FACTION_KONOHA_001',
    category: 'ICON',
    priority: 'P1',
    note: 'Ícone da facção Konohagakure (ver src/data/catalog/factions.js).',
  }),
  entry({
    assetId: 'ICON_FACTION_KIRI_001',
    contentId: 'FACTION_KIRI_001',
    category: 'ICON',
    priority: 'P1',
    note: 'Ícone da facção Kirigakure (ver src/data/catalog/factions.js).',
  }),
];

/**
 * Itens P1 do documento fonte: só têm nome, sem Asset ID nem prompt
 * definidos. Não são AssetManifestEntry formais — viram uma quando o
 * conteúdo correspondente for autorado (ver comentário no topo do arquivo).
 */
// Vazio desde D034: todos os grupos que existiam aqui (Personagens P1,
// Regiões P1, Transformações P1, Elementos P1, Status extras P1, Molduras
// de Raridade P1, Roleta P1, Mapa P1) tiveram a arte enviada pelo usuário e
// foram promovidos a entradas formais em `assetManifest` (ver o bloco
// "P1 promovidos a formais" acima). Novos itens sem Asset ID/prompt ainda
// definidos entram aqui de novo quando aparecerem.
export const assetBacklogP1 = [];

/** Índice assetId -> entry, para lookups O(1) (usado por validators.js). */
export const assetManifestIndex = new Map(assetManifest.map((e) => [e.assetId, e]));

/**
 * Encontra o Asset ID de uma `category` (PORTRAIT/FULL/COMBAT/...) ligado a
 * um `contentId` de catálogo (ex: 'CHAR_NARUTO_GENIN_001'). Usado pelas
 * telas jogáveis para resolver o retrato/arte de combate de um personagem/
 * inimigo/boss sem hardcodar o Asset ID em cada tela.
 */
export function findAssetIdByContent(contentId, category) {
  const found = assetManifest.find((e) => e.contentId === contentId && e.category === category);
  return found?.assetId ?? null;
}

/** Contagem de entradas por status, para relatórios (PROJECT_STATUS.md, dev console). */
export function summarizeManifestByStatus(entries = assetManifest) {
  const summary = {};
  for (const e of entries) {
    summary[e.status] = (summary[e.status] ?? 0) + 1;
  }
  return summary;
}

const PLACEHOLDER_COLORS = {
  PORTRAIT: '#4c6ef5',
  FULL: '#7048e8',
  COMBAT: '#e03131',
  ICON: '#f08c00',
  ART: '#1098ad',
  BG: '#2f9e44',
  UI: '#495057',
};

function escapeXml(text) {
  return text.replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  }[c]));
}

/**
 * Data URI de um placeholder SVG colorido por categoria, com o Asset ID
 * como legenda. Usado enquanto o status do asset não é "generated"+ (ver
 * CANON_RULES.md #61 — placeholder nunca bloqueia desenvolvimento).
 */
export function placeholderDataUri(assetId, category) {
  const color = PLACEHOLDER_COLORS[category] ?? '#868e96';
  const label = escapeXml(assetId);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">`
    + `<rect width="100%" height="100%" fill="${color}"/>`
    + `<text x="50%" y="50%" fill="#fff" font-family="sans-serif" font-size="13" `
    + `text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Caminho de imagem a usar agora: o real se `status` >= generated, senão um placeholder. */
export function resolveAssetSrc(assetId) {
  const found = assetManifestIndex.get(assetId);
  if (!found) return placeholderDataUri(assetId, 'UI');
  const hasArt = ['generated', 'reviewed', 'integrated'].includes(found.status);
  return hasArt ? found.path : placeholderDataUri(found.assetId, found.category);
}

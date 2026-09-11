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
// Nenhuma imagem foi gerada nesta sessão (PROMPT MESTRE #63): todo status é
// "prompt_ready" (P0, prompt completo pronto para gerar) ou "missing" (P1,
// só o nome existe ainda).

/** @typedef {import('../engine/types.js').AssetManifestEntry} AssetManifestEntry */

const STYLE_NOTE = 'Seguir Style Bible Visual (docs/design/14_STYLE_BIBLE_VISUAL.md): '
  + 'anime premium, line-art limpa, cel shading controlado, sem fotorrealismo, sem chibi.';

function entry({
  assetId, contentId = null, category, priority, prompt, note,
}) {
  return {
    assetId,
    contentId,
    category,
    path: `assets/${category.toLowerCase()}/${assetId}.png`,
    priority,
    status: prompt ? 'prompt_ready' : 'missing',
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
    category: 'COMBAT',
    priority: 'P0',
    prompt: 'Bandido mercenário, roupa improvisada, arma simples, sem bandana ninja.',
    note: 'Arquétipo de inimigo comum do País das Ondas; entidade ENEMY_ formal a criar no Marco 5.',
  }),
  entry({
    assetId: 'COMBAT_ENEMY_WAVES_MERCENARY_001',
    category: 'COMBAT',
    priority: 'P0',
    prompt: 'Mercenário profissional, proteção leve, kunai/espada curta.',
    note: 'Arquétipo de inimigo comum do País das Ondas; entidade ENEMY_ formal a criar no Marco 5.',
  }),
  entry({
    assetId: 'COMBAT_ENEMY_KIRI_NINJA_001',
    category: 'COMBAT',
    priority: 'P0',
    prompt: 'Ninja genérico de Kiri, tons frios, equipamento furtivo, sem copiar personagem '
      + 'canônico.',
    note: 'Arquétipo de inimigo comum de Kiri; entidade ENEMY_ formal a criar no Marco 5.',
  }),
  entry({
    assetId: 'COMBAT_ENEMY_KIRI_ELITE_001',
    category: 'COMBAT',
    priority: 'P0',
    prompt: 'Elite de Kiri, espada, proteção melhor, cicatriz/máscara parcial, não parecer '
      + 'Zabuza.',
    note: 'Arquétipo de elite de Kiri; entidade ENEMY_ formal a criar no Marco 5.',
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
];

/**
 * Itens P1 do documento fonte: só têm nome, sem Asset ID nem prompt
 * definidos. Não são AssetManifestEntry formais — viram uma quando o
 * conteúdo correspondente for autorado (ver comentário no topo do arquivo).
 */
export const assetBacklogP1 = [
  ...[
    'Kakashi Jōnin', 'Ino', 'Chōji', 'Hinata', 'Kiba', 'Shino', 'Rock Lee', 'Neji',
    'Tenten', 'Guy', 'Gaara Exam', 'Temari', 'Kankurō', 'Haku', 'Kabuto', 'Orochimaru',
    'Itachi', 'Kisame', 'Jiraiya',
  ].map((name) => ({ category: 'PORTRAIT', group: 'Personagens P1', name })),
  ...['Konoha', 'Floresta da Morte', 'Suna', 'Kiri', 'Ame', 'Laboratório Orochimaru']
    .map((name) => ({ category: 'BG', group: 'Regiões P1', name })),
  ...[
    'Sharingan 1T', 'Sharingan 2T', 'Byakugan', 'Selo Amaldiçoado Stage1', 'Sand Armor',
    'Eight Gates basic', 'Akimichi Expansion', 'Aburame Swarm', 'Inuzuka Sync',
  ].map((name) => ({ category: 'ART', group: 'Transformações P1', name })),
  ...['Katon', 'Suiton', 'Fūton', 'Raiton', 'Doton']
    .map((name) => ({ category: 'ICON', group: 'Elementos P1', name })),
  ...[
    'Frozen', 'Poisoned', 'Marked', 'Broken', 'Confused', 'Afraid', 'Sealed',
    'Chakra Disrupted', 'Protected', 'Knocked Down',
  ].map((name) => ({ category: 'ICON', group: 'Status extras P1', name })),
  ...['C', 'B', 'A', 'S', 'SS', 'EX']
    .map((name) => ({ category: 'UI', group: 'Molduras de Raridade P1', name })),
  { category: 'BG', group: 'Roleta P1', name: 'UI_BG_ROULETTE_001 — pergaminho cerimonial + selos + Chakra' },
  { category: 'UI', group: 'Roleta P1', name: 'UI_EFFECT_CHARACTER_REVEAL_001 — reveal de personagem' },
  { category: 'BG', group: 'Mapa P1', name: 'UI_BG_RUN_MAP_001 — mapa ninja estilizado' },
];

/** Índice assetId -> entry, para lookups O(1) (usado por validators.js). */
export const assetManifestIndex = new Map(assetManifest.map((e) => [e.assetId, e]));

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

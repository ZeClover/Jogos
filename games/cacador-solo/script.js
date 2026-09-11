const SAVE_KEY = 'cacador-solo-save-v3';
const PORTAL_SLOTS = 3;
const TICK_MS = 1500;
const REVEAL_GRACE_MS = 4000;

const RANK_ORDER = ['E', 'D', 'C', 'B', 'A', 'S'];

const CLASS_UNLOCK_MAP = {
  E: ['guerreiro', 'ladrao'],
  D: ['mago', 'feiticeira'],
  C: ['arqueira', 'punho'],
  B: ['clerigo', 'domador'],
  A: ['monarca', 'vidente'],
};

const CLASSES = [
  {
    id: 'recruta',
    name: 'Recruta',
    icon: '🔰',
    resourceType: 'mp',
    resourceLabel: 'Mana',
    desc: 'Classe inicial, simples e equilibrada. Derrote chefes de rank pra desbloquear classes únicas.',
    base: { hp: 100, mp: 30, atk: 9, def: 5, crit: 5 },
  },
  {
    id: 'guerreiro',
    name: 'Guerreiro Berserker',
    icon: '🪓',
    resourceType: 'fury',
    resourceLabel: 'Fúria',
    desc: 'Não usa mana: ganha Fúria ao acertar e ao apanhar, e gasta essa Fúria em golpes devastadores.',
    base: { hp: 140, mp: 0, atk: 11, def: 8, crit: 5 },
    unlockedBy: 'E',
  },
  {
    id: 'mago',
    name: 'Mago Elementalista',
    icon: '🔮',
    resourceType: 'mp',
    resourceLabel: 'Mana',
    desc: 'Marca inimigos com Fogo, Gelo ou Raio. Lançar um elemento diferente sobre uma marca ativa uma reação com dano muito maior.',
    base: { hp: 65, mp: 75, atk: 13, def: 2, crit: 8 },
    unlockedBy: 'D',
  },
  {
    id: 'arqueira',
    name: 'Arqueira Precisão',
    icon: '🏹',
    resourceType: 'mp',
    resourceLabel: 'Mana',
    desc: 'Acumula Foco a cada turno que acerta sem ser atingida. Pode carregar um tiro por um golpe devastador.',
    base: { hp: 85, mp: 30, atk: 12, def: 4, crit: 18 },
    unlockedBy: 'C',
  },
  {
    id: 'clerigo',
    name: 'Clériga de Sacrifício',
    icon: '🩸',
    resourceType: 'hp',
    resourceLabel: 'Sangue',
    desc: 'Não usa mana: suas habilidades custam uma porcentagem do seu HP atual.',
    base: { hp: 95, mp: 0, atk: 9, def: 5, crit: 5 },
    unlockedBy: 'B',
  },
  {
    id: 'monarca',
    name: 'Monarca das Sombras',
    icon: '🌑',
    resourceType: 'mp',
    resourceLabel: 'Mana',
    desc: 'Ao matar inimigos, ergue sombras que lutam ao seu lado pelo resto do mergulho.',
    base: { hp: 90, mp: 30, atk: 9, def: 4, crit: 8 },
    unlockedBy: 'A',
  },
  {
    id: 'ladrao',
    name: 'Ladrão das Sombras',
    icon: '🗡️',
    resourceType: 'mp',
    resourceLabel: 'Mana',
    desc: 'O primeiro golpe de cada combate é sempre crítico. Aplica Veneno nos inimigos, que causa dano a cada turno até ser detonado.',
    base: { hp: 75, mp: 35, atk: 12, def: 3, crit: 12 },
    unlockedBy: 'E',
  },
  {
    id: 'feiticeira',
    name: 'Feiticeira da Lua',
    icon: '🌙',
    resourceType: 'mp',
    resourceLabel: 'Mana',
    desc: 'Alterna entre Lua Cheia e Lua Nova a cada 2 turnos. Suas habilidades mudam de efeito conforme a fase atual.',
    base: { hp: 70, mp: 65, atk: 12, def: 3, crit: 8 },
    unlockedBy: 'D',
  },
  {
    id: 'punho',
    name: 'Punho de Ferro',
    icon: '👊',
    resourceType: 'mp',
    resourceLabel: 'Chi',
    desc: 'Ataques básicos consecutivos acumulam combo, aumentando o dano do próximo golpe básico. Usar uma habilidade reinicia o combo.',
    base: { hp: 100, mp: 25, atk: 12, def: 6, crit: 10 },
    unlockedBy: 'C',
  },
  {
    id: 'domador',
    name: 'Domador de Feras',
    icon: '🐾',
    resourceType: 'mp',
    resourceLabel: 'Mana',
    desc: 'Luta ao lado de um bicho de estimação que sobe de nível permanentemente entre mergulhos e ataca junto todo turno.',
    base: { hp: 95, mp: 30, atk: 10, def: 5, crit: 8 },
    unlockedBy: 'B',
  },
  {
    id: 'vidente',
    name: 'Vidente do Vazio',
    icon: '👁️',
    resourceType: 'mp',
    resourceLabel: 'Mana',
    desc: 'Enxerga o próximo ataque do inimigo antes que ele aconteça, permitindo reagir com antecedência.',
    base: { hp: 80, mp: 45, atk: 11, def: 4, crit: 10 },
    unlockedBy: 'A',
  },
];

const SKILLS_BY_CLASS = {
  recruta: [
    { id: 'golpe_forte', name: 'Golpe Forte', icon: '👊', cost: 40, resCost: 12, desc: '1.6x dano de ataque', effect: { type: 'damage', mult: 1.6 } },
    { id: 'postura', name: 'Postura', icon: '🧍', cost: 50, resCost: 10, desc: '+20% de defesa por 3 turnos', effect: { type: 'buff_def', amount: 0.2, turns: 3 } },
  ],
  guerreiro: [
    { id: 'golpe_selvagem', name: 'Golpe Selvagem', icon: '🪓', cost: 60, resCost: 40, desc: 'Custa 40 de Fúria. 2.0x dano de ataque', effect: { type: 'damage', mult: 2.0 } },
    { id: 'investida_brutal', name: 'Investida Brutal', icon: '💢', cost: 100, resCost: 60, desc: 'Custa 60 de Fúria. 2.3x dano e cura 10% do dano causado', effect: { type: 'damage_lifesteal', mult: 2.3, lifesteal: 0.1 } },
    { id: 'grito_sangrento', name: 'Grito Sangrento', icon: '📣', cost: 90, resCost: 50, desc: 'Custa 50 de Fúria. +40% de ataque por 3 turnos', effect: { type: 'buff_atk', amount: 0.4, turns: 3 } },
    { id: 'furia_descontrolada', name: 'Fúria Descontrolada', icon: '😡', cost: 200, resCost: 100, ultimate: true, desc: 'Definitiva: consome toda a Fúria. 4.0x dano e cura 20% do HP máximo', effect: { type: 'damage_heal_missing', mult: 4.0, healPct: 0.2 } },
  ],
  mago: [
    { id: 'bola_fogo', name: 'Bola de Fogo', icon: '🔥', cost: 50, resCost: 14, desc: '1.1x dano e marca o inimigo com Fogo', effect: { type: 'elemental', element: 'fire', mult: 1.1 } },
    { id: 'lanca_gelo', name: 'Lança de Gelo', icon: '❄️', cost: 50, resCost: 14, desc: '1.1x dano e marca o inimigo com Gelo', effect: { type: 'elemental', element: 'ice', mult: 1.1 } },
    { id: 'arco_eletrico', name: 'Arco Elétrico', icon: '⚡', cost: 50, resCost: 14, desc: '1.1x dano e marca o inimigo com Raio', effect: { type: 'elemental', element: 'lightning', mult: 1.1 } },
    { id: 'explosao_elemental', name: 'Explosão Elemental', icon: '☄️', cost: 200, resCost: 35, ultimate: true, desc: 'Definitiva: detona a marca atual do inimigo com bônus máximo', effect: { type: 'elemental_detonate' } },
  ],
  arqueira: [
    { id: 'tiro_duplo', name: 'Tiro Duplo', icon: '🏹', cost: 60, resCost: 16, desc: '2 flechas de 0.8x dano cada', effect: { type: 'multihit', hits: 2, mult: 0.8 } },
    { id: 'tiro_perfurante', name: 'Tiro Perfurante', icon: '➹', cost: 90, resCost: 18, desc: '1.5x dano ignorando a defesa do inimigo', effect: { type: 'damage_ignore_def', mult: 1.5 } },
    { id: 'foco_aprimorado', name: 'Foco Aprimorado', icon: '👁️', cost: 110, resCost: 0, passive: true, desc: 'Passiva: cada ponto de Foco vale +10% de crítico em vez de +8%' },
    { id: 'rajada_final', name: 'Rajada Final', icon: '🌧️', cost: 210, resCost: 30, ultimate: true, desc: 'Definitiva: consome todo o Foco. 1 flecha por ponto (mín. 3), 0.9x dano cada', effect: { type: 'foco_barrage', mult: 0.9, minHits: 3 } },
  ],
  clerigo: [
    { id: 'corte_ritual', name: 'Corte Ritual', icon: '🗡️', cost: 60, hpCostPct: 0.1, desc: 'Custa 10% do seu HP atual. 1.8x dano, cura 60% do dano causado', effect: { type: 'damage_lifesteal', mult: 1.8, lifesteal: 0.6 } },
    { id: 'prece_desesperada', name: 'Prece Desesperada', icon: '🙏', cost: 90, hpCostPct: 0.15, desc: 'Custa 15% do seu HP atual. Cura 50% do seu HP máximo', effect: { type: 'heal', amount: 0.5 } },
    { id: 'pacto_sangue', name: 'Pacto de Sangue', icon: '🩸', cost: 100, hpCostPct: 0.2, desc: 'Custa 20% do seu HP atual. +50% de ataque por 3 turnos', effect: { type: 'buff_atk', amount: 0.5, turns: 3 } },
    { id: 'milagre_final', name: 'Milagre Final', icon: '✨', cost: 210, hpCostPct: 0.3, ultimate: true, desc: 'Custa 30% do seu HP atual. Dano crítico garantido de 3.5x', effect: { type: 'damage_guaranteed_crit', mult: 3.5 } },
  ],
  monarca: [
    { id: 'comando_investida', name: 'Comando de Investida', icon: '📯', cost: 80, resCost: 20, desc: 'Suas sombras desferem um ataque extra em conjunto (0.6x do seu ataque por sombra)', effect: { type: 'command_strike', mult: 0.6 } },
    { id: 'grito_comando', name: 'Grito de Comando', icon: '🗣️', cost: 100, resCost: 15, desc: '+20% de ataque para você por 3 turnos', effect: { type: 'buff_atk', amount: 0.2, turns: 3 } },
    { id: 'vinculo_sombrio', name: 'Vínculo Sombrio', icon: '🔗', cost: 120, resCost: 0, passive: true, desc: 'Passiva: +15% de chance de erguer sombras dos inimigos derrotados' },
    { id: 'ascensao_sombria', name: 'Ascensão Sombria', icon: '🌑', cost: 220, resCost: 30, ultimate: true, desc: 'Definitiva: suas sombras desferem um ataque devastador em conjunto (1.5x do seu ataque por sombra)', effect: { type: 'command_strike', mult: 1.5 } },
  ],
  ladrao: [
    { id: 'facada_envenenada', name: 'Facada Envenenada', icon: '🗡️', cost: 60, resCost: 14, desc: '1.3x dano e aplica 1 carga de Veneno', effect: { type: 'poison_damage', mult: 1.3, stacks: 1 } },
    { id: 'golpe_duplo_toxico', name: 'Golpe Duplo Tóxico', icon: '🐍', cost: 90, resCost: 20, desc: '2 golpes de 0.7x dano cada, aplica 1 carga de Veneno por acerto', effect: { type: 'poison_multihit', hits: 2, mult: 0.7, stacksPerHit: 1 } },
    { id: 'passo_sombrio', name: 'Passo nas Sombras', icon: '👤', cost: 100, resCost: 16, desc: '1.3x dano, sempre crítico', effect: { type: 'damage_guaranteed_crit', mult: 1.3 } },
    { id: 'detonar_veneno', name: 'Detonar Veneno', icon: '☠️', cost: 210, resCost: 30, ultimate: true, desc: 'Definitiva: consome todas as cargas de Veneno do inimigo para um dano devastador (0.8x do seu ataque por carga)', effect: { type: 'poison_detonate', mult: 0.8 } },
  ],
  feiticeira: [
    { id: 'raio_lunar', name: 'Raio Lunar', icon: '🌕', cost: 60, resCost: 16, desc: 'Lua Cheia: 1.8x dano | Lua Nova: 1.1x dano e cura 20% do dano causado', effect: { type: 'moon_damage', fullMult: 1.8, newMult: 1.1, newLifesteal: 0.2 } },
    { id: 'veu_das_sombras', name: 'Véu das Sombras', icon: '🌑', cost: 100, resCost: 18, desc: 'Lua Cheia: +25% de ataque por 2 turnos | Lua Nova: +25% de defesa e regenera 6% HP por 2 turnos', effect: { type: 'moon_buff' } },
    { id: 'toque_lunar', name: 'Toque Lunar', icon: '🌗', cost: 110, resCost: 20, desc: 'Lua Cheia: 1.4x dano, sempre crítico | Lua Nova: cura 30% do HP máximo', effect: { type: 'moon_utility' } },
    { id: 'eclipse', name: 'Eclipse', icon: '🌘', cost: 220, resCost: 40, ultimate: true, desc: 'Definitiva: ativa os dois efeitos das fases ao mesmo tempo — dano alto e cura grande', effect: { type: 'moon_eclipse' } },
  ],
  punho: [
    { id: 'golpe_dragao', name: 'Golpe do Dragão', icon: '🐉', cost: 60, resCost: 20, desc: 'Custa 20 de Chi (reinicia o combo). 2.2x dano', effect: { type: 'damage', mult: 2.2 } },
    { id: 'postura_ferro', name: 'Postura de Ferro', icon: '🗿', cost: 90, resCost: 15, desc: 'Custa 15 de Chi (reinicia o combo). +40% de defesa por 3 turnos', effect: { type: 'buff_def', amount: 0.4, turns: 3 } },
    { id: 'explosao_chi', name: 'Explosão de Chi', icon: '💫', cost: 110, resCost: 25, desc: 'Custa 25 de Chi. 1.5x dano, consome o combo atual para dano bônus (+0.5x por golpe acumulado)', effect: { type: 'combo_finisher', mult: 1.5, bonusPerStack: 0.5 } },
    { id: 'furia_punho', name: 'Fúria do Punho', icon: '👊', cost: 210, resCost: 45, ultimate: true, desc: 'Definitiva: 5 golpes de 0.6x dano, sempre críticos', effect: { type: 'foco_barrage', mult: 0.6, minHits: 5 } },
  ],
  domador: [
    { id: 'comando_ataque', name: 'Comando de Ataque', icon: '🐾', cost: 60, resCost: 18, desc: 'Sua fera desfere um golpe extra (1.5x do ataque dela)', effect: { type: 'pet_strike', mult: 1.5 } },
    { id: 'vinculo_selvagem', name: 'Vínculo Selvagem', icon: '💚', cost: 90, resCost: 20, desc: 'Cura 25% do seu HP máximo', effect: { type: 'heal', amount: 0.25 } },
    { id: 'furia_fera', name: 'Fúria da Fera', icon: '🔥', cost: 100, resCost: 22, desc: '+30% de ataque para você e sua fera por 3 turnos', effect: { type: 'buff_atk', amount: 0.3, turns: 3 } },
    { id: 'investida_selvagem', name: 'Investida Selvagem', icon: '🦁', cost: 220, resCost: 40, ultimate: true, desc: 'Definitiva: sua fera desfere uma investida devastadora (3x o ataque dela)', effect: { type: 'pet_strike', mult: 3 } },
  ],
  vidente: [
    { id: 'golpe_precognitivo', name: 'Golpe Precognitivo', icon: '🔮', cost: 60, resCost: 16, desc: '1.7x dano', effect: { type: 'damage', mult: 1.7 } },
    { id: 'barreira_temporal', name: 'Barreira Temporal', icon: '🛡️', cost: 100, resCost: 20, desc: 'Se a premonição indicar um ataque especial, bloqueia ele completamente. Senão, +20% de defesa por 2 turnos', effect: { type: 'conditional_shield', amount: 0.2, turns: 2 } },
    { id: 'fenda_dimensional', name: 'Fenda Dimensional', icon: '🌀', cost: 110, resCost: 18, desc: '1.6x dano ignorando a defesa do inimigo', effect: { type: 'damage_ignore_def', mult: 1.6 } },
    { id: 'colapso_temporal', name: 'Colapso Temporal', icon: '⏳', cost: 220, resCost: 40, ultimate: true, desc: 'Definitiva: cura 25% do seu HP e causa 2.0x de dano ao mesmo tempo', effect: { type: 'damage_and_heal', mult: 2.0, healPct: 0.25 } },
  ],
};

const REACTIONS = {
  fire_ice: { name: 'Vaporizar', mult: 2.5 },
  ice_lightning: { name: 'Supercondução', mult: 2.0, stun: true },
  fire_lightning: { name: 'Sobrecarga', mult: 3.0 },
};

const ELEMENT_LABELS = { fire: '🔥 Fogo', ice: '❄️ Gelo', lightning: '⚡ Raio' };

const PORTAL_TIERS = [
  { id: 'E', name: 'Portal Rank E', floors: 6, baseHp: 22, baseAtk: 5, baseDef: 1, goldBase: 8 },
  { id: 'D', name: 'Portal Rank D', floors: 8, baseHp: 40, baseAtk: 8, baseDef: 2, goldBase: 14 },
  { id: 'C', name: 'Portal Rank C', floors: 10, baseHp: 70, baseAtk: 12, baseDef: 4, goldBase: 22 },
  { id: 'B', name: 'Portal Rank B', floors: 12, baseHp: 110, baseAtk: 17, baseDef: 6, goldBase: 34 },
  { id: 'A', name: 'Portal Rank A', floors: 14, baseHp: 170, baseAtk: 24, baseDef: 9, goldBase: 52 },
  { id: 'S', name: 'Portal Rank S', floors: 16, baseHp: 260, baseAtk: 34, baseDef: 13, goldBase: 80 },
];

const MONSTER_POOLS = {
  E: [
    { name: 'Lobo do Portal', icon: '🐺' },
    { name: 'Slime Corrosivo', icon: '🟢' },
    { name: 'Goblin Batedor', icon: '👺', special: { name: 'Golpe Traiçoeiro', mult: 1.6, chance: 0.25 } },
  ],
  D: [
    { name: 'Orc Guerreiro', icon: '🗡️', special: { name: 'Machadada', mult: 1.7, chance: 0.25 } },
    { name: 'Aranha Venenosa', icon: '🕷️', special: { name: 'Picada Venenosa', mult: 1.5, chance: 0.3 } },
    { name: 'Esqueleto Errante', icon: '💀' },
  ],
  C: [
    { name: 'Ghoul Faminto', icon: '🧟', special: { name: 'Mordida Voraz', mult: 1.6, chance: 0.3 } },
    { name: 'Escorpião Gigante', icon: '🦂', special: { name: 'Ferroada', mult: 1.7, chance: 0.25 } },
    { name: 'Wyrmling', icon: '🐉' },
  ],
  B: [
    { name: 'Ogro Feiticeiro', icon: '👹', special: { name: 'Explosão Rúnica', mult: 1.8, chance: 0.3 } },
    { name: 'Morcego Vampírico Alfa', icon: '🦇', special: { name: 'Sugar Sangue', mult: 1.5, chance: 0.3 } },
    { name: 'Cavaleiro Caído', icon: '⚔️' },
  ],
  A: [
    { name: 'Naga Ancestral', icon: '🐍', special: { name: 'Fúria Ancestral', mult: 1.8, chance: 0.3 } },
    { name: 'Elemental de Fogo', icon: '🔥', special: { name: 'Erupção', mult: 1.9, chance: 0.28 } },
    { name: 'Vampiro Noturno', icon: '🧛', special: { name: 'Garras Sombrias', mult: 1.6, chance: 0.3 } },
  ],
  S: [
    { name: 'Guardião Real', icon: '🗿', special: { name: 'Julgamento', mult: 1.9, chance: 0.3 } },
    { name: 'Avatar das Sombras', icon: '🌑', special: { name: 'Colapso', mult: 2.0, chance: 0.28 } },
    { name: 'Arauto do Abismo', icon: '☠️', special: { name: 'Grito Abissal', mult: 1.8, chance: 0.32 } },
  ],
};

const BOSSES = {
  E: { name: 'Rei dos Lobos', icon: '🐺', crown: '👑', special: { name: 'Uivo Feroz', mult: 2.0, chance: 0.35 } },
  D: { name: 'Comandante Orc', icon: '🗡️', crown: '👑', special: { name: 'Golpe Fendedor', mult: 2.1, chance: 0.35 } },
  C: { name: 'Rainha Ghoul', icon: '🧟', crown: '👑', special: { name: 'Peste Nauseante', mult: 2.0, chance: 0.35 } },
  B: { name: 'Cavaleiro Negro', icon: '⚔️', crown: '🖤', special: { name: 'Corte das Sombras', mult: 2.2, chance: 0.35 } },
  A: { name: 'Naga Imperial', icon: '🐍', crown: '👑', special: { name: 'Fúria Imperial', mult: 2.2, chance: 0.35 } },
  S: { name: 'Monarca Primordial', icon: '🌌', crown: '👑', special: { name: 'Colapso Dimensional', mult: 2.5, chance: 0.4 } },
};

const BLESSINGS = [
  { id: 'lobo', tier: 'E', name: 'Bênção do Rei dos Lobos', icon: '🐺', bonus: { atkPct: 0.05 }, desc: '+5% Ataque' },
  { id: 'orc', tier: 'D', name: 'Bênção do Comandante Orc', icon: '🗡️', bonus: { defFlat: 3 }, desc: '+3 Defesa' },
  { id: 'ghoul', tier: 'C', name: 'Bênção da Rainha Ghoul', icon: '🧟', bonus: { hpPct: 0.08 }, desc: '+8% HP Máximo' },
  { id: 'knight', tier: 'B', name: 'Bênção do Cavaleiro Negro', icon: '⚔️', bonus: { critPct: 5 }, desc: '+5% Crítico' },
  { id: 'naga', tier: 'A', name: 'Bênção da Naga Imperial', icon: '🐍', bonus: { mpPct: 0.15 }, desc: '+15% Mana Máxima' },
  { id: 'monarch', tier: 'S', name: 'Bênção do Monarca Primordial', icon: '🌌', bonus: { goldPct: 0.2 }, desc: '+20% Ouro Ganho' },
];

const UPGRADES = [
  { id: 'atk', name: '⚔️ Força', desc: '+2 Ataque', baseCost: 20, costGrowth: 1.35, maxLevel: 25, perLevel: 2 },
  { id: 'def', name: '🛡️ Resistência', desc: '+1 Defesa', baseCost: 20, costGrowth: 1.35, maxLevel: 25, perLevel: 1 },
  { id: 'hp', name: '❤️ Vitalidade', desc: '+10 HP Máximo', baseCost: 18, costGrowth: 1.3, maxLevel: 25, perLevel: 10 },
  { id: 'mp', name: '🔷 Mana', desc: '+8 Mana/Fúria Máxima', baseCost: 18, costGrowth: 1.3, maxLevel: 25, perLevel: 8 },
  { id: 'crit', name: '🎯 Precisão', desc: '+1% Crítico', baseCost: 35, costGrowth: 1.5, maxLevel: 20, perLevel: 1 },
  { id: 'gold', name: '💰 Sorte', desc: '+4% Ouro ganho', baseCost: 30, costGrowth: 1.45, maxLevel: 15, perLevel: 4 },
  { id: 'dodge', name: '🌀 Evasão', desc: '+1% de chance de desviar completamente de um ataque', baseCost: 40, costGrowth: 1.55, maxLevel: 15, perLevel: 1 },
  { id: 'critdmg', name: '💥 Fúria Crítica', desc: '+2% de dano em golpes críticos', baseCost: 35, costGrowth: 1.5, maxLevel: 15, perLevel: 2 },
  { id: 'potionpower', name: '🧪 Alquimia', desc: '+3% de efeito de poções e elixires', baseCost: 30, costGrowth: 1.4, maxLevel: 12, perLevel: 3 },
  { id: 'teampower', name: '📯 Treinamento de Equipes', desc: '+4% de poder para equipes despachadas', baseCost: 45, costGrowth: 1.45, maxLevel: 12, perLevel: 4 },
  { id: 'nursing', name: '⛑️ Enfermaria', desc: '-2s no tempo de recuperação de equipes derrotadas', baseCost: 50, costGrowth: 1.6, maxLevel: 6, perLevel: 2 },
];

const POTIONS = [
  { id: 'hp', name: '🧪 Poção de Vida', desc: 'Cura 40% do HP máximo em combate', cost: 15 },
  { id: 'mp', name: '🔵 Poção de Energia', desc: 'Restaura 50% da Mana/Fúria máxima em combate', cost: 12 },
  { id: 'elixir', name: '⚡ Elixir Maior', desc: 'Restaura 100% da Mana/Fúria máxima em combate', cost: 40 },
  { id: 'luck', name: '🍀 Poção da Sorte', desc: '+50% de ouro ganho pelo resto do mergulho', cost: 35 },
  { id: 'precision', name: '🎯 Tônico de Precisão', desc: '+30% de crítico por 3 turnos', cost: 30 },
  { id: 'revive', name: '🕊️ Fragmento Revivificante', desc: 'Se você morreria neste mergulho, sobrevive uma vez com 30% de HP (consumido automaticamente)', cost: 90 },
];

const WEAPON_TIERS = [
  { id: 'w1', name: 'Espada Enferrujada', icon: '🗡️', cost: 50, atk: 5 },
  { id: 'w2', name: 'Espada de Aço', icon: '⚔️', cost: 150, atk: 14 },
  { id: 'w3', name: 'Lâmina Élfica', icon: '🔱', cost: 400, atk: 28 },
  { id: 'w4', name: 'Lâmina do Caçador', icon: '🔪', cost: 900, atk: 48 },
  { id: 'w5', name: 'Espada Lendária', icon: '🌟', cost: 2000, atk: 80 },
];

const ARMOR_TIERS = [
  { id: 'a1', name: 'Couro Batido', icon: '🥾', cost: 50, def: 3, hp: 15 },
  { id: 'a2', name: 'Cota de Malha', icon: '🧥', cost: 150, def: 8, hp: 35 },
  { id: 'a3', name: 'Placas de Ferro', icon: '🛡️', cost: 400, def: 16, hp: 70 },
  { id: 'a4', name: 'Armadura Élfica', icon: '✨', cost: 900, def: 28, hp: 120 },
  { id: 'a5', name: 'Armadura Lendária', icon: '👑', cost: 2000, def: 45, hp: 200 },
];

const ACCESSORY_TIERS = [
  { id: 'c1', name: 'Anel de Cobre', icon: '💍', cost: 50, crit: 2, goldPct: 0.02 },
  { id: 'c2', name: 'Amuleto de Prata', icon: '📿', cost: 150, crit: 4, goldPct: 0.05 },
  { id: 'c3', name: 'Bracelete Élfico', icon: '🔮', cost: 400, crit: 7, goldPct: 0.08 },
  { id: 'c4', name: 'Coroa Menor', icon: '👑', cost: 900, crit: 11, goldPct: 0.12 },
  { id: 'c5', name: 'Relíquia Lendária', icon: '💎', cost: 2000, crit: 16, goldPct: 0.18 },
];

const EQUIP_SLOTS = [
  { key: 'weapon', label: '⚔️ Armas', tiers: WEAPON_TIERS },
  { key: 'armor', label: '🛡️ Armaduras', tiers: ARMOR_TIERS },
  { key: 'accessory', label: '💍 Acessórios', tiers: ACCESSORY_TIERS },
];

const TEAM_NAMES = ['Alfa', 'Bravo', 'Corvo', 'Ferro', 'Névoa', 'Aurora', 'Tempestade', 'Cinza'];
const TEAM_ICONS = ['🛡️', '🗡️', '🏹', '🔥', '⚡', '🌙'];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function createFreshState() {
  return {
    unlockedClasses: ['recruta'],
    activeClassId: 'recruta',
    rank: 'E',
    unlockedTiers: ['E'],
    gold: 0,
    upgrades: {},
    equipment: { weapon: 0, armor: 0, accessory: 0 },
    skillsByClass: { recruta: [] },
    blessings: [],
    potions: { hp: 0, mp: 0 },
    bestFloor: {},
    bossesDefeated: [],
    teams: [
      { id: uid(), name: 'Equipe Alfa', icon: '🛡️', classId: 'recruta', recovering: false, recoverAt: 0 },
      { id: uid(), name: 'Equipe Bravo', icon: '🗡️', classId: 'recruta', recovering: false, recoverAt: 0 },
    ],
    portals: [],
    recruitCount: 0,
    pet: { level: 1, xp: 0 },
    lastSeen: Date.now(),
  };
}

let state = createFreshState();
let dive = null;
let currentScreen = 'class';
let tickTimer = null;

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) state = Object.assign(state, JSON.parse(raw));
  } catch (e) {
    console.warn('Falha ao carregar save', e);
  }
}

function saveState() {
  state.lastSeen = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function getClassDef(id) {
  return CLASSES.find((c) => c.id === id);
}

function getActiveClass() {
  return getClassDef(state.activeClassId);
}

function hasSkill(id) {
  return (state.skillsByClass[state.activeClassId] || []).includes(id);
}

function getUpgradeLevel(id) {
  return state.upgrades[id] || 0;
}

function getUpgradeCost(upgrade) {
  return Math.ceil(upgrade.baseCost * Math.pow(upgrade.costGrowth, getUpgradeLevel(upgrade.id)));
}

function getBlessingBonus(key) {
  return state.blessings.reduce((sum, id) => {
    const b = BLESSINGS.find((x) => x.id === id);
    return sum + (b && b.bonus[key] ? b.bonus[key] : 0);
  }, 0);
}

function getEquipTier(slotKey) {
  const slot = EQUIP_SLOTS.find((s) => s.key === slotKey);
  const tierIdx = state.equipment[slotKey] || 0;
  return tierIdx > 0 ? slot.tiers[tierIdx - 1] : null;
}

function getEquipBonus(slotKey, statKey) {
  const item = getEquipTier(slotKey);
  return item && item[statKey] ? item[statKey] : 0;
}

function getMaxHp() {
  const cls = getActiveClass();
  return Math.round((cls.base.hp + getUpgradeLevel('hp') * 10 + getEquipBonus('armor', 'hp')) * (1 + getBlessingBonus('hpPct')));
}

function getMaxResource() {
  const cls = getActiveClass();
  if (cls.resourceType === 'fury') return 100;
  if (cls.resourceType === 'hp') return 0;
  return Math.round((cls.base.mp + getUpgradeLevel('mp') * 8) * (1 + getBlessingBonus('mpPct')));
}

function getBaseAtk() {
  const cls = getActiveClass();
  return cls.base.atk + getUpgradeLevel('atk') * 2 + getEquipBonus('weapon', 'atk');
}

function getBaseDef() {
  const cls = getActiveClass();
  return cls.base.def + getUpgradeLevel('def') * 1 + getEquipBonus('armor', 'def') + getBlessingBonus('defFlat');
}

function getBaseCrit() {
  const cls = getActiveClass();
  return cls.base.crit + getUpgradeLevel('crit') * 1 + getEquipBonus('accessory', 'crit') + getBlessingBonus('critPct');
}

function getGoldMult() {
  return 1 + getUpgradeLevel('gold') * 0.04 + getEquipBonus('accessory', 'goldPct') + getBlessingBonus('goldPct');
}

function getCritMultiplier() {
  return 1.5 + getUpgradeLevel('critdmg') * 0.02;
}

function getDodgeChance() {
  return getUpgradeLevel('dodge') * 1;
}

function getPotionPowerMult() {
  return 1 + getUpgradeLevel('potionpower') * 0.03;
}

function getDiveGoldMult() {
  return getGoldMult() * (1 + (dive && dive.luckBonus ? dive.luckBonus : 0));
}

function getKnownSkills() {
  const pool = SKILLS_BY_CLASS[state.activeClassId] || [];
  return pool.filter((s) => hasSkill(s.id) && !s.passive);
}

function tierIndex(tierId) {
  return RANK_ORDER.indexOf(tierId);
}

function getTier(tierId) {
  return PORTAL_TIERS.find((t) => t.id === tierId);
}

function showScreen(name) {
  currentScreen = name;
  ['hub', 'dive', 'shop', 'blessings', 'classes', 'summary'].forEach((s) => {
    document.getElementById(`screen-${s}`).hidden = s !== name;
  });
}

// ---------- Hub ----------

function renderHub() {
  const cls = getActiveClass();
  document.getElementById('hub-class-icon').textContent = cls.icon;
  document.getElementById('hub-class-name').textContent = cls.name;
  document.getElementById('hub-rank').textContent = state.rank;
  document.getElementById('hub-gold').textContent = state.gold;
  document.getElementById('hub-blessings-count').textContent = state.blessings.length;
  ensurePortalBoard();
  renderPortalBoard();
  renderTeamRoster();
}

// ---------- Portal board ----------

function pickRandomTierForPortal() {
  const options = state.unlockedTiers;
  return options[Math.floor(Math.random() * options.length)];
}

function spawnPortal() {
  const tierId = pickRandomTierForPortal();
  state.portals.push({
    id: uid(),
    tierId,
    status: 'open',
    assignedTeamId: null,
    revealQueue: [],
    revealedLog: [],
    spawnedAt: Date.now(),
    doneAt: null,
  });
}

function ensurePortalBoard() {
  let changed = false;
  state.portals = state.portals.filter((p) => {
    if (p.status === 'done' && p.doneAt && Date.now() - p.doneAt > REVEAL_GRACE_MS) {
      changed = true;
      return false;
    }
    return true;
  });
  while (state.portals.length < PORTAL_SLOTS) {
    spawnPortal();
    changed = true;
  }
  if (changed) saveState();
}

function renderPortalBoard() {
  const root = document.getElementById('portal-board');
  if (!root) return;
  root.innerHTML = '';
  state.portals.forEach((portal) => {
    const tier = getTier(portal.tierId);
    const card = document.createElement('div');
    card.className = 'portal-card';
    let statusHtml = '';
    if (portal.status === 'open') {
      statusHtml = '<span class="portal-status open">🌀 Aberto</span>';
    } else if (portal.status === 'dispatched') {
      statusHtml = `<span class="portal-status busy">⏳ Equipe dentro</span>`;
    } else if (portal.status === 'personal') {
      statusHtml = `<span class="portal-status busy">🧍 Você está dentro</span>`;
    } else if (portal.status === 'done') {
      statusHtml = `<span class="portal-status ${portal.result && portal.result.success ? 'success' : 'fail'}">${portal.result && portal.result.success ? '✅ Concluído' : '💀 Fracassou'}</span>`;
    }
    card.innerHTML = `
      <div class="portal-card-top">
        <div class="portal-name">${tier.name}</div>
        ${statusHtml}
      </div>
      <div class="portal-log" id="portal-log-${portal.id}"></div>
    `;
    renderPortalLog(portal);

    if (portal.status === 'open') {
      const actions = document.createElement('div');
      actions.className = 'portal-actions';

      const enterBtn = document.createElement('button');
      enterBtn.className = 'combat-btn';
      enterBtn.textContent = '🧍 Entrar Pessoalmente';
      enterBtn.addEventListener('click', () => enterPortalPersonally(portal.id));
      actions.appendChild(enterBtn);

      const availableTeams = state.teams.filter((t) => !t.recovering && !t.dispatchedPortalId);
      const dispatchSelect = document.createElement('select');
      dispatchSelect.className = 'team-select';
      dispatchSelect.innerHTML = '<option value="">Despachar equipe...</option>' + availableTeams.map((t) => `<option value="${t.id}">${t.icon} ${t.name}</option>`).join('');
      dispatchSelect.disabled = availableTeams.length === 0;
      dispatchSelect.addEventListener('change', () => {
        if (dispatchSelect.value) dispatchTeam(dispatchSelect.value, portal.id);
      });
      actions.appendChild(dispatchSelect);

      card.appendChild(actions);
    }

    root.appendChild(card);
  });
}

function renderPortalLog(portal) {
  const el = document.getElementById(`portal-log-${portal.id}`);
  if (!el) return;
  el.innerHTML = portal.revealedLog.slice(-3).map((l) => `<p>${l}</p>`).join('');
}

// ---------- Teams ----------

function getTeamPower(team) {
  const cls = getClassDef(team.classId);
  const base = cls.base.atk * 3 + cls.base.def * 2 + cls.base.hp * 0.3 + getUpgradeLevel('atk') * 3;
  return Math.round(base * (1 + getUpgradeLevel('teampower') * 0.04));
}

function renderTeamRoster() {
  const root = document.getElementById('team-roster');
  root.innerHTML = '';
  state.teams.forEach((team) => {
    const row = document.createElement('div');
    row.className = 'team-row';
    let status = 'Disponível';
    if (team.dispatchedPortalId) status = 'Em missão';
    else if (team.recovering) status = `Recuperando (${Math.max(0, Math.ceil((team.recoverAt - Date.now()) / 1000))}s)`;
    row.innerHTML = `
      <span class="team-icon">${team.icon}</span>
      <div class="team-info"><strong>${team.name}</strong><small>${getClassDef(team.classId).name} • ${status}</small></div>
    `;
    root.appendChild(row);
  });

  const cost = getRecruitCost();
  document.getElementById('recruit-cost').textContent = cost;
  const recruitBtn = document.getElementById('recruit-team-btn');
  recruitBtn.disabled = state.gold < cost;
}

function getRecruitCost() {
  return Math.round(60 * Math.pow(1.6, state.recruitCount));
}

function recruitTeam() {
  const cost = getRecruitCost();
  if (state.gold < cost) return;
  state.gold -= cost;
  state.recruitCount += 1;
  const name = `Equipe ${TEAM_NAMES[state.teams.length % TEAM_NAMES.length]}`;
  const icon = TEAM_ICONS[state.teams.length % TEAM_ICONS.length];
  const classId = state.unlockedClasses[Math.floor(Math.random() * state.unlockedClasses.length)];
  state.teams.push({ id: uid(), name, icon, classId, recovering: false, recoverAt: 0 });
  saveState();
  renderHub();
}

// ---------- Dispatch simulation ----------

function simulateTeamRun(team, tier) {
  const teamPower = getTeamPower(team);
  const lines = [`${team.icon} ${team.name} entra no ${tier.name}.`];
  let floor = 1;
  let success = false;
  let gold = 0;
  while (floor <= tier.floors) {
    const scale = 1 + 0.16 * (floor - 1);
    const floorPower = (tier.baseAtk * 4 + tier.baseHp * 0.5) * scale * (floor === tier.floors ? 1.8 : 1);
    const winChance = clamp(0.55 + (teamPower - floorPower) / (floorPower * 1.5), 0.08, 0.92);
    if (Math.random() < winChance) {
      const floorGold = Math.round(tier.goldBase * scale * (floor === tier.floors ? 4 : 1));
      gold += floorGold;
      if (floor === tier.floors) {
        lines.push(`${team.icon} ${team.name} derrota o chefe do ${tier.name}! +${floorGold} de ouro.`);
        success = true;
      } else {
        lines.push(`${team.icon} ${team.name} avança para o andar ${floor + 1}. +${floorGold} de ouro.`);
      }
      floor++;
    } else {
      lines.push(`${team.icon} ${team.name} foi derrotada no andar ${floor} e recuou.`);
      break;
    }
  }
  return { success, floorReached: Math.min(floor, tier.floors), gold, lines, bossCleared: success };
}

function dispatchTeam(teamId, portalId) {
  const team = state.teams.find((t) => t.id === teamId);
  const portal = state.portals.find((p) => p.id === portalId);
  if (!team || !portal || portal.status !== 'open') return;
  const tier = getTier(portal.tierId);
  const result = simulateTeamRun(team, tier);
  portal.status = 'dispatched';
  portal.assignedTeamId = teamId;
  portal.result = result;
  portal.revealQueue = [...result.lines];
  portal.revealedLog = [];
  team.dispatchedPortalId = portalId;
  saveState();
  renderHub();
}

function finalizePortal(portal) {
  const result = portal.result;
  const team = state.teams.find((t) => t.id === portal.assignedTeamId);
  if (result.success) {
    state.gold += result.gold;
    handleBossClearRewards(portal.tierId, `equipe ${team ? team.name : ''}`);
  }
  if (team) {
    team.dispatchedPortalId = null;
    if (!result.success) {
      const recoveryMs = Math.max(5000, 20000 - getUpgradeLevel('nursing') * 2000);
      team.recovering = true;
      team.recoverAt = Date.now() + recoveryMs;
    }
  }
  portal.status = 'done';
  portal.doneAt = Date.now();
  saveState();
}

function handleBossClearRewards(tierId, sourceLabel) {
  const idx = tierIndex(tierId);
  if (state.bossesDefeated.includes(tierId)) return;
  state.bossesDefeated.push(tierId);
  const blessing = BLESSINGS.find((b) => b.tier === tierId);
  if (blessing && !state.blessings.includes(blessing.id)) {
    state.blessings.push(blessing.id);
  }
  const nextTier = RANK_ORDER[idx + 1];
  if (nextTier && !state.unlockedTiers.includes(nextTier)) {
    state.unlockedTiers.push(nextTier);
    state.rank = nextTier;
  }
  const unlockClasses = CLASS_UNLOCK_MAP[tierId] || [];
  unlockClasses.forEach((classId) => {
    if (!state.unlockedClasses.includes(classId)) {
      state.unlockedClasses.push(classId);
      state.skillsByClass[classId] = state.skillsByClass[classId] || [];
    }
  });
}

// ---------- Global tick ----------

function globalTick() {
  let uiDirty = false;
  state.teams.forEach((team) => {
    if (team.recovering && Date.now() >= team.recoverAt) {
      team.recovering = false;
      uiDirty = true;
    }
  });
  state.portals.forEach((portal) => {
    if (portal.status === 'dispatched' && portal.revealQueue.length > 0) {
      const line = portal.revealQueue.shift();
      portal.revealedLog.push(line);
      uiDirty = true;
      if (portal.revealQueue.length === 0) {
        finalizePortal(portal);
      }
    }
  });
  const before = state.portals.length;
  ensurePortalBoard();
  if (uiDirty || state.portals.length !== before) {
    saveState();
    if (currentScreen === 'hub') renderHub();
  }
}

// ---------- Dive (personal) ----------

function enterPortalPersonally(portalId) {
  const portal = state.portals.find((p) => p.id === portalId);
  if (!portal || portal.status !== 'open') return;
  portal.status = 'personal';
  saveState();
  startDive(portal);
}

function startDive(portal) {
  const tier = getTier(portal.tierId);
  const cls = getActiveClass();
  dive = {
    portal,
    tier,
    floorIndex: 1,
    runGold: 0,
    inCombat: false,
    shadowArmy: [],
    luckBonus: 0,
    player: {
      hp: getMaxHp(),
      maxHp: getMaxHp(),
      resource: getMaxResource(),
      maxResource: getMaxResource(),
      buff: null,
      shield: false,
      fury: 0,
      foco: 0,
      charging: false,
    },
    enemy: null,
    log: [],
  };
  document.getElementById('resource-label').textContent = cls.resourceLabel;
  document.getElementById('resource-row').hidden = cls.resourceType === 'hp';
  document.getElementById('shadow-army-row').hidden = cls.id !== 'monarca';
  showScreen('dive');
  goToFloor();
}

function goToFloor() {
  const tier = dive.tier;
  document.getElementById('dive-tier-name').textContent = tier.name;
  const floorLabel = dive.floorIndex <= tier.floors ? `Andar ${dive.floorIndex} / ${tier.floors}` : `Andar Sombrio +${dive.floorIndex - tier.floors}`;
  document.getElementById('dive-floor-label').textContent = floorLabel;
  const ratio = Math.min(1, dive.floorIndex / tier.floors);
  document.getElementById('dive-floor-fill').style.width = `${ratio * 100}%`;
  document.getElementById('dive-run-gold').textContent = dive.runGold;
  renderPlayerBars();
  renderShadowArmyStrip();

  const event = dive.floorIndex === tier.floors ? 'boss' : rollFloorEvent();
  document.getElementById('event-area').hidden = false;
  document.getElementById('combat-area').hidden = true;
  document.getElementById('floor-choice').hidden = true;

  if (event === 'monster' || event === 'elite' || event === 'boss') {
    startCombat(event);
  } else if (event === 'treasure') {
    resolveTreasure();
  } else if (event === 'trap') {
    resolveTrap();
  } else {
    resolveRest();
  }
}

function rollFloorEvent() {
  const r = Math.random();
  if (r < 0.55) return 'monster';
  if (r < 0.7) return 'elite';
  if (r < 0.85) return 'treasure';
  if (r < 0.95) return 'trap';
  return 'rest';
}

function renderPlayerBars() {
  const p = dive.player;
  const cls = getActiveClass();
  document.getElementById('player-hp-fill').style.width = `${Math.max(0, (p.hp / p.maxHp) * 100)}%`;
  document.getElementById('player-hp-text').textContent = `${Math.max(0, Math.round(p.hp))} / ${p.maxHp}`;
  if (cls.resourceType !== 'hp') {
    const current = cls.resourceType === 'fury' ? p.fury : p.resource;
    const max = p.maxResource;
    document.getElementById('player-mp-fill').style.width = `${Math.max(0, (current / max) * 100)}%`;
    document.getElementById('player-mp-text').textContent = `${Math.max(0, Math.round(current))} / ${max}`;
    document.getElementById('player-mp-fill').classList.toggle('fury-fill', cls.resourceType === 'fury');
  }
}

function renderShadowArmyStrip() {
  if (state.activeClassId !== 'monarca') return;
  const root = document.getElementById('shadow-army-strip');
  root.innerHTML = dive.shadowArmy.length
    ? dive.shadowArmy.map((s) => `<span class="army-chip" title="${s.name}">${s.icon}</span>`).join('')
    : '<span class="army-empty">Nenhuma sombra erguida ainda</span>';
}

function setEventText(text) {
  document.getElementById('event-text').textContent = text;
}

function resolveTreasure() {
  const gold = Math.round(dive.tier.goldBase * (1.5 + Math.random()) * getDiveGoldMult());
  dive.runGold += gold;
  setEventText(`💰 Você encontrou um tesouro! +${gold} de ouro.`);
  document.getElementById('dive-run-gold').textContent = dive.runGold;
  showFloorChoice();
}

function resolveTrap() {
  const dmg = Math.round(dive.player.maxHp * (0.15 + Math.random() * 0.1));
  dive.player.hp = Math.max(1, dive.player.hp - dmg);
  setEventText(`⚠️ Você caiu numa armadilha! -${dmg} HP.`);
  renderPlayerBars();
  showFloorChoice();
}

function resolveRest() {
  const cls = getActiveClass();
  const healHp = Math.round((dive.player.maxHp - dive.player.hp) * 0.5);
  dive.player.hp = Math.min(dive.player.maxHp, dive.player.hp + healHp);
  let msg = `🏕️ Uma clareira segura. Você descansa e recupera ${healHp} HP`;
  if (cls.resourceType !== 'hp') {
    const cur = cls.resourceType === 'fury' ? dive.player.fury : dive.player.resource;
    const healRes = Math.round((dive.player.maxResource - cur) * 0.5);
    if (cls.resourceType === 'fury') dive.player.fury = Math.min(dive.player.maxResource, dive.player.fury + healRes);
    else dive.player.resource = Math.min(dive.player.maxResource, dive.player.resource + healRes);
    msg += ` e ${healRes} de ${cls.resourceLabel}`;
  }
  msg += '.';
  setEventText(msg);
  renderPlayerBars();
  showFloorChoice();
}

function showFloorChoice() {
  document.getElementById('floor-choice').hidden = false;
  const extractBtn = document.getElementById('extract-btn');
  extractBtn.textContent = dive.runGold > 0 ? `Extrair (guardar ${dive.runGold} de ouro)` : 'Extrair';
}

// ---------- Combat ----------

function generateEnemy(kind) {
  const tier = dive.tier;
  const scale = 1 + 0.16 * (dive.floorIndex - 1);
  if (kind === 'boss') {
    const boss = BOSSES[tier.id];
    return {
      name: boss.name,
      icon: boss.icon,
      crown: boss.crown,
      isBoss: true,
      hp: Math.round(tier.baseHp * scale * 3.2),
      maxHp: Math.round(tier.baseHp * scale * 3.2),
      atk: Math.round(tier.baseAtk * scale * 1.8),
      def: tier.baseDef + Math.floor(dive.floorIndex / 3) + 4,
      special: boss.special,
      mark: null,
      markTurnsLeft: 0,
      poisonStacks: 0,
      predictedSpecial: false,
    };
  }
  const pool = MONSTER_POOLS[tier.id];
  const base = pool[Math.floor(Math.random() * pool.length)];
  const isElite = kind === 'elite';
  return {
    name: base.name,
    icon: base.icon,
    isElite,
    hp: Math.round(tier.baseHp * scale * (isElite ? 1.6 : 1)),
    maxHp: Math.round(tier.baseHp * scale * (isElite ? 1.6 : 1)),
    atk: Math.round(tier.baseAtk * scale * (isElite ? 1.3 : 1)),
    def: tier.baseDef + Math.floor(dive.floorIndex / 3) + (isElite ? 2 : 0),
    special: base.special,
    mark: null,
    markTurnsLeft: 0,
    poisonStacks: 0,
    predictedSpecial: false,
  };
}

function getPetAtk() {
  return 8 + (state.pet ? state.pet.level : 1) * 3;
}

function getPetMaxHp() {
  return 40 + (state.pet ? state.pet.level : 1) * 10;
}

function predictEnemySpecial() {
  if (!dive.enemy) return;
  dive.enemy.predictedSpecial = Boolean(dive.enemy.special) && Math.random() < dive.enemy.special.chance;
}

function startCombat(kind) {
  dive.enemy = generateEnemy(kind);
  dive.inCombat = true;
  dive.log = [];
  dive.player.fury = 0;
  dive.player.foco = 0;
  dive.player.charging = false;
  dive.player.combo = 0;
  dive.player.firstStrikeReady = state.activeClassId === 'ladrao';
  dive.moonPhase = 'full';
  dive.moonTurnCount = 0;
  predictEnemySpecial();
  document.getElementById('event-area').hidden = true;
  document.getElementById('combat-area').hidden = false;
  addLog(`${dive.enemy.icon} ${dive.enemy.name} apareceu!`);
  renderCombat();
}

function addLog(text) {
  dive.log.unshift(text);
  dive.log = dive.log.slice(0, 4);
  document.getElementById('combat-log').innerHTML = dive.log.map((l) => `<p>${l}</p>`).join('');
}

function enemyLabel(enemy) {
  let label = enemy.isBoss ? `${enemy.crown} ${enemy.icon} ${enemy.name} (CHEFE)` : enemy.isElite ? `⭐ ${enemy.icon} ${enemy.name} (Elite)` : `${enemy.icon} ${enemy.name}`;
  if (enemy.mark) label += ` — ${ELEMENT_LABELS[enemy.mark]}`;
  return label;
}

function renderCombat() {
  const enemy = dive.enemy;
  document.getElementById('enemy-name').textContent = enemyLabel(enemy);
  document.getElementById('enemy-hp-fill').style.width = `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%`;
  document.getElementById('enemy-hp-text').textContent = `${Math.max(0, Math.round(enemy.hp))} / ${enemy.maxHp}`;
  renderPlayerBars();
  renderClassBadge();
  renderCombatActions();
}

function renderClassBadge() {
  const badge = document.getElementById('class-status-badge');
  const cls = state.activeClassId;
  if (cls === 'arqueira') {
    badge.hidden = false;
    badge.textContent = `👁️ Foco: ${dive.player.foco}${dive.player.charging ? ' • 🎯 Tiro carregado!' : ''}`;
  } else if (cls === 'monarca') {
    badge.hidden = false;
    badge.textContent = `🌑 Sombras no exército: ${dive.shadowArmy.length}`;
  } else if (cls === 'ladrao') {
    badge.hidden = false;
    badge.textContent = `☠️ Veneno no inimigo: ${dive.enemy.poisonStacks}${dive.player.firstStrikeReady ? ' • 🗡️ Primeiro golpe crítico!' : ''}`;
  } else if (cls === 'feiticeira') {
    badge.hidden = false;
    badge.textContent = dive.moonPhase === 'full' ? '🌕 Fase: Lua Cheia (dano)' : '🌑 Fase: Lua Nova (sustentação)';
  } else if (cls === 'punho') {
    badge.hidden = false;
    badge.textContent = `👊 Combo: ${dive.player.combo}/5`;
  } else if (cls === 'domador') {
    badge.hidden = false;
    badge.textContent = `🐾 Fera Nv. ${state.pet.level} (${getPetAtk()} ATK)`;
  } else if (cls === 'vidente') {
    badge.hidden = false;
    badge.textContent = dive.enemy.predictedSpecial
      ? `👁️ Premonição: ${dive.enemy.name} usará ${dive.enemy.special.name}!`
      : '👁️ Premonição: ataque comum a seguir.';
  } else {
    badge.hidden = true;
  }
}

function canUseSkill(skill) {
  const cls = getActiveClass();
  if (cls.resourceType === 'hp') return dive.player.hp > 1;
  const current = cls.resourceType === 'fury' ? dive.player.fury : dive.player.resource;
  return current >= (skill.resCost || 0);
}

function spendSkillCost(skill) {
  const cls = getActiveClass();
  if (cls.resourceType === 'hp') {
    const cost = Math.max(1, Math.floor(dive.player.hp * skill.hpCostPct));
    dive.player.hp = Math.max(1, dive.player.hp - cost);
    return cost;
  }
  if (cls.resourceType === 'fury') {
    dive.player.fury = Math.max(0, dive.player.fury - skill.resCost);
  } else {
    dive.player.resource = Math.max(0, dive.player.resource - skill.resCost);
  }
  return skill.resCost;
}

function renderCombatActions() {
  const root = document.getElementById('combat-actions');
  root.innerHTML = '';

  const atkBtn = document.createElement('button');
  atkBtn.className = 'combat-btn';
  atkBtn.textContent = dive.player.charging ? '🎯 Disparar (Carregado!)' : '⚔️ Atacar';
  atkBtn.addEventListener('click', () => playerAction({ type: 'basic' }));
  root.appendChild(atkBtn);

  const skillBtn = document.createElement('button');
  skillBtn.className = 'combat-btn';
  skillBtn.textContent = '✨ Habilidade';
  skillBtn.disabled = getKnownSkills().length === 0;
  skillBtn.addEventListener('click', renderSkillMenu);
  root.appendChild(skillBtn);

  if (state.activeClassId === 'arqueira') {
    const chargeBtn = document.createElement('button');
    chargeBtn.className = 'combat-btn';
    chargeBtn.textContent = '🎯 Carregar Tiro';
    chargeBtn.disabled = dive.player.charging;
    chargeBtn.addEventListener('click', () => playerAction({ type: 'charge' }));
    root.appendChild(chargeBtn);
  }

  const itemBtn = document.createElement('button');
  itemBtn.className = 'combat-btn';
  itemBtn.textContent = '🎒 Item';
  itemBtn.disabled = POTIONS.filter((p) => p.id !== 'revive').every((p) => (state.potions[p.id] || 0) === 0);
  itemBtn.addEventListener('click', renderItemMenu);
  root.appendChild(itemBtn);

  const fleeBtn = document.createElement('button');
  fleeBtn.className = 'combat-btn secondary';
  fleeBtn.textContent = '🏃 Fugir';
  fleeBtn.disabled = Boolean(dive.enemy.isBoss);
  fleeBtn.addEventListener('click', attemptFlee);
  root.appendChild(fleeBtn);
}

function renderSkillMenu() {
  const cls = getActiveClass();
  const root = document.getElementById('combat-actions');
  root.innerHTML = '';
  getKnownSkills().forEach((skill) => {
    const btn = document.createElement('button');
    btn.className = 'combat-btn skill-btn';
    btn.disabled = !canUseSkill(skill);
    const costLabel = cls.resourceType === 'hp' ? `${Math.round(skill.hpCostPct * 100)}% HP` : `${skill.resCost} ${cls.resourceLabel}`;
    btn.innerHTML = `<span>${skill.icon} ${skill.name}</span><small>${costLabel}</small>`;
    btn.addEventListener('click', () => playerAction({ type: 'skill', skill }));
    root.appendChild(btn);
  });
  const back = document.createElement('button');
  back.className = 'combat-btn secondary';
  back.textContent = '⬅️ Voltar';
  back.addEventListener('click', renderCombatActions);
  root.appendChild(back);
}

function renderItemMenu() {
  const root = document.getElementById('combat-actions');
  root.innerHTML = '';
  POTIONS.filter((p) => p.id !== 'revive').forEach((potion) => {
    const stock = state.potions[potion.id] || 0;
    const btn = document.createElement('button');
    btn.className = 'combat-btn skill-btn';
    btn.disabled = stock === 0;
    btn.innerHTML = `<span>${potion.name}</span><small>Estoque: ${stock}</small>`;
    btn.addEventListener('click', () => playerAction({ type: 'item', potionId: potion.id }));
    root.appendChild(btn);
  });
  const back = document.createElement('button');
  back.className = 'combat-btn secondary';
  back.textContent = '⬅️ Voltar';
  back.addEventListener('click', renderCombatActions);
  root.appendChild(back);
}

function rollCrit(critChance) {
  return Math.random() * 100 < critChance;
}

function dealDamage(atk, defTarget, options = {}) {
  const ignoreDef = Boolean(options.ignoreDef);
  const effDef = ignoreDef ? 0 : defTarget;
  const base = Math.max(1, Math.round(atk - effDef * 0.5));
  const isCrit = options.guaranteedCrit || rollCrit(options.critChance || 0);
  const dmg = isCrit ? Math.round(base * getCritMultiplier()) : base;
  return { dmg, isCrit };
}

function getPlayerAtk() {
  const buffAtk = dive.player.buff && dive.player.buff.atkPct ? dive.player.buff.atkPct : 0;
  return Math.round(getBaseAtk() * (1 + buffAtk));
}

function getPlayerDef() {
  const buffDef = dive.player.buff && dive.player.buff.defPct ? dive.player.buff.defPct : 0;
  return Math.round(getBaseDef() * (1 + buffDef));
}

function getPlayerCrit() {
  const buffCrit = dive.player.buff && dive.player.buff.critBonus ? dive.player.buff.critBonus : 0;
  let crit = getBaseCrit() + buffCrit;
  if (state.activeClassId === 'arqueira') {
    const perStack = hasSkill('foco_aprimorado') ? 10 : 8;
    crit += dive.player.foco * perStack;
  }
  return crit;
}

function enemyEffectiveDef() {
  return dive.enemy.def;
}

function applyToEnemy(dmg) {
  dive.enemy.hp = Math.max(0, dive.enemy.hp - dmg);
}

function gainFury(amount) {
  if (state.activeClassId !== 'guerreiro') return;
  dive.player.fury = Math.min(dive.player.maxResource, dive.player.fury + amount);
}

function playerAction(action) {
  if (!dive || !dive.inCombat) return;
  const enemy = dive.enemy;

  if (action.type === 'charge') {
    dive.player.charging = true;
    addLog('🎯 Você mira com calma, carregando o próximo disparo...');
    renderCombat();
    setTimeout(enemyTurn, 450);
    return;
  }

  if (action.type === 'basic') {
    resolveBasicAttack();
  } else if (action.type === 'item') {
    usePotion(action.potionId);
  } else if (action.type === 'skill') {
    if (!canUseSkill(action.skill)) return;
    useSkill(action.skill);
  }

  if (state.activeClassId === 'arqueira' && action.type !== 'item') {
    dive.player.foco = Math.min(5, dive.player.foco + 1);
  }

  if (state.activeClassId === 'domador' && action.type !== 'item' && enemy.hp > 0) {
    const petBuff = dive.player.buff && dive.player.buff.atkPct ? dive.player.buff.atkPct : 0;
    const petDmg = Math.round(getPetAtk() * (1 + petBuff) * 0.3);
    applyToEnemy(petDmg);
    addLog(`🐾 Sua fera ataca por ${petDmg}.`);
  }

  renderPlayerBars();

  if (enemy.hp <= 0) {
    handleVictory();
    return;
  }

  tickPlayerBuff();

  if (dive.enemy.poisonStacks > 0) {
    const poisonDmg = Math.round(getPlayerAtk() * 0.15) * dive.enemy.poisonStacks;
    applyToEnemy(poisonDmg);
    addLog(`☠️ Veneno causa ${poisonDmg} de dano.`);
    if (dive.enemy.hp <= 0) {
      handleVictory();
      return;
    }
  }

  predictEnemySpecial();
  renderCombat();
  setTimeout(enemyTurn, 450);
}

function resolveBasicAttack() {
  const critChance = getPlayerCrit();
  const charging = dive.player.charging;
  let mult = charging ? 2.5 : 1;
  if (state.activeClassId === 'punho') mult *= 1 + dive.player.combo * 0.08;
  const forcedCrit = charging || dive.player.firstStrikeReady;
  const { dmg, isCrit } = dealDamage(getPlayerAtk() * mult, enemyEffectiveDef(), { critChance, guaranteedCrit: forcedCrit });
  applyToEnemy(dmg);
  addLog(charging ? `🎯 Disparo carregado! ${dmg} de dano (CRÍTICO!).` : `Você atacou por ${dmg}${isCrit ? ' (CRÍTICO!)' : ''}.`);
  dive.player.charging = false;
  dive.player.firstStrikeReady = false;
  if (state.activeClassId === 'punho') dive.player.combo = Math.min(5, dive.player.combo + 1);
  gainFury(6);
}

function usePotion(potionId) {
  if ((state.potions[potionId] || 0) <= 0) return;
  const cls = getActiveClass();
  const power = getPotionPowerMult();
  state.potions[potionId] -= 1;

  if (potionId === 'hp') {
    const heal = Math.round(dive.player.maxHp * 0.4 * power);
    dive.player.hp = Math.min(dive.player.maxHp, dive.player.hp + heal);
    addLog(`🧪 Você bebeu uma poção de vida. +${heal} HP.`);
  } else if (potionId === 'mp' || potionId === 'elixir') {
    if (cls.resourceType === 'hp') {
      addLog('🔵 Esse item não tem efeito na sua classe.');
    } else {
      const frac = potionId === 'elixir' ? 1.0 : 0.5;
      const heal = Math.round(dive.player.maxResource * frac * power);
      if (cls.resourceType === 'fury') dive.player.fury = Math.min(dive.player.maxResource, dive.player.fury + heal);
      else dive.player.resource = Math.min(dive.player.maxResource, dive.player.resource + heal);
      addLog(`${potionId === 'elixir' ? '⚡' : '🔵'} Você usou ${potionId === 'elixir' ? 'um Elixir Maior' : 'uma poção de energia'}. +${heal} ${cls.resourceLabel}.`);
    }
  } else if (potionId === 'luck') {
    dive.luckBonus += 0.5;
    addLog('🍀 Poção da Sorte! +50% de ouro pelo resto do mergulho.');
  } else if (potionId === 'precision') {
    dive.player.buff = { critBonus: 30 * power, turnsLeft: 3 };
    addLog('🎯 Tônico de Precisão! +30% de crítico por 3 turnos.');
  }
  saveState();
}

function useSkill(skill) {
  spendSkillCost(skill);
  const effect = skill.effect;
  const critChance = getPlayerCrit();
  resetComboOnSkillUse(effect);

  if (effect.type === 'damage') {
    const { dmg, isCrit } = dealDamage(getPlayerAtk() * effect.mult, enemyEffectiveDef(), { critChance });
    applyToEnemy(dmg);
    addLog(`${skill.icon} ${skill.name}! ${dmg} de dano${isCrit ? ' (CRÍTICO!)' : ''}.`);
  } else if (effect.type === 'damage_guaranteed_crit') {
    const { dmg } = dealDamage(getPlayerAtk() * effect.mult, enemyEffectiveDef(), { guaranteedCrit: true });
    applyToEnemy(dmg);
    addLog(`${skill.icon} ${skill.name}! ${dmg} de dano (CRÍTICO!).`);
  } else if (effect.type === 'damage_ignore_def') {
    const { dmg, isCrit } = dealDamage(getPlayerAtk() * effect.mult, 0, { critChance, ignoreDef: true });
    applyToEnemy(dmg);
    addLog(`${skill.icon} ${skill.name}! ${dmg} de dano ignorando defesa${isCrit ? ' (CRÍTICO!)' : ''}.`);
  } else if (effect.type === 'multihit') {
    let total = 0;
    for (let i = 0; i < effect.hits; i++) {
      const { dmg } = dealDamage(getPlayerAtk() * effect.mult, enemyEffectiveDef(), { critChance });
      applyToEnemy(dmg);
      total += dmg;
    }
    addLog(`${skill.icon} ${skill.name}! ${effect.hits} golpes, ${total} de dano total.`);
  } else if (effect.type === 'damage_lifesteal') {
    const { dmg, isCrit } = dealDamage(getPlayerAtk() * effect.mult, enemyEffectiveDef(), { critChance });
    applyToEnemy(dmg);
    const heal = Math.round(dmg * effect.lifesteal);
    dive.player.hp = Math.min(dive.player.maxHp, dive.player.hp + heal);
    addLog(`${skill.icon} ${skill.name}! ${dmg} de dano${isCrit ? ' (CRÍTICO!)' : ''}, curou ${heal} HP.`);
  } else if (effect.type === 'damage_heal_missing') {
    const { dmg, isCrit } = dealDamage(getPlayerAtk() * effect.mult, enemyEffectiveDef(), { critChance });
    applyToEnemy(dmg);
    const heal = Math.round(dive.player.maxHp * effect.healPct);
    dive.player.hp = Math.min(dive.player.maxHp, dive.player.hp + heal);
    addLog(`${skill.icon} ${skill.name}! ${dmg} de dano${isCrit ? ' (CRÍTICO!)' : ''}, curou ${heal} HP.`);
  } else if (effect.type === 'buff_atk') {
    dive.player.buff = { atkPct: effect.amount, turnsLeft: effect.turns };
    addLog(`${skill.icon} ${skill.name}! +${Math.round(effect.amount * 100)}% de ataque por ${effect.turns} turnos.`);
  } else if (effect.type === 'buff_def') {
    dive.player.buff = { defPct: effect.amount, turnsLeft: effect.turns };
    addLog(`${skill.icon} ${skill.name}! +${Math.round(effect.amount * 100)}% de defesa por ${effect.turns} turnos.`);
  } else if (effect.type === 'heal') {
    const heal = Math.round(dive.player.maxHp * effect.amount);
    dive.player.hp = Math.min(dive.player.maxHp, dive.player.hp + heal);
    addLog(`${skill.icon} ${skill.name}! Curou ${heal} HP.`);
  } else if (effect.type === 'command_strike') {
    const count = dive.shadowArmy.length;
    if (count === 0) {
      addLog(`${skill.icon} ${skill.name}! Mas você não tem sombras para comandar.`);
    } else {
      const dmg = Math.round(getPlayerAtk() * effect.mult * count);
      applyToEnemy(dmg);
      addLog(`${skill.icon} ${skill.name}! ${count} sombras atacam em conjunto: ${dmg} de dano.`);
    }
  } else if (effect.type === 'elemental') {
    let dmg;
    let isCrit;
    let reactionMsg = '';
    if (dive.enemy.mark && dive.enemy.mark !== effect.element) {
      const key = [dive.enemy.mark, effect.element].sort().join('_');
      const reaction = REACTIONS[key];
      const result = dealDamage(getPlayerAtk() * (reaction ? reaction.mult : effect.mult), enemyEffectiveDef(), { critChance });
      dmg = result.dmg;
      isCrit = result.isCrit;
      applyToEnemy(dmg);
      if (reaction) reactionMsg = ` REAÇÃO ${reaction.name.toUpperCase()}!`;
      dive.enemy.mark = null;
      dive.enemy.markTurnsLeft = 0;
    } else {
      const result = dealDamage(getPlayerAtk() * effect.mult, enemyEffectiveDef(), { critChance });
      dmg = result.dmg;
      isCrit = result.isCrit;
      applyToEnemy(dmg);
      dive.enemy.mark = effect.element;
      dive.enemy.markTurnsLeft = 2;
    }
    addLog(`${skill.icon} ${skill.name}! ${dmg} de dano${isCrit ? ' (CRÍTICO!)' : ''}.${reactionMsg}`);
  } else if (effect.type === 'elemental_detonate') {
    if (!dive.enemy.mark) {
      const { dmg, isCrit } = dealDamage(getPlayerAtk() * 2.0, enemyEffectiveDef(), { critChance });
      applyToEnemy(dmg);
      addLog(`${skill.icon} ${skill.name}! Sem marca ativa, dano direto: ${dmg}${isCrit ? ' (CRÍTICO!)' : ''}.`);
    } else {
      const otherElements = ['fire', 'ice', 'lightning'].filter((e) => e !== dive.enemy.mark);
      const bestKey = otherElements.map((e) => [e, dive.enemy.mark].sort().join('_')).map((k) => REACTIONS[k]).sort((a, b) => b.mult - a.mult)[0];
      const { dmg, isCrit } = dealDamage(getPlayerAtk() * (bestKey.mult * 1.3), enemyEffectiveDef(), { critChance });
      applyToEnemy(dmg);
      addLog(`${skill.icon} ${skill.name}! Detona a marca de ${ELEMENT_LABELS[dive.enemy.mark]}: ${dmg} de dano${isCrit ? ' (CRÍTICO!)' : ''}.`);
      dive.enemy.mark = null;
    }
  } else if (effect.type === 'foco_barrage') {
    const hits = Math.max(effect.minHits, dive.player.foco);
    let total = 0;
    for (let i = 0; i < hits; i++) {
      const { dmg } = dealDamage(getPlayerAtk() * effect.mult, enemyEffectiveDef(), { critChance: 100 });
      applyToEnemy(dmg);
      total += dmg;
    }
    dive.player.foco = 0;
    addLog(`${skill.icon} ${skill.name}! ${hits} flechas, ${total} de dano total.`);
  } else if (effect.type === 'poison_damage') {
    const { dmg, isCrit } = dealDamage(getPlayerAtk() * effect.mult, enemyEffectiveDef(), { critChance });
    applyToEnemy(dmg);
    dive.enemy.poisonStacks = Math.min(10, dive.enemy.poisonStacks + effect.stacks);
    addLog(`${skill.icon} ${skill.name}! ${dmg} de dano${isCrit ? ' (CRÍTICO!)' : ''} e +${effect.stacks} carga de Veneno.`);
  } else if (effect.type === 'poison_multihit') {
    let total = 0;
    for (let i = 0; i < effect.hits; i++) {
      const { dmg } = dealDamage(getPlayerAtk() * effect.mult, enemyEffectiveDef(), { critChance });
      applyToEnemy(dmg);
      total += dmg;
      dive.enemy.poisonStacks = Math.min(10, dive.enemy.poisonStacks + effect.stacksPerHit);
    }
    addLog(`${skill.icon} ${skill.name}! ${effect.hits} golpes, ${total} de dano total e +${effect.hits * effect.stacksPerHit} cargas de Veneno.`);
  } else if (effect.type === 'poison_detonate') {
    const stacks = dive.enemy.poisonStacks;
    if (stacks === 0) {
      addLog(`${skill.icon} ${skill.name}! Mas o inimigo não está envenenado.`);
    } else {
      const dmg = Math.round(getPlayerAtk() * effect.mult * stacks);
      applyToEnemy(dmg);
      dive.enemy.poisonStacks = 0;
      addLog(`${skill.icon} ${skill.name}! Detona ${stacks} cargas de Veneno: ${dmg} de dano.`);
    }
  } else if (effect.type === 'moon_damage') {
    if (dive.moonPhase === 'full') {
      const { dmg, isCrit } = dealDamage(getPlayerAtk() * effect.fullMult, enemyEffectiveDef(), { critChance });
      applyToEnemy(dmg);
      addLog(`${skill.icon} ${skill.name} (Lua Cheia)! ${dmg} de dano${isCrit ? ' (CRÍTICO!)' : ''}.`);
    } else {
      const { dmg, isCrit } = dealDamage(getPlayerAtk() * effect.newMult, enemyEffectiveDef(), { critChance });
      applyToEnemy(dmg);
      const heal = Math.round(dmg * effect.newLifesteal);
      dive.player.hp = Math.min(dive.player.maxHp, dive.player.hp + heal);
      addLog(`${skill.icon} ${skill.name} (Lua Nova)! ${dmg} de dano${isCrit ? ' (CRÍTICO!)' : ''}, curou ${heal} HP.`);
    }
  } else if (effect.type === 'moon_buff') {
    if (dive.moonPhase === 'full') {
      dive.player.buff = { atkPct: 0.25, turnsLeft: 2 };
      addLog(`${skill.icon} ${skill.name} (Lua Cheia)! +25% de ataque por 2 turnos.`);
    } else {
      dive.player.buff = { defPct: 0.25, regenPct: 0.06, turnsLeft: 2 };
      addLog(`${skill.icon} ${skill.name} (Lua Nova)! +25% de defesa e regeneração por 2 turnos.`);
    }
  } else if (effect.type === 'moon_utility') {
    if (dive.moonPhase === 'full') {
      const { dmg } = dealDamage(getPlayerAtk() * 1.4, enemyEffectiveDef(), { guaranteedCrit: true });
      applyToEnemy(dmg);
      addLog(`${skill.icon} ${skill.name} (Lua Cheia)! ${dmg} de dano (CRÍTICO!).`);
    } else {
      const heal = Math.round(dive.player.maxHp * 0.3);
      dive.player.hp = Math.min(dive.player.maxHp, dive.player.hp + heal);
      addLog(`${skill.icon} ${skill.name} (Lua Nova)! Curou ${heal} HP.`);
    }
  } else if (effect.type === 'moon_eclipse') {
    const { dmg, isCrit } = dealDamage(getPlayerAtk() * 2.0, enemyEffectiveDef(), { critChance });
    applyToEnemy(dmg);
    const heal = Math.round(dive.player.maxHp * 0.25);
    dive.player.hp = Math.min(dive.player.maxHp, dive.player.hp + heal);
    addLog(`${skill.icon} ${skill.name}! ${dmg} de dano${isCrit ? ' (CRÍTICO!)' : ''} e curou ${heal} HP.`);
  } else if (effect.type === 'combo_finisher') {
    const stacks = dive.player.combo;
    const { dmg, isCrit } = dealDamage(getPlayerAtk() * (effect.mult + stacks * effect.bonusPerStack), enemyEffectiveDef(), { critChance });
    applyToEnemy(dmg);
    dive.player.combo = 0;
    addLog(`${skill.icon} ${skill.name}! ${dmg} de dano${isCrit ? ' (CRÍTICO!)' : ''} (bônus de ${stacks} combo).`);
  } else if (effect.type === 'pet_strike') {
    const petBuff = dive.player.buff && dive.player.buff.atkPct ? dive.player.buff.atkPct : 0;
    const dmg = Math.round(getPetAtk() * (1 + petBuff) * effect.mult);
    applyToEnemy(dmg);
    addLog(`${skill.icon} ${skill.name}! Sua fera ataca por ${dmg}.`);
  } else if (effect.type === 'conditional_shield') {
    if (dive.enemy.predictedSpecial) {
      dive.player.shield = true;
      addLog(`${skill.icon} ${skill.name}! Você previu o ataque especial e se blindou completamente.`);
    } else {
      dive.player.buff = { defPct: effect.amount, turnsLeft: effect.turns };
      addLog(`${skill.icon} ${skill.name}! Nenhum perigo previsto — +${Math.round(effect.amount * 100)}% de defesa por ${effect.turns} turnos.`);
    }
  } else if (effect.type === 'damage_and_heal') {
    const { dmg, isCrit } = dealDamage(getPlayerAtk() * effect.mult, enemyEffectiveDef(), { critChance });
    applyToEnemy(dmg);
    const heal = Math.round(dive.player.maxHp * effect.healPct);
    dive.player.hp = Math.min(dive.player.maxHp, dive.player.hp + heal);
    addLog(`${skill.icon} ${skill.name}! ${dmg} de dano${isCrit ? ' (CRÍTICO!)' : ''} e curou ${heal} HP.`);
  }
}

function resetComboOnSkillUse(effect) {
  if (state.activeClassId === 'punho' && effect.type !== 'combo_finisher') {
    dive.player.combo = 0;
  }
}

function tickPlayerBuff() {
  if (dive.player.buff) {
    dive.player.buff.turnsLeft -= 1;
    if (dive.player.buff.turnsLeft <= 0) dive.player.buff = null;
  }
  if (dive.enemy.markTurnsLeft > 0) {
    dive.enemy.markTurnsLeft -= 1;
    if (dive.enemy.markTurnsLeft <= 0) dive.enemy.mark = null;
  }
  if (state.activeClassId === 'feiticeira') {
    dive.moonTurnCount += 1;
    if (dive.moonTurnCount >= 2) {
      dive.moonTurnCount = 0;
      dive.moonPhase = dive.moonPhase === 'full' ? 'new' : 'full';
      addLog(dive.moonPhase === 'full' ? '🌕 A Lua Cheia retorna.' : '🌑 A Lua Nova se ergue.');
    }
  }
}

function attemptFlee() {
  if (Math.random() < 0.65) {
    dive.inCombat = false;
    dive.enemy = null;
    document.getElementById('combat-area').hidden = true;
    document.getElementById('event-area').hidden = false;
    setEventText('🏃 Você fugiu com sucesso, sem recompensas desse combate.');
    showFloorChoice();
  } else {
    addLog('🏃 Você tentou fugir, mas falhou!');
    setTimeout(enemyTurn, 300);
  }
}

function enemyTurn() {
  if (!dive || !dive.inCombat) return;
  const enemy = dive.enemy;
  const useSpecial = state.activeClassId === 'vidente' ? enemy.predictedSpecial : Boolean(enemy.special) && Math.random() < enemy.special.chance;
  const atkMult = useSpecial ? enemy.special.mult : 1;

  if (Math.random() * 100 < getDodgeChance()) {
    addLog(`🌀 Você desviou do ataque de ${enemy.icon} ${enemy.name}!`);
    renderPlayerBars();
    renderCombat();
    return;
  }

  const { dmg } = dealDamage(enemy.atk * atkMult, getPlayerDef(), {});
  let finalDmg = dmg;
  if (dive.player.shield) {
    dive.player.shield = false;
    finalDmg = 0;
    addLog('🔷 Seu escudo absorveu o golpe!');
  } else {
    dive.player.hp -= finalDmg;
    addLog(useSpecial ? `${enemy.icon} usou ${enemy.special.name}! ${finalDmg} de dano.` : `${enemy.icon} atacou por ${finalDmg}.`);
    gainFury(12);
    if (state.activeClassId === 'arqueira' && finalDmg > 0) dive.player.foco = 0;
  }
  renderPlayerBars();

  if (dive.player.hp <= 0) {
    if ((state.potions.revive || 0) > 0) {
      state.potions.revive -= 1;
      dive.player.hp = Math.round(dive.player.maxHp * 0.3);
      addLog('🕊️ Um Fragmento Revivificante te trouxe de volta!');
      saveState();
      renderPlayerBars();
      renderCombat();
      return;
    }
    handleDefeat();
    return;
  }
  renderCombat();
}

function handleVictory() {
  const enemy = dive.enemy;
  const isBoss = Boolean(enemy.isBoss);
  const isElite = Boolean(enemy.isElite);
  const gold = isBoss
    ? Math.round(dive.tier.goldBase * dive.tier.floors * 0.8 * getDiveGoldMult())
    : Math.round(dive.tier.goldBase * (1 + 0.12 * (dive.floorIndex - 1)) * (isElite ? 2 : 1) * getDiveGoldMult());
  dive.runGold += gold;
  dive.inCombat = false;
  dive.player.buff = null;
  dive.player.shield = false;
  document.getElementById('dive-run-gold').textContent = dive.runGold;

  let extraMsg = '';

  if (state.activeClassId === 'domador') {
    state.pet.xp += isBoss ? 5 : isElite ? 2 : 1;
    const threshold = state.pet.level * 3;
    if (state.pet.xp >= threshold) {
      state.pet.xp -= threshold;
      state.pet.level += 1;
      extraMsg += ` 🐾 Sua fera subiu para o nível ${state.pet.level}!`;
    }
  }

  if (state.activeClassId === 'monarca' && !isBoss && dive.shadowArmy.length < 5) {
    const baseChance = isElite ? 0.5 : 0.3;
    const chance = baseChance + (hasSkill('vinculo_sombrio') ? 0.15 : 0);
    if (Math.random() < chance) {
      dive.shadowArmy.push({ name: enemy.name, icon: enemy.icon, atk: Math.round(enemy.atk * 0.5) });
      extraMsg += ` 🌑 Você ergueu ${enemy.icon} ${enemy.name} como sombra!`;
    }
  }

  if (isBoss) {
    const wasNew = !state.bossesDefeated.includes(dive.tier.id);
    handleBossClearRewards(dive.tier.id, 'você');
    if (wasNew) {
      const unlockClasses = CLASS_UNLOCK_MAP[dive.tier.id] || [];
      unlockClasses.forEach((classId) => {
        extraMsg += ` Classe ${getClassDef(classId).icon} ${getClassDef(classId).name} desbloqueada!`;
      });
      const blessing = BLESSINGS.find((b) => b.tier === dive.tier.id);
      if (blessing) extraMsg += ` Você recebeu a ${blessing.icon} ${blessing.name}!`;
      const nextIdx = tierIndex(dive.tier.id) + 1;
      if (RANK_ORDER[nextIdx]) extraMsg += ` Rank ${RANK_ORDER[nextIdx]} desbloqueado!`;
      else extraMsg += ' Você derrotou o Monarca Primordial!';
    }
    saveState();
  }

  document.getElementById('combat-area').hidden = true;
  document.getElementById('event-area').hidden = false;
  setEventText(`✅ ${enemy.name} derrotado! +${gold} de ouro.${extraMsg}`);
  renderShadowArmyStrip();
  showFloorChoice();
}

function handleDefeat() {
  dive.inCombat = false;
  const best = state.bestFloor[dive.tier.id] || 0;
  state.bestFloor[dive.tier.id] = Math.max(best, dive.floorIndex);
  dive.portal.status = 'done';
  dive.portal.doneAt = Date.now();
  dive.portal.result = { success: false };
  saveState();
  showScreen('summary');
  document.getElementById('summary-title').textContent = '💀 Você Caiu';
  document.getElementById('summary-text').textContent =
    `Foi derrotado no andar ${dive.floorIndex} do ${dive.tier.name}. O ouro deste mergulho (${dive.runGold}) foi perdido${state.activeClassId === 'monarca' && dive.shadowArmy.length ? ' e seu exército de sombras se dispersou' : ''}.`;
}

// ---------- Floor choice ----------

function continueDeeper() {
  dive.floorIndex += 1;
  goToFloor();
}

function extractRun() {
  const best = state.bestFloor[dive.tier.id] || 0;
  state.bestFloor[dive.tier.id] = Math.max(best, dive.floorIndex);
  state.gold += dive.runGold;
  dive.portal.status = 'done';
  dive.portal.doneAt = Date.now();
  dive.portal.result = { success: true };
  saveState();
  showScreen('summary');
  document.getElementById('summary-title').textContent = '🌀 Extração Concluída';
  document.getElementById('summary-text').textContent =
    `Você extraiu do andar ${dive.floorIndex} do ${dive.tier.name} com ${dive.runGold} de ouro guardado.`;
}

// ---------- Shop ----------

function renderShop() {
  const cls = getActiveClass();
  document.getElementById('shop-gold').textContent = state.gold;

  const upgradeRoot = document.getElementById('shop-upgrade-rows');
  upgradeRoot.innerHTML = '';
  UPGRADES.forEach((upgrade) => {
    const level = getUpgradeLevel(upgrade.id);
    const maxed = level >= upgrade.maxLevel;
    const cost = getUpgradeCost(upgrade);
    const row = document.createElement('div');
    row.className = 'shop-row';
    row.innerHTML = `<div class="shop-info">${upgrade.name} (Nv. ${level}/${upgrade.maxLevel})<small>${upgrade.desc}</small></div>`;
    const btn = document.createElement('button');
    btn.textContent = maxed ? 'Máximo' : `${cost} 💰`;
    btn.disabled = maxed || state.gold < cost;
    btn.addEventListener('click', () => {
      if (maxed || state.gold < cost) return;
      state.gold -= cost;
      state.upgrades[upgrade.id] = level + 1;
      saveState();
      renderShop();
    });
    row.appendChild(btn);
    upgradeRoot.appendChild(row);
  });

  const equipRoot = document.getElementById('shop-equip-rows');
  equipRoot.innerHTML = '';
  EQUIP_SLOTS.forEach((slot) => {
    const group = document.createElement('div');
    group.className = 'equip-group';
    group.innerHTML = `<h4 class="equip-group-title">${slot.label}</h4>`;
    const currentTier = state.equipment[slot.key] || 0;
    slot.tiers.forEach((item, idx) => {
      const tierNum = idx + 1;
      if (tierNum < currentTier) return;
      const row = document.createElement('div');
      row.className = 'shop-row';
      const statsDesc = Object.keys(item)
        .filter((k) => !['id', 'name', 'icon', 'cost'].includes(k))
        .map((k) => `+${k === 'goldPct' ? `${Math.round(item[k] * 100)}%` : item[k]} ${k === 'atk' ? 'Ataque' : k === 'def' ? 'Defesa' : k === 'hp' ? 'HP' : k === 'crit' ? 'Crítico' : 'Ouro'}`)
        .join(', ');
      row.innerHTML = `<div class="shop-info">${item.icon} ${item.name}<small>${statsDesc}</small></div>`;
      const btn = document.createElement('button');
      const equipped = tierNum === currentTier;
      btn.textContent = equipped ? 'Equipado' : `${item.cost} 💰`;
      btn.disabled = equipped || state.gold < item.cost;
      btn.addEventListener('click', () => {
        if (equipped || state.gold < item.cost) return;
        state.gold -= item.cost;
        state.equipment[slot.key] = tierNum;
        saveState();
        renderShop();
      });
      row.appendChild(btn);
      group.appendChild(row);
    });
    equipRoot.appendChild(group);
  });

  const skillRoot = document.getElementById('shop-skill-rows');
  skillRoot.innerHTML = '';
  (SKILLS_BY_CLASS[state.activeClassId] || []).forEach((skill) => {
    const owned = hasSkill(skill.id);
    const row = document.createElement('div');
    row.className = 'shop-row';
    row.innerHTML = `<div class="shop-info">${skill.icon} ${skill.name}${skill.ultimate ? ' ⭐' : ''}<small>${skill.desc}</small></div>`;
    const btn = document.createElement('button');
    btn.textContent = owned ? 'Aprendida' : `${skill.cost} 💰`;
    btn.disabled = owned || state.gold < skill.cost;
    btn.addEventListener('click', () => {
      if (owned || state.gold < skill.cost) return;
      state.gold -= skill.cost;
      state.skillsByClass[state.activeClassId] = state.skillsByClass[state.activeClassId] || [];
      state.skillsByClass[state.activeClassId].push(skill.id);
      saveState();
      renderShop();
    });
    row.appendChild(btn);
    skillRoot.appendChild(row);
  });

  const potionRoot = document.getElementById('shop-potion-rows');
  potionRoot.innerHTML = '';
  POTIONS.forEach((potion) => {
    const stock = state.potions[potion.id] || 0;
    const row = document.createElement('div');
    row.className = 'shop-row';
    row.innerHTML = `<div class="shop-info">${potion.name} (Estoque: ${stock})<small>${potion.desc}</small></div>`;
    const btn = document.createElement('button');
    btn.textContent = `${potion.cost} 💰`;
    btn.disabled = state.gold < potion.cost;
    btn.addEventListener('click', () => {
      if (state.gold < potion.cost) return;
      state.gold -= potion.cost;
      state.potions[potion.id] = (state.potions[potion.id] || 0) + 1;
      saveState();
      renderShop();
    });
    row.appendChild(btn);
    potionRoot.appendChild(row);
  });
}

// ---------- Blessings roster ----------

function renderBlessings() {
  const root = document.getElementById('blessings-list');
  root.innerHTML = '';
  BLESSINGS.forEach((blessing) => {
    const owned = state.blessings.includes(blessing.id);
    const row = document.createElement('div');
    row.className = 'shadow-row' + (owned ? '' : ' locked');
    row.innerHTML = `
      <span class="shadow-icon">${owned ? blessing.icon : '❔'}</span>
      <div class="shadow-info">
        <strong>${owned ? blessing.name : `Bênção de Rank ${blessing.tier} (derrote o chefe)`}</strong>
        <small>${owned ? blessing.desc : 'Ainda não conquistada'}</small>
      </div>
    `;
    root.appendChild(row);
  });
}

// ---------- Classes screen ----------

function renderClasses() {
  const root = document.getElementById('classes-list');
  root.innerHTML = '';
  CLASSES.forEach((cls) => {
    const unlocked = state.unlockedClasses.includes(cls.id);
    const active = state.activeClassId === cls.id;
    const card = document.createElement('div');
    card.className = 'class-row' + (unlocked ? '' : ' locked') + (active ? ' active' : '');
    card.innerHTML = `
      <span class="class-row-icon">${unlocked ? cls.icon : '🔒'}</span>
      <div class="class-row-info">
        <strong>${unlocked ? cls.name : `Classe bloqueada (chefe Rank ${cls.unlockedBy})`}</strong>
        <small>${unlocked ? cls.desc : 'Derrote o chefe deste rank pra desbloquear'}</small>
      </div>
    `;
    if (unlocked && !active) {
      const btn = document.createElement('button');
      btn.textContent = 'Usar';
      btn.addEventListener('click', () => {
        state.activeClassId = cls.id;
        saveState();
        renderClasses();
      });
      card.appendChild(btn);
    } else if (active) {
      const tag = document.createElement('span');
      tag.className = 'active-tag';
      tag.textContent = 'Ativa';
      card.appendChild(tag);
    }
    root.appendChild(card);
  });
}

// ---------- Init ----------

function init() {
  loadState();

  if (!document.getElementById(`screen-hub`)) return;

  showScreen('hub');
  renderHub();

  document.getElementById('to-shop-btn').addEventListener('click', () => {
    showScreen('shop');
    renderShop();
  });
  document.getElementById('to-blessings-btn').addEventListener('click', () => {
    showScreen('blessings');
    renderBlessings();
  });
  document.getElementById('to-classes-btn').addEventListener('click', () => {
    showScreen('classes');
    renderClasses();
  });
  document.getElementById('recruit-team-btn').addEventListener('click', recruitTeam);
  document.querySelectorAll('.back-to-hub').forEach((btn) => {
    btn.addEventListener('click', () => {
      showScreen('hub');
      renderHub();
    });
  });

  document.getElementById('continue-btn').addEventListener('click', continueDeeper);
  document.getElementById('extract-btn').addEventListener('click', extractRun);
  document.getElementById('summary-continue-btn').addEventListener('click', () => {
    showScreen('hub');
    renderHub();
  });

  window.addEventListener('beforeunload', saveState);
  tickTimer = setInterval(globalTick, TICK_MS);
}

init();

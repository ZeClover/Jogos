// Catálogo de Regiões (Marco 7) — primeira região: País das Ondas
// (PROMPT MESTRE §54, mesma região do Vertical Slice/Marco 6). Ver
// CANON_RULES.md: "Regiões precisam ter identidade mecânica e de loot,
// não só visual" — aqui a identidade mecânica é o pool de Inimigos por
// tier + o boss fixo + a distribuição de tipo de nó; identidade de LOOT
// fica pendente até Itens/Economia existirem (doc 03, ainda não
// implementado) — ver DECISIONS.md D020.
import { regions } from '../index.js';

export const REGION_DEFINITIONS = [
  {
    id: 'REG_PAIS_DAS_ONDAS_001',
    name: 'País das Ondas',
    act: 'FORMACAO',
    description: 'Vilarejo pobre sob o jugo de Gatō; pontes de madeira sobre água parada e névoa constante perto da Grande Ponte.',
    enemyPoolByTier: {
      COMMON: ['ENEMY_WAVES_BANDIT_001'],
      VETERAN: ['ENEMY_WAVES_MERCENARY_001'],
      SPECIALIST: ['ENEMY_KIRI_NINJA_001'],
      ELITE: ['ENEMY_KIRI_ELITE_001'],
    },
    bossId: 'BOSS_ZABUZA_001',
    nodeTypeWeights: [
      { type: 'MISSAO', weight: 5 },
      { type: 'ELITE', weight: 2 },
      { type: 'DESCANSO', weight: 2 },
    ],
    lootIdentityNote: 'Identidade de loot regional (drops/mercadores específicos do País das Ondas) adiada até o catálogo de Itens/Economia (doc 03) existir — ver DECISIONS.md D020.',
  },
];

regions.registerAll(REGION_DEFINITIONS);

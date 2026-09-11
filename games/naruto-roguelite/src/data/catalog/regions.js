// Catálogo de Regiões — País das Ondas (Marco 7, PROMPT MESTRE §54, mesma
// região do Vertical Slice/Marco 6) e Floresta da Morte (Marco 9, 2º Ato
// — Ascensão). Ver CANON_RULES.md: "Regiões precisam ter identidade
// mecânica e de loot, não só visual" — a identidade mecânica é o pool de
// Inimigos por tier (fixo ou gerado, `useGenerator`) + o boss/capstone +
// a distribuição de tipo de nó; identidade de LOOT fica pendente até
// Itens/Economia existirem (doc 03, ainda não implementado) — ver
// DECISIONS.md D020/D023.
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
  {
    id: 'REG_FLORESTA_DA_MORTE_001',
    name: 'Floresta da Morte',
    act: 'ASCENSAO',
    description: 'Mata fechada e hostil que cerca a etapa de sobrevivência do Exame Chūnin — trilhas emaranhadas, feras gigantes e outros times de genin competindo pelos mesmos pergaminhos.',
    useGenerator: true,
    // Sem enemyPoolByTier de propósito: mapGenerator.js gera as fichas de
    // inimigo comum/elite via src/engine/generator/enemyGenerator.js —
    // "Gerador combina peças validadas, não inventa tudo do zero" (doc
    // 09) — ver DECISIONS.md D023. `bossId` abaixo é um boss autorado de
    // verdade (fases/telegraph reais, CANON_RULES #30) — ver D024, que
    // fecha a pendência D023 #3 deixada em aberto.
    bossId: 'BOSS_SERPENTE_FLORESTA_001',
    nodeTypeWeights: [
      { type: 'MISSAO', weight: 5 },
      { type: 'ELITE', weight: 3 },
      { type: 'DESCANSO', weight: 1 },
    ],
    lootIdentityNote: 'Identidade de loot regional adiada até Itens/Economia (doc 03) existir — ver DECISIONS.md D020/D023.',
  },
];

regions.registerAll(REGION_DEFINITIONS);

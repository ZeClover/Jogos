// Catálogo de Bosses — Zabuza Momochi (País das Ondas, Marco 5,
// PROMPT MESTRE §54), a Serpente da Floresta da Morte (Marco 9, Ato
// Ascensão) e o Escorpião do Deserto (Marco 9, Ato Mundo Shinobi — Suna)
// — as duas feras gigantes seguem o mesmo espírito: presença já citada
// na descrição da Região, não um personagem canônico nomeado (ver
// DECISIONS.md D024/D026). CANON_RULES.md #30 exige identidade/mecânica/
// fases/telegraph/fraquezas, não "inimigo comum com HP maior" — ver
// campos `phases`/`weaknesses` abaixo e os perfis de IA correspondentes
// em `src/engine/combat/ai.js` (`zabuzaAction`/`serpenteAction`/
// `escorpiaoAction`).
//
// Stats de Zabuza seguem a referência de Jōnin do doc 01 (HP 200-350 /
// Chakra 150-280); a Serpente e o Escorpião são mais HP/Taijutsu e menos
// Chakra/Ninjutsu (feras, não ninjas) — o Escorpião (3º Ato, rank B/A)
// escala um pouco acima da Serpente (2º Ato, rank C/B), mesmo espírito
// de escala por Ato do doc 04 — todos provisórios (mesmo espírito de
// D012/D017), revisáveis sem mudar a arquitetura.

import { bosses } from '../index.js';

export const BOSS_DEFINITIONS = [
  {
    id: 'BOSS_ZABUZA_001',
    name: 'Zabuza Momochi',
    tier: 'BOSS',
    aiLevel: 'BOSS',
    aiProfile: 'BOSS_ZABUZA_001',
    stats: {
      hpMax: 320,
      chakraMax: 200,
      taijutsu: 42,
      ninjutsu: 34,
      defesaFisica: 26,
      defesaChakra: 20,
      velocidade: 24,
      precisao: 16,
      evasao: 6,
      critChance: 0.08,
      resistenciaEstado: 20,
    },
    loadout: {
      ativas: ['JUT_KIRIGAKURE_NO_JUTSU_001'],
      reacao: null,
      suprema: null,
      passivas: [],
    },
    phases: [
      {
        id: 'FASE_1_ATAQUE_DIRETO',
        name: 'Ataque Direto',
        hpRange: [0.6, 1.0],
        telegraph: 'Zabuza avança com a Kubikiribōchō sem hesitar — combate franco, sem truques.',
        behaviorNote: 'Ataque Básico repetido no alvo com menos HP.',
      },
      {
        id: 'FASE_2_NEVOA_CERRADA',
        name: 'Névoa Cerrada',
        hpRange: [0.25, 0.6],
        telegraph: 'A névoa se adensa ao redor de Zabuza — ele está prestes a desaparecer de vista.',
        behaviorNote: 'Assim que possível, usa Kirigakure no Jutsu (Oculto em si mesmo) antes de voltar a atacar.',
      },
      {
        id: 'FASE_3_DESESPERO',
        name: 'Desespero',
        hpRange: [0, 0.25],
        telegraph: 'Zabuza abandona a cautela — os golpes ficam mais rápidos e imprudentes.',
        behaviorNote: 'Ataque Básico constante, sem tentar Kirigakure de novo nem se defender.',
      },
    ],
    weaknesses: [
      'Estados de Controle (Imobilizado, Atordoado...) ainda não sofreram a resistência adaptativa nas primeiras aplicações da luta (CANON_RULES #31) — controlar cedo é mais confiável que tarde.',
      'Ataques com a tag Sensorial ignoram a penalidade de acerto da Névoa/Oculto na Fase 2 (D018) — nenhum jutsu do Vertical Slice tem essa tag ainda, então a Fase 2 é genuinamente mais difícil de acertar por enquanto, como pretendido.',
    ],
  },
  {
    id: 'BOSS_SERPENTE_FLORESTA_001',
    name: 'Serpente da Floresta da Morte',
    tier: 'BOSS',
    aiLevel: 'BOSS',
    aiProfile: 'BOSS_SERPENTE_FLORESTA_001',
    stats: {
      hpMax: 380,
      chakraMax: 140,
      taijutsu: 55,
      ninjutsu: 8,
      defesaFisica: 30,
      defesaChakra: 12,
      velocidade: 20,
      precisao: 14,
      evasao: 8,
      critChance: 0.05,
      resistenciaEstado: 16,
    },
    loadout: {
      ativas: ['JUT_CONSTRICAO_SUFOCANTE_001', 'JUT_MORDIDA_PERFURANTE_001'],
      reacao: null,
      suprema: null,
      passivas: [],
    },
    phases: [
      {
        id: 'FASE_1_EMBOSCADA',
        name: 'Emboscada',
        hpRange: [0.6, 1.0],
        telegraph: 'A serpente ataca do meio da vegetação densa — mordidas diretas, sem padrão especial ainda.',
        behaviorNote: 'Ataque Básico repetido no alvo com menos HP.',
      },
      {
        id: 'FASE_2_CONSTRICAO',
        name: 'Constrição',
        hpRange: [0.3, 0.6],
        telegraph: 'O corpo da serpente se enrosca — ela está prestes a prender alguém no lugar.',
        behaviorNote: 'Assim que possível (Chakra/cooldown livres), usa Constrição Sufocante (Imobilizado) no alvo com menos HP antes de voltar a atacar.',
      },
      {
        id: 'FASE_3_FURIA_FEROZ',
        name: 'Fúria Feroz',
        hpRange: [0, 0.3],
        telegraph: 'As presas ficam visíveis a cada bote — os ataques passam a rasgar, não só golpear.',
        behaviorNote: 'Prioriza Mordida Perfurante (Sangrando) sempre que possível; Ataque Básico como reserva.',
      },
    ],
    weaknesses: [
      'Constrição Sufocante aplica Imobilizado com chance fixa (85%) — a resistência adaptativa (CANON_RULES #31) ainda favorece o esquadrão nas primeiras aplicações da luta.',
      'Sem alcance à distância: todo o loadout (Ataque Básico e os 2 Jutsus) é MELEE, que só mira a linha de Frente OCUPADA do esquadrão (positions.js) — espalhar o esquadrão entre Frente e Trás protege por completo quem ficar atrás, enquanto durar quem estiver na Frente.',
    ],
  },
  {
    id: 'BOSS_ESCORPIAO_DESERTO_001',
    name: 'Escorpião do Deserto',
    tier: 'BOSS',
    aiLevel: 'BOSS',
    aiProfile: 'BOSS_ESCORPIAO_DESERTO_001',
    stats: {
      hpMax: 410,
      chakraMax: 150,
      taijutsu: 50,
      ninjutsu: 8,
      defesaFisica: 33,
      defesaChakra: 13,
      velocidade: 18,
      precisao: 15,
      evasao: 6,
      critChance: 0.05,
      resistenciaEstado: 18,
    },
    loadout: {
      ativas: ['JUT_FERROADA_PARALISANTE_001', 'JUT_INVESTIDA_DAS_PINCAS_001'],
      reacao: null,
      suprema: null,
      passivas: [],
    },
    phases: [
      {
        id: 'FASE_1_TOCAIA_NA_AREIA',
        name: 'Tocaia na Areia',
        hpRange: [0.6, 1.0],
        telegraph: 'O escorpião emerge da areia solta e ataca direto — pinças e ferrão ainda contidos.',
        behaviorNote: 'Ataque Básico repetido no alvo com menos HP.',
      },
      {
        id: 'FASE_2_FERROADA',
        name: 'Ferroada',
        hpRange: [0.3, 0.6],
        telegraph: 'A cauda se ergue e trava no alvo — o ferrão está prestes a descer com veneno paralisante.',
        behaviorNote: 'Assim que possível (Chakra/cooldown livres), usa Ferroada Paralisante (Paralisado) no alvo com menos HP que ainda não esteja Paralisado, antes de voltar a atacar.',
      },
      {
        id: 'FASE_3_FURIA_DAS_PINCAS',
        name: 'Fúria das Pinças',
        hpRange: [0, 0.3],
        telegraph: 'As pinças se abrem por completo — os golpes deixam de mirar carne e passam a mirar a guarda.',
        behaviorNote: 'Prioriza Investida das Pinças (Vulnerável) sempre que possível; Ataque Básico como reserva.',
      },
    ],
    weaknesses: [
      'Ferroada Paralisante aplica Paralisado com chance fixa (80%) — a resistência adaptativa (CANON_RULES #31) ainda favorece o esquadrão nas primeiras aplicações da luta.',
      'Sem alcance à distância: todo o loadout (Ataque Básico e os 2 Jutsus) é MELEE, que só mira a linha de Frente OCUPADA do esquadrão (positions.js) — espalhar o esquadrão entre Frente e Trás protege quem ficar atrás.',
    ],
  },
];

bosses.registerAll(BOSS_DEFINITIONS);

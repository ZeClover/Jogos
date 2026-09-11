// Catálogo de Bosses — primeiro boss do Vertical Slice: Zabuza Momochi
// (País das Ondas, PROMPT MESTRE §54). CANON_RULES.md #30 exige
// identidade/mecânica/fases/telegraph/fraquezas, não "inimigo comum com
// HP maior" — ver campos `phases`/`weaknesses` abaixo e o perfil de IA
// correspondente em `src/engine/combat/ai.js` (`zabuzaAction`).
//
// Stats seguem a referência de Jōnin do doc 01 (HP 200-350 / Chakra
// 150-280) como âncora, mas são uma distribuição provisória (mesmo
// espírito de D012/D017) — revisável no Marco 9 sem mudar a arquitetura.

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
];

bosses.registerAll(BOSS_DEFINITIONS);

// Catálogo de Inimigos — Lote 01 (País das Ondas), transcrito de
// docs/design/15_BIBLIOTECA_PROMPTS_VISUAIS_P0_P1.md (P0 — Inimigos), que
// já definia estes 4 arquétipos com prompt visual pronto. Ver
// docs/design/05_INIMIGOS_ELITES_BOSSES.md para os tiers.
//
// Bandido/Mercenário não são ninjas (sem bandana, doc 15) — por isso
// `chakraMax: 0`/baixo e sem `loadout` (Ataque Básico é a única ação que
// faz sentido para eles; nenhum jutsu genérico de "inimigo comum" existe
// no catálogo ainda, e inventar um só para preencher a ficha seria
// fabricar conteúdo sem base — ver DECISIONS.md D018).
//
// Stats são uma distribuição provisória, mesmo espírito de D017 — usam a
// referência de rank por HP/Chakra do doc 01 (Genin/Chūnin/Jōnin) como
// âncora aproximada por tier.

import { enemies } from '../index.js';

export const ENEMY_DEFINITIONS = [
  {
    id: 'ENEMY_WAVES_BANDIT_001',
    name: 'Bandido do País das Ondas',
    tier: 'COMMON',
    aiLevel: 'BASICA',
    stats: {
      hpMax: 55, chakraMax: 0, taijutsu: 12, defesaFisica: 6, velocidade: 9, precisao: 2,
    },
  },
  {
    id: 'ENEMY_WAVES_MERCENARY_001',
    name: 'Mercenário do País das Ondas',
    tier: 'VETERAN',
    aiLevel: 'INTERMEDIARIA',
    stats: {
      hpMax: 75, chakraMax: 10, taijutsu: 17, defesaFisica: 10, velocidade: 12, precisao: 5,
    },
  },
  {
    id: 'ENEMY_KIRI_NINJA_001',
    name: 'Ninja de Kiri',
    tier: 'SPECIALIST',
    aiLevel: 'INTERMEDIARIA',
    stats: {
      hpMax: 92,
      chakraMax: 60,
      taijutsu: 16,
      ninjutsu: 18,
      defesaFisica: 12,
      defesaChakra: 12,
      velocidade: 16,
      precisao: 8,
      resistenciaEstado: 5,
    },
  },
  {
    id: 'ENEMY_KIRI_ELITE_001',
    name: 'Elite de Kiri',
    tier: 'ELITE',
    aiLevel: 'ELITE',
    stats: {
      hpMax: 130,
      chakraMax: 90,
      taijutsu: 22,
      ninjutsu: 24,
      defesaFisica: 16,
      defesaChakra: 16,
      velocidade: 18,
      precisao: 12,
      resistenciaEstado: 10,
      critChance: 0.08,
    },
  },
];

enemies.registerAll(ENEMY_DEFINITIONS);

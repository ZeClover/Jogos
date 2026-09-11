// Gerador procedural de Inimigo Comum (Marco 9, docs/design/05_INIMIGOS_
// ELITES_BOSSES.md + 09_BALANCEAMENTO_E_GERADOR.md): "Gerador combina
// peças validadas, não inventa tudo do zero" (doc 09). Reaproveita só
// vocabulário/faixas já existentes — a curva de stats por tier calibrada
// no Marco 5 (D018 #6), as 6 Tags de Natureza catalogadas no Marco 2 — e
// NÃO fabrica jutsu novo: todo inimigo gerado usa só Ataque Básico, igual
// aos arquétipos comuns hoje (D018), nunca um golpe especial inventado
// sem ficha real. Puro e determinístico (RngStream do chamador). Ver
// DECISIONS.md D023.
import { tags } from '../../data/index.js';

// Âncoras de stat por tier — mesma referência do catálogo de Inimigos do
// Marco 5 (src/data/catalog/enemies.js), generalizada para qualquer
// arquétipo procedural (não só País das Ondas). MINI_BOSS estende ELITE
// (tier já listado em ENEMY_TIERS desde o Marco 0, nunca usado até agora).
const RANK_STAT_ANCHORS = {
  COMMON: {
    hpMax: 55, chakraMax: 0, taijutsu: 12, ninjutsu: 0, defesaFisica: 6, defesaChakra: 0, velocidade: 9, precisao: 2, resistenciaEstado: 0,
  },
  VETERAN: {
    hpMax: 75, chakraMax: 10, taijutsu: 17, ninjutsu: 6, defesaFisica: 10, defesaChakra: 6, velocidade: 12, precisao: 5, resistenciaEstado: 2,
  },
  SPECIALIST: {
    hpMax: 92, chakraMax: 60, taijutsu: 16, ninjutsu: 18, defesaFisica: 12, defesaChakra: 12, velocidade: 16, precisao: 8, resistenciaEstado: 5,
  },
  ELITE: {
    hpMax: 130, chakraMax: 90, taijutsu: 22, ninjutsu: 24, defesaFisica: 16, defesaChakra: 16, velocidade: 18, precisao: 12, resistenciaEstado: 10,
  },
  MINI_BOSS: {
    hpMax: 190, chakraMax: 120, taijutsu: 30, ninjutsu: 30, defesaFisica: 22, defesaChakra: 20, velocidade: 22, precisao: 16, resistenciaEstado: 14, critChance: 0.06,
  },
};

const RANK_AI_LEVEL = {
  COMMON: 'BASICA', VETERAN: 'INTERMEDIARIA', SPECIALIST: 'INTERMEDIARIA', ELITE: 'ELITE', MINI_BOSS: 'ELITE',
};

const RANK_TITLE = {
  COMMON: 'Recruta', VETERAN: 'Veterano', SPECIALIST: 'Especialista', ELITE: 'Elite', MINI_BOSS: 'Capitão',
};

const NATUREZA_IDS = [
  'TAG_KATON_001', 'TAG_RAITON_001', 'TAG_SUITON_001', 'TAG_FUTON_001', 'TAG_DOTON_001', 'TAG_HYOTON_001',
];
// Natureza -> atributo que recebe um pequeno bônus de sabor (mesmo espírito
// da associação natureza/mecânica já usada em D015/D018 — ex: Suiton com
// Névoa/Oculto — não uma regra nova).
const NATUREZA_STAT_BIAS = {
  TAG_KATON_001: 'taijutsu',
  TAG_RAITON_001: 'precisao',
  TAG_SUITON_001: 'ninjutsu',
  TAG_FUTON_001: 'velocidade',
  TAG_DOTON_001: 'defesaFisica',
  TAG_HYOTON_001: 'resistenciaEstado',
};
const NATUREZA_BIAS_PERCENT = 0.15;

const TRAITS = ['Implacável', 'Ágil', 'Cauteloso', 'Feroz', 'Disciplinado', 'Traiçoeiro', 'Silencioso', 'Obstinado'];
const WEAPONS = ['Kunai', 'Shuriken', 'Espada Curta', 'Lança', 'Correntes', 'Leque de Guerra'];

function applyNaturezaBias(anchorStats, naturezaId) {
  const statKey = NATUREZA_STAT_BIAS[naturezaId];
  const stats = { ...anchorStats };
  if (statKey !== undefined && stats[statKey] !== undefined) {
    stats[statKey] = Math.round(stats[statKey] * (1 + NATUREZA_BIAS_PERCENT));
  }
  return stats;
}

/**
 * Gera a ficha de um inimigo (Comum a Mini-Boss) combinando Rank + Natureza
 * + Traço + Arma — peças todas já validadas em marcos anteriores. NÃO
 * registra na Registry `enemies`: é uma ficha efêmera de uma Run (sem
 * promessa de ID estável entre runs, D023 #1), pronta para
 * `createCombatantFromEnemy` (mesmo formato de `stats`/`tier`/`aiLevel`).
 * @param {object} params
 * @param {'COMMON'|'VETERAN'|'SPECIALIST'|'ELITE'|'MINI_BOSS'} params.rank
 * @param {import('../rng.js').RngStream} params.rng
 */
export function generateEnemy({ rank, rng }) {
  const anchor = RANK_STAT_ANCHORS[rank];
  if (!anchor) throw new Error(`generateEnemy: rank sem âncora de stats conhecida: "${rank}"`);

  const naturezaId = rng.pick(NATUREZA_IDS);
  const naturezaName = tags.get(naturezaId)?.name ?? naturezaId;
  const trait = rng.pick(TRAITS);
  const weapon = rng.pick(WEAPONS);
  const id = `GEN_${rank}_${rng.int(1000, 9999)}`;

  return {
    id,
    name: `${RANK_TITLE[rank]} de ${naturezaName} (${trait}, ${weapon})`,
    tier: rank,
    aiLevel: RANK_AI_LEVEL[rank],
    stats: applyNaturezaBias(anchor, naturezaId),
    generated: true,
  };
}

/** Atalho para `generateEnemy({ rank: 'MINI_BOSS', rng })` — capstone de Região sem boss autorado (D023 #3). */
export function generateMiniBoss({ rng }) {
  return generateEnemy({ rank: 'MINI_BOSS', rng });
}

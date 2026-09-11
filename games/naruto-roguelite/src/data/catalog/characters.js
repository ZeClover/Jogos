// Catálogo de Personagens (Versões) — Lote 01 (Vertical Slice), transcrito
// de docs/design/12_PERSONAGENS_VERTICAL_SLICE.md. Ver CANON_RULES.md #55:
// estas fichas são referência oficial, não devem ser simplificadas.
//
// Campos dados literalmente pelo doc: squadCost, rank, role, stats.hpMax,
// stats.chakraMax (+ stats.controleChakra da Sakura), exclusiveResource
// (id/nome/max), loadout.reacao (Kawarimi para os 4), evolutionNotes.
//
// `stats` além de HP/Chakra (e Controle de Chakra da Sakura) são uma
// distribuição provisória — o doc (nesta versão condensada) não dá os 12
// atributos primários completos por personagem. Ver DECISIONS.md D017: os
// valores aqui diferenciam os 4 Genin de forma consistente com seus papéis
// (`role`), mas são revisáveis no Marco 9 sem quebrar nada — combatentes
// são recriados a partir desta ficha, nunca hardcoded em outro lugar.
//
// `loadout.ativas`/`suprema` só contêm jutsus que já têm ficha real no
// catálogo. Os demais nomes que o doc 12 lista no loadout de cada
// personagem mas que não tinham ficha ficavam em `pendingAtivas`/
// `pendingSuprema` — descritivos, não IDs, para não inventar mecânica sem
// base (mesmo padrão do `assetBacklogP1` do Marco 0). O lote 03 de
// Jutsus (D032, `jutsus.js`) fechou essa pendência para os 4 Genin: todo
// nome que estava em `pendingAtivas`/`pendingSuprema` agora tem ficha
// real e mora em `ativas`/`suprema` — os campos `pending*` não aparecem
// mais em nenhum dos 4.

import { characters } from '../index.js';

export const CHARACTER_DEFINITIONS = [
  {
    id: 'CHAR_NARUTO_GENIN_001',
    baseCharacterId: 'NARUTO',
    name: 'Naruto Uzumaki',
    version: 'Genin',
    squadCost: 2,
    rank: 'C',
    role: ['Pressão', 'Dano', 'Setup'],
    stats: {
      hpMax: 128,
      chakraMax: 118,
      taijutsu: 32,
      ninjutsu: 38,
      defesaFisica: 18,
      defesaChakra: 16,
      velocidade: 22,
      precisao: 8,
    },
    exclusiveResource: { id: 'clones', name: 'Clones', max: 5 },
    passiveId: 'PASSIVE_CABECA_DURA_001',
    loadout: {
      ativas: ['JUT_KAGE_BUNSHIN_001', 'JUT_RASENGAN_001', 'JUT_COMBO_IMPROVISADO_001', 'JUT_BUNSHIN_FEINT_001'],
      reacao: 'JUT_KAWARIMI_001',
      suprema: 'JUT_UZUMAKI_NARUTO_RENDAN_001',
      passivas: ['PASSIVE_CABECA_DURA_001'],
    },
    evolutionNotes: 'Evoluções citadas no doc (clones / Rasengan / Chakra da Raposa / Vale do Fim) viram novas CharacterVersion em lotes futuros — não fabricadas aqui.',
  },
  {
    id: 'CHAR_SASUKE_GENIN_001',
    baseCharacterId: 'SASUKE',
    name: 'Sasuke Uchiha',
    version: 'Genin',
    squadCost: 2,
    rank: 'C',
    role: ['Burst', 'Precisão', 'Execução'],
    stats: {
      hpMax: 105,
      chakraMax: 102,
      taijutsu: 26,
      ninjutsu: 34,
      defesaFisica: 14,
      defesaChakra: 14,
      velocidade: 26,
      precisao: 14,
      critChance: 0.08,
    },
    loadout: {
      ativas: ['JUT_KATON_GOKAKYU_001', 'JUT_SHURIKEN_COMBO_001', 'JUT_WIRE_TRAP_001'],
      reacao: 'JUT_KAWARIMI_001',
      suprema: 'JUT_SHISHI_RENDAN_001',
      passivas: [],
    },
    evolutionNotes: 'Sharingan 1 Tomoe é uma transformação (não uma nova CharacterVersion) — sistema de transformações ainda não existe no motor; Raiton citado como natureza futura, sem ficha ainda.',
  },
  {
    id: 'CHAR_SAKURA_GENIN_001',
    baseCharacterId: 'SAKURA',
    name: 'Sakura Haruno',
    version: 'Genin',
    squadCost: 2,
    rank: 'C',
    role: ['Suporte', 'Controle de Chakra'],
    stats: {
      hpMax: 100,
      chakraMax: 108,
      controleChakra: 31,
      taijutsu: 14,
      ninjutsu: 16,
      defesaFisica: 12,
      defesaChakra: 14,
      velocidade: 16,
      precisao: 10,
      resistenciaMental: 16,
    },
    exclusiveResource: { id: 'foco', name: 'Foco', max: 3 },
    loadout: {
      ativas: ['JUT_KAI_001', 'JUT_FIRST_AID_001', 'JUT_CHAKRA_FOCUS_001', 'JUT_PRECISE_KUNAI_001'],
      reacao: 'JUT_KAWARIMI_001',
      suprema: 'JUT_INNER_SAKURA_001',
      passivas: [],
    },
    evolutionNotes: 'Evolução para Aprendiz Médica vira nova CharacterVersion em lote futuro.',
  },
  {
    id: 'CHAR_SHIKAMARU_GENIN_001',
    baseCharacterId: 'SHIKAMARU',
    name: 'Shikamaru Nara',
    version: 'Genin',
    squadCost: 2,
    rank: 'B',
    role: ['Controle', 'Planejamento'],
    stats: {
      hpMax: 98,
      chakraMax: 92,
      taijutsu: 10,
      ninjutsu: 20,
      defesaFisica: 12,
      defesaChakra: 14,
      velocidade: 10,
      precisao: 16,
      resistenciaMental: 18,
    },
    exclusiveResource: { id: 'planejamento', name: 'Planejamento', max: 5 },
    loadout: {
      ativas: ['JUT_KAGEMANE_001', 'JUT_SHADOW_SETUP_001', 'JUT_ANALYZE_SHIKAMARU_001', 'JUT_KUNAI_TRAP_001'],
      reacao: 'JUT_KAWARIMI_001',
      suprema: 'JUT_KAGE_MANE_COMPLETE_RESTRAINT_001',
      passivas: [],
    },
    evolutionNotes: 'Evolução para Chūnin vira nova CharacterVersion em lote futuro.',
  },
];

characters.registerAll(CHARACTER_DEFINITIONS);

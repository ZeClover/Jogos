// Catálogo de Jutsus — Lote 01 (Vertical Slice), transcrito de
// docs/design/13_JUTSUS_VERTICAL_SLICE.md. Ver CANON_RULES.md #55: estas
// fichas são referência oficial de profundidade/balanceamento inicial,
// não devem ser simplificadas.
//
// Campos consumidos pelo motor (src/engine/combat/jutsu.js + actions.js):
//   effect      DAMAGE (default) | HEAL | CLEANSE | ARM_REACTION | UTILITY
//   category    TAIJUTSU | NINJUTSU | GENJUTSU | DEFESA | ESPECIAL
//   range       MELEE | RANGED | AREA | ALLY | SELF
//   slot        ACTION_SLOTS.* — default PRINCIPAL se omitido
//   cost        Chakra (após desconto de eficiência do atacante)
//   power       dano (DAMAGE) ou cura (HEAL); ignorado por CLEANSE/ARM_REACTION
//   accuracy    0..1, default 0.9 no motor; HEAL só rola acerto se < 1
//   cooldown    rodadas de recarga após o cast (0 = sem cooldown)
//   ignoresGuard  true = ignora a guarda de Defender do alvo ("quebra guarda")
//   appliesStates [{ stateId, chance, stacks?, duration?, guaranteed? }]
//   tags        Tag IDs — natureza/estilo/efeito, também usados por Reações
//
// Simplificações desta versão (ver DECISIONS.md D016): sinergia com
// Clones (Rasengan, Uzumaki Naruto Rendan), bônus de Sharingan (Chidori),
// manutenção por rodada (Kagemane), geração de recurso exclusivo (Kage
// Bunshin=Clones, Analyze=Planejamento) e resolução multi-alvo de AoE
// (Gōkakyū) dependem de sistemas que chegam no Marco 4 (Personagens/
// Recursos) — os números de dano/custo/cooldown já são os finais do doc.

import { jutsus } from '../index.js';

export const JUTSU_DEFINITIONS = [
  {
    id: 'JUT_KAGE_BUNSHIN_001',
    name: 'Kage Bunshin',
    rank: 'B',
    category: 'NINJUTSU',
    tags: ['TAG_NINJUTSU_001', 'TAG_CLONE_001'],
    cost: 16,
    cooldown: 1,
    range: 'SELF',
    effect: 'UTILITY',
    note: 'Gera 2 clones (máx. 5) — recurso exclusivo "Clones" do Naruto, mecânica de posse/uso chega no Marco 4.',
  },
  {
    id: 'JUT_RASENGAN_001',
    name: 'Rasengan',
    rank: 'A',
    category: 'NINJUTSU',
    tags: ['TAG_NINJUTSU_001'],
    cost: 28,
    power: 65,
    accuracy: 0.88,
    range: 'MELEE',
    cooldown: 0,
    effect: 'DAMAGE',
    ignoresGuard: true,
    note: 'Sinergia de poder com número de Clones ativos deferida ao Marco 4 (recurso ainda não existe).',
  },
  {
    id: 'JUT_KATON_GOKAKYU_001',
    name: 'Katon: Gōkakyū no Jutsu',
    rank: 'C',
    category: 'NINJUTSU',
    tags: ['TAG_NINJUTSU_001', 'TAG_KATON_001'],
    cost: 18,
    power: 36,
    accuracy: 0.9,
    range: 'AREA',
    cooldown: 0,
    effect: 'DAMAGE',
    appliesStates: [{ stateId: 'STATUS_QUEIMANDO_001', chance: 0.55 }],
    note: 'AoE resolvido nesta versão como alvo único nomeado (ver DECISIONS.md D016) — atingir todos os inimigos ao mesmo tempo fica para quando houver necessidade real de resolução multi-alvo.',
  },
  {
    id: 'JUT_CHIDORI_001',
    name: 'Chidori',
    rank: 'A',
    category: 'NINJUTSU',
    tags: ['TAG_NINJUTSU_001', 'TAG_RAITON_001', 'TAG_PERFURACAO_001', 'TAG_EXECUCAO_001'],
    cost: 34,
    power: 72,
    accuracy: 0.8,
    range: 'MELEE',
    cooldown: 0,
    effect: 'DAMAGE',
    note: 'Accuracy sobe a 95% com Sharingan ativo no canon — Sharingan é uma transformação de personagem (Marco 4), não um Estado de combate; fica em 80% fixo por enquanto.',
  },
  {
    id: 'JUT_KAGEMANE_001',
    name: 'Kagemane no Jutsu',
    rank: 'C',
    category: 'NINJUTSU',
    tags: ['TAG_NINJUTSU_001'],
    cost: 14,
    power: 0,
    accuracy: 0.85,
    range: 'RANGED',
    cooldown: 0,
    effect: 'DAMAGE',
    appliesStates: [{ stateId: 'STATUS_IMOBILIZADO_001', chance: 0.9 }],
    note: 'Manutenção de 5 Chakra/rodada para manter o alvo Imobilizado não implementada — nesta versão o custo é só o de conjuração; Imobilizado expira pela duração normal do Estado (base 2 rodadas).',
  },
  {
    id: 'JUT_KAWARIMI_001',
    name: 'Kawarimi no Jutsu',
    rank: 'E',
    category: 'DEFESA',
    tags: ['TAG_NINJUTSU_001'],
    cost: 10,
    range: 'SELF',
    slot: 'REACAO',
    cooldown: 0,
    effect: 'ARM_REACTION',
    note: 'Arma uma esquiva que consome o próximo golpe single-target elegível (ver effects.js#tryEvadeWithReaction) — falha contra AoE, ataques inevitáveis e enquanto o próprio usuário está Imobilizado.',
  },
  {
    id: 'JUT_UZUMAKI_NARUTO_RENDAN_001',
    name: 'Uzumaki Naruto Rendan',
    rank: 'B',
    category: 'TAIJUTSU',
    tags: ['TAG_TAIJUTSU_001', 'TAG_IMPACTO_001'],
    cost: 12,
    power: 58,
    accuracy: 0.9,
    range: 'MELEE',
    cooldown: 4,
    effect: 'DAMAGE',
    note: 'Custo canônico inclui "+2 Clones" — exigência de recurso Clones deferida ao Marco 4; por ora só cobra o Chakra.',
  },
  {
    id: 'JUT_SHISHI_RENDAN_001',
    name: 'Shishi Rendan',
    rank: 'C',
    category: 'TAIJUTSU',
    tags: ['TAG_TAIJUTSU_001', 'TAG_IMPACTO_001'],
    cost: 10,
    power: 55,
    accuracy: 0.9,
    range: 'MELEE',
    cooldown: 4,
    effect: 'DAMAGE',
  },
  {
    id: 'JUT_KAI_001',
    name: 'Kai',
    rank: 'D',
    category: 'ESPECIAL',
    tags: ['TAG_NINJUTSU_001'],
    cost: 8,
    range: 'ALLY',
    cooldown: 0,
    effect: 'CLEANSE',
    note: 'Remove Estados com remoção "CURA" (ex: Selado, Genjutsu) do alvo — inclui a si mesmo (range ALLY cobre o próprio ator).',
  },
  {
    id: 'JUT_FIRST_AID_001',
    name: 'First Aid',
    rank: 'E',
    category: 'NINJUTSU',
    tags: ['TAG_NINJUTSU_001'],
    cost: 5,
    power: 14,
    range: 'ALLY',
    cooldown: 2,
    effect: 'HEAL',
  },
  {
    id: 'JUT_SHADOW_SETUP_001',
    name: 'Shadow Setup',
    rank: 'D',
    category: 'NINJUTSU',
    tags: ['TAG_NINJUTSU_001'],
    cost: 7,
    range: 'SELF',
    cooldown: 0,
    effect: 'UTILITY',
    appliesStates: [{ stateId: 'STATUS_FOCADO_001', guaranteed: true, duration: 2 }],
    note: '"Melhora o Kagemane por 2 rounds" modelado como Focado (Estado de Buff já catalogado) em si mesmo — o bônus concreto ao próximo Kagemane fica para quando houver um hook de sinergia entre jutsus específicos.',
  },
  {
    id: 'JUT_ANALYZE_SHIKAMARU_001',
    name: 'Analyze',
    rank: 'E',
    category: 'ESPECIAL',
    tags: [],
    cost: 0,
    range: 'SELF',
    cooldown: 0,
    effect: 'UTILITY',
    special: true,
    note: '"Revela informação e gera Planejamento" — Arquivo Ninja (Marco 7+) e recurso "Planejamento" do Shikamaru (Marco 4) ainda não existem; cataloga a ficha com custo/slot corretos sem efeito mecânico extra por enquanto.',
  },
];

jutsus.registerAll(JUTSU_DEFINITIONS);

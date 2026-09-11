// Catálogo de Itens — Lote 01 (Marco 10, D025) + Lote 04 (Marco 10, D029).
// docs/design/03_ITENS_EQUIPAMENTOS_ECONOMIA.md.
//
// Lote 01 — CONSUMIVEL/FERRAMENTA (D025): os 6 Content IDs abaixo já
// existiam como entradas P0 do Asset Manifest desde o Marco 0
// (`src/content/asset_manifest.js`) — esse lote só formalizou a ficha
// mecânica deles, sem inventar nomes novos. Uso único em combate via
// `ACTION_TYPES.ITEM`; desde D028 também têm `price` em Ryō e podem ser
// comprados no nó LOJA.
//
// Lote 04 + 05 — ARMA (D029/D031): as 9 "Armas Lendárias" citadas
// literalmente no doc 03 por inteiro ("Samehada, Kubikiribōchō, Kiba,
// Hiramekarei, Nuibari, Kabutowari, Shibuki, Kusanagi, Gunbai") — nomes
// reais do doc, não inventados, mas SEM entrada no Asset Manifest
// (diferente do Lote 01), então os Content IDs aqui são novos (mesmo
// padrão de D016/D018 autorando Jutsus novos sem depender do Manifest).
// O doc diz que Armas Lendárias "mudam estilo" — este lote implementa só
// um bônus/penalidade fixo de atributo (`statBonus`), sem jutsu/mecânica
// nova; "mudar estilo" de verdade fica pra quando houver base de design
// mais detalhada. Equipamento é persistente (não se gasta), escolhido
// antes da Run (ver `src/ui/run.js`) — CORPO/ACESSORIO ficam de fora
// deste lote por não terem nenhum nome citado no doc (D029 #1).
//
// Campos consumidos pelo motor:
//   Itens de combate (`actions.js#handleItem`):
//     effect      DAMAGE | HEAL | RESTORE_CHAKRA | CLEANSE | UTILITY
//     category    TAIJUTSU | NINJUTSU (usado só por DAMAGE, mesmo mapeamento de defesa dos Jutsus)
//     range       MELEE | RANGED | AREA | ALLY | SELF
//     power       dano (DAMAGE) ou quantidade restaurada (HEAL/RESTORE_CHAKRA)
//     appliesStates [{ stateId, chance, duration?, guaranteed? }]
//     price       custo em Ryō no nó LOJA (Marco 10, D028) — provisório
//   Equipamento (`combat/equipment.js#applyEquipmentBonuses`):
//     statBonus   [{ attribute, amount }] — soma direta no bloco de atributos ao equipar
import { items } from '../index.js';

export const ITEM_DEFINITIONS = [
  {
    id: 'ITEM_KUNAI_BASIC_001',
    name: 'Kunai',
    category: 'FERRAMENTA',
    tags: ['TAG_TAIJUTSU_001', 'TAG_PERFURACAO_001'],
    effect: 'DAMAGE',
    combatCategory: 'TAIJUTSU',
    power: 15,
    accuracy: 0.9,
    range: 'RANGED',
    price: 15,
  },
  {
    id: 'ITEM_SHURIKEN_BASIC_001',
    name: 'Shuriken',
    category: 'FERRAMENTA',
    tags: ['TAG_TAIJUTSU_001', 'TAG_PERFURACAO_001'],
    effect: 'DAMAGE',
    combatCategory: 'TAIJUTSU',
    power: 12,
    accuracy: 0.92,
    range: 'RANGED',
    price: 10,
  },
  {
    id: 'ITEM_SMOKE_BOMB_001',
    name: 'Bomba de Fumaça',
    category: 'FERRAMENTA',
    tags: [],
    effect: 'UTILITY',
    range: 'SELF',
    appliesStates: [{ stateId: 'STATUS_OCULTO_001', guaranteed: true, duration: 2 }],
    note: 'Cobre o usuário de fumaça — fica Oculto por 2 rodadas, mesmo Estado do Kirigakure no Jutsu (Marco 5).',
    price: 18,
  },
  {
    id: 'ITEM_EXPLOSIVE_TAG_001',
    name: 'Selo Explosivo',
    category: 'FERRAMENTA',
    tags: ['TAG_NINJUTSU_001', 'TAG_IMPACTO_001'],
    effect: 'DAMAGE',
    combatCategory: 'NINJUTSU',
    power: 26,
    accuracy: 0.85,
    range: 'RANGED',
    price: 32,
  },
  {
    id: 'ITEM_SOLDIER_PILL_001',
    name: 'Pílula do Soldado',
    category: 'CONSUMIVEL',
    tags: [],
    effect: 'RESTORE_CHAKRA',
    power: 30,
    range: 'ALLY',
    note: 'Restaura Chakra — canonicamente uma pílula militar ninja de emergência.',
    price: 28,
  },
  {
    id: 'ITEM_ANTIDOTE_001',
    name: 'Antídoto',
    category: 'CONSUMIVEL',
    tags: [],
    effect: 'CLEANSE',
    range: 'ALLY',
    note: 'Remove Estados com remoção "CURA" do alvo — mesmo efeito de Kai (Marco 3), sem custo de Chakra.',
    price: 22,
  },
  {
    id: 'ITEM_KUBIKIRIBOCHO_001',
    name: 'Kubikiribōchō',
    category: 'ARMA',
    tags: [],
    statBonus: [
      { attribute: 'taijutsu', amount: 12 },
      { attribute: 'velocidade', amount: -3 },
    ],
    note: 'Arma Lendária citada no doc 03 — o zanbatō de Zabuza Momochi. Lâmina pesada: +Taijutsu, -Velocidade. Provisório (D029).',
  },
  {
    id: 'ITEM_KUSANAGI_001',
    name: 'Kusanagi',
    category: 'ARMA',
    tags: [],
    statBonus: [
      { attribute: 'velocidade', amount: 8 },
      { attribute: 'defesaFisica', amount: -4 },
    ],
    note: 'Arma Lendária citada no doc 03. Lâmina leve e precisa: +Velocidade, -Defesa Física (menos guarda, mais agilidade). Provisório (D029).',
  },
  {
    id: 'ITEM_SAMEHADA_001',
    name: 'Samehada',
    category: 'ARMA',
    tags: [],
    statBonus: [
      { attribute: 'ninjutsu', amount: 10 },
      { attribute: 'defesaChakra', amount: -6 },
    ],
    note: 'Arma Lendária citada no doc 03 — a espada devoradora de Chakra. +Ninjutsu, -Defesa de Chakra (arriscado depender dela). Provisório (D029).',
  },
  {
    id: 'ITEM_GUNBAI_001',
    name: 'Gunbai',
    category: 'ARMA',
    tags: [],
    statBonus: [
      { attribute: 'defesaFisica', amount: 8 },
      { attribute: 'velocidade', amount: -4 },
    ],
    note: 'Arma Lendária citada no doc 03 — o leque de guerra. Pesado e defensivo: +Defesa Física, -Velocidade. Provisório (D029).',
  },
  {
    id: 'ITEM_KIBA_001',
    name: 'Kiba',
    category: 'ARMA',
    tags: [],
    statBonus: [
      { attribute: 'velocidade', amount: 10 },
      { attribute: 'defesaChakra', amount: -5 },
    ],
    note: 'Arma Lendária citada no doc 03 — as presas gêmeas do estilo Inuzuka. Golpes rápidos e ferozes: +Velocidade, -Defesa de Chakra (sem guarda pra Ninjutsu). Provisório (D031).',
  },
  {
    id: 'ITEM_HIRAMEKAREI_001',
    name: 'Hiramekarei',
    category: 'ARMA',
    tags: [],
    statBonus: [
      { attribute: 'defesaFisica', amount: 10 },
      { attribute: 'velocidade', amount: -5 },
    ],
    note: 'Arma Lendária citada no doc 03 — a espada-escudo dos Sete Espadachins da Névoa. Postura defensiva pesada: +Defesa Física, -Velocidade. Provisório (D031).',
  },
  {
    id: 'ITEM_NUIBARI_001',
    name: 'Nuibari',
    category: 'ARMA',
    tags: [],
    statBonus: [
      { attribute: 'precisao', amount: 8 },
      { attribute: 'evasao', amount: -4 },
    ],
    note: 'Arma Lendária citada no doc 03 — a "agulha de costura", precisa e metódica: +Precisão, -Evasão (pouca mobilidade ao mirar). Provisório (D031).',
  },
  {
    id: 'ITEM_KABUTOWARI_001',
    name: 'Kabutowari',
    category: 'ARMA',
    tags: [],
    statBonus: [
      { attribute: 'taijutsu', amount: 14 },
      { attribute: 'precisao', amount: -5 },
    ],
    note: 'Arma Lendária citada no doc 03 — machado-espada pesado dos Sete Espadachins da Névoa. Golpes brutos: +Taijutsu, -Precisão (imprecisão em golpes tão largos). Provisório (D031).',
  },
  {
    id: 'ITEM_SHIBUKI_001',
    name: 'Shibuki',
    category: 'ARMA',
    tags: [],
    statBonus: [
      { attribute: 'genjutsu', amount: 10 },
      { attribute: 'defesaFisica', amount: -5 },
    ],
    note: 'Arma Lendária citada no doc 03 — lâmina fina associada a técnicas ilusórias: +Genjutsu, -Defesa Física (fina demais pra aguentar impacto direto). Provisório (D031).',
  },
];

items.registerAll(ITEM_DEFINITIONS);

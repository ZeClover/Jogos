// Catálogo de Itens — Lote 01 (Marco 10, docs/design/03_ITENS_EQUIPAMENTOS_
// ECONOMIA.md). Os 6 Content IDs abaixo já existiam como entradas P0 do
// Asset Manifest desde o Marco 0 (`src/content/asset_manifest.js`) — este
// lote só formaliza a ficha mecânica deles, sem inventar nomes novos.
//
// Escopo deste lote (ver DECISIONS.md D025): só itens CONSUMIVEL/
// FERRAMENTA de uso único em combate via `ACTION_TYPES.ITEM`. Todo
// Personagem ainda carrega o kit fixo inicial (`characterBridge.js`),
// mas desde o Marco 10 (lote 3, D028) esses mesmos itens também têm um
// `price` em Ryō e podem ser comprados no nó LOJA para reabastecer o
// esquadrão no meio de uma Run — ver `src/engine/run/economy.js`.
// Equipamento persistente (ARMA/CORPO/ACESSORIO recalculando atributos)
// fica para quando houver um sistema de loadout/equipar de verdade.
//
// Campos consumidos pelo motor (`src/engine/combat/actions.js#handleItem`):
//   effect      DAMAGE | HEAL | RESTORE_CHAKRA | CLEANSE | UTILITY
//   category    TAIJUTSU | NINJUTSU (usado só por DAMAGE, mesmo mapeamento de defesa dos Jutsus)
//   range       MELEE | RANGED | AREA | ALLY | SELF
//   power       dano (DAMAGE) ou quantidade restaurada (HEAL/RESTORE_CHAKRA)
//   appliesStates [{ stateId, chance, duration?, guaranteed? }]
//   price       custo em Ryō no nó LOJA (Marco 10, D028) — provisório
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
];

items.registerAll(ITEM_DEFINITIONS);

// Economia da Run (Marco 10, docs/design/03_ITENS_EQUIPAMENTOS_ECONOMIA.md
// — "Build = personagem + jutsu + passiva + equipamento + ferramenta +
// consumível" e "economia da Run (Ryō) separada de Economia Permanente
// (Legado/Tickets/Fragmentos)"). Ganho de Ryō por resultado de missão
// (D027) + gasto no nó LOJA (D028) — mesmo espírito de mastery.js/
// reputation.js (funções puras, planas, sobre dado serializável de
// runState.js). Equipamento persistente continua fora de escopo — só
// Itens CONSUMIVEL/FERRAMENTA (D025) podem ser comprados por ora.
import { MISSION_RESULTS } from '../enums.js';

const RYO_PER_MISSION_RESULT = {
  [MISSION_RESULTS.SUCESSO_PERFEITO]: 40,
  [MISSION_RESULTS.SUCESSO]: 25,
  [MISSION_RESULTS.SUCESSO_PARCIAL]: 12,
  [MISSION_RESULTS.FALHA]: 5,
  [MISSION_RESULTS.DESASTRE]: 0,
};

/** Ryō concedido por um resultado de missão (MISSION_RESULTS). Número provisório, mesmo espírito de D012/D017/D020/D022. */
export function ryoForMissionResult(result) {
  return RYO_PER_MISSION_RESULT[result] ?? 0;
}

/** Soma o Ryō de todos os nós de uma Crônica (`run.chronicle`, runState.js). */
export function ryoForChronicle(chronicle) {
  return chronicle.reduce((sum, entry) => sum + ryoForMissionResult(entry.result), 0);
}

/** Confere se `run.ryo` cobre `price` (nó LOJA, Marco 10, D028). */
export function canAfford(run, price) {
  return run.ryo >= price;
}

/**
 * Compra 1 unidade de `itemId` para `characterId` (nó LOJA, D028): deduz
 * `price` de `run.ryo` e soma 1 em `run.purchasedInventory[characterId]
 * [itemId]` — um "bônus de inventário" separado do kit fixo
 * (`DEFAULT_STARTING_KIT`, D025 #4), aplicado por cima dele ao montar o
 * Combatente pra cada combate seguinte da mesma Run
 * (`createCombatantFromCharacter`'s `extraInventory`). Devolve `false`
 * sem mudar nada se `run.ryo` não cobrir o preço.
 */
export function buyItem(run, characterId, itemId, price) {
  if (!canAfford(run, price)) return false;
  run.ryo -= price;
  const charInventory = run.purchasedInventory[characterId] ?? {};
  charInventory[itemId] = (charInventory[itemId] ?? 0) + 1;
  run.purchasedInventory[characterId] = charInventory;
  return true;
}

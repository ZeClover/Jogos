// Economia da Run (Marco 10, docs/design/03_ITENS_EQUIPAMENTOS_ECONOMIA.md
// — "Build = personagem + jutsu + passiva + equipamento + ferramenta +
// consumível" e "economia da Run (Ryō) separada de Economia Permanente
// (Legado/Tickets/Fragmentos)"). Este módulo só cobre o GANHO de Ryō por
// resultado de missão — mesmo espírito de mastery.js/reputation.js
// (função pura, plana, serializável). Gastar Ryō (loja/nó LOJA,
// comprar Itens/Equipamento) fica fora de escopo deste lote — ver
// DECISIONS.md D027, mesmo padrão de D025 #6 (Itens sem Economia).
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

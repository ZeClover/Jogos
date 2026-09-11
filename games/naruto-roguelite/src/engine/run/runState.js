// Estado de uma Run (Marco 7) — a mesma jornada do Vertical Slice
// (D019/Marco 6) modelada de verdade como grafo de nós gerado por seed,
// com resultado graduado por missão e uma Crônica por dia (CANON_RULES —
// Run/Campanha: "sempre saveável"; Narrativa: "Crônica da run registra
// decisões por dia"). NÃO conhece squad/combate diretamente — quem chama
// (UI) monta os combatentes e devolve o resultado; runState só guarda o
// progresso pelo mapa e a crônica. Serializável em JSON puro (nenhum
// Map/Set/classe) para o SaveManager (Marco 0) salvar/carregar sem
// adaptação.
import { generateRegionMap, findNode } from './mapGenerator.js';
import { RUN_STATUSES } from '../enums.js';

export { findNode };

/**
 * @param {object} params
 * @param {object} params.region - ficha de src/data/catalog/regions.js.
 * @param {import('../seed.js').SeedManager} params.seedManager
 */
export function createRun({ region, seedManager }) {
  const map = generateRegionMap({ region, rng: seedManager.map });
  return {
    seed: seedManager.masterSeed,
    regionId: region.id,
    map,
    day: 1,
    currentNodeIds: map.startNodeIds,
    visitedNodeIds: [],
    chronicle: [],
    status: RUN_STATUSES.IN_PROGRESS,
  };
}

/** Nós disponíveis para o jogador escolher agora. */
export function availableNodes(run) {
  return run.currentNodeIds.map((id) => findNode(run.map, id)).filter(Boolean);
}

export function addChronicleEntry(run, entry) {
  run.chronicle.push({ day: run.day, ...entry });
}

/**
 * Resolve `node` como concluído (missão vencida/perdida ou descanso
 * feito) e avança a Run: soma 1 dia no calendário (CANON_RULES — "o
 * calendário avança com missões, descanso e viagem"), registra a
 * Crônica, e decide o próximo passo — vitória (nó Boss vencido), derrota
 * (resultado DESASTRE) ou os próximos `currentNodeIds` disponíveis.
 * @param {object} run
 * @param {object} node
 * @param {string} result - um MISSION_RESULTS, ou `'DESCANSO'` para nó de descanso.
 */
export function resolveNode(run, node, result) {
  run.day += 1;
  run.visitedNodeIds.push(node.id);
  addChronicleEntry(run, {
    nodeId: node.id, nodeName: node.name, nodeType: node.type, result,
  });

  if (result === 'DESASTRE') {
    run.status = RUN_STATUSES.DEFEAT;
    return run;
  }
  if (node.isBoss) {
    run.status = RUN_STATUSES.VICTORY;
    return run;
  }
  run.currentNodeIds = node.connectsTo ?? [];
  return run;
}

/** "Pedir reforço" (D020): custa 1 dia extra de calendário, sem resolver o nó. */
export function spendReinforceDay(run) {
  run.day += 1;
}

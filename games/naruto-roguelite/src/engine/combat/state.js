// CombatState: laço de rodadas do Combate Mínimo + Effect Engine. Motor
// "pull-based" — quem está no controle (UI, IA, teste) chama applyAction()
// para o ator da vez; o estado não avança sozinho. Isso serve tanto para
// um jogador humano quanto para a IA (Marco 5) sem duplicar lógica de loop.

import { isAlive } from './combatant.js';
import { computeTurnOrder } from './turnOrder.js';
import { resolveAction } from './actions.js';
import { tickStates } from './effects.js';
import { tickCooldowns } from './jutsu.js';
import { ACTION_BUDGET_PER_ROUND } from '../enums.js';

export class CombatState {
  /**
   * @param {object} params
   * @param {object[]} params.teamA - combatentes (ver createCombatant()).
   * @param {object[]} params.teamB
   * @param {import('../seed.js').SeedManager} params.seedManager
   * @param {Map} [params.statusCatalog] - id -> definição de Estado (src/data/catalog/statuses.js).
   *   Sem isso, Estados ainda podem ser tickados (duração) mas sem dano contínuo.
   * @param {object[]} [params.reactionCatalog] - definições de Reação (src/data/catalog/reactions.js).
   * @param {Map} [params.jutsuCatalog] - id -> ficha de Jutsu (src/data/catalog/jutsus.js).
   *   Sem isso, ações JUTSU com `jutsuId` são rejeitadas com UNKNOWN_JUTSU.
   * @param {Map} [params.itemCatalog] - id -> ficha de Item (src/data/catalog/items.js, Marco 10).
   *   Sem isso, ações ITEM são rejeitadas com UNKNOWN_ITEM.
   */
  constructor({
    teamA, teamB, seedManager, statusCatalog = new Map(), reactionCatalog = [], jutsuCatalog = new Map(), itemCatalog = new Map(),
  }) {
    if (!teamA?.length || !teamB?.length) {
      throw new Error('CombatState: teamA e teamB precisam ter ao menos 1 combatente');
    }
    this.combatants = new Map([...teamA, ...teamB].map((c) => [c.id, c]));
    this.teamAIds = teamA.map((c) => c.id);
    this.teamBIds = teamB.map((c) => c.id);
    this.rng = seedManager.combat;
    this.statusCatalog = statusCatalog;
    this.reactionCatalog = reactionCatalog;
    this.jutsuCatalog = jutsuCatalog;
    this.itemCatalog = itemCatalog;
    this.round = 0;
    this.turnOrder = [];
    this.turnIndex = 0;
    this.log = [];
    this._startRound();
  }

  /** IDs do time (A ou B) ao qual `combatantId` pertence — inclui o próprio. */
  sideIds(combatantId) {
    return this.teamAIds.includes(combatantId) ? this.teamAIds : this.teamBIds;
  }

  /** Combatentes do mesmo lado de `combatantId`, excluindo ele mesmo (aliados). */
  allies(combatantId) {
    return this.sideIds(combatantId)
      .filter((id) => id !== combatantId)
      .map((id) => this.combatants.get(id));
  }

  /** IDs do time OPOSTO ao de `combatantId` — usado por IA (ai.js, Marco 5) para achar alvos. */
  enemySideIds(combatantId) {
    return this.teamAIds.includes(combatantId) ? this.teamBIds : this.teamAIds;
  }

  _aliveIn(ids) {
    return ids.some((id) => isAlive(this.combatants.get(id)));
  }

  isCombatOver() {
    return !this._aliveIn(this.teamAIds) || !this._aliveIn(this.teamBIds);
  }

  /** 'A' | 'B' | null (combate ainda não acabou). */
  winner() {
    if (!this.isCombatOver()) return null;
    return this._aliveIn(this.teamAIds) ? 'A' : 'B';
  }

  currentActorId() {
    while (
      this.turnIndex < this.turnOrder.length
      && !isAlive(this.turnOrder[this.turnIndex])
    ) {
      this.turnIndex += 1;
    }
    return this.turnOrder[this.turnIndex]?.id ?? null;
  }

  isRoundOver() {
    return this.currentActorId() === null;
  }

  /**
   * Aplica `action` como ator `actorId`. Lança erro para chamadas
   * estruturalmente inválidas (combate acabado, não é a vez do ator) —
   * essas são erros de uso do motor, não resultados de jogo. Falhas de
   * jogo (Chakra insuficiente, fora de alcance...) voltam em
   * `result.applied === false`, sem exceção.
   */
  applyAction(actorId, action) {
    if (this.isCombatOver()) throw new Error('CombatState: o combate já terminou');
    if (this.currentActorId() !== actorId) {
      throw new Error(`CombatState: não é o turno de "${actorId}" (vez de "${this.currentActorId()}")`);
    }

    const actor = this.combatants.get(actorId);
    const result = resolveAction(this, actor, action);
    this._log({
      type: 'ACTION', round: this.round, actorId, action, result,
    });

    if (result.applied) this._advance();
    return result;
  }

  _advance() {
    this.turnIndex += 1;
    if (this.isCombatOver()) {
      this._log({ type: 'COMBAT_END', round: this.round, winner: this.winner() });
      return;
    }
    if (this.isRoundOver()) this._startRound();
  }

  _startRound() {
    if (this.round > 0) {
      this._endRound();
      // Dano contínuo de Estados (ex: Queimando) pode decidir o combate
      // no fim da rodada, antes de qualquer novo turno — não inicie uma
      // rodada nova nesse caso.
      if (this.isCombatOver()) {
        this.turnOrder = [];
        this.turnIndex = 0;
        this._log({ type: 'COMBAT_END', round: this.round, winner: this.winner() });
        return;
      }
    }
    this.round += 1;

    for (const c of this.combatants.values()) {
      if (!isAlive(c)) continue;
      c.guard = 0;
      c.actionBudget = { ...ACTION_BUDGET_PER_ROUND };
    }

    const aliveCombatants = [...this.combatants.values()].filter(isAlive);
    this.turnOrder = computeTurnOrder(aliveCombatants, this.rng);
    this.turnIndex = 0;

    this._log({
      type: 'ROUND_START', round: this.round, order: this.turnOrder.map((c) => c.id),
    });
  }

  _endRound() {
    for (const c of this.combatants.values()) {
      if (!isAlive(c)) continue;
      if (c.attributes.regenChakra) {
        c.chakra = Math.min(c.attributes.chakraMax, c.chakra + c.attributes.regenChakra);
      }
      const stateEvents = tickStates(c, this.statusCatalog);
      for (const event of stateEvents) this._log({ round: this.round, ...event });
      tickCooldowns(c);
    }
    this._log({ type: 'ROUND_END', round: this.round });
  }

  _log(event) {
    this.log.push(event);
  }
}

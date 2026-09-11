// Combatente: instância em combate de um personagem/inimigo. Não confundir
// com a ficha de conteúdo (CHAR_.../ENEMY_...) — essa entra no Marco 4/5;
// aqui só existe o suficiente para o Combate Mínimo + Effect Engine
// rodarem (HP, Chakra, posição, orçamento de ações, guarda, Estados
// ativos).

import { POSITIONS, ACTION_BUDGET_PER_ROUND } from '../enums.js';

/**
 * @param {object} params
 * @param {string} params.id - identificador único dentro do combate (pode ou não ser um Content ID formal).
 * @param {string} [params.name]
 * @param {string} [params.position] - POSITIONS.FRENTE/CENTRO/TRAS (default CENTRO).
 * @param {object} params.attributes - ver attributes.js (createAttributes()).
 */
export function createCombatant({
  id, name = id, position = POSITIONS.CENTRO, attributes,
}) {
  if (!id) throw new Error('createCombatant: "id" é obrigatório');
  if (!attributes) throw new Error('createCombatant: "attributes" é obrigatório');
  if (!Object.values(POSITIONS).includes(position)) {
    throw new Error(`createCombatant: posição inválida "${position}"`);
  }

  return {
    id,
    name,
    position,
    attributes,
    hp: attributes.hpMax,
    chakra: attributes.chakraMax,
    guard: 0,
    actionBudget: { ...ACTION_BUDGET_PER_ROUND },
    states: [],
    controlApplications: new Map(),
    cooldowns: new Map(),
    pendingReaction: null,
  };
}

export function isAlive(combatant) {
  return combatant.hp > 0;
}

export function applyDamage(combatant, amount) {
  combatant.hp = Math.max(0, combatant.hp - Math.max(0, amount));
  return combatant.hp;
}

export function applyHeal(combatant, amount) {
  combatant.hp = Math.min(combatant.attributes.hpMax, combatant.hp + Math.max(0, amount));
  return combatant.hp;
}

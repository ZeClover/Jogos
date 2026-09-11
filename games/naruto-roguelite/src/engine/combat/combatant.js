// Combatente: instância em combate de um personagem/inimigo. Não confundir
// com a ficha de conteúdo (CHAR_.../ENEMY_...) — essa é dado (Marco 4,
// src/data/catalog/characters.js) que vira Combatente via characterBridge.js;
// aqui só existe o suficiente para o Combate Mínimo + Effect Engine + Jutsus
// + Recursos Exclusivos rodarem (HP, Chakra, posição, orçamento de ações,
// guarda, Estados ativos, cooldowns, reação armada, recurso exclusivo).

import { POSITIONS, ACTION_BUDGET_PER_ROUND } from '../enums.js';

/**
 * @param {object} params
 * @param {string} params.id - identificador único dentro do combate (pode ou não ser um Content ID formal).
 * @param {string} [params.name]
 * @param {string} [params.position] - POSITIONS.FRENTE/CENTRO/TRAS (default CENTRO).
 * @param {object} params.attributes - ver attributes.js (createAttributes()).
 * @param {{ id: string, name?: string, max: number, current?: number }} [params.resource] -
 *   recurso exclusivo do personagem (ex: Clones do Naruto — CANON_RULES
 *   #Personagens). `current` default 0 (a maioria dos recursos se constrói
 *   durante a luta, não começa cheio — ver DECISIONS.md D017).
 * @param {Record<string, number>} [params.inventory] - quantidade de cada
 *   Item (Marco 10, `ITEM_*`) que o combatente carrega — `{ [itemId]: quantidade }`.
 *   Sem loja/loot ainda (D025), é só o "kit ninja" inicial do personagem.
 */
export function createCombatant({
  id, name = id, position = POSITIONS.CENTRO, attributes, resource = null, inventory = {},
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
    resource: resource ? { current: 0, ...resource } : null,
    inventory: { ...inventory },
  };
}

/** Confere se o combatente ainda tem ao menos 1 unidade de `itemId`. */
export function hasItem(combatant, itemId) {
  return (combatant.inventory[itemId] ?? 0) > 0;
}

/** Consome 1 unidade de `itemId`. Devolve se conseguiu (false se não tinha nenhuma). */
export function consumeItem(combatant, itemId) {
  if (!hasItem(combatant, itemId)) return false;
  combatant.inventory[itemId] -= 1;
  return true;
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

/** Ganha `amount` do recurso exclusivo do combatente, sem passar de `max`. No-op se não tiver recurso. */
export function gainResource(combatant, amount) {
  if (!combatant.resource) return 0;
  combatant.resource.current = Math.min(combatant.resource.max, combatant.resource.current + Math.max(0, amount));
  return combatant.resource.current;
}

/** Gasta `amount` do recurso exclusivo se houver o suficiente. Devolve se conseguiu gastar. */
export function spendResource(combatant, amount) {
  if (!combatant.resource || combatant.resource.current < amount) return false;
  combatant.resource.current -= amount;
  return true;
}

// Ponte entre fichas de Personagem (dado, src/data/catalog/characters.js)
// e o Combatente de runtime (combatant.js). Simétrico a jutsu.js — o
// combate não conhece "CharacterVersion", só sabe montar um Combatante a
// partir de atributos/recurso.

import { createAttributes } from './attributes.js';
import { createCombatant } from './combatant.js';

/** @typedef {import('../types.js').CharacterVersion} CharacterVersion */

// Kit ninja padrão (Marco 10) — todo Personagem carrega isso ao entrar em
// combate. Sem Economia/loja/loadout de itens ainda (D025), é um kit fixo
// igual para todos, não uma escolha do jogador nem algo comprado/achado.
const DEFAULT_STARTING_KIT = Object.freeze({
  ITEM_KUNAI_BASIC_001: 2,
  ITEM_SMOKE_BOMB_001: 1,
  ITEM_SOLDIER_PILL_001: 1,
  ITEM_ANTIDOTE_001: 1,
});

/**
 * Cria um Combatente a partir de uma ficha de Personagem.
 * @param {CharacterVersion} characterDef
 * @param {object} [options]
 * @param {string} [options.id] - id do combatente em combate (default: o próprio characterDef.id).
 * @param {string} [options.position] - POSITIONS.* (default CENTRO, ver combatant.js).
 * @param {Record<string, number>} [options.extraInventory] - itens comprados no nó LOJA
 *   desta Run (Marco 10, D028, `run.purchasedInventory[characterId]`), somados por cima do kit fixo.
 */
export function createCombatantFromCharacter(characterDef, { id, position, extraInventory } = {}) {
  const inventory = { ...DEFAULT_STARTING_KIT };
  for (const [itemId, qty] of Object.entries(extraInventory ?? {})) {
    inventory[itemId] = (inventory[itemId] ?? 0) + qty;
  }
  return createCombatant({
    id: id ?? characterDef.id,
    name: characterDef.name,
    position,
    attributes: createAttributes(characterDef.stats),
    resource: characterDef.exclusiveResource
      ? {
        id: characterDef.exclusiveResource.id,
        name: characterDef.exclusiveResource.name,
        max: characterDef.exclusiveResource.max,
      }
      : null,
    inventory,
  });
}

/** Soma o Custo de Esquadrão de uma lista de fichas de Personagem (CANON_RULES #Personagens). */
export function computeSquadCost(characterDefs) {
  return characterDefs.reduce((total, def) => total + def.squadCost, 0);
}

/** Confere se a lista de fichas cabe no orçamento (padrão 12, CANON_RULES #18). */
export function isSquadWithinBudget(characterDefs, budget = 12) {
  return computeSquadCost(characterDefs) <= budget;
}

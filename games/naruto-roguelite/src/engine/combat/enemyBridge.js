// Ponte entre fichas de Inimigo/Boss (dado, src/data/catalog/enemies.js e
// bosses.js) e o Combatente de runtime — simétrico a characterBridge.js.
// O combate não conhece "Enemy"/"Boss", só sabe montar um Combatante a
// partir de atributos.

import { createAttributes } from './attributes.js';
import { createCombatant } from './combatant.js';

/** @typedef {import('../types.js').Enemy} Enemy */
/** @typedef {import('../types.js').Boss} Boss */

/**
 * Cria um Combatente a partir de uma ficha de Inimigo ou Boss (ambas têm
 * `id`/`name`/`stats`, então a mesma função serve para as duas).
 * @param {Enemy|Boss} def
 * @param {object} [options]
 * @param {string} [options.id] - id do combatente em combate (default: o próprio def.id).
 * @param {string} [options.position] - POSITIONS.* (default CENTRO, ver combatant.js).
 */
export function createCombatantFromEnemy(def, { id, position } = {}) {
  return createCombatant({
    id: id ?? def.id,
    name: def.name,
    position,
    attributes: createAttributes(def.stats),
  });
}

/** Alias explícito para bosses — mesma implementação, nome mais claro nos call sites. */
export const createCombatantFromBoss = createCombatantFromEnemy;

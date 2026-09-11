// Ponte entre combates separados de uma sequência linear de encontros (ex:
// o roteiro do Vertical Slice, Marco 6, src/data/vertical_slice.js). O
// motor de combate (CombatState) só sabe resolver UM combate por vez —
// nada aqui sabe o que é "campanha"/"missão" de verdade (isso é Marco 7,
// Run/Mapa/Missões); é só o suficiente para carregar HP/Chakra/recurso do
// esquadrão de um encontro para o próximo. Ver DECISIONS.md D019.

import { isAlive } from './combatant.js';

/**
 * Tira uma foto do HP/Chakra/recurso dos sobreviventes de `combatants`.
 * Combatentes com HP 0 não entram no snapshot — ficam de fora do próximo
 * encontro (permadeath dentro da mesma sequência, D019).
 * @param {object[]} combatants
 * @returns {{id: string, hp: number, chakra: number, resourceCurrent?: number}[]}
 */
export function snapshotSquad(combatants) {
  return combatants
    .filter(isAlive)
    .map((c) => ({
      id: c.id,
      hp: c.hp,
      chakra: c.chakra,
      resourceCurrent: c.resource?.current,
    }));
}

/**
 * Aplica um snapshot anterior sobre combatentes recém-criados (mesmo id) —
 * usado ao montar o próximo encontro a partir das fichas de Personagem de
 * novo, mas continuando de onde o esquadrão parou. Sem entrada no
 * snapshot para um id, o combatente fica com o HP/Chakra cheio padrão
 * (não deveria acontecer em uso normal — só sobreviventes viram
 * combatentes do próximo encontro).
 */
export function applySquadSnapshot(freshCombatants, snapshot) {
  const byId = new Map(snapshot.map((s) => [s.id, s]));
  for (const c of freshCombatants) {
    const saved = byId.get(c.id);
    if (!saved) continue;
    c.hp = Math.min(c.attributes.hpMax, saved.hp);
    c.chakra = Math.min(c.attributes.chakraMax, saved.chakra);
    if (c.resource && saved.resourceCurrent !== undefined) {
      c.resource.current = Math.min(c.resource.max, saved.resourceCurrent);
    }
  }
}

/** IDs presentes em um snapshot — quem segue disponível para o próximo encontro. */
export function survivingIds(snapshot) {
  return snapshot.map((s) => s.id);
}

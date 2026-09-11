import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAttributes } from '../../src/engine/combat/attributes.js';
import { createCombatant, applyDamage } from '../../src/engine/combat/combatant.js';
import { frontmostOccupiedLine, isValidRangeTarget } from '../../src/engine/combat/positions.js';
import { POSITIONS } from '../../src/engine/enums.js';

function combatant(id, position) {
  return createCombatant({ id, position, attributes: createAttributes({ hpMax: 50 }) });
}

test('frontmostOccupiedLine prioriza Frente > Centro > Trás', () => {
  const team = [combatant('a', POSITIONS.TRAS), combatant('b', POSITIONS.FRENTE), combatant('c', POSITIONS.CENTRO)];
  assert.equal(frontmostOccupiedLine(team), POSITIONS.FRENTE);
});

test('frontmostOccupiedLine ignora combatentes mortos', () => {
  const front = combatant('a', POSITIONS.FRENTE);
  applyDamage(front, 999);
  const team = [front, combatant('b', POSITIONS.CENTRO)];
  assert.equal(frontmostOccupiedLine(team), POSITIONS.CENTRO);
});

test('frontmostOccupiedLine retorna null se ninguém estiver vivo', () => {
  const dead = combatant('a', POSITIONS.FRENTE);
  applyDamage(dead, 999);
  assert.equal(frontmostOccupiedLine([dead]), null);
});

test('isValidRangeTarget MELEE só aceita a linha de frente ocupada do time inimigo', () => {
  const actor = combatant('atacante', POSITIONS.FRENTE);
  const front = combatant('inimigo-frente', POSITIONS.FRENTE);
  const back = combatant('inimigo-tras', POSITIONS.TRAS);
  const enemyTeam = [front, back];

  assert.equal(isValidRangeTarget({
    actor, target: front, range: 'MELEE', enemyTeam,
  }), true);
  assert.equal(isValidRangeTarget({
    actor, target: back, range: 'MELEE', enemyTeam,
  }), false);
});

test('isValidRangeTarget MELEE libera a próxima linha quando a de frente morre', () => {
  const actor = combatant('atacante', POSITIONS.FRENTE);
  const front = combatant('inimigo-frente', POSITIONS.FRENTE);
  applyDamage(front, 999);
  const back = combatant('inimigo-tras', POSITIONS.TRAS);
  const enemyTeam = [front, back];

  assert.equal(isValidRangeTarget({
    actor, target: back, range: 'MELEE', enemyTeam,
  }), true);
});

test('isValidRangeTarget RANGED aceita qualquer linha viva', () => {
  const actor = combatant('atacante', POSITIONS.TRAS);
  const back = combatant('inimigo-tras', POSITIONS.TRAS);
  const enemyTeam = [combatant('inimigo-frente', POSITIONS.FRENTE), back];
  assert.equal(isValidRangeTarget({
    actor, target: back, range: 'RANGED', enemyTeam,
  }), true);
});

test('isValidRangeTarget SELF só aceita o próprio ator', () => {
  const actor = combatant('a', POSITIONS.CENTRO);
  const other = combatant('b', POSITIONS.CENTRO);
  assert.equal(isValidRangeTarget({
    actor, target: actor, range: 'SELF', enemyTeam: [],
  }), true);
  assert.equal(isValidRangeTarget({
    actor, target: other, range: 'SELF', enemyTeam: [],
  }), false);
});

test('isValidRangeTarget lança em alcance desconhecido', () => {
  const actor = combatant('a', POSITIONS.CENTRO);
  assert.throws(() => isValidRangeTarget({
    actor, target: actor, range: 'TELEPORTE', enemyTeam: [],
  }));
});

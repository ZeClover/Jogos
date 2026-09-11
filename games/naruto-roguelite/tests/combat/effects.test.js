import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRngStream } from '../../src/engine/rng.js';
import { createAttributes } from '../../src/engine/combat/attributes.js';
import { createCombatant } from '../../src/engine/combat/combatant.js';
import {
  tryApplyState, removeState, hasState, getActiveState, tickStates,
  resolveReactions, attackerBonusFromTargetStates, IMOBILIZADO_STATE_ID,
} from '../../src/engine/combat/effects.js';

function combatant(overrides = {}) {
  return createCombatant({ id: 'c', attributes: createAttributes(overrides) });
}

// rng "determinístico por limiar": só considera sucesso uma chance ~100%.
// Útil para testar a curva de resistência adaptativa sem depender de sorte.
const thresholdRng = { chance: (p) => p >= 0.999 };

const STACKING_DOT = {
  id: 'STATUS_FIXTURE_STACK_001',
  stacks: true,
  maxStacks: 3,
  baseDuration: 2,
  controlType: false,
  dot: { stat: 'hp', percentPerStack: 10 },
};

const NON_STACKING = {
  id: 'STATUS_FIXTURE_SINGLE_001', stacks: false, maxStacks: 1, baseDuration: 3, controlType: false, dot: null,
};

const CONTROL_STATE = {
  id: 'STATUS_FIXTURE_CONTROL_001', stacks: false, maxStacks: 1, baseDuration: 1, controlType: true, dot: null,
};

test('tryApplyState guaranteed sempre aplica, ignorando resistência', () => {
  const c = combatant({ resistenciaEstado: 100 });
  const result = tryApplyState(c, NON_STACKING, { guaranteed: true, rng: thresholdRng });
  assert.equal(result.applied, true);
  assert.ok(hasState(c, NON_STACKING.id));
});

test('tryApplyState respeita resistenciaEstado (100% de resistência sempre falha)', () => {
  const c = combatant({ resistenciaEstado: 100 });
  const result = tryApplyState(c, NON_STACKING, { chance: 1, rng: thresholdRng });
  assert.equal(result.applied, false);
  assert.equal(result.reason, 'RESISTED');
});

test('tryApplyState com resistenciaEstado 0 e chance 1 aplica', () => {
  const c = combatant({ resistenciaEstado: 0 });
  const result = tryApplyState(c, NON_STACKING, { chance: 1, rng: thresholdRng });
  assert.equal(result.applied, true);
});

test('tryApplyState empilha até maxStacks e estende a duração', () => {
  const c = combatant();
  tryApplyState(c, STACKING_DOT, {
    guaranteed: true, stacks: 1, duration: 2, rng: thresholdRng,
  });
  tryApplyState(c, STACKING_DOT, {
    guaranteed: true, stacks: 5, duration: 1, rng: thresholdRng,
  });
  const active = getActiveState(c, STACKING_DOT.id);
  assert.equal(active.stacks, 3, 'não deveria passar de maxStacks');
  assert.equal(active.duration, 2, 'duração deveria ficar no maior valor entre a atual e a nova');
});

test('tryApplyState em Estado sem stack só reaplica (não duplica entrada)', () => {
  const c = combatant();
  tryApplyState(c, NON_STACKING, { guaranteed: true, rng: thresholdRng });
  tryApplyState(c, NON_STACKING, { guaranteed: true, rng: thresholdRng });
  assert.equal(c.states.length, 1);
});

test('resistência adaptativa de controle segue a curva 100%/70%/40%/imune', () => {
  // rng "espião": sempre deixa aplicar (para o contador de controle avançar
  // a cada chamada) e registra a chance efetiva que foi calculada, para
  // conferirmos a curva em si — não o resultado de uma rolagem aleatória.
  const chanceLog = [];
  const spyRng = { chance: (p) => { chanceLog.push(p); return true; } };
  const c = combatant({ resistenciaEstado: 0 });

  for (let i = 0; i < 4; i += 1) {
    tryApplyState(c, CONTROL_STATE, { chance: 1, rng: spyRng });
  }

  assert.deepEqual(chanceLog, [1, 0.7, 0.4, 0]);
});

test('aplicação de controle resistida (não aplicada) não avança a curva adaptativa', () => {
  const chanceLog = [];
  // primeira sempre resiste; a curva só deve avançar em aplicações bem-sucedidas.
  let calls = 0;
  const flakyRng = { chance: (p) => { chanceLog.push(p); calls += 1; return calls > 1; } };
  const c = combatant({ resistenciaEstado: 0 });

  tryApplyState(c, CONTROL_STATE, { chance: 1, rng: flakyRng }); // resistida (calls=1 -> false)
  tryApplyState(c, CONTROL_STATE, { chance: 1, rng: flakyRng }); // aplica (calls=2 -> true), ainda é a "1ª" para a curva

  assert.deepEqual(chanceLog, [1, 1], 'sem aplicação bem-sucedida anterior, a chance efetiva continua 100%');
});

test('removeState remove e devolve true/false conforme existia ou não', () => {
  const c = combatant();
  tryApplyState(c, NON_STACKING, { guaranteed: true, rng: thresholdRng });
  assert.equal(removeState(c, NON_STACKING.id), true);
  assert.equal(hasState(c, NON_STACKING.id), false);
  assert.equal(removeState(c, NON_STACKING.id), false);
});

test('tickStates aplica dano contínuo proporcional a stacks e reduz duração', () => {
  const c = combatant({ hpMax: 100 });
  tryApplyState(c, STACKING_DOT, {
    guaranteed: true, stacks: 2, duration: 2, rng: thresholdRng,
  });
  const catalog = new Map([[STACKING_DOT.id, STACKING_DOT]]);

  const events = tickStates(c, catalog);
  assert.equal(c.hp, 80, '2 stacks * 10% de 100 HP = 20 de dano'); // 100 - 20
  const active = getActiveState(c, STACKING_DOT.id);
  assert.equal(active.duration, 1);
  assert.ok(events.some((e) => e.type === 'DOT' && e.amount === 20));
});

test('tickStates remove o Estado quando a duração chega a zero', () => {
  const c = combatant();
  tryApplyState(c, NON_STACKING, { guaranteed: true, duration: 1, rng: thresholdRng });
  const events = tickStates(c, new Map());
  assert.equal(hasState(c, NON_STACKING.id), false);
  assert.ok(events.some((e) => e.type === 'STATE_EXPIRED' && e.stateId === NON_STACKING.id));
});

test('tickStates funciona sem catálogo de status (só reduz duração, sem DoT)', () => {
  const c = combatant({ hpMax: 100 });
  tryApplyState(c, STACKING_DOT, { guaranteed: true, duration: 2, rng: thresholdRng });
  tickStates(c, undefined);
  assert.equal(c.hp, 100, 'sem catálogo não há como saber que é DoT');
});

test('tickStates drena Chakra quando dot.stat é "chakra"', () => {
  const c = combatant({ chakraMax: 100 });
  const chakraDrain = {
    id: 'STATUS_FIXTURE_DRAIN_001', stacks: false, maxStacks: 1, baseDuration: 2, controlType: false, dot: { stat: 'chakra', percentPerStack: 15 },
  };
  tryApplyState(c, chakraDrain, { guaranteed: true, rng: thresholdRng });
  tickStates(c, new Map([[chakraDrain.id, chakraDrain]]));
  assert.equal(c.chakra, 85);
});

test('resolveReactions aplica o Estado resultado quando gatilho + tag batem', () => {
  const target = combatant();
  tryApplyState(target, NON_STACKING, { guaranteed: true, rng: thresholdRng });

  const resultState = {
    id: 'STATUS_FIXTURE_RESULT_001', stacks: false, maxStacks: 1, baseDuration: 2, controlType: false, dot: null,
  };
  const reactionCatalog = [{
    id: 'REACTION_FIXTURE_001',
    triggerStateId: NON_STACKING.id,
    triggerTagId: 'TAG_FIXTURE_001',
    resultStateId: resultState.id,
    guaranteedApply: true,
  }];
  const statusCatalog = new Map([[resultState.id, resultState]]);

  const events = resolveReactions({
    reactionCatalog, statusCatalog, target, incomingTags: ['TAG_FIXTURE_001'], rng: thresholdRng,
  });

  assert.equal(events.length, 1);
  assert.equal(events[0].outcome.applied, true);
  assert.ok(hasState(target, resultState.id));
});

test('resolveReactions não dispara sem o Estado gatilho ou sem a tag certa', () => {
  const target = combatant();
  const reactionCatalog = [{
    id: 'REACTION_FIXTURE_002',
    triggerStateId: 'STATUS_QUE_NAO_EXISTE_001',
    triggerTagId: 'TAG_FIXTURE_001',
    resultStateId: NON_STACKING.id,
    guaranteedApply: true,
  }];
  const events = resolveReactions({
    reactionCatalog,
    statusCatalog: new Map([[NON_STACKING.id, NON_STACKING]]),
    target,
    incomingTags: ['TAG_FIXTURE_001'],
    rng: thresholdRng,
  });
  assert.equal(events.length, 0);
});

test('resolveReactions respeita o limite máximo de reações por ação', () => {
  const target = combatant();
  const results = ['a', 'b', 'c', 'd', 'e'].map((suffix) => ({
    id: `STATUS_FIXTURE_R_${suffix}`, stacks: false, maxStacks: 1, baseDuration: 1, controlType: false, dot: null,
  }));
  tryApplyState(target, NON_STACKING, { guaranteed: true, rng: thresholdRng });

  const reactionCatalog = results.map((r) => ({
    id: `REACTION_FIXTURE_${r.id}`,
    triggerStateId: NON_STACKING.id,
    triggerTagId: 'TAG_FIXTURE_001',
    resultStateId: r.id,
    guaranteedApply: true,
  }));
  const statusCatalog = new Map(results.map((r) => [r.id, r]));

  const events = resolveReactions({
    reactionCatalog, statusCatalog, target, incomingTags: ['TAG_FIXTURE_001'], rng: thresholdRng, maxReactions: 4,
  });
  assert.equal(events.length, 4, 'catálogo tem 5 reações elegíveis, mas o limite é 4');
});

test('attackerBonusFromTargetStates só concede bônus contra Imobilizado', () => {
  const target = combatant();
  assert.deepEqual(attackerBonusFromTargetStates(target), { accuracyBonus: 0, critBonus: 0 });

  target.states.push({
    stateId: IMOBILIZADO_STATE_ID, stacks: 1, duration: 2, sourceId: null,
  });
  const bonus = attackerBonusFromTargetStates(target);
  assert.ok(bonus.accuracyBonus > 0);
  assert.ok(bonus.critBonus > 0);
});

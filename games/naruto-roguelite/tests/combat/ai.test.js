import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../../src/data/catalog/index.js';
import { statuses, reactions, jutsus } from '../../src/data/index.js';
import { SeedManager } from '../../src/engine/seed.js';
import { createAttributes } from '../../src/engine/combat/attributes.js';
import { createCombatant, applyDamage } from '../../src/engine/combat/combatant.js';
import { CombatState } from '../../src/engine/combat/state.js';
import { chooseAction, BOSS_AI_PROFILES } from '../../src/engine/combat/ai.js';
import { ACTION_TYPES, POSITIONS } from '../../src/engine/enums.js';

function fighter(id, overrides = {}, position = POSITIONS.FRENTE) {
  return createCombatant({ id, position, attributes: createAttributes(overrides) });
}

function newState(teamA, teamB, seed = 'ai-test') {
  return new CombatState({
    teamA, teamB, seedManager: new SeedManager(seed), statusCatalog: statuses, reactionCatalog: reactions.all(), jutsuCatalog: jutsus,
  });
}

test('chooseAction devolve null quando não há inimigo vivo', () => {
  const actor = fighter('a');
  const alvo = fighter('b');
  applyDamage(alvo, 9999);
  const state = newState([actor], [alvo]);
  assert.equal(chooseAction(state, actor, { level: 'BASICA' }), null);
});

test('BASICA sempre ataca o primeiro inimigo vivo da lista', () => {
  const actor = fighter('a');
  const state = newState([actor], [fighter('b'), fighter('c')]);
  const action = chooseAction(state, actor, { level: 'BASICA' });
  assert.equal(action.type, ACTION_TYPES.ATAQUE_BASICO);
  assert.ok(['b', 'c'].includes(action.targetId));
});

test('INTERMEDIARIA foca o inimigo com menos HP', () => {
  const actor = fighter('a');
  const fraco = fighter('fraco', { hpMax: 100 });
  applyDamage(fraco, 80); // 20 hp
  const forte = fighter('forte', { hpMax: 100 }); // 100 hp
  const state = newState([actor], [forte, fraco]);

  const action = chooseAction(state, actor, { level: 'INTERMEDIARIA' });
  assert.equal(action.targetId, 'fraco');
});

test('INTERMEDIARIA se defende quando o próprio HP está crítico', () => {
  const actor = fighter('a', { hpMax: 100 });
  applyDamage(actor, 80); // 20% hp, abaixo do limiar de 30%
  const state = newState([actor], [fighter('b')]);

  const action = chooseAction(state, actor, { level: 'INTERMEDIARIA' });
  assert.equal(action.type, ACTION_TYPES.DEFENDER);
});

test('ELITE recua para Trás quando o HP está crítico e ainda não está lá', () => {
  const actor = fighter('a', { hpMax: 100 }, POSITIONS.FRENTE);
  applyDamage(actor, 80);
  const state = newState([actor], [fighter('b')]);

  const action = chooseAction(state, actor, { level: 'ELITE' });
  assert.equal(action.type, ACTION_TYPES.MOVER);
  assert.equal(action.position, POSITIONS.TRAS);
});

test('ELITE se defende (já não tem mais como recuar) quando HP crítico e já está em Trás', () => {
  const actor = fighter('a', { hpMax: 100 }, POSITIONS.TRAS);
  applyDamage(actor, 80);
  const state = newState([actor], [fighter('b')]);

  const action = chooseAction(state, actor, { level: 'ELITE' });
  assert.equal(action.type, ACTION_TYPES.DEFENDER);
});

test('ELITE foca o inimigo com menos HP quando saudável', () => {
  const actor = fighter('a', { hpMax: 100 });
  const fraco = fighter('fraco', { hpMax: 100 });
  applyDamage(fraco, 80);
  const state = newState([actor], [fighter('forte', { hpMax: 100 }), fraco]);

  const action = chooseAction(state, actor, { level: 'ELITE' });
  assert.equal(action.type, ACTION_TYPES.ATAQUE_BASICO);
  assert.equal(action.targetId, 'fraco');
});

test('chooseAction lança em nível desconhecido', () => {
  const actor = fighter('a');
  const state = newState([actor], [fighter('b')]);
  assert.throws(() => chooseAction(state, actor, { level: 'LENDARIO' }));
});

test('chooseAction com level BOSS sem perfil cadastrado lança erro claro', () => {
  const actor = fighter('a');
  const state = newState([actor], [fighter('b')]);
  assert.throws(() => chooseAction(state, actor, { level: 'BOSS', bossId: 'BOSS_INEXISTENTE_001' }));
});

test('Zabuza (perfil de boss) ataca normalmente na Fase 1 (HP > 60%)', () => {
  const zabuza = fighter('zabuza', { hpMax: 300, chakraMax: 200 });
  const state = newState([zabuza], [fighter('alvo')]);

  const action = chooseAction(state, zabuza, { level: 'BOSS', bossId: 'BOSS_ZABUZA_001' });
  assert.equal(action.type, ACTION_TYPES.ATAQUE_BASICO);
});

test('Zabuza usa Kirigakure (fica Oculto) ao entrar na Fase 2 (25%-60% HP)', () => {
  const zabuza = fighter('zabuza', { hpMax: 300, chakraMax: 200 });
  applyDamage(zabuza, 150); // 50% hp -> fase 2
  const state = newState([zabuza], [fighter('alvo')]);

  const action = chooseAction(state, zabuza, { level: 'BOSS', bossId: 'BOSS_ZABUZA_001' });
  assert.equal(action.type, ACTION_TYPES.JUTSU);
  assert.equal(action.jutsuId, 'JUT_KIRIGAKURE_NO_JUTSU_001');
  assert.equal(action.targetId, 'zabuza');
});

test('Zabuza não tenta Kirigakure de novo se já estiver Oculto', () => {
  const zabuza = fighter('zabuza', { hpMax: 300, chakraMax: 200 });
  applyDamage(zabuza, 150);
  const state = newState([zabuza], [fighter('alvo')]);
  zabuza.states.push({
    stateId: 'STATUS_OCULTO_001', stacks: 1, duration: 2, sourceId: 'zabuza',
  });

  const action = chooseAction(state, zabuza, { level: 'BOSS', bossId: 'BOSS_ZABUZA_001' });
  assert.equal(action.type, ACTION_TYPES.ATAQUE_BASICO);
});

test('Zabuza entra em Desespero (ataque constante) abaixo de 25% HP', () => {
  const zabuza = fighter('zabuza', { hpMax: 300, chakraMax: 200 });
  applyDamage(zabuza, 250); // ~17% hp -> fase 3
  const state = newState([zabuza], [fighter('alvo')]);

  const action = chooseAction(state, zabuza, { level: 'BOSS', bossId: 'BOSS_ZABUZA_001' });
  assert.equal(action.type, ACTION_TYPES.ATAQUE_BASICO);
});

test('BOSS_AI_PROFILES tem uma entrada para Zabuza', () => {
  assert.ok(typeof BOSS_AI_PROFILES.BOSS_ZABUZA_001 === 'function');
});

test('Serpente (perfil de boss) ataca normalmente na Fase 1 (HP > 60%)', () => {
  const serpente = fighter('serpente', { hpMax: 380, chakraMax: 140 });
  const state = newState([serpente], [fighter('alvo')]);

  const action = chooseAction(state, serpente, { level: 'BOSS', bossId: 'BOSS_SERPENTE_FLORESTA_001' });
  assert.equal(action.type, ACTION_TYPES.ATAQUE_BASICO);
});

test('Serpente usa Constrição Sufocante num alvo ainda não Imobilizado ao entrar na Fase 2 (30%-60% HP)', () => {
  const serpente = fighter('serpente', { hpMax: 380, chakraMax: 140 });
  applyDamage(serpente, 190); // 50% hp -> fase 2
  const state = newState([serpente], [fighter('alvo')]);

  const action = chooseAction(state, serpente, { level: 'BOSS', bossId: 'BOSS_SERPENTE_FLORESTA_001' });
  assert.equal(action.type, ACTION_TYPES.JUTSU);
  assert.equal(action.jutsuId, 'JUT_CONSTRICAO_SUFOCANTE_001');
  assert.equal(action.targetId, 'alvo');
});

test('Serpente não repete Constrição num alvo já Imobilizado (ataca normalmente)', () => {
  const serpente = fighter('serpente', { hpMax: 380, chakraMax: 140 });
  applyDamage(serpente, 190);
  const alvo = fighter('alvo');
  alvo.states.push({
    stateId: 'STATUS_IMOBILIZADO_001', stacks: 1, duration: 2, sourceId: 'serpente',
  });
  const state = newState([serpente], [alvo]);

  const action = chooseAction(state, serpente, { level: 'BOSS', bossId: 'BOSS_SERPENTE_FLORESTA_001' });
  assert.equal(action.type, ACTION_TYPES.ATAQUE_BASICO);
});

test('Serpente prioriza Mordida Perfurante na Fase 3 (Fúria Feroz, <30% HP)', () => {
  const serpente = fighter('serpente', { hpMax: 380, chakraMax: 140 });
  applyDamage(serpente, 320); // ~16% hp -> fase 3
  const state = newState([serpente], [fighter('alvo')]);

  const action = chooseAction(state, serpente, { level: 'BOSS', bossId: 'BOSS_SERPENTE_FLORESTA_001' });
  assert.equal(action.type, ACTION_TYPES.JUTSU);
  assert.equal(action.jutsuId, 'JUT_MORDIDA_PERFURANTE_001');
});

test('BOSS_AI_PROFILES tem uma entrada para a Serpente da Floresta da Morte', () => {
  assert.ok(typeof BOSS_AI_PROFILES.BOSS_SERPENTE_FLORESTA_001 === 'function');
});

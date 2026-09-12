import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRngStream } from '../../src/engine/rng.js';
import { createAttributes } from '../../src/engine/combat/attributes.js';
import { createCombatant, applyDamage } from '../../src/engine/combat/combatant.js';
import { resolveAction } from '../../src/engine/combat/actions.js';
import { ACTION_TYPES, ACTION_SLOTS, POSITIONS } from '../../src/engine/enums.js';

function makeState({
  teamA, teamB, seed = 'seed-actions', itemCatalog = new Map(), jutsuCatalog = new Map(),
}) {
  const all = [...teamA, ...teamB];
  return {
    combatants: new Map(all.map((c) => [c.id, c])),
    rng: createRngStream(seed, 'combat'),
    teamAIds: teamA.map((c) => c.id),
    teamBIds: teamB.map((c) => c.id),
    itemCatalog,
    jutsuCatalog,
    sideIds(id) {
      return this.teamAIds.includes(id) ? this.teamAIds : this.teamBIds;
    },
  };
}

function fighter(id, overrides = {}, position = POSITIONS.FRENTE, inventory = {}) {
  return createCombatant({
    id, position, attributes: createAttributes(overrides), inventory,
  });
}

// Certeiro/nunca-erra e nunca-crítico, para tornar os testes de dano determinísticos
// sem depender de qual sequência a RngStream produz para uma dada seed.
const ALWAYS_HIT = { precisao: 10000, evasao: 0 };
const NEVER_CRIT = { critChance: 0 };

test('ATAQUE_BASICO fora de alcance (MELEE) é rejeitado sem consumir o turno', () => {
  const actor = fighter('atacante', { ...ALWAYS_HIT, ...NEVER_CRIT }, POSITIONS.FRENTE);
  const front = fighter('inimigo-frente', {}, POSITIONS.FRENTE);
  const back = fighter('inimigo-tras', {}, POSITIONS.TRAS);
  const state = makeState({ teamA: [actor], teamB: [front, back] });

  const result = resolveAction(state, actor, { type: ACTION_TYPES.ATAQUE_BASICO, targetId: back.id });
  assert.equal(result.applied, false);
  assert.equal(result.reason, 'OUT_OF_RANGE');
  assert.equal(actor.actionBudget[ACTION_SLOTS.PRINCIPAL], 1, 'orçamento não deve ser consumido em ação inválida');
});

test('ATAQUE_BASICO válido causa dano baseado no Taijutsu do atacante', () => {
  const actor = fighter('atacante', { ...ALWAYS_HIT, ...NEVER_CRIT, taijutsu: 50 }, POSITIONS.FRENTE);
  const target = fighter('alvo', { defesaFisica: 0 }, POSITIONS.FRENTE);
  const state = makeState({ teamA: [actor], teamB: [target] });

  const result = resolveAction(state, actor, { type: ACTION_TYPES.ATAQUE_BASICO, targetId: target.id });
  assert.equal(result.applied, true);
  assert.equal(result.hit, true);
  assert.equal(result.damage, 50); // defesa 0 -> sem mitigação
  assert.equal(target.hp, target.attributes.hpMax - 50);
  assert.equal(actor.actionBudget[ACTION_SLOTS.PRINCIPAL], 0, 'ação válida consome o orçamento do slot');
});

test('ATAQUE_BASICO não gasta Chakra', () => {
  const actor = fighter('atacante', { ...ALWAYS_HIT, ...NEVER_CRIT }, POSITIONS.FRENTE);
  const target = fighter('alvo', {}, POSITIONS.FRENTE);
  const state = makeState({ teamA: [actor], teamB: [target] });
  const chakraAntes = actor.chakra;

  resolveAction(state, actor, { type: ACTION_TYPES.ATAQUE_BASICO, targetId: target.id });
  assert.equal(actor.chakra, chakraAntes);
});

test('JUTSU com Chakra insuficiente é rejeitado sem consumir o turno nem o Chakra', () => {
  const actor = fighter('atacante', { chakraMax: 10 });
  actor.chakra = 5;
  const target = fighter('alvo', {}, POSITIONS.FRENTE);
  const state = makeState({ teamA: [actor], teamB: [target] });

  const result = resolveAction(state, actor, {
    type: ACTION_TYPES.JUTSU, targetId: target.id, cost: 20, power: 10, range: 'RANGED',
  });
  assert.equal(result.applied, false);
  assert.equal(result.reason, 'INSUFFICIENT_CHAKRA');
  assert.equal(actor.chakra, 5);
});

test('JUTSU válido gasta Chakra e aplica dano pela categoria correta', () => {
  const actor = fighter('atacante', { ...ALWAYS_HIT, ...NEVER_CRIT, chakraMax: 100 });
  const target = fighter('alvo', { defesaChakra: 0, resistenciaMental: 999 }, POSITIONS.FRENTE);
  const state = makeState({ teamA: [actor], teamB: [target] });

  const result = resolveAction(state, actor, {
    type: ACTION_TYPES.JUTSU, targetId: target.id, cost: 18, power: 36, category: 'NINJUTSU', range: 'RANGED',
  });
  assert.equal(result.applied, true);
  assert.equal(result.chakraSpent, 18);
  assert.equal(actor.chakra, 100 - 18);
  assert.equal(result.damage, 36); // defesaChakra 0 -> sem mitigação
});

test('JUTSU aplica desconto de custo pela eficiência do atacante', () => {
  const actor = fighter('atacante', {
    ...ALWAYS_HIT, ...NEVER_CRIT, chakraMax: 100, eficiencia: 0.5,
  });
  const target = fighter('alvo', {}, POSITIONS.FRENTE);
  const state = makeState({ teamA: [actor], teamB: [target] });

  const result = resolveAction(state, actor, {
    type: ACTION_TYPES.JUTSU, targetId: target.id, cost: 20, power: 10, range: 'RANGED',
  });
  assert.equal(result.chakraSpent, 10);
});

test('JUTSU com categoria desconhecida é rejeitado', () => {
  const actor = fighter('atacante', {});
  const target = fighter('alvo', {}, POSITIONS.FRENTE);
  const state = makeState({ teamA: [actor], teamB: [target] });

  const result = resolveAction(state, actor, {
    type: ACTION_TYPES.JUTSU, targetId: target.id, cost: 1, power: 1, category: 'DOUJUTSU_INEXISTENTE',
  });
  assert.equal(result.applied, false);
  assert.equal(result.reason, 'INVALID_CATEGORY');
});

const FIXTURE_JUTSU_REQUIRES_RESOURCE = {
  id: 'JUT_FIXTURE_REQUIRES_RESOURCE_001',
  category: 'TAIJUTSU',
  cost: 5,
  power: 10,
  range: 'MELEE',
  effect: 'DAMAGE',
  requiresResource: { amount: 2 },
};

function fighterWithResource(id, resource, overrides = {}) {
  return createCombatant({
    id, position: POSITIONS.FRENTE, attributes: createAttributes(overrides), resource,
  });
}

test('JUTSU com requiresResource falha com INSUFFICIENT_RESOURCE sem recurso suficiente (sem gastar Chakra)', () => {
  const actor = fighterWithResource('atacante', { id: 'clones', name: 'Clones', max: 5, current: 1 }, { chakraMax: 100 });
  const target = fighter('alvo', {}, POSITIONS.FRENTE);
  const jutsuCatalog = new Map([[FIXTURE_JUTSU_REQUIRES_RESOURCE.id, FIXTURE_JUTSU_REQUIRES_RESOURCE]]);
  const state = makeState({ teamA: [actor], teamB: [target], jutsuCatalog });

  const result = resolveAction(state, actor, {
    type: ACTION_TYPES.JUTSU, jutsuId: FIXTURE_JUTSU_REQUIRES_RESOURCE.id, targetId: target.id,
  });
  assert.equal(result.applied, false);
  assert.equal(result.reason, 'INSUFFICIENT_RESOURCE');
  assert.equal(actor.chakra, 100, 'Chakra não deveria ser gasto numa ação rejeitada');
  assert.equal(actor.resource.current, 1, 'recurso não deveria ser gasto numa ação rejeitada');
});

test('JUTSU com requiresResource gasta o recurso e devolve resourceSpent com recurso suficiente', () => {
  const actor = fighterWithResource('atacante', { id: 'clones', name: 'Clones', max: 5, current: 3 }, { ...ALWAYS_HIT, ...NEVER_CRIT, chakraMax: 100 });
  const target = fighter('alvo', {}, POSITIONS.FRENTE);
  const jutsuCatalog = new Map([[FIXTURE_JUTSU_REQUIRES_RESOURCE.id, FIXTURE_JUTSU_REQUIRES_RESOURCE]]);
  const state = makeState({ teamA: [actor], teamB: [target], jutsuCatalog });

  const result = resolveAction(state, actor, {
    type: ACTION_TYPES.JUTSU, jutsuId: FIXTURE_JUTSU_REQUIRES_RESOURCE.id, targetId: target.id,
  });
  assert.equal(result.applied, true);
  assert.equal(result.resourceSpent, 2);
  assert.equal(actor.resource.current, 1);
});

test('JUTSU sem requiresResource não mexe no recurso exclusivo do ator', () => {
  const actor = fighterWithResource('atacante', { id: 'clones', name: 'Clones', max: 5, current: 3 }, { ...ALWAYS_HIT, ...NEVER_CRIT, chakraMax: 100 });
  const target = fighter('alvo', {}, POSITIONS.FRENTE);
  const state = makeState({ teamA: [actor], teamB: [target] });

  const result = resolveAction(state, actor, {
    type: ACTION_TYPES.JUTSU, targetId: target.id, cost: 5, power: 10, range: 'RANGED',
  });
  assert.equal(result.applied, true);
  assert.equal(result.resourceSpent, undefined);
  assert.equal(actor.resource.current, 3);
});

test('DEFENDER define a guarda como 30% da Defesa Física do ator', () => {
  const actor = fighter('atacante', { defesaFisica: 40 });
  const state = makeState({ teamA: [actor], teamB: [fighter('alvo', {}, POSITIONS.FRENTE)] });

  const result = resolveAction(state, actor, { type: ACTION_TYPES.DEFENDER });
  assert.equal(result.applied, true);
  assert.equal(actor.guard, 12);
});

test('guarda de Defender reduz o próximo dano recebido', () => {
  const attacker = fighter('atacante', { ...ALWAYS_HIT, ...NEVER_CRIT, taijutsu: 50 }, POSITIONS.FRENTE);
  const defender = fighter('defensor', { defesaFisica: 0 }, POSITIONS.FRENTE);
  const state = makeState({ teamA: [attacker], teamB: [defender] });

  resolveAction(state, defender, { type: ACTION_TYPES.DEFENDER }); // guard = 0 (defesaFisica 0 * 0.3)
  defender.guard = 20; // força uma guarda não-trivial para o teste
  const result = resolveAction(state, attacker, { type: ACTION_TYPES.ATAQUE_BASICO, targetId: defender.id });
  assert.equal(result.damage, 50 - 20);
});

test('MOVER muda a posição do ator', () => {
  const actor = fighter('a', {}, POSITIONS.CENTRO);
  const state = makeState({ teamA: [actor], teamB: [fighter('b', {}, POSITIONS.FRENTE)] });

  const moved = resolveAction(state, actor, { type: ACTION_TYPES.MOVER, position: POSITIONS.FRENTE });
  assert.equal(moved.applied, true);
  assert.equal(actor.position, POSITIONS.FRENTE);
});

test('MOVER rejeita mover para a posição em que já está, sem consumir orçamento', () => {
  const actor = fighter('a', {}, POSITIONS.FRENTE);
  const state = makeState({ teamA: [actor], teamB: [fighter('b', {}, POSITIONS.FRENTE)] });

  const noop = resolveAction(state, actor, { type: ACTION_TYPES.MOVER, position: POSITIONS.FRENTE });
  assert.equal(noop.applied, false);
  assert.equal(noop.reason, 'ALREADY_IN_POSITION');
  assert.equal(actor.actionBudget[ACTION_SLOTS.PRINCIPAL], 1);
});

test('MOVER rejeita posição inválida', () => {
  const actor = fighter('a', {}, POSITIONS.CENTRO);
  const state = makeState({ teamA: [actor], teamB: [fighter('b', {}, POSITIONS.FRENTE)] });
  const result = resolveAction(state, actor, { type: ACTION_TYPES.MOVER, position: 'FLANCO' });
  assert.equal(result.applied, false);
  assert.equal(result.reason, 'INVALID_POSITION');
});

test('TROCAR troca posições entre aliados', () => {
  const a = fighter('a', {}, POSITIONS.FRENTE);
  const b = fighter('b', {}, POSITIONS.TRAS);
  const state = makeState({ teamA: [a, b], teamB: [fighter('inimigo', {}, POSITIONS.FRENTE)] });

  const result = resolveAction(state, a, { type: ACTION_TYPES.TROCAR, allyId: b.id });
  assert.equal(result.applied, true);
  assert.equal(a.position, POSITIONS.TRAS);
  assert.equal(b.position, POSITIONS.FRENTE);
});

test('TROCAR rejeita alvo do time inimigo ou morto', () => {
  const a = fighter('a', {}, POSITIONS.FRENTE);
  const inimigo = fighter('inimigo', {}, POSITIONS.FRENTE);
  const aliadoMorto = fighter('aliado-morto', {}, POSITIONS.TRAS);
  applyDamage(aliadoMorto, 9999);
  const state = makeState({ teamA: [a, aliadoMorto], teamB: [inimigo] });

  assert.equal(resolveAction(state, a, { type: ACTION_TYPES.TROCAR, allyId: inimigo.id }).reason, 'INVALID_ALLY');
  assert.equal(resolveAction(state, a, { type: ACTION_TYPES.TROCAR, allyId: aliadoMorto.id }).reason, 'INVALID_ALLY');
});

test('PREPARAR/INTERAGIR retornam NOT_IMPLEMENTED_YET sem consumir turno', () => {
  const actor = fighter('a', {}, POSITIONS.CENTRO);
  const state = makeState({ teamA: [actor], teamB: [fighter('b', {}, POSITIONS.FRENTE)] });

  for (const type of [ACTION_TYPES.PREPARAR, ACTION_TYPES.INTERAGIR]) {
    const result = resolveAction(state, actor, { type });
    assert.equal(result.applied, false);
    assert.equal(result.reason, 'NOT_IMPLEMENTED_YET');
  }
});

// --- ITEM (Marco 10) -------------------------------------------------------

const FIXTURE_KUNAI = {
  id: 'ITEM_FIXTURE_KUNAI_001', effect: 'DAMAGE', combatCategory: 'TAIJUTSU', power: 20, accuracy: 1, range: 'RANGED',
};
const FIXTURE_PILL = {
  id: 'ITEM_FIXTURE_PILL_001', effect: 'RESTORE_CHAKRA', power: 30, range: 'ALLY',
};
const FIXTURE_ANTIDOTE = {
  id: 'ITEM_FIXTURE_ANTIDOTE_001', effect: 'CLEANSE', range: 'ALLY',
};
const FIXTURE_ITEM_CATALOG = new Map([
  [FIXTURE_KUNAI.id, FIXTURE_KUNAI],
  [FIXTURE_PILL.id, FIXTURE_PILL],
  [FIXTURE_ANTIDOTE.id, FIXTURE_ANTIDOTE],
]);

test('ITEM desconhecido (sem itemId, ou itemId fora do catálogo) é rejeitado com UNKNOWN_ITEM', () => {
  const actor = fighter('a', {}, POSITIONS.CENTRO);
  const state = makeState({ teamA: [actor], teamB: [fighter('b', {}, POSITIONS.FRENTE)], itemCatalog: FIXTURE_ITEM_CATALOG });

  assert.equal(resolveAction(state, actor, { type: ACTION_TYPES.ITEM }).reason, 'UNKNOWN_ITEM');
  assert.equal(resolveAction(state, actor, { type: ACTION_TYPES.ITEM, itemId: 'ITEM_FANTASMA_001' }).reason, 'UNKNOWN_ITEM');
});

test('ITEM que o ator não carrega no inventário é rejeitado com ITEM_NOT_IN_INVENTORY, sem consumir turno', () => {
  const actor = fighter('a', {}, POSITIONS.CENTRO, {}); // inventário vazio
  const target = fighter('b', {}, POSITIONS.FRENTE);
  const state = makeState({ teamA: [actor], teamB: [target], itemCatalog: FIXTURE_ITEM_CATALOG });

  const result = resolveAction(state, actor, { type: ACTION_TYPES.ITEM, itemId: FIXTURE_KUNAI.id, targetId: target.id });
  assert.equal(result.applied, false);
  assert.equal(result.reason, 'ITEM_NOT_IN_INVENTORY');
  assert.equal(actor.actionBudget[ACTION_SLOTS.PRINCIPAL], 1);
});

test('ITEM de dano (Kunai) acerta, causa dano e consome 1 unidade do inventário', () => {
  const actor = fighter('a', { ...ALWAYS_HIT, ...NEVER_CRIT }, POSITIONS.CENTRO, { [FIXTURE_KUNAI.id]: 2 });
  const target = fighter('b', { defesaFisica: 0 }, POSITIONS.FRENTE);
  const state = makeState({ teamA: [actor], teamB: [target], itemCatalog: FIXTURE_ITEM_CATALOG });

  const result = resolveAction(state, actor, { type: ACTION_TYPES.ITEM, itemId: FIXTURE_KUNAI.id, targetId: target.id });
  assert.equal(result.applied, true);
  assert.equal(result.success, true);
  assert.equal(result.damage, 20);
  assert.equal(actor.inventory[FIXTURE_KUNAI.id], 1, 'consome 1 unidade, não zera o resto do estoque');
});

test('ITEM de dano não gasta Chakra do ator (diferente de Jutsu)', () => {
  const actor = fighter('a', {
    ...ALWAYS_HIT, ...NEVER_CRIT, chakraMax: 50,
  }, POSITIONS.CENTRO, { [FIXTURE_KUNAI.id]: 1 });
  const target = fighter('b', { defesaFisica: 0 }, POSITIONS.FRENTE);
  const state = makeState({ teamA: [actor], teamB: [target], itemCatalog: FIXTURE_ITEM_CATALOG });

  resolveAction(state, actor, { type: ACTION_TYPES.ITEM, itemId: FIXTURE_KUNAI.id, targetId: target.id });
  assert.equal(actor.chakra, 50);
});

test('ITEM RESTORE_CHAKRA (Pílula do Soldado) restaura Chakra do alvo sem passar do máximo', () => {
  const actor = fighter('a', { chakraMax: 100 }, POSITIONS.CENTRO, { [FIXTURE_PILL.id]: 1 });
  applyDamage(actor, 0); // hp intacto; ajustamos chakra manualmente abaixo
  actor.chakra = 80;
  const state = makeState({ teamA: [actor], teamB: [fighter('b', {}, POSITIONS.FRENTE)], itemCatalog: FIXTURE_ITEM_CATALOG });

  const result = resolveAction(state, actor, { type: ACTION_TYPES.ITEM, itemId: FIXTURE_PILL.id, targetId: actor.id });
  assert.equal(result.applied, true);
  assert.equal(result.chakraRestored, 30);
  assert.equal(actor.chakra, 100, 'não deveria passar do chakraMax (80+30=110 -> capado em 100)');
});

test('ITEM CLEANSE (Antídoto) usa o mesmo cleanseCurableStates de Kai, sem custo de Chakra', () => {
  const actor = fighter('a', {}, POSITIONS.CENTRO, { [FIXTURE_ANTIDOTE.id]: 1 });
  const state = makeState({ teamA: [actor], teamB: [fighter('b', {}, POSITIONS.FRENTE)], itemCatalog: FIXTURE_ITEM_CATALOG });

  const result = resolveAction(state, actor, { type: ACTION_TYPES.ITEM, itemId: FIXTURE_ANTIDOTE.id, targetId: actor.id });
  assert.equal(result.applied, true);
  assert.deepEqual(result.removedStates, []); // sem catálogo de Estados no fixture, nada pra remover — só confere que não quebra
});

test('tipo de ação desconhecido é rejeitado com UNKNOWN_ACTION_TYPE', () => {
  const actor = fighter('a', {}, POSITIONS.CENTRO);
  const state = makeState({ teamA: [actor], teamB: [fighter('b', {}, POSITIONS.FRENTE)] });
  const result = resolveAction(state, actor, { type: 'VOAR' });
  assert.equal(result.applied, false);
  assert.equal(result.reason, 'UNKNOWN_ACTION_TYPE');
});

test('orçamento de slot esgotado rejeita novas ações no mesmo slot', () => {
  const actor = fighter('a', { ...ALWAYS_HIT, ...NEVER_CRIT }, POSITIONS.FRENTE);
  const target = fighter('b', {}, POSITIONS.FRENTE);
  const state = makeState({ teamA: [actor], teamB: [target] });

  resolveAction(state, actor, { type: ACTION_TYPES.DEFENDER });
  const second = resolveAction(state, actor, { type: ACTION_TYPES.DEFENDER });
  assert.equal(second.applied, false);
  assert.equal(second.reason, 'ACTION_SLOT_EXHAUSTED');
});

test('slots PRINCIPAL e RAPIDA são orçamentos independentes', () => {
  const actor = fighter('a', {}, POSITIONS.CENTRO);
  const state = makeState({ teamA: [actor], teamB: [fighter('b', {}, POSITIONS.FRENTE)] });

  const principal = resolveAction(state, actor, { type: ACTION_TYPES.DEFENDER, slot: ACTION_SLOTS.PRINCIPAL });
  const rapida = resolveAction(state, actor, { type: ACTION_TYPES.DEFENDER, slot: ACTION_SLOTS.RAPIDA });
  assert.equal(principal.applied, true);
  assert.equal(rapida.applied, true);
});

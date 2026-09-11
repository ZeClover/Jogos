// Integração ponta a ponta do catálogo real de Personagens (Marco 4) com
// jutsus reais (Marco 3) e o Effect Engine (Marco 2) através de
// characterBridge.js + CombatState — nenhuma fixture reescrita à mão.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../../src/data/catalog/index.js';
import {
  statuses, reactions, jutsus, characters,
} from '../../src/data/index.js';
import { SeedManager } from '../../src/engine/seed.js';
import { createAttributes } from '../../src/engine/combat/attributes.js';
import { createCombatant } from '../../src/engine/combat/combatant.js';
import { createCombatantFromCharacter } from '../../src/engine/combat/characterBridge.js';
import { CombatState } from '../../src/engine/combat/state.js';
import { resolveAction } from '../../src/engine/combat/actions.js';
import { ACTION_TYPES, POSITIONS } from '../../src/engine/enums.js';

const ALWAYS_HIT = { precisao: 10000, evasao: 0 };
const NEVER_CRIT = { critChance: 0 };

function fakeState(teamA, teamB, seed = 'character-integration') {
  const all = [...teamA, ...teamB];
  return {
    combatants: new Map(all.map((c) => [c.id, c])),
    rng: new SeedManager(seed).combat,
    teamAIds: teamA.map((c) => c.id),
    teamBIds: teamB.map((c) => c.id),
    statusCatalog: statuses,
    reactionCatalog: reactions.all(),
    jutsuCatalog: jutsus,
    sideIds(id) {
      return this.teamAIds.includes(id) ? this.teamAIds : this.teamBIds;
    },
  };
}

test('Naruto Genin real cria um combatente com HP/Chakra/recurso do catálogo', () => {
  const narutoDef = characters.get('CHAR_NARUTO_GENIN_001');
  const naruto = createCombatantFromCharacter(narutoDef, { position: POSITIONS.FRENTE });

  assert.equal(naruto.hp, 128);
  assert.equal(naruto.chakra, 118);
  assert.deepEqual(naruto.resource, {
    id: 'clones', name: 'Clones', max: 5, current: 0,
  });
});

test('Kage Bunshin (jutsu real) concede Clones ao Naruto real, até o máximo', () => {
  const narutoDef = characters.get('CHAR_NARUTO_GENIN_001');
  const naruto = createCombatantFromCharacter(narutoDef, {
    id: 'naruto', position: POSITIONS.FRENTE,
  });
  naruto.attributes = createAttributes({ ...naruto.attributes, chakraMax: 200 });
  naruto.chakra = 200;
  const alvo = createCombatant({ id: 'alvo', attributes: createAttributes() });
  const state = fakeState([naruto], [alvo]);

  const result = resolveAction(state, naruto, {
    type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_KAGE_BUNSHIN_001', targetId: 'naruto',
  });

  assert.equal(result.applied, true);
  assert.equal(naruto.resource.current, 2);
  assert.equal(result.resourceGained, 2);

  // Kage Bunshin tem cooldown 1 — uma segunda tentativa imediata (mesma
  // rodada, sem ninguém ter tickado cooldowns) deve ser recusada por
  // cooldown, não por orçamento de ação (por isso usa o slot RAPIDA, que
  // ainda está livre).
  const second = resolveAction(state, naruto, {
    type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_KAGE_BUNSHIN_001', targetId: 'naruto', slot: 'RAPIDA',
  });
  assert.equal(second.applied, false);
  assert.equal(second.reason, 'ON_COOLDOWN');
  assert.equal(naruto.resource.current, 2, 'tentativa recusada não deveria gerar mais Clones');
});

test('Analyze (jutsu real) concede Planejamento ao Shikamaru real', () => {
  const shikamaruDef = characters.get('CHAR_SHIKAMARU_GENIN_001');
  const shikamaru = createCombatantFromCharacter(shikamaruDef, {
    id: 'shikamaru', position: POSITIONS.FRENTE,
  });
  const alvo = createCombatant({ id: 'alvo', attributes: createAttributes() });
  const state = fakeState([shikamaru], [alvo]);

  const result = resolveAction(state, shikamaru, {
    type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_ANALYZE_SHIKAMARU_001', targetId: 'shikamaru',
  });

  assert.equal(result.applied, true);
  assert.equal(shikamaru.resource.current, 1);
});

test('combate completo entre dois Genin reais até decidir vencedor', () => {
  const narutoDef = characters.get('CHAR_NARUTO_GENIN_001');
  const sasukeDef = characters.get('CHAR_SASUKE_GENIN_001');

  const naruto = createCombatantFromCharacter(narutoDef, { id: 'naruto', position: POSITIONS.FRENTE });
  naruto.attributes = createAttributes({
    ...naruto.attributes, ...ALWAYS_HIT, ...NEVER_CRIT,
  });
  const sasuke = createCombatantFromCharacter(sasukeDef, { id: 'sasuke', position: POSITIONS.FRENTE });
  sasuke.attributes = createAttributes({ ...sasuke.attributes, hpMax: 40 });
  sasuke.hp = 40;

  const state = new CombatState({
    teamA: [naruto],
    teamB: [sasuke],
    seedManager: new SeedManager('genin-fight'),
    statusCatalog: statuses,
    reactionCatalog: reactions.all(),
    jutsuCatalog: jutsus,
  });

  let guard = 0;
  while (!state.isCombatOver() && guard < 100) {
    const actorId = state.currentActorId();
    const targetId = actorId === 'naruto' ? 'sasuke' : 'naruto';
    const action = actorId === 'naruto'
      ? { type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_RASENGAN_001', targetId }
      : { type: ACTION_TYPES.ATAQUE_BASICO, targetId };
    const result = state.applyAction(actorId, action);
    if (!result.applied) state.applyAction(actorId, { type: ACTION_TYPES.ATAQUE_BASICO, targetId });
    guard += 1;
  }

  assert.equal(state.isCombatOver(), true);
  assert.equal(state.winner(), 'A');
});

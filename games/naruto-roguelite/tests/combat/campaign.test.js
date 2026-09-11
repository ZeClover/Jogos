import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAttributes } from '../../src/engine/combat/attributes.js';
import { createCombatant, applyDamage } from '../../src/engine/combat/combatant.js';
import { snapshotSquad, applySquadSnapshot, survivingIds } from '../../src/engine/combat/campaign.js';

function fighter(id, overrides = {}, resource = null) {
  return createCombatant({ id, attributes: createAttributes(overrides), resource });
}

test('snapshotSquad só inclui sobreviventes (HP > 0)', () => {
  const alive = fighter('a', { hpMax: 100 });
  const dead = fighter('b', { hpMax: 100 });
  applyDamage(dead, 9999);

  const snapshot = snapshotSquad([alive, dead]);
  assert.equal(snapshot.length, 1);
  assert.equal(snapshot[0].id, 'a');
});

test('snapshotSquad grava hp/chakra/recurso do sobrevivente', () => {
  const c = fighter('a', { hpMax: 100, chakraMax: 50 }, { id: 'clones', name: 'Clones', max: 5 });
  applyDamage(c, 30);
  c.resource.current = 3;

  const [snap] = snapshotSquad([c]);
  assert.equal(snap.hp, 70);
  assert.equal(snap.chakra, 50);
  assert.equal(snap.resourceCurrent, 3);
});

test('applySquadSnapshot restaura hp/chakra/recurso em combatentes recém-criados com o mesmo id', () => {
  const before = fighter('a', { hpMax: 100, chakraMax: 50 }, { id: 'clones', name: 'Clones', max: 5 });
  applyDamage(before, 40);
  before.resource.current = 2;
  const snapshot = snapshotSquad([before]);

  const fresh = fighter('a', { hpMax: 100, chakraMax: 50 }, { id: 'clones', name: 'Clones', max: 5 });
  applySquadSnapshot([fresh], snapshot);

  assert.equal(fresh.hp, 60);
  assert.equal(fresh.chakra, 50);
  assert.equal(fresh.resource.current, 2);
});

test('applySquadSnapshot não estoura o max do combatente novo (ex: max maior no snapshot antigo)', () => {
  const snapshot = [{ id: 'a', hp: 9999, chakra: 9999, resourceCurrent: 9999 }];
  const fresh = fighter('a', { hpMax: 100, chakraMax: 50 }, { id: 'clones', name: 'Clones', max: 5 });

  applySquadSnapshot([fresh], snapshot);

  assert.equal(fresh.hp, 100);
  assert.equal(fresh.chakra, 50);
  assert.equal(fresh.resource.current, 5);
});

test('applySquadSnapshot ignora combatentes sem entrada no snapshot (não estavam no encontro anterior)', () => {
  const fresh = fighter('novo', { hpMax: 100 });
  applySquadSnapshot([fresh], []);
  assert.equal(fresh.hp, 100);
});

test('applySquadSnapshot não mexe no recurso quando o combatente novo não tem recurso exclusivo', () => {
  const snapshot = [{ id: 'a', hp: 50, chakra: 20, resourceCurrent: 3 }];
  const fresh = fighter('a', { hpMax: 100, chakraMax: 50 });
  applySquadSnapshot([fresh], snapshot);
  assert.equal(fresh.resource, null);
});

test('survivingIds devolve os ids do snapshot', () => {
  const snapshot = [{ id: 'a', hp: 10, chakra: 10 }, { id: 'b', hp: 5, chakra: 5 }];
  assert.deepEqual(survivingIds(snapshot), ['a', 'b']);
});

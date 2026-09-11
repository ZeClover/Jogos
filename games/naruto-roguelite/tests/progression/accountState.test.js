import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAccountState, applyRunEnd } from '../../src/engine/progression/accountState.js';
import { isDiscovered } from '../../src/engine/progression/archive.js';

test('createAccountState começa zerado e com Ameaça bloqueada', () => {
  const account = createAccountState();
  assert.deepEqual(account.mastery, {});
  assert.deepEqual(account.archive.discoveredIds, []);
  assert.deepEqual(account.reputation, {});
  assert.equal(account.threatUnlocked, false);
  assert.equal(account.victories, 0);
  assert.equal(account.runsPlayed, 0);
});

test('applyRunEnd em vitória: soma XP por resultado da Crônica, descobre encontros, libera Ameaça', () => {
  const account = createAccountState();
  const chronicle = [
    { day: 2, result: 'SUCESSO_PERFEITO' },
    { day: 3, result: 'SUCESSO' },
  ];
  const {
    leveledUp, discoveredCount, missionXp, reputationDelta,
  } = applyRunEnd(account, {
    chronicle,
    squadIds: ['CHAR_A', 'CHAR_B'],
    encounteredIds: ['ENEMY_X', 'BOSS_Y'],
    regionId: 'REG_Z',
    factionId: 'FACTION_Z',
    won: true,
  });

  assert.equal(missionXp, 50); // 30 + 20
  assert.equal(reputationDelta, 8 + 5); // SUCESSO_PERFEITO + SUCESSO (reputation.js)
  assert.equal(account.reputation.FACTION_Z, reputationDelta);
  assert.equal(account.mastery.CHAR_A.xp, 50);
  assert.equal(account.mastery.CHAR_B.xp, 50);
  assert.equal(discoveredCount, 3);
  assert.ok(isDiscovered(account.archive, 'ENEMY_X'));
  assert.ok(isDiscovered(account.archive, 'BOSS_Y'));
  assert.ok(isDiscovered(account.archive, 'REG_Z'));
  assert.equal(account.threatUnlocked, true);
  assert.equal(account.victories, 1);
  assert.equal(account.runsPlayed, 1);
  assert.deepEqual(leveledUp, []); // 50 XP não é suficiente pra subir de nível
});

test('applyRunEnd em derrota: ainda concede XP/descoberta, mas NÃO libera Ameaça nem soma vitória', () => {
  const account = createAccountState();
  applyRunEnd(account, {
    chronicle: [{ day: 2, result: 'FALHA' }],
    squadIds: ['CHAR_A'],
    encounteredIds: ['ENEMY_X'],
    regionId: 'REG_Z',
    won: false,
  });

  assert.equal(account.mastery.CHAR_A.xp, 5);
  assert.ok(isDiscovered(account.archive, 'ENEMY_X'));
  assert.equal(account.threatUnlocked, false);
  assert.equal(account.victories, 0);
  assert.equal(account.runsPlayed, 1);
});

test('applyRunEnd reporta leveledUp quando o XP acumulado cruza um limiar de nível', () => {
  const account = createAccountState();
  applyRunEnd(account, {
    chronicle: [{ result: 'SUCESSO_PERFEITO' }, { result: 'SUCESSO_PERFEITO' }, { result: 'SUCESSO_PERFEITO' }],
    squadIds: ['CHAR_A'],
    encounteredIds: [],
    won: true,
  });
  const { leveledUp } = applyRunEnd(account, {
    chronicle: [{ result: 'SUCESSO_PERFEITO' }],
    squadIds: ['CHAR_A'],
    encounteredIds: [],
    won: true,
  });
  assert.deepEqual(leveledUp, [{ characterId: 'CHAR_A', level: 1 }]);
});

test('applyRunEnd é serializável em JSON (round-trip preserva o estado)', () => {
  const account = createAccountState();
  applyRunEnd(account, {
    chronicle: [{ result: 'SUCESSO' }],
    squadIds: ['CHAR_A'],
    encounteredIds: ['ENEMY_X'],
    regionId: 'REG_Z',
    won: true,
  });
  const roundTripped = JSON.parse(JSON.stringify(account));
  assert.deepEqual(roundTripped, account);
});

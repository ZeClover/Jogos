// UI do Modo Run (Marco 7, `run.html`) — diferente do roteiro fixo do
// Vertical Slice (`play.html`/`src/ui/game.js`, Marco 6/D019): aqui o
// mapa é gerado por seed de verdade (src/engine/run/mapGenerator.js),
// com nós de Missão/Elite/Descanso, resultado graduado de missão e
// reclassificação de rank — mesmo motor de combate dos Marcos 1-5.
// Duplica parte da lógica de tela de batalha de game.js deliberadamente
// (ver DECISIONS.md D021): extrair um módulo compartilhado agora
// arriscaria a UI já validada do Marco 6 sob pressão de tempo do Marco 7;
// revisitar quando surgir um 3º consumidor real.

import '../data/catalog/index.js';
import {
  characters, enemies, bosses, jutsus, statuses, reactions, regions, items, factions,
} from '../data/index.js';
import { SeedManager, generateSeedString } from '../engine/seed.js';
import { SaveManager } from '../engine/save.js';
import { CombatState } from '../engine/combat/state.js';
import { createCombatantFromCharacter, computeSquadCost } from '../engine/combat/characterBridge.js';
import { createCombatantFromEnemy, createCombatantFromBoss } from '../engine/combat/enemyBridge.js';
import { chooseAction } from '../engine/combat/ai.js';
import { isAlive } from '../engine/combat/combatant.js';
import { snapshotSquad, applySquadSnapshot } from '../engine/combat/campaign.js';
import { ACTION_TYPES, POSITIONS } from '../engine/enums.js';
import {
  createRun, availableNodes, resolveNode, spendReinforceDay,
} from '../engine/run/runState.js';
import { maybeReclassifyNode, reinforceSquad } from '../engine/run/reclassify.js';
import { resolveMissionResult } from '../engine/run/missionResult.js';
import { buyItem, canAfford } from '../engine/run/economy.js';
import {
  createAccountState, applyRunEnd, archiveLabel,
  clampThreatLevel, effectiveAiLevel, effectiveReclassifyChance, THREAT_MIN, THREAT_MAX,
  xpToNextLevel, MASTERY_MAX_LEVEL,
  getReputationValue, reputationLevel,
} from '../engine/progression/index.js';

const DEFAULT_REGION_ID = 'REG_PAIS_DAS_ONDAS_001';
const SQUAD_IDS = [
  'CHAR_NARUTO_GENIN_001', 'CHAR_SASUKE_GENIN_001', 'CHAR_SAKURA_GENIN_001', 'CHAR_SHIKAMARU_GENIN_001',
];
const NODE_LABEL = {
  MISSAO: 'Missão', ELITE: 'Elite', BOSS: 'Confronto Final', DESCANSO: 'Descanso', LOJA: 'Mercador',
};
// Itens vendíveis no nó LOJA (Marco 10, D028): qualquer Item do catálogo com `price` definido.
const SHOP_ITEM_IDS = () => items.all().filter((def) => typeof def.price === 'number').map((def) => def.id);
const RESULT_LABEL = {
  SUCESSO_PERFEITO: 'Sucesso Perfeito',
  SUCESSO: 'Sucesso',
  SUCESSO_PARCIAL: 'Sucesso Parcial',
  FALHA: 'Falha',
  DESASTRE: 'Desastre',
  DESCANSO: 'Descanso',
  LOJA: 'Compras feitas',
};
const POSITION_LABEL = { FRENTE: 'Frente', CENTRO: 'Centro', TRAS: 'Trás' };
const ACTION_LABEL = { ATAQUE_BASICO: 'Ataque Básico', DEFENDER: 'Defender' };
const AI_STEP_DELAY_MS = 500;
const DESCANSO_HEAL_PERCENT = 0.5;

const saveManager = new SaveManager();

/** @type {any} */
const R = {
  screen: 'INTRO',
  seedManager: null,
  run: null,
  squadSnapshot: null,
  pendingNode: null,
  state: null,
  teamA: [],
  teamB: [],
  enemyMeta: new Map(),
  squadBeforeBattle: null,
  pendingAction: null,
  lastResultMessage: null,
  account: saveManager.load('account')?.data ?? createAccountState(),
  threatLevel: THREAT_MIN,
  encounteredIds: new Set(),
  runEndSummary: null,
  regionId: DEFAULT_REGION_ID,
  shopBuyerId: null,
  equipment: {}, // { [characterId]: armaItemId|null } (Marco 10, D029) — escolhido na Introdução, dura a Run inteira.
};

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function barRow(label, current, max, cls) {
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((current / max) * 100))) : 0;
  return `
    <div class="vs-bar-row">
      <span class="vs-bar-label">${escapeHtml(label)}</span>
      <span class="vs-bar-track"><span class="vs-bar-fill ${cls}" style="width:${pct}%"></span></span>
      <span class="vs-bar-value">${current}/${max}</span>
    </div>
  `;
}

// --- Esquadrão / inimigos ---------------------------------------------------

function buildSquad(snapshot) {
  const ids = snapshot ? snapshot.map((s) => s.id) : SQUAD_IDS;
  const combatants = ids.map((id) => createCombatantFromCharacter(characters.get(id), {
    extraInventory: R.run?.purchasedInventory?.[id],
    equippedItems: [items.get(R.equipment[id])].filter(Boolean),
  }));
  if (snapshot) applySquadSnapshot(combatants, snapshot);
  return combatants;
}

function buildEnemyTeam(node) {
  const meta = new Map();
  const seenCount = new Map();
  const combatants = node.enemyIds.map((enemyId) => {
    const bossDef = bosses.get(enemyId);
    // Marco 9: Regiões com useGenerator (ex: Floresta da Morte) montam
    // fichas efêmeras em `run.map.generatedEnemies` — não passam pela
    // Registry `enemies` (D023 #1). `createCombatantFromEnemy` já aceita
    // qualquer objeto no formato certo, gerado ou não.
    const def = bossDef ?? enemies.get(enemyId) ?? R.run.map.generatedEnemies[enemyId];
    const n = (seenCount.get(enemyId) ?? 0) + 1;
    seenCount.set(enemyId, n);
    const combatantId = n > 1 ? `${enemyId}#${n}` : enemyId;
    const bridge = bossDef ? createCombatantFromBoss : createCombatantFromEnemy;
    const combatant = bridge(def, { id: combatantId, position: POSITIONS.FRENTE });
    combatant.name = n > 1 ? `${def.name} ${n}` : def.name;
    // Ameaça (Marco 8): sob nível suficiente, inimigos comuns "sobem" 1 nível de IA — nunca stat bruto (ver DECISIONS.md D022).
    const aiLevel = effectiveAiLevel(def.aiLevel, R.threatLevel);
    meta.set(combatant.id, { aiLevel, aiProfile: def.aiProfile ?? null });
    // Arquivo Ninja (Marco 8) só registra conteúdo estável do catálogo —
    // fichas geradas (GEN_*) são efêmeras, sem identidade fixa entre runs
    // (D023 #1), então não entram no Arquivo.
    if (!def.generated) R.encounteredIds.add(enemyId);
    return combatant;
  });
  return { combatants, meta };
}

// --- Ações do jogador (mesma lógica de game.js, ver D021) -------------------

function targetKindForRange(range) {
  if (range === 'SELF') return 'SELF';
  if (range === 'ALLY') return 'ALLY';
  return 'ENEMY';
}

function effectiveJutsuCost(actor, jutsuDef) {
  const raw = Math.max(0, jutsuDef.cost ?? 0);
  return Math.round(raw * (1 - Math.min(1, Math.max(0, actor.attributes.eficiencia ?? 0))));
}

function hasBudget(actor, slot) {
  return (actor.actionBudget[slot] ?? 0) > 0;
}

function getActionOptions(actor) {
  const charDef = characters.get(actor.id);
  const options = [{
    kind: 'ATAQUE_BASICO', label: 'Ataque Básico', detail: `Taijutsu ${actor.attributes.taijutsu} · Corpo a corpo`, slot: 'PRINCIPAL', targetKind: 'ENEMY',
  }];

  if (charDef) {
    const jutsuIds = [
      ...(charDef.loadout.ativas ?? []),
      ...(charDef.loadout.suprema ? [charDef.loadout.suprema] : []),
      ...(charDef.loadout.reacao ? [charDef.loadout.reacao] : []),
    ];
    for (const jutsuId of jutsuIds) {
      const def = jutsus.get(jutsuId);
      if (!def) continue;
      const cost = effectiveJutsuCost(actor, def);
      const cooldownLeft = actor.cooldowns.get(jutsuId) ?? 0;
      options.push({
        kind: 'JUTSU',
        jutsuId,
        label: def.name,
        detail: `${def.rank} · Custo ${cost}${def.cooldown ? ` · CD ${def.cooldown}` : ''}${cooldownLeft > 0 ? ` · recarregando (${cooldownLeft}r)` : ''}`,
        slot: def.slot ?? 'PRINCIPAL',
        targetKind: targetKindForRange(def.range),
        disabled: cooldownLeft > 0 || actor.chakra < cost,
      });
    }
  }

  for (const [itemId, count] of Object.entries(actor.inventory)) {
    const def = items.get(itemId);
    if (!def) continue;
    options.push({
      kind: 'ITEM',
      itemId,
      label: `${def.name} (${count}x)`,
      detail: `${def.category} · ${def.effect}`,
      slot: 'PRINCIPAL',
      targetKind: targetKindForRange(def.range ?? 'RANGED'),
      disabled: count <= 0,
    });
  }

  options.push({
    kind: 'DEFENDER', label: 'Defender', detail: 'Reduz o próximo dano recebido', slot: 'PRINCIPAL', targetKind: 'NONE',
  });
  for (const pos of Object.values(POSITIONS)) {
    if (pos === actor.position) continue;
    options.push({
      kind: 'MOVER', label: `Mover: ${POSITION_LABEL[pos]}`, detail: 'Troca de linha', slot: 'RAPIDA', targetKind: 'NONE', position: pos,
    });
  }

  return options.map((opt) => ({ ...opt, disabled: Boolean(opt.disabled) || !hasBudget(actor, opt.slot) }));
}

function optionKey(opt) {
  return `${opt.kind}|${opt.jutsuId ?? ''}|${opt.itemId ?? ''}|${opt.position ?? ''}`;
}

function buildActionPayload(option, targetId) {
  if (option.kind === 'ATAQUE_BASICO') return { type: ACTION_TYPES.ATAQUE_BASICO, targetId };
  if (option.kind === 'JUTSU') return { type: ACTION_TYPES.JUTSU, jutsuId: option.jutsuId, targetId };
  if (option.kind === 'ITEM') return { type: ACTION_TYPES.ITEM, itemId: option.itemId, targetId };
  if (option.kind === 'DEFENDER') return { type: ACTION_TYPES.DEFENDER };
  if (option.kind === 'MOVER') return { type: ACTION_TYPES.MOVER, position: option.position };
  return null;
}

// --- Fluxo da Run ------------------------------------------------------

function startRun(seedInput, threatLevelInput, regionIdInput) {
  const seed = seedInput?.trim() || generateSeedString();
  R.seedManager = new SeedManager(seed);
  R.threatLevel = R.account.threatUnlocked ? clampThreatLevel(Number(threatLevelInput) || THREAT_MIN) : THREAT_MIN;
  R.regionId = regions.has(regionIdInput) ? regionIdInput : DEFAULT_REGION_ID;
  R.run = createRun({ region: regions.get(R.regionId), seedManager: R.seedManager });
  R.squadSnapshot = null;
  R.encounteredIds = new Set();
  R.runEndSummary = null;
  R.screen = 'MAP';
  render();
}

function ensureNodesReclassified() {
  const chance = effectiveReclassifyChance(0.15, R.threatLevel);
  for (const node of availableNodes(R.run)) {
    maybeReclassifyNode(node, R.seedManager.map, chance);
  }
}

function onSelectNode(nodeId) {
  const node = availableNodes(R.run).find((n) => n.id === nodeId);
  if (!node) return;
  if (node.type === 'DESCANSO') {
    resolveDescanso(node);
    return;
  }
  if (node.type === 'LOJA') {
    R.pendingNode = node;
    R.shopBuyerId = SQUAD_IDS.find((id) => (R.squadSnapshot?.find((s) => s.id === id)?.hp ?? 1) > 0) ?? SQUAD_IDS[0];
    R.screen = 'SHOP';
    render();
    return;
  }
  if (node.reclassified) {
    R.pendingNode = node;
    R.screen = 'RECLASSIFY_CHOICE';
    render();
    return;
  }
  startBattle(node);
}

/** Aplica o fim de Run (Marco 8) ao estado de conta e salva, se a Run acabou de terminar. */
function finalizeRunIfEnded() {
  if (R.run.status === 'IN_PROGRESS') return;
  R.runEndSummary = applyRunEnd(R.account, {
    chronicle: R.run.chronicle,
    squadIds: SQUAD_IDS,
    encounteredIds: [...R.encounteredIds],
    regionId: R.regionId,
    factionId: regions.get(R.regionId)?.factionId ?? null,
    won: R.run.status === 'VICTORY',
  });
  saveManager.save('account', R.account);
}

function resolveDescanso(node) {
  const squad = buildSquad(R.squadSnapshot);
  for (const c of squad) {
    if (c.hp <= 0) continue;
    c.hp = Math.min(c.attributes.hpMax, Math.round(c.hp + c.attributes.hpMax * DESCANSO_HEAL_PERCENT));
  }
  R.squadSnapshot = snapshotSquad(squad);
  resolveNode(R.run, node, 'DESCANSO');
  R.screen = R.run.status === 'IN_PROGRESS' ? 'MAP' : R.run.status;
  finalizeRunIfEnded();
  render();
}

function onBuyItem(itemId) {
  const def = items.get(itemId);
  if (!def || typeof def.price !== 'number' || !R.shopBuyerId) return;
  buyItem(R.run, R.shopBuyerId, itemId, def.price);
  render();
}

function leaveShop() {
  const node = R.pendingNode;
  if (!node) return;
  resolveNode(R.run, node, 'LOJA');
  R.pendingNode = null;
  R.shopBuyerId = null;
  R.screen = R.run.status === 'IN_PROGRESS' ? 'MAP' : R.run.status;
  finalizeRunIfEnded();
  render();
}

function onReclassifyChoice(choice) {
  const node = R.pendingNode;
  if (!node) return;
  if (choice === 'RETREAT') {
    R.pendingNode = null;
    R.screen = 'MAP';
    render();
    return;
  }
  if (choice === 'REINFORCE') {
    const squad = buildSquad(R.squadSnapshot);
    reinforceSquad(squad);
    R.squadSnapshot = snapshotSquad(squad);
    spendReinforceDay(R.run);
  }
  R.pendingNode = null;
  startBattle(node);
}

function startBattle(node) {
  const teamA = buildSquad(R.squadSnapshot);
  const { combatants: teamB, meta } = buildEnemyTeam(node);

  R.pendingNode = node;
  R.teamA = teamA;
  R.teamB = teamB;
  R.enemyMeta = meta;
  R.squadBeforeBattle = teamA.map((c) => ({ id: c.id, attributes: c.attributes }));
  R.pendingAction = null;
  R.lastResultMessage = null;
  R.state = new CombatState({
    teamA,
    teamB,
    seedManager: R.seedManager,
    statusCatalog: statuses,
    reactionCatalog: reactions.all(),
    jutsuCatalog: jutsus,
    itemCatalog: items,
  });
  R.screen = 'BATTLE';
  maybeRunAI();
}

function isEnemyActor(id) {
  return R.teamB.some((c) => c.id === id);
}

function maybeRunAI() {
  if (R.state.isCombatOver()) { onBattleEnd(); return; }
  const actorId = R.state.currentActorId();
  if (!isEnemyActor(actorId)) { render(); return; }
  render();
  setTimeout(() => {
    const actor = R.state.combatants.get(actorId);
    const meta = R.enemyMeta.get(actorId) ?? { aiLevel: 'BASICA', aiProfile: null };
    let action;
    try {
      action = chooseAction(R.state, actor, { level: meta.aiLevel, bossId: meta.aiProfile });
    } catch {
      action = null;
    }
    const result = action ? R.state.applyAction(actorId, action) : { applied: false };
    if (!result.applied) R.state.applyAction(actorId, { type: ACTION_TYPES.DEFENDER });
    maybeRunAI();
  }, AI_STEP_DELAY_MS);
}

function resolvePlayerAction(actorId, action) {
  const result = R.state.applyAction(actorId, action);
  R.pendingAction = null;
  R.lastResultMessage = result.applied ? null : `Ação recusada: ${result.reason}`;
  if (R.state.isCombatOver()) { onBattleEnd(); return; }
  maybeRunAI();
}

function onBattleEnd() {
  const won = R.state.winner() === 'A';
  const result = resolveMissionResult({
    squadBefore: R.squadBeforeBattle,
    squadAfter: R.teamA,
    won,
  });
  R.squadSnapshot = snapshotSquad(R.teamA);
  resolveNode(R.run, R.pendingNode, result);
  R.lastResultMessage = null;
  R.screen = R.run.status === 'IN_PROGRESS' ? 'MAP' : R.run.status;
  finalizeRunIfEnded();
  render();
}

function onSelectOption(index) {
  const actorId = R.state.currentActorId();
  const actor = R.state.combatants.get(actorId);
  const option = getActionOptions(actor)[index];
  if (!option || option.disabled) return;

  if (option.targetKind === 'NONE') { resolvePlayerAction(actorId, buildActionPayload(option)); return; }
  if (option.targetKind === 'SELF') { resolvePlayerAction(actorId, buildActionPayload(option, actorId)); return; }
  R.pendingAction = option;
  render();
}

function onSelectTarget(targetId) {
  const option = R.pendingAction;
  if (!option) return;
  const target = R.state.combatants.get(targetId);
  if (!target || !isAlive(target)) return;

  const isOwnSide = R.teamA.some((c) => c.id === targetId);
  if (option.targetKind === 'ENEMY' && isOwnSide) return;
  if (option.targetKind === 'ALLY' && !isOwnSide) return;

  const actorId = R.state.currentActorId();
  R.pendingAction = null;
  resolvePlayerAction(actorId, buildActionPayload(option, targetId));
}

function restart() {
  R.screen = 'INTRO';
  R.seedManager = null;
  R.run = null;
  R.squadSnapshot = null;
  R.pendingNode = null;
  R.state = null;
  R.teamA = [];
  R.teamB = [];
  R.enemyMeta = new Map();
  R.pendingAction = null;
  R.lastResultMessage = null;
  R.shopBuyerId = null;
}

// --- Renderização --------------------------------------------------------

function computeTargetableIds() {
  const option = R.pendingAction;
  if (!option) return new Set();
  if (option.targetKind === 'ENEMY') return new Set(R.teamB.filter(isAlive).map((c) => c.id));
  if (option.targetKind === 'ALLY') return new Set(R.teamA.filter(isAlive).map((c) => c.id));
  return new Set();
}

function renderCombatantCard(c, { isCurrentTurn, clickable }) {
  const meta = R.enemyMeta.get(c.id);
  const statesHtml = c.states.map((s) => {
    const def = statuses.get(s.stateId);
    const label = def?.name ?? s.stateId;
    const controlCls = def?.controlType ? 'state-control' : '';
    return `<span class="vs-tag ${controlCls}">${escapeHtml(label)}${s.stacks > 1 ? `×${s.stacks}` : ''} (${s.duration}r)</span>`;
  }).join('');

  return `
    <div class="vs-combatant ${isAlive(c) ? '' : 'is-down'} ${isCurrentTurn ? 'is-turn' : ''} ${clickable ? 'is-target-candidate' : ''}" data-target-id="${c.id}">
      <div class="vs-combatant-head">
        <strong>${escapeHtml(c.name)}</strong>
        <span class="vs-combatant-meta">${POSITION_LABEL[c.position]}${meta ? ` · ${escapeHtml(meta.aiLevel)}` : ''}</span>
      </div>
      ${barRow('HP', c.hp, c.attributes.hpMax, 'hp')}
      ${c.attributes.chakraMax > 0 ? barRow('Chakra', c.chakra, c.attributes.chakraMax, 'chakra') : ''}
      ${c.resource ? barRow(c.resource.name, c.resource.current, c.resource.max, 'resource') : ''}
      ${c.guard > 0 ? `<span class="vs-tag hint">Guarda +${c.guard}</span>` : ''}
      ${statesHtml ? `<div class="vs-tag-row">${statesHtml}</div>` : ''}
    </div>
  `;
}

function renderSide(combatants, title, targetableIds) {
  const currentActorId = R.state.currentActorId();
  const cards = combatants.map((c) => renderCombatantCard(c, {
    isCurrentTurn: c.id === currentActorId,
    clickable: targetableIds.has(c.id),
  })).join('');
  return `<div class="vs-side"><h3>${escapeHtml(title)}</h3>${cards}</div>`;
}

function renderActionPanel(actor) {
  const options = getActionOptions(actor);
  const buttons = options.map((opt, i) => `
    <button class="vs-action-btn ${R.pendingAction && optionKey(opt) === optionKey(R.pendingAction) ? 'is-selected' : ''}"
            data-option-index="${i}" ${opt.disabled ? 'disabled' : ''}>
      <span class="vs-action-name">${escapeHtml(opt.label)}</span>
      <span class="vs-action-detail">${escapeHtml(opt.detail)}</span>
    </button>
  `).join('');
  const cancel = R.pendingAction ? '<button class="vs-btn secondary" data-cancel-action>Cancelar alvo</button>' : '';
  return `<div class="vs-actions">${buttons}</div>${cancel}`;
}

function actorName(id) {
  return R.state.combatants.get(id)?.name ?? id;
}

function formatLogLines() {
  return R.state.log.map((event) => {
    if (event.type === 'ROUND_START') return { cls: 'vs-log-round', text: `— Rodada ${event.round} —` };
    if (event.type === 'COMBAT_END') {
      return { cls: 'vs-log-end', text: `>>> Combate encerrado — vencedor: ${event.winner === 'A' ? 'esquadrão' : 'inimigos'}` };
    }
    if (event.type === 'DOT') return { text: `  ${actorName(event.targetId)} perde ${event.amount} de ${event.stat} (dano contínuo)` };
    if (event.type !== 'ACTION') return null;

    const { actorId, action, result } = event;
    if (!result.applied) return null;
    const who = actorName(actorId);
    const label = action.jutsuId
      ? (jutsus.get(action.jutsuId)?.name ?? action.jutsuId)
      : action.itemId
        ? (items.get(action.itemId)?.name ?? action.itemId)
        : (ACTION_LABEL[action.type] ?? action.type);

    if (result.armed) return { text: `  ${who} arma ${label}` };
    if (result.evaded) return { text: `  ${who} usa ${label} em ${actorName(action.targetId)} -> evadido com Kawarimi!` };
    if (result.removedStates) return { text: `  ${who} usa ${label} -> limpa [${result.removedStates.join(', ') || 'nada'}]` };
    if (result.chakraRestored !== undefined) return { text: `  ${who} usa ${label} em ${actorName(action.targetId)} -> restaura ${result.chakraRestored} de Chakra` };
    if (result.healed !== undefined) return { text: `  ${who} usa ${label} em ${actorName(action.targetId)} -> cura ${result.healed}` };
    if (action.type === ACTION_TYPES.DEFENDER) return { text: `  ${who} se defende (+${result.guard} de guarda)` };
    if (action.type === ACTION_TYPES.MOVER) return { text: `  ${who} muda para ${POSITION_LABEL[result.position]}` };
    if (result.hit === false) return { text: `  ${who} usa ${label} em ${actorName(action.targetId)} -> errou` };
    if (result.damage !== undefined) {
      const statesTxt = result.appliedStates?.some((s) => s.applied) ? ' [aplica Estado]' : '';
      return { text: `  ${who} usa ${label} em ${actorName(action.targetId)} -> ${result.damage} de dano${result.isCrit ? ' (crítico!)' : ''}${statesTxt}` };
    }
    return { text: `  ${who} usa ${label}` };
  }).filter(Boolean);
}

function archiveTotalCount() {
  return enemies.size + bosses.size + regions.size;
}

function renderMasteryRow(characterId) {
  const def = characters.get(characterId);
  const entry = R.account.mastery[characterId];
  const level = entry?.level ?? 0;
  const xp = entry?.xp ?? 0;
  const toNext = xpToNextLevel(entry);
  return `
    <div class="vs-bar-row">
      <span class="vs-bar-label">${escapeHtml(def.name)}</span>
      <span class="vs-bar-track"><span class="vs-bar-fill resource" style="width:${Math.round((level / MASTERY_MAX_LEVEL) * 100)}%"></span></span>
      <span class="vs-bar-value">Nv ${level}${toNext !== null ? ` (+${toNext}xp)` : ' (máx)'}</span>
    </div>
  `;
}

function renderArchiveEntries() {
  const allIds = [...enemies.all(), ...bosses.all(), ...regions.all()].map((def) => def.id);
  const items = allIds.map((id) => {
    const registry = bosses.has(id) ? bosses : (regions.has(id) ? regions : enemies);
    return `<span class="vs-tag ${bosses.has(id) ? 'state-control' : ''}">${escapeHtml(archiveLabel(R.account.archive, id, registry))}</span>`;
  }).join('');
  return `<div class="vs-tag-row" style="margin:8px 0 4px">${items}</div>`;
}

/** Só mostra Facções cuja Região já foi visitada nesta conta (Neutra 0 pra todas seria ruído sem sentido — Marco 9, D026). */
function renderReputationEntries() {
  const knownFactionIds = [...new Set(
    regions.all()
      .filter((r) => r.factionId && R.account.archive.discoveredIds.includes(r.id))
      .map((r) => r.factionId),
  )];
  if (!knownFactionIds.length) return '';
  const rows = knownFactionIds.map((factionId) => {
    const def = factions.get(factionId);
    const value = getReputationValue(R.account.reputation, factionId);
    const level = reputationLevel(value);
    return `<span class="vs-tag">${escapeHtml(def.name)}: ${level} (${value >= 0 ? '+' : ''}${value})</span>`;
  }).join('');
  return `
    <p class="vs-hint">Reputação de Facção (sobe/desce com o resultado das missões na Região dela):</p>
    <div class="vs-tag-row" style="margin:8px 0 4px">${rows}</div>
  `;
}

function renderAccountPanel() {
  const discovered = R.account.archive.discoveredIds.length;
  const total = archiveTotalCount();
  return `
    <h3 style="margin-top:18px">Progressão da Conta</h3>
    <p class="vs-hint">
      Vitórias: ${R.account.victories} · Runs jogadas: ${R.account.runsPlayed} ·
      Arquivo Ninja: ${discovered}/${total} entradas descobertas
      ${R.account.threatUnlocked ? '· Ameaça liberada 🔓' : '· Ameaça bloqueada (vença uma Run para liberar)'}
    </p>
    ${renderArchiveEntries()}
    <p class="vs-hint">Maestria (ganha jogando — nunca comprada, nunca vira bônus de status):</p>
    ${SQUAD_IDS.map(renderMasteryRow).join('')}
    ${renderReputationEntries()}
  `;
}

/** Equipamento persistente (Marco 10, D029): 1 arma opcional por membro do esquadrão, escolhida antes de gerar o mapa. */
function renderEquipmentPanel(defs) {
  const armaOptions = items.all().filter((d) => d.category === 'ARMA');
  const rows = defs.map((def) => {
    const options = [
      `<option value="">Nenhuma</option>`,
      ...armaOptions.map((arma) => `<option value="${arma.id}" ${R.equipment[def.id] === arma.id ? 'selected' : ''}>${escapeHtml(arma.name)}</option>`),
    ].join('');
    return `
      <div style="display:flex;gap:8px;align-items:center;margin:4px 0;flex-wrap:wrap">
        <label for="equip-arma-${def.id}" class="vs-hint" style="min-width:110px">${escapeHtml(def.name)}:</label>
        <select id="equip-arma-${def.id}" data-equip-character="${def.id}"
                style="background:#fff;border:1px solid var(--panel-border);color:var(--ink);border-radius:6px;padding:6px 8px;font-family:inherit">
          ${options}
        </select>
      </div>
    `;
  }).join('');
  return `
    <h3 style="margin-top:14px">Equipamento (Arma, opcional)</h3>
    <p class="vs-hint">Armas Lendárias mudam atributos (com tradeoff) — dura a Run inteira, sem custo. Ver DECISIONS.md D029.</p>
    ${rows}
  `;
}

function renderIntroScreen() {
  const region = regions.get(R.regionId);
  const defs = SQUAD_IDS.map((id) => characters.get(id));
  const threatOptions = R.account.threatUnlocked
    ? `
      <div style="display:flex;gap:8px;align-items:center;margin:6px 0 14px;flex-wrap:wrap">
        <label for="run-threat-input" class="vs-hint">Nível de Ameaça (${THREAT_MIN}-${THREAT_MAX}, sobe a IA inimiga, não HP/dano):</label>
        <input id="run-threat-input" type="number" min="${THREAT_MIN}" max="${THREAT_MAX}" value="0"
               style="width:70px;background:#fff;border:1px solid var(--panel-border);color:var(--ink);border-radius:6px;padding:6px 8px;font-family:inherit" />
      </div>
    `
    : '';
  const regionOptions = regions.all().map((r) => `
    <option value="${r.id}" ${r.id === R.regionId ? 'selected' : ''}>${escapeHtml(r.name)} (Ato ${escapeHtml(r.act)})</option>
  `).join('');

  return `
    <div class="vs-scroll">
      <h2>${escapeHtml(region.name)} — Modo Run</h2>
      <p class="vs-hint">${escapeHtml(region.description)}</p>
      <p class="vs-hint">
        Esquadrão: Naruto, Sasuke, Sakura e Shikamaru (Custo ${computeSquadCost(defs)}/12).
        O mapa (missões, elites, descanso e o confronto final) é gerado a partir
        de uma seed — a mesma seed sempre produz o mesmo mapa.
        ${region.useGenerator ? 'Os inimigos comuns/elite desta Região são gerados proceduralmente (Marco 9); o confronto final usa um boss autorado de verdade.' : ''}
      </p>
      <div style="display:flex;gap:8px;align-items:center;margin:14px 0;flex-wrap:wrap">
        <label for="run-region-select" class="vs-hint">Região:</label>
        <select id="run-region-select" style="background:#fff;border:1px solid var(--panel-border);color:var(--ink);border-radius:6px;padding:6px 8px;font-family:inherit">
          ${regionOptions}
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin:14px 0;flex-wrap:wrap">
        <input id="run-seed-input" type="text" placeholder="seed da run (opcional)"
               style="flex:1;min-width:200px;background:#fff;border:1px solid var(--panel-border);
                      color:var(--ink);border-radius:6px;padding:8px 10px;font-family:inherit" />
      </div>
      ${threatOptions}
      ${renderEquipmentPanel(defs)}
      <button class="vs-btn" data-start-run>Gerar Mapa e Começar</button>
      <p class="vs-hint" style="margin-top:14px">Prefere o roteiro fixo já validado? <a href="play.html">Jogar o Vertical Slice</a>.</p>
      ${renderAccountPanel()}
    </div>
  `;
}

function renderMapScreen() {
  ensureNodesReclassified();
  const nodes = availableNodes(R.run);
  const cards = nodes.map((node) => {
    const enemyNames = (node.enemyIds ?? [])
      .map((id) => (bosses.get(id) ?? enemies.get(id) ?? R.run.map.generatedEnemies[id])?.name)
      .filter(Boolean);
    return `
      <button class="vs-node-card ${node.isBoss ? 'is-boss' : ''} ${node.reclassified ? 'is-reclassified' : ''}" data-node-id="${node.id}">
        <h4>${NODE_LABEL[node.type]}${node.reclassified ? ' ⚠️' : ''}</h4>
        <p class="vs-node-meta">${escapeHtml(node.name)}${node.rank ? ` · Rank ${escapeHtml(node.rank)}` : ''}</p>
        ${enemyNames.length ? `<p class="vs-node-meta">${escapeHtml(enemyNames.join(', '))}</p>` : ''}
        ${node.reclassified ? `<p class="vs-node-meta">Reclassificada: ${escapeHtml(node.originalRank)} → ${escapeHtml(node.rank)}</p>` : ''}
      </button>
    `;
  }).join('');

  return `
    <div class="vs-scroll">
      <h2>Dia ${R.run.day} — Escolha o próximo passo</h2>
      <p class="vs-hint">${nodes.length} rota(s) disponível(is) a partir daqui. · Ryō acumulado nesta Run: ${R.run.ryo}</p>
      <div class="vs-node-grid">${cards}</div>
      ${renderChronicle()}
    </div>
  `;
}

/** Nó LOJA (Marco 10, D028): compra itens consumíveis/ferramenta para um membro do esquadrão, gastando o Ryō da Run. */
function renderShopScreen() {
  const defs = SQUAD_IDS.map((id) => characters.get(id));
  const buyerOptions = defs.map((def) => `
    <option value="${def.id}" ${def.id === R.shopBuyerId ? 'selected' : ''}>${escapeHtml(def.name)}</option>
  `).join('');

  const buyerInventory = R.run.purchasedInventory[R.shopBuyerId] ?? {};
  const rows = SHOP_ITEM_IDS().map((itemId) => {
    const def = items.get(itemId);
    const owned = buyerInventory[itemId] ?? 0;
    const affordable = canAfford(R.run, def.price);
    return `
      <div class="vs-node-card">
        <h4>${escapeHtml(def.name)}</h4>
        <p class="vs-node-meta">${escapeHtml(def.category)} · ${escapeHtml(def.effect)} · ${def.price} Ryō${owned ? ` · comprado(s) nesta Run: ${owned}x` : ''}</p>
        <button class="vs-btn" data-buy-item="${itemId}" ${affordable ? '' : 'disabled'}>Comprar</button>
      </div>
    `;
  }).join('');

  return `
    <div class="vs-scroll">
      <h2>🏪 Mercador Itinerante</h2>
      <p class="vs-hint">Ryō disponível: ${R.run.ryo}. Comprar entrega o item para o membro do esquadrão escolhido — ele carrega até o fim da Run (além do kit fixo de cada combate).</p>
      <div style="display:flex;gap:8px;align-items:center;margin:10px 0 14px;flex-wrap:wrap">
        <label for="shop-buyer-select" class="vs-hint">Comprar para:</label>
        <select id="shop-buyer-select" style="background:#fff;border:1px solid var(--panel-border);color:var(--ink);border-radius:6px;padding:6px 8px;font-family:inherit">
          ${buyerOptions}
        </select>
      </div>
      <div class="vs-node-grid">${rows}</div>
      <p><button class="vs-btn secondary" data-shop-continue>Continuar viagem</button></p>
    </div>
  `;
}

function renderReclassifyScreen() {
  const node = R.pendingNode;
  return `
    <div class="vs-scroll vs-end-screen">
      <h2>⚠️ Informação nova: a missão é mais dura do que parecia</h2>
      <p class="vs-hint">
        "${escapeHtml(node.name)}" foi reclassificada de Rank ${escapeHtml(node.originalRank)}
        para Rank ${escapeHtml(node.rank)}. O que o esquadrão faz?
      </p>
      <p>
        <button class="vs-btn" data-reclassify-choice="CONTINUE">Continuar mesmo assim</button>
        <button class="vs-btn secondary" data-reclassify-choice="RETREAT">Recuar (escolher outra rota)</button>
        <button class="vs-btn secondary" data-reclassify-choice="REINFORCE">Buscar reforço (+1 dia, cura 25% o esquadrão)</button>
      </p>
    </div>
  `;
}

function renderBattleScreen() {
  const node = R.pendingNode;
  const actorId = R.state.currentActorId();
  const actor = actorId ? R.state.combatants.get(actorId) : null;
  const isPlayerTurn = Boolean(actor) && R.teamA.some((c) => c.id === actorId);
  const targetableIds = computeTargetableIds();

  const turnBanner = isPlayerTurn
    ? `<div class="vs-turn-banner">Sua vez: <strong>${escapeHtml(actor.name)}</strong>${R.pendingAction ? ` — escolha um alvo para ${escapeHtml(R.pendingAction.label)}` : ''}</div>`
    : `<div class="vs-turn-banner">${actor ? `${escapeHtml(actor.name)} (inimigo) age…` : 'Resolvendo rodada…'}</div>`;

  return `
    <div class="vs-scroll">
      <h2>${NODE_LABEL[node.type]} — ${escapeHtml(node.name)}</h2>
      <p class="vs-hint">Rank ${escapeHtml(node.rank)} · Dia ${R.run.day}</p>
      ${turnBanner}
      <div class="vs-battlefield">
        ${renderSide(R.teamA, 'Esquadrão', targetableIds)}
        ${renderSide(R.teamB, node.name, targetableIds)}
      </div>
      ${R.lastResultMessage ? `<p class="vs-hint">${escapeHtml(R.lastResultMessage)}</p>` : ''}
      ${isPlayerTurn ? renderActionPanel(actor) : ''}
      <pre class="vs-log">${formatLogLines().map((l) => `<span class="${l.cls ?? ''}">${escapeHtml(l.text)}</span>`).join('\n')}</pre>
    </div>
  `;
}

function renderChronicle() {
  if (!R.run.chronicle.length) return '';
  const rows = R.run.chronicle.map((entry) => {
    const bad = entry.result === 'FALHA' || entry.result === 'DESASTRE';
    const good = entry.result === 'SUCESSO_PERFEITO' || entry.result === 'SUCESSO';
    return `
      <li>
        <span>Dia ${entry.day} · ${escapeHtml(NODE_LABEL[entry.nodeType] ?? entry.nodeType)}: ${escapeHtml(entry.nodeName)}</span>
        <span class="result-tag ${bad ? 'bad' : ''} ${good ? 'good' : ''}">${escapeHtml(RESULT_LABEL[entry.result] ?? entry.result)}</span>
      </li>
    `;
  }).join('');
  return `<h3>Crônica da Run</h3><ul class="vs-chronicle">${rows}</ul>`;
}

function renderRunEndSummary() {
  if (!R.runEndSummary) return '';
  const {
    leveledUp, discoveredCount, missionXp, reputationDelta,
  } = R.runEndSummary;
  const levelUpTxt = leveledUp.length
    ? leveledUp.map((l) => `${escapeHtml(characters.get(l.characterId)?.name ?? l.characterId)} -> Nível ${l.level}`).join(', ')
    : 'nenhum';
  const region = regions.get(R.regionId);
  const factionName = region?.factionId ? factions.get(region.factionId)?.name : null;
  return `
    <p class="vs-hint">
      +${missionXp} XP de Maestria para cada membro do esquadrão · Subiu de nível: ${levelUpTxt} ·
      ${discoveredCount} nova(s) entrada(s) no Arquivo Ninja
      ${R.account.threatUnlocked ? '· Ameaça liberada!' : ''}
      ${factionName && reputationDelta ? `· Reputação com ${escapeHtml(factionName)}: ${reputationDelta >= 0 ? '+' : ''}${reputationDelta}` : ''}
      · Ryō restante da Run (não persiste pra próxima): ${R.run.ryo}
    </p>
  `;
}

function renderVictoryScreen() {
  const region = regions.get(R.regionId);
  const bossNames = R.teamB.map((c) => c.name).join(', ');
  return `
    <div class="vs-scroll vs-end-screen">
      <h2>🏆 ${escapeHtml(region.name)} superada!</h2>
      <p class="vs-hint">${escapeHtml(bossNames)} foi derrotado(a) no Dia ${R.run.day}. Seed: <code>${escapeHtml(R.run.seed)}</code></p>
      ${renderRunEndSummary()}
      ${renderChronicle()}
      <p><button class="vs-btn" data-restart>Jogar outra Run</button></p>
    </div>
  `;
}

function renderDefeatScreen() {
  return `
    <div class="vs-scroll vs-end-screen">
      <h2>💀 A run termina aqui</h2>
      <p class="vs-hint">O esquadrão não resistiu. Seed: <code>${escapeHtml(R.run.seed)}</code></p>
      ${renderRunEndSummary()}
      ${renderChronicle()}
      <p><button class="vs-btn danger" data-restart>Tentar outra Run</button></p>
    </div>
  `;
}

function renderScreen() {
  if (R.screen === 'INTRO') return renderIntroScreen();
  if (R.screen === 'MAP') return renderMapScreen();
  if (R.screen === 'SHOP') return renderShopScreen();
  if (R.screen === 'RECLASSIFY_CHOICE') return renderReclassifyScreen();
  if (R.screen === 'BATTLE') return renderBattleScreen();
  if (R.screen === 'VICTORY') return renderVictoryScreen();
  if (R.screen === 'DEFEAT') return renderDefeatScreen();
  return '<div class="vs-scroll"><p>?</p></div>';
}

function render() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = renderScreen();
  const log = app.querySelector('.vs-log');
  if (log) log.scrollTop = log.scrollHeight;
}

// --- Eventos ---------------------------------------------------------------

function handleClick(event) {
  if (event.target.closest('[data-start-run]')) {
    startRun(
      document.getElementById('run-seed-input')?.value,
      document.getElementById('run-threat-input')?.value,
      document.getElementById('run-region-select')?.value,
    );
    return;
  }
  if (event.target.closest('[data-restart]')) { restart(); render(); return; }
  if (event.target.closest('[data-cancel-action]')) { R.pendingAction = null; render(); return; }

  const nodeBtn = event.target.closest('[data-node-id]');
  if (nodeBtn) { onSelectNode(nodeBtn.dataset.nodeId); return; }

  const reclassifyBtn = event.target.closest('[data-reclassify-choice]');
  if (reclassifyBtn) { onReclassifyChoice(reclassifyBtn.dataset.reclassifyChoice); return; }

  const buyBtn = event.target.closest('[data-buy-item]');
  if (buyBtn) { onBuyItem(buyBtn.dataset.buyItem); return; }
  if (event.target.closest('[data-shop-continue]')) { leaveShop(); return; }

  const optBtn = event.target.closest('[data-option-index]');
  if (optBtn) { onSelectOption(Number(optBtn.dataset.optionIndex)); return; }

  const targetEl = event.target.closest('[data-target-id]');
  if (targetEl && R.pendingAction) onSelectTarget(targetEl.dataset.targetId);
}

function handleChange(event) {
  if (event.target.id === 'run-region-select') {
    R.regionId = event.target.value;
    render();
  }
  if (event.target.id === 'shop-buyer-select') {
    R.shopBuyerId = event.target.value;
    render();
  }
  const characterId = event.target.dataset.equipCharacter;
  if (characterId) {
    R.equipment[characterId] = event.target.value || null;
    render();
  }
}

document.getElementById('app').addEventListener('click', handleClick);
document.getElementById('app').addEventListener('change', handleChange);
render();

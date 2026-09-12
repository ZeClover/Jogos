// UI jogável do Vertical Slice (Marco 6, `play.html`) — diferente do dev
// console (`index.html`/`devconsole.js`, que é diagnóstico interno, ver
// DECISIONS.md D011). Aqui um humano joga de verdade: escolhe ação, clica
// no alvo, vê o esquadrão dos 4 Genin atravessar os 3 combates do roteiro
// do País das Ondas (`src/data/vertical_slice.js`) até o boss Zabuza,
// tudo através do MESMO motor de combate dos Marcos 1-5 (CombatState/
// resolveAction/chooseAction) — nenhuma lógica de jogo é duplicada aqui,
// só leitura de estado e construção de HTML.

import '../data/catalog/index.js';
import {
  characters, enemies, bosses, jutsus, statuses, reactions, items,
} from '../data/index.js';
import { SeedManager, generateSeedString } from '../engine/seed.js';
import { CombatState } from '../engine/combat/state.js';
import { createCombatantFromCharacter, computeSquadCost } from '../engine/combat/characterBridge.js';
import { createCombatantFromEnemy, createCombatantFromBoss } from '../engine/combat/enemyBridge.js';
import { chooseAction } from '../engine/combat/ai.js';
import { isAlive } from '../engine/combat/combatant.js';
import { snapshotSquad, applySquadSnapshot } from '../engine/combat/campaign.js';
import { ACTION_TYPES, POSITIONS } from '../engine/enums.js';
import { VERTICAL_SLICE_ENCOUNTERS } from '../data/vertical_slice.js';
import { findAssetIdByContent, resolveAssetSrc, placeholderDataUri } from '../content/asset_manifest.js';

const SQUAD_IDS = [
  'CHAR_NARUTO_GENIN_001', 'CHAR_SASUKE_GENIN_001', 'CHAR_SAKURA_GENIN_001', 'CHAR_SHIKAMARU_GENIN_001',
];
/**
 * Retrato/arte de combate real (D034) se o catálogo tiver `contentId` ligado;
 * senão, placeholder. `categories` é tentado em ordem (ex: inimigos comuns só
 * têm COMBAT, mas o boss Zabuza só tem ART/PORTRAIT — sem sprite COMBAT).
 */
function portraitSrcFor(defId, categories = ['PORTRAIT']) {
  const cats = Array.isArray(categories) ? categories : [categories];
  for (const category of cats) {
    const assetId = findAssetIdByContent(defId, category);
    if (assetId) return resolveAssetSrc(assetId);
  }
  return placeholderDataUri(defId, cats[0]);
}

const POSITION_LABEL = { FRENTE: 'Frente', CENTRO: 'Centro', TRAS: 'Trás' };
const ACTION_LABEL = { ATAQUE_BASICO: 'Ataque Básico', DEFENDER: 'Defender' };
const ROMAN = { 1: '', 2: ' II', 3: ' III', 4: ' IV' };
const AI_STEP_DELAY_MS = 500;

/** @type {any} Estado mutável da sessão jogável — não é save (isso é Marco 7+). */
const G = {
  screen: 'SQUAD',
  encounterIndex: 0,
  squadSnapshot: null,
  state: null,
  teamA: [],
  teamB: [],
  enemyMeta: new Map(),
  pendingAction: null,
  lastResultMessage: null,
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

// --- Montagem de combatentes ----------------------------------------------

function buildSquad(snapshot) {
  const ids = snapshot ? snapshot.map((s) => s.id) : SQUAD_IDS;
  const combatants = ids.map((id) => createCombatantFromCharacter(characters.get(id)));
  if (snapshot) applySquadSnapshot(combatants, snapshot);
  return combatants;
}

function buildEnemyTeam(encounter) {
  const meta = new Map();
  const seenCount = new Map();
  const combatants = encounter.enemyIds.map((enemyId) => {
    const bossDef = bosses.get(enemyId);
    const def = bossDef ?? enemies.get(enemyId);
    const n = (seenCount.get(enemyId) ?? 0) + 1;
    seenCount.set(enemyId, n);
    const combatantId = n > 1 ? `${enemyId}#${n}` : enemyId;
    const bridge = bossDef ? createCombatantFromBoss : createCombatantFromEnemy;
    const combatant = bridge(def, { id: combatantId, position: POSITIONS.FRENTE });
    combatant.name = `${def.name}${ROMAN[n] ?? ` ${n}`}`;
    meta.set(combatant.id, { aiLevel: def.aiLevel, aiProfile: def.aiProfile ?? null });
    return combatant;
  });
  return { combatants, meta };
}

// --- Ações disponíveis para o ator humano da vez ---------------------------

function targetKindForRange(range) {
  if (range === 'SELF') return 'SELF';
  if (range === 'ALLY') return 'ALLY';
  return 'ENEMY'; // MELEE/RANGED/AREA
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
    kind: 'ATAQUE_BASICO',
    label: 'Ataque Básico',
    detail: `Taijutsu ${actor.attributes.taijutsu} · Corpo a corpo`,
    slot: 'PRINCIPAL',
    targetKind: 'ENEMY',
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
      const requiredResource = def.requiresResource?.amount ?? 0;
      const lacksResource = requiredResource > 0 && (actor.resource?.current ?? 0) < requiredResource;
      options.push({
        kind: 'JUTSU',
        jutsuId,
        label: def.name,
        detail: `${def.rank} · Custo ${cost}${def.cooldown ? ` · CD ${def.cooldown}` : ''}`
          + `${cooldownLeft > 0 ? ` · recarregando (${cooldownLeft}r)` : ''}`
          + `${requiredResource ? ` · exige ${requiredResource} ${actor.resource?.name ?? 'recurso'}` : ''}`,
        slot: def.slot ?? 'PRINCIPAL',
        targetKind: targetKindForRange(def.range),
        disabled: cooldownLeft > 0 || actor.chakra < cost || lacksResource,
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

// --- Fluxo de combate -------------------------------------------------------

function isEnemyActor(id) {
  return G.teamB.some((c) => c.id === id);
}

function startEncounter(index) {
  const encounter = VERTICAL_SLICE_ENCOUNTERS[index];
  const teamA = buildSquad(G.squadSnapshot);
  const { combatants: teamB, meta } = buildEnemyTeam(encounter);

  G.encounterIndex = index;
  G.teamA = teamA;
  G.teamB = teamB;
  G.enemyMeta = meta;
  G.pendingAction = null;
  G.lastResultMessage = null;
  G.state = new CombatState({
    teamA,
    teamB,
    seedManager: new SeedManager(generateSeedString()),
    statusCatalog: statuses,
    reactionCatalog: reactions.all(),
    jutsuCatalog: jutsus,
    itemCatalog: items,
  });
  G.screen = 'BATTLE';
  maybeRunAI();
}

function onCombatEnd() {
  const winner = G.state.winner();
  if (winner === 'A') {
    G.squadSnapshot = snapshotSquad(G.teamA);
    G.screen = G.encounterIndex === VERTICAL_SLICE_ENCOUNTERS.length - 1 ? 'FINAL_VICTORY' : 'ENCOUNTER_VICTORY';
  } else {
    G.screen = 'DEFEAT';
  }
  render();
}

/** Resolve automaticamente todos os turnos consecutivos de inimigos (IA), com um pequeno atraso por turno para dar ritmo. */
function maybeRunAI() {
  if (G.state.isCombatOver()) { onCombatEnd(); return; }
  const actorId = G.state.currentActorId();
  if (!isEnemyActor(actorId)) { render(); return; }
  render();
  setTimeout(() => {
    const actor = G.state.combatants.get(actorId);
    const meta = G.enemyMeta.get(actorId) ?? { aiLevel: 'BASICA', aiProfile: null };
    let action;
    try {
      action = chooseAction(G.state, actor, { level: meta.aiLevel, bossId: meta.aiProfile });
    } catch {
      action = null;
    }
    const result = action ? G.state.applyAction(actorId, action) : { applied: false };
    if (!result.applied) {
      // Ação preferida indisponível (chakra/cooldown/alcance) — Defender é sempre válido, garante que o turno avança.
      G.state.applyAction(actorId, { type: ACTION_TYPES.DEFENDER });
    }
    maybeRunAI();
  }, AI_STEP_DELAY_MS);
}

function resolvePlayerAction(actorId, action) {
  const result = G.state.applyAction(actorId, action);
  G.pendingAction = null;
  G.lastResultMessage = result.applied ? null : `Ação recusada: ${result.reason}`;
  if (G.state.isCombatOver()) { onCombatEnd(); return; }
  maybeRunAI();
}

function onSelectOption(index) {
  const actorId = G.state.currentActorId();
  const actor = G.state.combatants.get(actorId);
  const option = getActionOptions(actor)[index];
  if (!option || option.disabled) return;

  if (option.targetKind === 'NONE') {
    resolvePlayerAction(actorId, buildActionPayload(option));
    return;
  }
  if (option.targetKind === 'SELF') {
    resolvePlayerAction(actorId, buildActionPayload(option, actorId));
    return;
  }
  G.pendingAction = option;
  render();
}

function onSelectTarget(targetId) {
  const option = G.pendingAction;
  if (!option) return;
  const target = G.state.combatants.get(targetId);
  if (!target || !isAlive(target)) return;

  const isOwnSide = G.teamA.some((c) => c.id === targetId);
  if (option.targetKind === 'ENEMY' && isOwnSide) return;
  if (option.targetKind === 'ALLY' && !isOwnSide) return;

  const actorId = G.state.currentActorId();
  G.pendingAction = null;
  resolvePlayerAction(actorId, buildActionPayload(option, targetId));
}

function resetGame() {
  G.screen = 'SQUAD';
  G.encounterIndex = 0;
  G.squadSnapshot = null;
  G.state = null;
  G.teamA = [];
  G.teamB = [];
  G.enemyMeta = new Map();
  G.pendingAction = null;
  G.lastResultMessage = null;
}

// --- Renderização ------------------------------------------------------

function computeTargetableIds() {
  const option = G.pendingAction;
  if (!option) return new Set();
  if (option.targetKind === 'ENEMY') return new Set(G.teamB.filter(isAlive).map((c) => c.id));
  if (option.targetKind === 'ALLY') return new Set(G.teamA.filter(isAlive).map((c) => c.id));
  return new Set();
}

function renderCombatantCard(c, { isCurrentTurn, clickable }) {
  const meta = G.enemyMeta.get(c.id);
  const statesHtml = c.states.map((s) => {
    const def = statuses.get(s.stateId);
    const label = def?.name ?? s.stateId;
    const controlCls = def?.controlType ? 'state-control' : '';
    return `<span class="vs-tag ${controlCls}">${escapeHtml(label)}${s.stacks > 1 ? `×${s.stacks}` : ''} (${s.duration}r)</span>`;
  }).join('');

  const defId = c.id.split('#')[0];
  return `
    <div class="vs-combatant ${isAlive(c) ? '' : 'is-down'} ${isCurrentTurn ? 'is-turn' : ''} ${clickable ? 'is-target-candidate' : ''}" data-target-id="${c.id}">
      <div class="vs-combatant-head">
        <img class="vs-combatant-portrait" src="${portraitSrcFor(defId, ['COMBAT', 'ART', 'PORTRAIT'])}" alt="">
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
  const currentActorId = G.state.currentActorId();
  const cards = combatants.map((c) => renderCombatantCard(c, {
    isCurrentTurn: c.id === currentActorId,
    clickable: targetableIds.has(c.id),
  })).join('');
  return `<div class="vs-side"><h3>${escapeHtml(title)}</h3>${cards}</div>`;
}

function renderActionPanel(actor) {
  const options = getActionOptions(actor);
  const buttons = options.map((opt, i) => `
    <button class="vs-action-btn ${G.pendingAction && optionKey(opt) === optionKey(G.pendingAction) ? 'is-selected' : ''}"
            data-option-index="${i}" ${opt.disabled ? 'disabled' : ''}>
      <span class="vs-action-name">${escapeHtml(opt.label)}</span>
      <span class="vs-action-detail">${escapeHtml(opt.detail)}</span>
    </button>
  `).join('');
  const cancel = G.pendingAction ? '<button class="vs-btn secondary" data-cancel-action>Cancelar alvo</button>' : '';
  return `<div class="vs-actions">${buttons}</div>${cancel}`;
}

function actorName(id) {
  return G.state.combatants.get(id)?.name ?? id;
}

function formatLogLines() {
  return G.state.log.map((event) => {
    if (event.type === 'ROUND_START') return { cls: 'vs-log-round', text: `— Rodada ${event.round} —` };
    if (event.type === 'COMBAT_END') {
      return { cls: 'vs-log-end', text: `>>> Combate encerrado — vencedor: ${event.winner === 'A' ? 'esquadrão' : 'inimigos'}` };
    }
    if (event.type === 'DOT') return { text: `  ${actorName(event.targetId)} perde ${event.amount} de ${event.stat} (dano contínuo)` };
    if (event.type !== 'ACTION') return null;

    const { actorId, action, result } = event;
    if (!result.applied) return null; // ação recusada não consome turno, não polui o log
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

function renderSquadScreen() {
  const defs = SQUAD_IDS.map((id) => characters.get(id));
  const cards = defs.map((def) => {
    const combatant = createCombatantFromCharacter(def);
    return `
      <div class="vs-card">
        <img class="vs-portrait" src="${portraitSrcFor(def.id)}" alt="${escapeHtml(def.name)}">
        <h3>${escapeHtml(def.name)}</h3>
        <p class="vs-role">${escapeHtml(def.role.join(' · '))} · Rank ${def.rank} · Custo ${def.squadCost}</p>
        ${barRow('HP', combatant.hp, combatant.attributes.hpMax, 'hp')}
        ${barRow('Chakra', combatant.chakra, combatant.attributes.chakraMax, 'chakra')}
        ${def.exclusiveResource ? `<p class="vs-hint">${escapeHtml(def.exclusiveResource.name)}: 0/${def.exclusiveResource.max}</p>` : ''}
      </div>
    `;
  }).join('');

  return `
    <div class="vs-scroll">
      <h2>País das Ondas — Esquadrão</h2>
      <p class="vs-hint">
        Naruto, Sasuke, Sakura e Shikamaru (Genin) escoltam Tazuna até o País das
        Ondas, enfrentando bandidos, mercenários de Gatō e, na ponte, o Demônio
        Oculto da Névoa — Zabuza Momochi. Custo de Esquadrão: ${computeSquadCost(defs)}/12.
      </p>
      <div class="vs-roster">${cards}</div>
      <button class="vs-btn" data-start>Iniciar Missão (roteiro fixo)</button>
      <p class="vs-hint" style="margin-top:14px">
        Prefere um mapa gerado por seed, com Descanso/Elite/Reclassificação de
        rank de verdade (Marco 7)? <a href="run.html">Jogar o Modo Run</a>.
      </p>
    </div>
  `;
}

function renderBattleScreen() {
  const encounter = VERTICAL_SLICE_ENCOUNTERS[G.encounterIndex];
  const actorId = G.state.currentActorId();
  const actor = actorId ? G.state.combatants.get(actorId) : null;
  const isPlayerTurn = Boolean(actor) && G.teamA.some((c) => c.id === actorId);
  const targetableIds = computeTargetableIds();

  const progress = VERTICAL_SLICE_ENCOUNTERS.map((enc, i) => {
    const cls = i < G.encounterIndex ? 'is-done' : i === G.encounterIndex ? 'is-current' : '';
    return `<span class="vs-progress-step ${cls}">${i + 1}. ${escapeHtml(enc.name)}</span>`;
  }).join('');

  const turnBanner = isPlayerTurn
    ? `<div class="vs-turn-banner">Sua vez: <strong>${escapeHtml(actor.name)}</strong>`
      + `${G.pendingAction ? ` — escolha um alvo para ${escapeHtml(G.pendingAction.label)}` : ''}</div>`
    : `<div class="vs-turn-banner">${actor ? `${escapeHtml(actor.name)} (inimigo) age…` : 'Resolvendo rodada…'}</div>`;

  return `
    <div class="vs-progress">${progress}</div>
    <div class="vs-scroll">
      <h2>${escapeHtml(encounter.name)}</h2>
      <p class="vs-hint">${escapeHtml(encounter.description)}</p>
      ${turnBanner}
      <div class="vs-battlefield">
        ${renderSide(G.teamA, 'Esquadrão', targetableIds)}
        ${renderSide(G.teamB, encounter.name, targetableIds)}
      </div>
      ${G.lastResultMessage ? `<p class="vs-hint">${escapeHtml(G.lastResultMessage)}</p>` : ''}
      ${isPlayerTurn ? renderActionPanel(actor) : ''}
      <pre class="vs-log">${formatLogLines().map((l) => `<span class="${l.cls ?? ''}">${escapeHtml(l.text)}</span>`).join('\n')}</pre>
    </div>
  `;
}

function renderEncounterVictoryScreen() {
  const encounter = VERTICAL_SLICE_ENCOUNTERS[G.encounterIndex];
  const next = VERTICAL_SLICE_ENCOUNTERS[G.encounterIndex + 1];
  const survivors = G.squadSnapshot.map((s) => {
    const def = characters.get(s.id);
    return `<li>${escapeHtml(def.name)} — HP ${s.hp}, Chakra ${s.chakra}</li>`;
  }).join('');

  return `
    <div class="vs-scroll vs-end-screen">
      <h2>Vitória — ${escapeHtml(encounter.name)}</h2>
      <p class="vs-hint">O esquadrão vence e segue para: <strong>${escapeHtml(next.name)}</strong>.</p>
      <ul style="text-align:left;display:inline-block">${survivors}</ul>
      <p><button class="vs-btn" data-continue>Continuar</button></p>
    </div>
  `;
}

function renderFinalVictoryScreen() {
  return `
    <div class="vs-scroll vs-end-screen">
      <h2>🏆 País das Ondas protegido!</h2>
      <p class="vs-hint">
        Zabuza Momochi foi derrotado. O Vertical Slice do Naruto Roguelite termina
        aqui — os próximos marcos trazem Run/Mapa/Missões (Marco 7) e Progressão
        (Marco 8) para dar continuidade real à história.
      </p>
      <p><button class="vs-btn" data-restart>Jogar de novo</button></p>
    </div>
  `;
}

function renderDefeatScreen() {
  const encounter = VERTICAL_SLICE_ENCOUNTERS[G.encounterIndex];
  return `
    <div class="vs-scroll vs-end-screen">
      <h2>💀 Esquadrão derrotado</h2>
      <p class="vs-hint">O esquadrão caiu em "${escapeHtml(encounter.name)}". Tente de novo com outra estratégia.</p>
      <p><button class="vs-btn danger" data-restart>Recomeçar</button></p>
    </div>
  `;
}

function renderScreen() {
  if (G.screen === 'SQUAD') return renderSquadScreen();
  if (G.screen === 'BATTLE') return renderBattleScreen();
  if (G.screen === 'ENCOUNTER_VICTORY') return renderEncounterVictoryScreen();
  if (G.screen === 'FINAL_VICTORY') return renderFinalVictoryScreen();
  if (G.screen === 'DEFEAT') return renderDefeatScreen();
  return '<div class="vs-scroll"><p>?</p></div>';
}

function render() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = renderScreen();
  const log = app.querySelector('.vs-log');
  if (log) log.scrollTop = log.scrollHeight;
}

// --- Eventos (delegados, um único listener) --------------------------------

function handleClick(event) {
  if (event.target.closest('[data-start]')) { startEncounter(0); return; }
  if (event.target.closest('[data-continue]')) { startEncounter(G.encounterIndex + 1); return; }
  if (event.target.closest('[data-restart]')) { resetGame(); render(); return; }
  if (event.target.closest('[data-cancel-action]')) { G.pendingAction = null; render(); return; }

  const optBtn = event.target.closest('[data-option-index]');
  if (optBtn) { onSelectOption(Number(optBtn.dataset.optionIndex)); return; }

  const targetEl = event.target.closest('[data-target-id]');
  if (targetEl && G.pendingAction) onSelectTarget(targetEl.dataset.targetId);
}

document.getElementById('app').addEventListener('click', handleClick);
render();

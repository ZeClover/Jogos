// Dev console dos Marcos 0 (Fundação), 1 (Combate Mínimo), 2 (Effect
// Engine), 3 (Jutsus) e 4 (Personagens).
//
// Isto NÃO é a UI final do jogo (essa vem em marcos futuros, guiada pela
// Style Bible Visual). É uma página de diagnóstico que prova, no navegador,
// que a engine core funciona: RNG/Seed determinística, registries de
// conteúdo, validadores, save/load e um combate de exemplo com Tags/
// Estados/Reações/Jutsus/Personagens reais do catálogo rodando de ponta a
// ponta (o Naruto do combate abaixo é CHAR_NARUTO_GENIN_001 de verdade).

import { SeedManager, generateSeedString } from '../engine/seed.js';
import {
  validateEntities, splitByLevel, findDuplicateIds,
} from '../engine/validators.js';
import { SaveManager, CURRENT_SCHEMA_VERSION, createMemoryStorage } from '../engine/save.js';
import { Registry } from '../engine/registry.js';
import { summarizeRegistries, registries } from '../data/index.js';
import '../data/catalog/index.js';
import {
  tags, statuses, reactions, jutsus, passives, characters,
} from '../data/index.js';
import {
  assetManifest, assetBacklogP1, summarizeManifestByStatus, resolveAssetSrc,
} from '../content/asset_manifest.js';
import { createAttributes } from '../engine/combat/attributes.js';
import { createCombatant } from '../engine/combat/combatant.js';
import { createCombatantFromCharacter, computeSquadCost } from '../engine/combat/characterBridge.js';
import { CombatState } from '../engine/combat/state.js';
import { ACTION_TYPES, POSITIONS } from '../engine/enums.js';

const TARGET_SCALE = {
  characters: '500–800+', jutsus: '1.000–1.500+', passives: '400–600+',
  items: '500+', bosses: '200–300+', events: '300+', missions: '200+ templates',
  regions: '50+', achievements: '500+',
};

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function mount(id, html) {
  const node = document.getElementById(id);
  if (node) node.innerHTML = html;
}

// --- RNG / Seed --------------------------------------------------------

function renderRng() {
  const seedInput = document.getElementById('seed-input');
  const seed = seedInput.value.trim() || generateSeedString();
  seedInput.value = seed;

  const manager = new SeedManager(seed);
  const streamNames = ['map', 'combat', 'loot', 'event'];
  const rows = streamNames.map((name) => {
    const rolls = Array.from({ length: 5 }, () => manager.stream(name).float().toFixed(4));
    return `<tr><td><code>${name}</code></td><td>${rolls.join(', ')}</td></tr>`;
  }).join('');

  // Prova de reprodutibilidade: mesma seed + mesmo nome de stream -> mesma sequência.
  const check1 = new SeedManager(seed).stream('combat');
  const check2 = new SeedManager(seed).stream('combat');
  const sameSequence = check1.float().toFixed(6) === check2.float().toFixed(6)
    && check1.float().toFixed(6) === check2.float().toFixed(6);

  mount('rng-output', `
    <table>
      <thead><tr><th>Stream</th><th>Primeiros 5 rolls</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:10px">
      <span class="pill ${sameSequence ? 'ok' : 'error'}">
        ${sameSequence ? '✓ determinístico' : '✗ falhou'}
      </span>
      <span style="color:var(--muted);font-size:0.8rem;margin-left:6px">
        mesma seed reconstruída do zero produz a mesma sequência na stream "combat"
      </span>
    </p>
  `);
}

// --- Registries de conteúdo ---------------------------------------------

function renderRegistries() {
  const sizes = summarizeRegistries();
  const rows = Object.entries(registries).map(([name, registry]) => `
    <tr>
      <td><code>${registry.idPrefix}_</code></td>
      <td>${escapeHtml(registry.label)}</td>
      <td>${sizes[name]}</td>
      <td style="color:var(--muted)">${TARGET_SCALE[name] ?? '—'}</td>
    </tr>
  `).join('');

  mount('registries-output', `
    <table>
      <thead><tr><th>Prefixo</th><th>Registry</th><th>Atual</th><th>Meta (longo prazo)</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `);
}

// --- Asset Manifest --------------------------------------------------------

function renderAssets() {
  const byStatus = summarizeManifestByStatus();
  const statCards = Object.entries(byStatus).map(([status, count]) => `
    <div class="stat">
      <div class="n status-${status}">${count}</div>
      <div class="l">${status}</div>
    </div>
  `).join('');

  const previewIds = assetManifest.slice(0, 6).map((e) => e.assetId);
  const previews = previewIds.map((id) => `
    <img src="${resolveAssetSrc(id)}" alt="${escapeHtml(id)}"
         style="width:72px;height:72px;border-radius:8px;border:1px solid var(--panel-border)" />
  `).join('');

  mount('assets-output', `
    <div class="stat-grid">${statCards}</div>
    <p class="hint" style="margin-top:14px">
      + ${assetBacklogP1.length} itens no backlog P1 (nome definido, sem Asset ID/prompt formal ainda)
    </p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">${previews}</div>
  `);
}

// --- Validadores (dados de exemplo, não são conteúdo do jogo) --------------

function renderValidators() {
  const knownTags = ['TAG_NINJUTSU_001', 'TAG_KATON_001', 'TAG_AREA_001'];
  const targetRegistry = new Registry('ENEMY', 'Inimigos de exemplo');
  targetRegistry.register({ id: 'ENEMY_BANDIT_001' });

  const fixtureJutsus = [
    { id: 'JUT_EXEMPLO_001', name: 'Exemplo Válido', tags: ['TAG_KATON_001'], targetsEnemy: 'ENEMY_BANDIT_001' },
    { id: 'JUT_EXEMPLO_002', tags: ['TAG_INEXISTENTE_999'], targetsEnemy: 'ENEMY_FANTASMA_999' }, // sem name, tag inválida, ref quebrada
    { id: 'JUT_EXEMPLO_001', name: 'Duplicado', tags: [] }, // ID duplicado do primeiro
  ];

  const issues = validateEntities(fixtureJutsus, {
    requiredFields: ['name'],
    tagFields: [{ field: 'tags', knownTags }],
    referenceFields: [{ field: 'targetsEnemy', registry: targetRegistry }],
  });
  const { errors, warnings } = splitByLevel(issues);

  const rows = issues.map((i) => `
    <tr>
      <td><span class="pill ${i.level === 'error' ? 'error' : 'warn'}">${i.level}</span></td>
      <td><code>${escapeHtml(i.code)}</code></td>
      <td><code>${escapeHtml(i.entityId ?? '—')}</code></td>
      <td>${escapeHtml(i.message)}</td>
    </tr>
  `).join('');

  const expectedErrorCodes = ['DUPLICATE_ID', 'MISSING_REQUIRED_FIELD', 'INVALID_TAG', 'UNRESOLVED_REFERENCE'];
  const foundCodes = new Set(issues.map((i) => i.code));
  const allDetected = expectedErrorCodes.every((code) => foundCodes.has(code));

  mount('validators-output', `
    <p>
      <span class="pill ${allDetected ? 'ok' : 'error'}">
        ${allDetected ? '✓ todas as classes de problema detectadas' : '✗ faltou detectar algo'}
      </span>
      <span style="color:var(--muted);font-size:0.8rem;margin-left:6px">
        ${errors.length} erro(s), ${warnings.length} aviso(s) num conjunto de dados de exemplo propositalmente quebrado
      </span>
    </p>
    <table>
      <thead><tr><th>Nível</th><th>Código</th><th>Entidade</th><th>Mensagem</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `);
}

// --- Save/Load ---------------------------------------------------------

function renderSave() {
  const storage = (typeof localStorage !== 'undefined') ? localStorage : createMemoryStorage();
  const saveManager = new SaveManager({ storage, namespace: 'naruto-roguelite-devconsole-demo' });

  document.getElementById('save-write').onclick = () => {
    saveManager.save('run', { demo: true, createdAt: Date.now(), note: 'Save de demonstração do Marco 0' });
    renderSaveStatus();
  };
  document.getElementById('save-clear').onclick = () => {
    saveManager.delete('run');
    renderSaveStatus();
  };

  function renderSaveStatus() {
    const loaded = saveManager.load('run');
    mount('save-output', loaded ? `
      <p><span class="pill ok">✓ save presente</span></p>
      <pre class="log-line">schemaVersion: ${loaded.schemaVersion} (atual: ${CURRENT_SCHEMA_VERSION})
savedAt: ${loaded.savedAt}
data: ${escapeHtml(JSON.stringify(loaded.data))}</pre>
    ` : `<p><span class="pill warn">nenhum save no slot "run"</span></p>`);
  }

  renderSaveStatus();
}

// --- Combate + Effect Engine (Marcos 1 e 2) -----------------------------

function makeDemoFighter(id, name, overrides, position) {
  return createCombatant({
    id, name, position, attributes: createAttributes(overrides),
  });
}

/**
 * Combate 1v1 de demonstração usando o Naruto Genin REAL do catálogo
 * (Marco 4: CHAR_NARUTO_GENIN_001, com HP/Chakra/recurso Clones da ficha)
 * contra um bandido genérico. Naruto usa o loadout real do personagem:
 * Rasengan quando o Chakra alcança, Kage Bunshin para construir Clones
 * quando não, Kawarimi para se defender quando o Chakra está baixo, senão
 * Ataque Básico.
 */
function runDemoCombat(seed) {
  const narutoDef = characters.get('CHAR_NARUTO_GENIN_001');
  const naruto = createCombatantFromCharacter(narutoDef, { id: 'demo-naruto', position: POSITIONS.FRENTE });
  const bandido = makeDemoFighter('demo-bandido', 'Bandido (demo)', {
    taijutsu: 20, defesaFisica: 12, velocidade: 14, hpMax: 90, resistenciaEstado: 10,
  }, POSITIONS.FRENTE);

  const state = new CombatState({
    teamA: [naruto],
    teamB: [bandido],
    seedManager: new SeedManager(seed),
    statusCatalog: statuses,
    reactionCatalog: reactions.all(),
    jutsuCatalog: jutsus,
  });

  let guard = 0;
  while (!state.isCombatOver() && guard < 100) {
    const actorId = state.currentActorId();
    const actor = state.combatants.get(actorId);
    const targetId = actorId === naruto.id ? bandido.id : naruto.id;

    let action;
    if (actorId === naruto.id && actor.chakra >= 28) {
      action = { type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_RASENGAN_001', targetId };
    } else if (actorId === naruto.id && actor.chakra >= 16 && !actor.cooldowns.has('JUT_KAGE_BUNSHIN_001')) {
      action = { type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_KAGE_BUNSHIN_001', targetId: actor.id };
    } else if (actorId === naruto.id && actor.chakra >= 10 && !actor.pendingReaction) {
      action = {
        type: ACTION_TYPES.JUTSU, jutsuId: 'JUT_KAWARIMI_001', targetId: actor.id,
      };
    } else {
      action = { type: ACTION_TYPES.ATAQUE_BASICO, targetId };
    }

    state.applyAction(actorId, action);
    guard += 1;
  }

  return {
    state, naruto, bandido,
  };
}

function describeStateResult(entries, label) {
  if (!entries?.length) return '';
  const parts = entries.map((e) => {
    if (e.reactionId) return `${e.reactionId}${e.outcome.applied ? ` -> ${e.outcome.stateId}` : ' (resistida)'}`;
    return `${e.stateId}${e.applied ? '' : ` (${e.reason ?? 'resistido'})`}`;
  });
  return ` [${label}: ${parts.join(', ')}]`;
}

function renderCombat() {
  const seedInput = document.getElementById('combat-seed-input');
  const seed = seedInput.value.trim() || generateSeedString();
  seedInput.value = seed;

  const { state, naruto, bandido } = runDemoCombat(seed);

  const lines = state.log.map((event) => {
    if (event.type === 'ROUND_START') return `— Rodada ${event.round} — ordem: ${event.order.join(', ')}`;
    if (event.type === 'ROUND_END') return `  (fim da rodada ${event.round}, Chakra regenera, Estados avançam)`;
    if (event.type === 'COMBAT_END') return `>>> Combate encerrado — vencedor: time ${event.winner}`;
    if (event.type === 'DOT') return `  [dano contínuo] ${event.targetId} perde ${event.amount} de ${event.stat} (${event.stateId})`;
    if (event.type === 'STATE_EXPIRED') return `  [Estado expira] ${event.stateId} em ${event.targetId}`;
    if (event.type === 'ACTION') {
      const { actorId, action, result } = event;
      const label = action.jutsuId ?? action.type;
      if (!result.applied) return `  ${actorId} tenta ${label} -> recusado (${result.reason})`;
      if (result.armed) return `  ${actorId} arma ${label} (Reação)`;
      if (result.evaded) return `  ${actorId} usa ${label} em ${action.targetId} -> evitado por Kawarimi!`;
      if (result.removedStates) {
        return `  ${actorId} usa ${label} em ${action.targetId} -> limpa [${result.removedStates.join(', ') || 'nada para limpar'}]`;
      }
      if (result.healed !== undefined) {
        return `  ${actorId} usa ${label} em ${action.targetId} -> cura ${result.healed} (alvo em ${result.targetHp} HP)`;
      }
      if (result.hit === false) return `  ${actorId} usa ${label} em ${action.targetId} -> errou`;
      if (result.damage !== undefined) {
        const statesTxt = describeStateResult(result.appliedStates, 'Estados');
        const reactionsTxt = describeStateResult(result.reactions, 'Reações');
        return `  ${actorId} usa ${label} em ${action.targetId} -> ${result.damage} de dano`
          + `${result.isCrit ? ' (crítico!)' : ''} (alvo em ${result.targetHp} HP)${statesTxt}${reactionsTxt}`;
      }
      if (result.resourceGained !== undefined) {
        return `  ${actorId} usa ${label} -> recurso em ${result.resourceGained}`;
      }
      return `  ${actorId} usa ${label}`;
    }
    return `  ${event.type}`;
  });

  const activeStates = (c) => (c.states.length
    ? c.states.map((s) => `${s.stateId}${s.stacks > 1 ? `×${s.stacks}` : ''}(${s.duration}r)`).join(', ')
    : '—');

  mount('combat-output', `
    <p>
      <span class="pill ok">✓ ${naruto.name} (HP ${naruto.hp}/${naruto.attributes.hpMax}, Chakra ${naruto.chakra}/${naruto.attributes.chakraMax}, ${naruto.resource.name} ${naruto.resource.current}/${naruto.resource.max})</span>
      <span class="pill ${state.winner() === 'B' ? 'ok' : 'warn'}">${bandido.name} (HP ${bandido.hp}/${bandido.attributes.hpMax})</span>
      <span class="pill ok">vencedor: time ${state.winner()} · ${state.round} rodada(s)</span>
    </p>
    <p style="font-size:0.8rem;color:var(--muted)">
      Estados ativos ao final — ${naruto.name}: ${escapeHtml(activeStates(naruto))} ·
      ${bandido.name}: ${escapeHtml(activeStates(bandido))}
    </p>
    <pre class="log-line">${escapeHtml(lines.join('\n'))}</pre>
  `);
}

// --- Catálogo (Tags/Estados/Reações/Jutsus) -----------------------------

function renderCatalog() {
  mount('catalog-output', `
    <div class="stat-grid">
      <div class="stat"><div class="n">${tags.size}</div><div class="l">Tags</div></div>
      <div class="stat"><div class="n">${statuses.size}</div><div class="l">Estados</div></div>
      <div class="stat"><div class="n">${reactions.size}</div><div class="l">Reações</div></div>
      <div class="stat"><div class="n">${jutsus.size}</div><div class="l">Jutsus</div></div>
    </div>
    <p class="hint" style="margin-top:10px">
      ${statuses.all().filter((s) => s.controlType).length} Estados de Controle (resistência adaptativa),
      ${statuses.all().filter((s) => s.dot).length} com dano contínuo.
      Ver <code>docs/design/01_COMBATE_TAGS_ESTADOS_REACOES.md</code> e <code>DECISIONS.md</code> D015.
    </p>
    <p class="hint">
      Jutsus (Vertical Slice, doc 13): ${jutsus.all().map((j) => j.name).join(', ')}.
      Ver <code>DECISIONS.md</code> D016.
    </p>
  `);
}

// --- Personagens (Marco 4) ------------------------------------------------

function renderCharacters() {
  const rows = characters.all().map((def) => {
    const passiveName = def.passiveId ? passives.get(def.passiveId)?.name : '—';
    const resourceTxt = def.exclusiveResource ? `${def.exclusiveResource.name} (máx ${def.exclusiveResource.max})` : '—';
    const ativasTxt = def.loadout.ativas.map((id) => jutsus.get(id)?.name ?? id).join(', ');
    const supremaTxt = def.loadout.suprema
      ? (jutsus.get(def.loadout.suprema)?.name ?? def.loadout.suprema)
      : `— (pendente: ${def.loadout.pendingSuprema ?? '?'})`;
    return `
      <tr>
        <td>${escapeHtml(def.name)} <span style="color:var(--muted)">(${escapeHtml(def.version)})</span></td>
        <td>${def.squadCost}</td>
        <td>${escapeHtml(def.rank)}</td>
        <td>${def.stats.hpMax ?? '—'} / ${def.stats.chakraMax ?? '—'}</td>
        <td>${escapeHtml(resourceTxt)}</td>
        <td>${escapeHtml(ativasTxt)}</td>
        <td>${escapeHtml(supremaTxt)}</td>
        <td>${escapeHtml(passiveName ?? '—')}</td>
      </tr>
    `;
  }).join('');

  mount('characters-output', `
    <p class="hint">
      Custo de Esquadrão total: ${computeSquadCost(characters.all())} / 12 (orçamento padrão).
    </p>
    <table>
      <thead>
        <tr><th>Personagem</th><th>Custo</th><th>Rank</th><th>HP/Chakra</th><th>Recurso</th><th>Ativas</th><th>Suprema</th><th>Passiva</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `);
}

// --- Init ----------------------------------------------------------------

document.getElementById('seed-reroll').addEventListener('click', () => {
  document.getElementById('seed-input').value = '';
  renderRng();
});
document.getElementById('seed-input').addEventListener('change', renderRng);
document.getElementById('combat-run').addEventListener('click', renderCombat);
document.getElementById('combat-seed-input').addEventListener('change', renderCombat);

renderRng();
renderRegistries();
renderCatalog();
renderCharacters();
renderAssets();
renderValidators();
renderSave();
renderCombat();

mount('boot-status', '<span class="pill ok">✓ engine carregada sem erros</span>');

const SAVE_KEY = 'relic-quest-save-v1';
const REQUIRED_ENCOUNTERS = 3;
const POTION_COST = 12;
const HERO_ICON = '🥷';
const HERO_IMG = 'assets/hero-kael.png';

function setPortrait(el, img, fallbackIcon, alt) {
  el.innerHTML = img ? `<img src="${img}" alt="${alt}">` : fallbackIcon;
}

const REGIONS = [
  {
    title: 'Floresta Sussurrante',
    flavor: 'A névoa cobre as árvores retorcidas à sua frente. Algo se move entre os galhos.',
    enemies: [
      { name: 'Lobo Selvagem', icon: '🐺', img: 'assets/lobo-selvagem.png', hp: 18, atk: 5, exp: 8, gold: 6 },
      { name: 'Bandido da Estrada', icon: '🗡️', hp: 22, atk: 6, exp: 10, gold: 9 },
      { name: 'Aranha Gigante', icon: '🕷️', hp: 16, atk: 7, exp: 9, gold: 7 },
    ],
    boss: { name: 'Guardião de Musgo', icon: '🌲', hp: 70, atk: 9, exp: 40, gold: 35 },
  },
  {
    title: 'Colinas Áridas',
    flavor: 'O vento quente levanta poeira sobre as colinas rachadas.',
    enemies: [
      { name: 'Escorpião de Pedra', icon: '🦂', hp: 30, atk: 10, exp: 14, gold: 12 },
      { name: 'Nômade Hostil', icon: '🏹', hp: 34, atk: 11, exp: 16, gold: 14 },
      { name: 'Harpia', icon: '🦅', hp: 26, atk: 13, exp: 15, gold: 11 },
    ],
    boss: { name: 'Golem de Areia', icon: '🏜️', hp: 130, atk: 15, exp: 70, gold: 65 },
  },
  {
    title: 'Ruínas Submersas',
    flavor: 'Água escura pinga das colunas antigas. Ecos de vozes esquecidas ressoam.',
    enemies: [
      { name: 'Esqueleto Afogado', icon: '💀', hp: 46, atk: 15, exp: 22, gold: 18 },
      { name: 'Sereia Amaldiçoada', icon: '🧜', hp: 40, atk: 18, exp: 24, gold: 20 },
      { name: 'Caranguejo Gigante', icon: '🦀', hp: 54, atk: 14, exp: 23, gold: 19 },
    ],
    boss: { name: 'Kraken Menor', icon: '🐙', hp: 210, atk: 22, exp: 110, gold: 100 },
  },
  {
    title: 'Montanha Gélida',
    flavor: 'O frio corta como lâminas. A neve esconde passos silenciosos.',
    enemies: [
      { name: 'Lobo de Gelo', icon: '🐺', hp: 62, atk: 20, exp: 32, gold: 26 },
      { name: 'Yeti Jovem', icon: '❄️', hp: 70, atk: 22, exp: 35, gold: 29 },
      { name: 'Espírito Congelante', icon: '👻', hp: 56, atk: 24, exp: 33, gold: 27 },
    ],
    boss: { name: 'Dragão de Gelo Adormecido', icon: '🐉', hp: 320, atk: 30, exp: 170, gold: 150 },
  },
  {
    title: 'Fortaleza Sombria',
    flavor: 'Os portões negros se abrem. O ar pesa com a presença do Rei Sombrio.',
    enemies: [
      { name: 'Cavaleiro Sombrio', icon: '🗡️', hp: 90, atk: 28, exp: 48, gold: 40 },
      { name: 'Espectro', icon: '👻', hp: 80, atk: 32, exp: 50, gold: 42 },
      { name: 'Sentinela de Ferro', icon: '🛡️', hp: 100, atk: 26, exp: 46, gold: 38 },
    ],
    boss: { name: 'Rei Sombrio', icon: '👑', hp: 500, atk: 38, exp: 0, gold: 0 },
  },
];

const WEAPONS = [
  { name: 'Adaga Enferrujada', atk: 0, cost: 0 },
  { name: 'Espada de Ferro', atk: 4, cost: 30 },
  { name: 'Espada Élfica', atk: 9, cost: 90 },
  { name: 'Lâmina Flamejante', atk: 16, cost: 220 },
  { name: 'Espada do Herói', atk: 26, cost: 500 },
];

const ARMORS = [
  { name: 'Roupas Surradas', def: 0, cost: 0 },
  { name: 'Armadura de Couro', def: 3, cost: 25 },
  { name: 'Cota de Malha', def: 7, cost: 80 },
  { name: 'Armadura Élfica', def: 12, cost: 200 },
  { name: 'Placas do Herói', def: 20, cost: 480 },
];

const SKILLS = [
  { name: 'Corte Duplo', mpCost: 2, minLevel: 2, multiplier: 1.6 },
  { name: 'Fúria Interior', mpCost: 4, minLevel: 4, multiplier: 2.4 },
];

function maxHpForLevel(level) {
  return 30 + (level - 1) * 8;
}
function maxMpForLevel(level) {
  return 5 + (level - 1) * 2;
}
function baseAtkForLevel(level) {
  return 8 + (level - 1) * 2;
}
function baseDefForLevel(level) {
  return 4 + (level - 1);
}
function getExpToNext(level) {
  return Math.round(20 * Math.pow(level, 1.6));
}
function getRestCost() {
  return 5 * state.level;
}

function createFreshState() {
  return {
    heroName: 'Kael',
    started: false,
    gameWon: false,
    level: 1,
    exp: 0,
    hp: maxHpForLevel(1),
    mp: maxMpForLevel(1),
    gold: 20,
    potions: 2,
    weaponIndex: 0,
    armorIndex: 0,
    regionIndex: 0,
    encountersCleared: 0,
    lastSeen: Date.now(),
  };
}

let state = createFreshState();
let currentBattle = null;

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      state = Object.assign(state, JSON.parse(raw));
    }
  } catch (e) {
    console.warn('Falha ao carregar save', e);
  }
  state.hp = Math.min(state.hp, getMaxHp());
  state.mp = Math.min(state.mp, getMaxMp());
}

function saveState() {
  state.lastSeen = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function getMaxHp() {
  return maxHpForLevel(state.level);
}
function getMaxMp() {
  return maxMpForLevel(state.level);
}
function getTotalAtk() {
  return baseAtkForLevel(state.level) + WEAPONS[state.weaponIndex].atk;
}
function getTotalDef() {
  return baseDefForLevel(state.level) + ARMORS[state.armorIndex].def;
}

function showScreen(name) {
  document.getElementById('screen-intro').hidden = name !== 'intro';
  document.getElementById('screen-region').hidden = name !== 'region';
  document.getElementById('screen-battle').hidden = name !== 'battle';
  document.getElementById('screen-victory').hidden = name !== 'victory';
  document.getElementById('hero-panel').hidden = name === 'intro' || name === 'victory';
}

function renderHeroPanel() {
  setPortrait(document.getElementById('hero-portrait'), HERO_IMG, HERO_ICON, state.heroName);
  document.getElementById('hero-name-label').textContent = state.heroName;
  document.getElementById('hero-level').textContent = state.level;
  const maxHp = getMaxHp();
  const maxMp = getMaxMp();
  document.getElementById('hero-hp-fill').style.width = `${(Math.max(0, state.hp) / maxHp) * 100}%`;
  document.getElementById('hero-hp-label').textContent = `${Math.max(0, Math.round(state.hp))}/${maxHp}`;
  document.getElementById('hero-mp-fill').style.width = `${(Math.max(0, state.mp) / maxMp) * 100}%`;
  document.getElementById('hero-mp-label').textContent = `${Math.max(0, Math.round(state.mp))}/${maxMp}`;
  const expNeeded = getExpToNext(state.level);
  document.getElementById('hero-exp-fill').style.width = `${(state.exp / expNeeded) * 100}%`;
  document.getElementById('hero-exp-label').textContent = `${state.exp}/${expNeeded}`;
  document.getElementById('hero-atk').textContent = getTotalAtk();
  document.getElementById('hero-def').textContent = getTotalDef();
  document.getElementById('hero-gold').textContent = state.gold;
  document.getElementById('hero-potions').textContent = state.potions;
}

function renderEncounterTrack() {
  const track = document.getElementById('encounter-track');
  track.innerHTML = '';
  for (let i = 0; i < REQUIRED_ENCOUNTERS; i++) {
    const dot = document.createElement('div');
    dot.className = 'encounter-dot' + (i < state.encountersCleared ? ' cleared' : '');
    track.appendChild(dot);
  }
}

function makeShopRow(name, desc, cost, onBuy) {
  const row = document.createElement('div');
  row.className = 'shop-row';
  row.innerHTML = `<div class="shop-info">${name}<small>${desc}</small></div>`;
  const btn = document.createElement('button');
  btn.textContent = `${cost} ouro`;
  btn.disabled = state.gold < cost;
  btn.addEventListener('click', onBuy);
  row.appendChild(btn);
  return row;
}

function buyPotion() {
  if (state.gold < POTION_COST) return;
  state.gold -= POTION_COST;
  state.potions += 1;
  renderRegion();
  saveState();
}

function buyWeapon() {
  const w = WEAPONS[state.weaponIndex + 1];
  if (!w || state.gold < w.cost) return;
  state.gold -= w.cost;
  state.weaponIndex += 1;
  renderRegion();
  saveState();
}

function buyArmor() {
  const a = ARMORS[state.armorIndex + 1];
  if (!a || state.gold < a.cost) return;
  state.gold -= a.cost;
  state.armorIndex += 1;
  renderRegion();
  saveState();
}

function renderShop() {
  const root = document.getElementById('shop-rows');
  root.innerHTML = '';
  root.appendChild(makeShopRow('🧪 Poção de Cura', 'Cura 50% do HP máximo.', POTION_COST, buyPotion));

  const nextWeapon = WEAPONS[state.weaponIndex + 1];
  if (nextWeapon) {
    root.appendChild(
      makeShopRow(`⚔️ ${nextWeapon.name}`, `+${nextWeapon.atk} ATK (equipa automaticamente)`, nextWeapon.cost, buyWeapon)
    );
  }
  const nextArmor = ARMORS[state.armorIndex + 1];
  if (nextArmor) {
    root.appendChild(
      makeShopRow(`🛡️ ${nextArmor.name}`, `+${nextArmor.def} DEF (equipa automaticamente)`, nextArmor.cost, buyArmor)
    );
  }
}

function renderRegion() {
  const region = REGIONS[state.regionIndex];
  document.getElementById('region-title').textContent = region.title;
  document.getElementById('region-flavor').textContent = region.flavor;
  renderHeroPanel();
  renderEncounterTrack();
  const cleared = state.encountersCleared >= REQUIRED_ENCOUNTERS;
  document.getElementById('explore-btn').hidden = cleared;
  document.getElementById('boss-btn').hidden = !cleared;
  renderShop();
  const restCost = getRestCost();
  document.getElementById('rest-cost').textContent = restCost;
  document.getElementById('rest-btn').disabled = state.gold < restCost;
}

function returnToRegionScreen() {
  showScreen('region');
  renderRegion();
}

function logBattleMsg(text, cls) {
  const log = document.getElementById('battle-log');
  const entry = document.createElement('div');
  if (cls) entry.className = cls;
  entry.textContent = text;
  log.prepend(entry);
  while (log.childNodes.length > 30) {
    log.removeChild(log.lastChild);
  }
}

function clearBattleLog() {
  document.getElementById('battle-log').innerHTML = '';
}

function setBattleMenuEnabled(enabled) {
  const root = document.getElementById('battle-menu-root');
  root.style.pointerEvents = enabled ? 'auto' : 'none';
  root.style.opacity = enabled ? '1' : '0.5';
}

function showBattleMenu(which) {
  document.getElementById('battle-menu-main').hidden = which !== 'main';
  document.getElementById('battle-menu-skill').hidden = which !== 'skill';
  document.getElementById('battle-menu-item').hidden = which !== 'item';
}

function buildSkillMenu() {
  const root = document.getElementById('battle-menu-skill');
  root.innerHTML = '';
  const available = SKILLS.filter((s) => state.level >= s.minLevel);
  if (available.length === 0) {
    const p = document.createElement('div');
    p.className = 'rpg-text';
    p.textContent = 'Nenhuma técnica aprendida ainda.';
    root.appendChild(p);
  }
  available.forEach((skill) => {
    const btn = document.createElement('button');
    btn.textContent = `${skill.name} (${skill.mpCost} MP)`;
    btn.disabled = state.mp < skill.mpCost;
    btn.addEventListener('click', () => useSkill(skill));
    root.appendChild(btn);
  });
  const back = document.createElement('button');
  back.textContent = 'Voltar';
  back.className = 'back-option';
  back.addEventListener('click', () => showBattleMenu('main'));
  root.appendChild(back);
}

function buildItemMenu() {
  const root = document.getElementById('battle-menu-item');
  root.innerHTML = '';
  const btn = document.createElement('button');
  btn.textContent = `Poção de Cura (${state.potions})`;
  btn.disabled = state.potions <= 0;
  btn.addEventListener('click', useItem);
  root.appendChild(btn);
  const back = document.createElement('button');
  back.textContent = 'Voltar';
  back.className = 'back-option';
  back.addEventListener('click', () => showBattleMenu('main'));
  root.appendChild(back);
}

function renderBattle() {
  const { enemy, enemyHp, enemyMaxHp, isBoss } = currentBattle;
  setPortrait(document.getElementById('enemy-icon'), enemy.img, enemy.icon, enemy.name);
  document.getElementById('battle-enemy-name').textContent = enemy.name;
  const hp = Math.max(0, enemyHp);
  document.getElementById('enemy-hp-fill').style.width = `${(hp / enemyMaxHp) * 100}%`;
  document.getElementById('enemy-hp-label').textContent = `${Math.round(hp)}/${enemyMaxHp}`;
  document.getElementById('flee-btn').hidden = isBoss;
  renderHeroPanel();
}

function startBattle(enemyTemplate, isBoss) {
  currentBattle = {
    enemy: enemyTemplate,
    enemyHp: enemyTemplate.hp,
    enemyMaxHp: enemyTemplate.hp,
    isBoss,
    playerDefending: false,
  };
  showScreen('battle');
  clearBattleLog();
  logBattleMsg(`Um ${enemyTemplate.name} apareceu!`, 'info');
  showBattleMenu('main');
  setBattleMenuEnabled(true);
  renderBattle();
}

function computeDamageToEnemy(atk) {
  const variance = 0.85 + Math.random() * 0.3;
  const isCrit = Math.random() < 0.1;
  let dmg = Math.max(1, Math.round(atk * variance));
  if (isCrit) dmg = Math.round(dmg * 1.5);
  return { dmg, isCrit };
}

function computeDamageFromEnemy(enemyAtk) {
  const def = getTotalDef();
  const variance = 0.85 + Math.random() * 0.3;
  const isCrit = Math.random() < 0.08;
  let dmg = Math.max(1, Math.round((enemyAtk - def * 0.5) * variance));
  if (isCrit) dmg = Math.round(dmg * 1.5);
  return { dmg, isCrit };
}

function doPlayerAttack() {
  const { dmg, isCrit } = computeDamageToEnemy(getTotalAtk());
  currentBattle.enemyHp -= dmg;
  logBattleMsg(`${state.heroName} atacou! ${isCrit ? 'CRÍTICO! ' : ''}${dmg} de dano.`, 'dmg-enemy');
  resolveAfterPlayerAction();
}

function useSkill(skill) {
  if (state.mp < skill.mpCost) return;
  state.mp -= skill.mpCost;
  const { dmg, isCrit } = computeDamageToEnemy(Math.round(getTotalAtk() * skill.multiplier));
  currentBattle.enemyHp -= dmg;
  logBattleMsg(`${state.heroName} usou ${skill.name}! ${isCrit ? 'CRÍTICO! ' : ''}${dmg} de dano.`, 'dmg-enemy');
  showBattleMenu('main');
  resolveAfterPlayerAction();
}

function useItem() {
  if (state.potions <= 0) return;
  state.potions -= 1;
  const healAmt = Math.round(getMaxHp() * 0.5);
  state.hp = Math.min(getMaxHp(), state.hp + healAmt);
  logBattleMsg(`${state.heroName} usou uma Poção de Cura! +${healAmt} HP.`, 'info');
  showBattleMenu('main');
  resolveAfterPlayerAction();
}

function doPlayerDefend() {
  currentBattle.playerDefending = true;
  logBattleMsg(`${state.heroName} se defende.`, 'info');
  resolveAfterPlayerAction();
}

function doFlee() {
  if (currentBattle.isBoss) return;
  const success = Math.random() < 0.6;
  if (success) {
    logBattleMsg('Você fugiu com sucesso!', 'info');
    setBattleMenuEnabled(false);
    setTimeout(returnToRegionScreen, 900);
  } else {
    logBattleMsg('Não conseguiu fugir!', 'dmg-player');
    resolveAfterPlayerAction();
  }
}

function resolveAfterPlayerAction() {
  renderBattle();
  if (currentBattle.enemyHp <= 0) {
    handleVictory();
    return;
  }
  setBattleMenuEnabled(false);
  setTimeout(() => {
    const { dmg, isCrit } = computeDamageFromEnemy(currentBattle.enemy.atk);
    const finalDmg = currentBattle.playerDefending ? Math.round(dmg * 0.5) : dmg;
    state.hp -= finalDmg;
    logBattleMsg(`${currentBattle.enemy.name} atacou! ${isCrit ? 'CRÍTICO! ' : ''}${finalDmg} de dano.`, 'dmg-player');
    currentBattle.playerDefending = false;
    renderBattle();
    if (state.hp <= 0) {
      handleDefeat();
    } else {
      setBattleMenuEnabled(true);
      saveState();
    }
  }, 700);
}

function handleVictory() {
  const enemy = currentBattle.enemy;
  const isBoss = currentBattle.isBoss;
  setBattleMenuEnabled(false);
  logBattleMsg(`Você derrotou ${enemy.name}! +${enemy.exp} EXP, +${enemy.gold} ouro.`, 'info');
  state.exp += enemy.exp;
  state.gold += enemy.gold;

  let leveledUp = false;
  while (state.exp >= getExpToNext(state.level)) {
    state.exp -= getExpToNext(state.level);
    state.level += 1;
    leveledUp = true;
  }
  if (leveledUp) {
    state.hp = getMaxHp();
    state.mp = getMaxMp();
    logBattleMsg(`${state.heroName} subiu para o nível ${state.level}!`, 'info');
  }

  if (isBoss) {
    if (state.regionIndex >= REGIONS.length - 1) {
      state.gameWon = true;
      saveState();
      setTimeout(showVictoryScreen, 1400);
      return;
    }
    state.regionIndex += 1;
    state.encountersCleared = 0;
    logBattleMsg('Uma Relíquia Ancestral brilha em suas mãos!', 'info');
  } else {
    state.encountersCleared += 1;
  }
  saveState();
  setTimeout(returnToRegionScreen, 1400);
}

function handleDefeat() {
  setBattleMenuEnabled(false);
  logBattleMsg(`${state.heroName} foi derrotado... mas conseguiu escapar com vida.`, 'dmg-player');
  state.hp = Math.max(1, Math.round(getMaxHp() * 0.3));
  state.gold = Math.max(0, state.gold - Math.round(state.gold * 0.2));
  saveState();
  setTimeout(returnToRegionScreen, 1600);
}

function renderVictoryText() {
  document.getElementById('victory-text').textContent =
    `${state.heroName} reuniu as cinco Relíquias Ancestrais e derrotou o Rei Sombrio. ` +
    `A luz retorna a Eldrin. Nível final: ${state.level}. Sua lenda será cantada por gerações.`;
}

function showVictoryScreen() {
  showScreen('victory');
  renderVictoryText();
}

function init() {
  loadState();

  if (state.gameWon) {
    showScreen('victory');
    renderVictoryText();
  } else if (state.started) {
    showScreen('region');
    renderRegion();
  } else {
    showScreen('intro');
  }

  document.getElementById('start-journey-btn').addEventListener('click', () => {
    const input = document.getElementById('hero-name-input').value.trim();
    state.heroName = input || 'Kael';
    state.started = true;
    saveState();
    showScreen('region');
    renderRegion();
  });

  document.getElementById('explore-btn').addEventListener('click', () => {
    const region = REGIONS[state.regionIndex];
    const enemyTemplate = region.enemies[Math.floor(Math.random() * region.enemies.length)];
    startBattle(enemyTemplate, false);
  });

  document.getElementById('boss-btn').addEventListener('click', () => {
    startBattle(REGIONS[state.regionIndex].boss, true);
  });

  document.getElementById('rest-btn').addEventListener('click', () => {
    const cost = getRestCost();
    if (state.gold < cost) return;
    state.gold -= cost;
    state.hp = getMaxHp();
    state.mp = getMaxMp();
    renderRegion();
    saveState();
  });

  document.getElementById('battle-menu-main').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'attack') doPlayerAttack();
    else if (action === 'skill') {
      buildSkillMenu();
      showBattleMenu('skill');
    } else if (action === 'item') {
      buildItemMenu();
      showBattleMenu('item');
    } else if (action === 'defend') doPlayerDefend();
    else if (action === 'flee') doFlee();
  });

  document.getElementById('restart-btn').addEventListener('click', () => {
    if (confirm('Começar uma nova jornada do zero?')) {
      localStorage.removeItem(SAVE_KEY);
      state = createFreshState();
      document.getElementById('hero-name-input').value = '';
      showScreen('intro');
    }
  });

  setInterval(saveState, 5000);
  window.addEventListener('beforeunload', saveState);
}

init();

const SAVE_KEY = 'ninja-idle-save-v1';

const UNITS = [
  {
    id: 'genin',
    name: 'Genin',
    icon: '🎓',
    desc: 'Recém-formado, ainda aprendendo a controlar o chakra.',
    baseCost: 15,
    baseCps: 0.2,
  },
  {
    id: 'chunin',
    name: 'Chunin',
    icon: '🗡️',
    desc: 'Ninja experiente, já liderou missões de rank C.',
    baseCost: 100,
    baseCps: 1.5,
  },
  {
    id: 'jounin',
    name: 'Jounin',
    icon: '⚔️',
    desc: 'Especialista em jutsus avançados.',
    baseCost: 600,
    baseCps: 8,
  },
  {
    id: 'anbu',
    name: 'ANBU',
    icon: '🐺',
    desc: 'Operativo de elite, missões secretas de alto risco.',
    baseCost: 3500,
    baseCps: 45,
  },
  {
    id: 'sannin',
    name: 'Sannin',
    icon: '🐍',
    desc: 'Lenda viva, poder que abala nações.',
    baseCost: 20000,
    baseCps: 220,
  },
  {
    id: 'jinchuriki',
    name: 'Jinchuriki',
    icon: '🦊',
    desc: 'Hospedeiro de uma Besta com Cauda. Poder monstruoso.',
    baseCost: 120000,
    baseCps: 1100,
  },
  {
    id: 'kage',
    name: 'Kage',
    icon: '🔥',
    desc: 'A sombra mais forte da vila, guardião do povo.',
    baseCost: 750000,
    baseCps: 6000,
  },
];

const RANKS = [
  { title: 'Estudante da Academia', threshold: 0 },
  { title: 'Genin', threshold: 500 },
  { title: 'Chunin', threshold: 5000 },
  { title: 'Jounin Especial', threshold: 40000 },
  { title: 'Jounin', threshold: 200000 },
  { title: 'ANBU', threshold: 1000000 },
  { title: 'Sannin Lendário', threshold: 6000000 },
  { title: 'Kage', threshold: 30000000 },
  { title: 'Hokage', threshold: 150000000 },
];

const UPGRADES = [
  {
    id: 'kunai_training',
    name: 'Treino com Kunai',
    icon: '🔪',
    desc: '+2 de poder de clique.',
    cost: 50,
    type: 'clickFlat',
    value: 2,
  },
  {
    id: 'shadow_clone_click',
    name: 'Bushin de Sombra',
    icon: '👥',
    desc: 'Cada clique também gera 5% do seu chakra/seg.',
    cost: 2000,
    type: 'clickPercentOfCps',
    value: 0.05,
  },
  {
    id: 'genin_training',
    name: 'Treinamento em Grupo',
    icon: '🎓',
    desc: 'Genins produzem o dobro de chakra.',
    cost: 400,
    type: 'unitMultiplier',
    unitId: 'genin',
    value: 2,
  },
  {
    id: 'chunin_tactics',
    name: 'Táticas Avançadas',
    icon: '🗡️',
    desc: 'Chunins produzem o dobro de chakra.',
    cost: 2500,
    type: 'unitMultiplier',
    unitId: 'chunin',
    value: 2,
  },
  {
    id: 'jounin_mastery',
    name: 'Maestria Jounin',
    icon: '⚔️',
    desc: 'Jounins produzem o dobro de chakra.',
    cost: 15000,
    type: 'unitMultiplier',
    unitId: 'jounin',
    value: 2,
  },
  {
    id: 'anbu_shadow',
    name: 'Protocolo ANBU',
    icon: '🐺',
    desc: 'ANBUs produzem o dobro de chakra.',
    cost: 90000,
    type: 'unitMultiplier',
    unitId: 'anbu',
    value: 2,
  },
  {
    id: 'sannin_legacy',
    name: 'Legado Sannin',
    icon: '🐍',
    desc: 'Sannins produzem o dobro de chakra.',
    cost: 500000,
    type: 'unitMultiplier',
    unitId: 'sannin',
    value: 2,
  },
  {
    id: 'rasengan_click',
    name: 'Rasengan',
    icon: '🌀',
    desc: 'Poder de clique x5.',
    cost: 750000,
    type: 'clickMultiplier',
    value: 5,
  },
  {
    id: 'jinchuriki_control',
    name: 'Controle Total',
    icon: '🦊',
    desc: 'Jinchurikis produzem o dobro de chakra.',
    cost: 3000000,
    type: 'unitMultiplier',
    unitId: 'jinchuriki',
    value: 2,
  },
  {
    id: 'kage_wisdom',
    name: 'Sabedoria do Kage',
    icon: '🔥',
    desc: 'Kages produzem o dobro de chakra.',
    cost: 18000000,
    type: 'unitMultiplier',
    unitId: 'kage',
    value: 2,
  },
  {
    id: 'sage_mode',
    name: 'Modo Sábio',
    icon: '✨',
    desc: '+50% em todo chakra gerado.',
    cost: 60000000,
    type: 'globalCpsMultiplier',
    value: 1.5,
  },
];

const ACHIEVEMENTS = [
  { id: 'first_chakra', icon: '🌱', name: 'Primeiro Chakra', desc: 'Ganhe seu primeiro ponto de chakra.', check: (s) => s.lifetimeEarned >= 1 },
  { id: 'chakra_1k', icon: '📈', name: 'Aquecendo', desc: 'Acumule 1.000 de chakra na vida.', check: (s) => s.lifetimeEarned >= 1000 },
  { id: 'chakra_1m', icon: '💰', name: 'Fortuna Ninja', desc: 'Acumule 1 milhão de chakra na vida.', check: (s) => s.lifetimeEarned >= 1e6 },
  { id: 'chakra_1b', icon: '🌌', name: 'Poder Cósmico', desc: 'Acumule 1 bilhão de chakra na vida.', check: (s) => s.lifetimeEarned >= 1e9 },
  { id: 'clicks_100', icon: '👆', name: 'Dedo Cansado', desc: 'Clique 100 vezes para treinar.', check: (s) => s.totalClicks >= 100 },
  { id: 'clicks_1000', icon: '✋', name: 'Mestre do Clique', desc: 'Clique 1.000 vezes para treinar.', check: (s) => s.totalClicks >= 1000 },
  { id: 'rank_genin', icon: '🎓', name: 'Formado', desc: 'Alcance o rank Genin.', check: (s) => s.highestRankIndex >= 1 },
  { id: 'rank_chunin', icon: '🗡️', name: 'No Caminho Chunin', desc: 'Alcance o rank Chunin.', check: (s) => s.highestRankIndex >= 2 },
  { id: 'rank_kage', icon: '🔥', name: 'Sombra da Vila', desc: 'Alcance o rank Kage.', check: (s) => s.highestRankIndex >= 7 },
  { id: 'rank_hokage', icon: '👑', name: 'Vontade do Fogo', desc: 'Torne-se Hokage.', check: (s) => s.highestRankIndex >= 8 },
  { id: 'prestige_1', icon: '🌀', name: 'Primeira Ascensão', desc: 'Ascenda pela primeira vez.', check: (s) => s.prestigeCount >= 1 },
  { id: 'prestige_10', icon: '♾️', name: 'Ciclo Eterno', desc: 'Ascenda 10 vezes.', check: (s) => s.prestigeCount >= 10 },
  { id: 'upgrades_5', icon: '🛠️', name: 'Colecionador', desc: 'Compre 5 upgrades diferentes.', check: (s) => s.lifetimeUpgrades.length >= 5 },
  { id: 'upgrades_all', icon: '🏆', name: 'Tudo Comprado', desc: 'Compre todos os upgrades.', check: (s) => s.lifetimeUpgrades.length >= UPGRADES.length },
];

const PRESTIGE_DIVISOR = 1_000_000;
const PRESTIGE_BONUS_PER_POINT = 0.02;
const ACHIEVEMENT_BONUS_PER_UNLOCK = 0.01;

function createFreshState() {
  return {
    chakra: 0,
    totalEarned: 0,
    clickPower: 1,
    owned: {},
    upgrades: {},
    prestigePoints: 0,
    lifetimeEarned: 0,
    totalClicks: 0,
    prestigeCount: 0,
    highestRankIndex: 0,
    lifetimeUpgrades: [],
    achievements: [],
    lastSeen: Date.now(),
  };
}

let state = createFreshState();

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = Object.assign(state, parsed);
    }
  } catch (e) {
    console.warn('Falha ao carregar save', e);
  }

  const elapsedSeconds = Math.max(0, (Date.now() - (state.lastSeen || Date.now())) / 1000);
  if (elapsedSeconds > 5) {
    const offlineCps = getEffectiveCps();
    const cappedSeconds = Math.min(elapsedSeconds, 8 * 3600);
    const earned = offlineCps * cappedSeconds;
    if (earned > 1) {
      state.chakra += earned;
      state.totalEarned += earned;
      state.lifetimeEarned += earned;
      showOfflineToast(earned, cappedSeconds);
    }
  }
}

function saveState() {
  state.lastSeen = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function getUnitCount(id) {
  return state.owned[id] || 0;
}

function getUnitCost(unit) {
  const count = getUnitCount(unit.id);
  return Math.ceil(unit.baseCost * Math.pow(1.15, count));
}

function isUpgradeOwned(id) {
  return Boolean(state.upgrades[id]);
}

function getUnitMultiplier(unitId) {
  return UPGRADES.filter((u) => u.type === 'unitMultiplier' && u.unitId === unitId && isUpgradeOwned(u.id)).reduce(
    (mult, u) => mult * u.value,
    1
  );
}

function getClickFlatBonus() {
  return UPGRADES.filter((u) => u.type === 'clickFlat' && isUpgradeOwned(u.id)).reduce((sum, u) => sum + u.value, 0);
}

function getClickMultiplier() {
  return UPGRADES.filter((u) => u.type === 'clickMultiplier' && isUpgradeOwned(u.id)).reduce((mult, u) => mult * u.value, 1);
}

function getGlobalUpgradeCpsMultiplier() {
  return UPGRADES.filter((u) => u.type === 'globalCpsMultiplier' && isUpgradeOwned(u.id)).reduce((mult, u) => mult * u.value, 1);
}

function getClickPercentOfCps() {
  return UPGRADES.filter((u) => u.type === 'clickPercentOfCps' && isUpgradeOwned(u.id)).reduce((sum, u) => sum + u.value, 0);
}

function getRawCps() {
  const base = UNITS.reduce((sum, unit) => sum + unit.baseCps * getUnitMultiplier(unit.id) * getUnitCount(unit.id), 0);
  return base * getGlobalUpgradeCpsMultiplier();
}

function getPrestigeMultiplier() {
  return 1 + state.prestigePoints * PRESTIGE_BONUS_PER_POINT;
}

function getAchievementBonusMultiplier() {
  return 1 + state.achievements.length * ACHIEVEMENT_BONUS_PER_UNLOCK;
}

function getEffectiveMultiplier() {
  return getPrestigeMultiplier() * getAchievementBonusMultiplier();
}

function getEffectiveCps() {
  return getRawCps() * getEffectiveMultiplier();
}

function getEffectiveClickPower() {
  const flatClick = (state.clickPower + getClickFlatBonus()) * getClickMultiplier();
  const percentBonus = getRawCps() * getClickPercentOfCps();
  return (flatClick + percentBonus) * getEffectiveMultiplier();
}

function getPrestigeGain() {
  return Math.floor(Math.cbrt(state.totalEarned / PRESTIGE_DIVISOR));
}

function doPrestige() {
  const gain = getPrestigeGain();
  if (gain <= 0) return;
  state.prestigePoints += gain;
  state.prestigeCount += 1;
  state.chakra = 0;
  state.totalEarned = 0;
  state.owned = {};
  state.upgrades = {};
  updateStats();
  refreshShop();
  refreshUpgrades();
  renderPrestige();
  checkAchievements();
  saveState();
}

function getCurrentRankIndex() {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (state.totalEarned >= RANKS[i].threshold) idx = i;
  }
  return idx;
}

function getCurrentRank() {
  return RANKS[getCurrentRankIndex()];
}

function getNextRank() {
  return RANKS[getCurrentRankIndex() + 1] || null;
}

function formatNumber(num) {
  if (num < 10) return (Math.round(num * 10) / 10).toString();
  if (num < 1000) return Math.floor(num).toString();
  const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];
  const order = Math.floor(Math.log10(num) / 3);
  const scaled = num / Math.pow(1000, order);
  return scaled.toFixed(scaled < 10 ? 2 : 1) + units[order];
}

function showOfflineToast(earned, seconds) {
  const minutes = Math.floor(seconds / 60);
  const msg = document.createElement('div');
  msg.className = 'status-msg';
  msg.style.position = 'fixed';
  msg.style.top = '1rem';
  msg.style.left = '50%';
  msg.style.transform = 'translateX(-50%)';
  msg.style.background = '#1e2338';
  msg.style.padding = '0.75rem 1.25rem';
  msg.style.borderRadius = '999px';
  msg.style.zIndex = '20';
  msg.textContent = `Enquanto você estava fora (${minutes} min), seus aliados geraram ${formatNumber(earned)} de chakra!`;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 5000);
}

function showAchievementToast(achievement) {
  const msg = document.createElement('div');
  msg.className = 'status-msg';
  msg.style.position = 'fixed';
  msg.style.top = '1rem';
  msg.style.left = '50%';
  msg.style.transform = 'translateX(-50%)';
  msg.style.background = 'linear-gradient(135deg, #9d5cff, #ff9d3c)';
  msg.style.color = '#fff';
  msg.style.padding = '0.75rem 1.25rem';
  msg.style.borderRadius = '999px';
  msg.style.zIndex = '20';
  msg.textContent = `${achievement.icon} Conquista desbloqueada: ${achievement.name}!`;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3500);
}

const shopElements = {};

function buildShop() {
  const list = document.getElementById('shop-list');
  list.innerHTML = '';
  UNITS.forEach((unit) => {
    const btn = document.createElement('button');
    btn.className = 'shop-item';
    btn.innerHTML = `
      <div class="icon">${unit.icon}</div>
      <div class="info">
        <div class="name">${unit.name} <span class="count">0</span></div>
        <div class="desc">${unit.desc} · +${formatNumber(unit.baseCps)} chakra/seg cada</div>
      </div>
      <div class="cost">
        <div class="price">0</div>
        <span class="cps">chakra</span>
      </div>
    `;
    btn.addEventListener('click', () => buyUnit(unit));
    list.appendChild(btn);
    shopElements[unit.id] = {
      btn,
      countEl: btn.querySelector('.count'),
      priceEl: btn.querySelector('.price'),
    };
  });
  refreshShop();
}

function refreshShop() {
  UNITS.forEach((unit) => {
    const els = shopElements[unit.id];
    if (!els) return;
    const cost = getUnitCost(unit);
    const count = getUnitCount(unit.id);
    if (els.countEl.textContent !== String(count)) {
      els.countEl.textContent = count;
    }
    const priceText = formatNumber(cost);
    if (els.priceEl.textContent !== priceText) {
      els.priceEl.textContent = priceText;
    }
    els.btn.disabled = state.chakra < cost;
  });
}

function buyUnit(unit) {
  const cost = getUnitCost(unit);
  if (state.chakra < cost) return;
  state.chakra -= cost;
  state.owned[unit.id] = getUnitCount(unit.id) + 1;
  refreshShop();
  updateStats();
  saveState();
}

const upgradeElements = {};

function buildUpgrades() {
  const list = document.getElementById('upgrades-list');
  list.innerHTML = '';
  UPGRADES.forEach((upgrade) => {
    const btn = document.createElement('button');
    btn.className = 'shop-item upgrade-item';
    btn.innerHTML = `
      <div class="icon">${upgrade.icon}</div>
      <div class="info">
        <div class="name">${upgrade.name}</div>
        <div class="desc">${upgrade.desc}</div>
      </div>
      <div class="cost">
        <div class="price">${formatNumber(upgrade.cost)}</div>
        <span class="cps">chakra</span>
      </div>
    `;
    btn.addEventListener('click', () => buyUpgrade(upgrade));
    list.appendChild(btn);
    upgradeElements[upgrade.id] = { btn, priceEl: btn.querySelector('.price') };
  });
  refreshUpgrades();
}

function refreshUpgrades() {
  UPGRADES.forEach((upgrade) => {
    const els = upgradeElements[upgrade.id];
    if (!els) return;
    const owned = isUpgradeOwned(upgrade.id);
    els.btn.disabled = owned || state.chakra < upgrade.cost;
    els.btn.classList.toggle('purchased', owned);
    els.priceEl.textContent = owned ? 'Comprado' : formatNumber(upgrade.cost);
  });
}

function buyUpgrade(upgrade) {
  if (isUpgradeOwned(upgrade.id)) return;
  if (state.chakra < upgrade.cost) return;
  state.chakra -= upgrade.cost;
  state.upgrades[upgrade.id] = true;
  if (!state.lifetimeUpgrades.includes(upgrade.id)) {
    state.lifetimeUpgrades.push(upgrade.id);
  }
  refreshUpgrades();
  refreshShop();
  updateStats();
  checkAchievements();
  saveState();
}

function renderAchievements() {
  const list = document.getElementById('achievements-list');
  list.innerHTML = '';
  ACHIEVEMENTS.forEach((ach) => {
    const unlocked = state.achievements.includes(ach.id);
    const card = document.createElement('div');
    card.className = 'achievement-card' + (unlocked ? ' unlocked' : '');
    card.innerHTML = `
      <div class="icon">${unlocked ? ach.icon : '🔒'}</div>
      <div class="name">${ach.name}</div>
      <div class="desc">${unlocked ? ach.desc : '???'}</div>
    `;
    list.appendChild(card);
  });

  const bonusPercent = Math.round((getAchievementBonusMultiplier() - 1) * 100);
  document.getElementById('achievements-count').textContent = `${state.achievements.length}/${ACHIEVEMENTS.length}`;
  document.getElementById('achievements-bonus').textContent = `+${bonusPercent}%`;
}

function checkAchievements() {
  let changed = false;
  ACHIEVEMENTS.forEach((ach) => {
    if (!state.achievements.includes(ach.id) && ach.check(state)) {
      state.achievements.push(ach.id);
      changed = true;
      showAchievementToast(ach);
    }
  });
  if (changed) {
    renderAchievements();
    updateStats();
    saveState();
  }
}

function updateStats() {
  document.getElementById('chakra-value').textContent = formatNumber(state.chakra);
  document.getElementById('cps-value').textContent = formatNumber(getEffectiveCps());

  const rankIndex = getCurrentRankIndex();
  if (rankIndex > state.highestRankIndex) {
    state.highestRankIndex = rankIndex;
  }

  const rank = getCurrentRank();
  const next = getNextRank();
  document.getElementById('rank-label').textContent = rank.title;

  const fill = document.getElementById('rank-bar-fill');
  if (next) {
    const progress = (state.totalEarned - rank.threshold) / (next.threshold - rank.threshold);
    fill.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
  } else {
    fill.style.width = '100%';
  }
}

function spawnFloatingGain(x, y, amount) {
  const el = document.createElement('div');
  el.className = 'floating-gain';
  el.textContent = `+${formatNumber(amount)}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

function handleTrainClick(event) {
  const amount = getEffectiveClickPower();
  state.chakra += amount;
  state.totalEarned += amount;
  state.lifetimeEarned += amount;
  state.totalClicks += 1;
  spawnFloatingGain(event.clientX, event.clientY, amount);
  updateStats();
  refreshShop();
  refreshUpgrades();
  renderPrestige();
  checkAchievements();
}

function tick() {
  const cps = getEffectiveCps();
  if (cps > 0) {
    const delta = cps / 10;
    state.chakra += delta;
    state.totalEarned += delta;
    state.lifetimeEarned += delta;
    updateStats();
    refreshShop();
    refreshUpgrades();
    renderPrestige();
    checkAchievements();
  }
}

function renderPrestige() {
  const gain = getPrestigeGain();
  document.getElementById('prestige-points').textContent = formatNumber(state.prestigePoints);
  document.getElementById('prestige-bonus').textContent = `+${Math.round((getPrestigeMultiplier() - 1) * 100)}%`;
  document.getElementById('prestige-gain').textContent = `+${formatNumber(gain)}`;
  const btn = document.getElementById('prestige-btn');
  btn.disabled = gain <= 0;
}

function init() {
  loadState();
  updateStats();
  buildShop();
  buildUpgrades();
  renderPrestige();
  renderAchievements();
  checkAchievements();

  document.getElementById('train-btn').addEventListener('click', handleTrainClick);

  document.getElementById('prestige-btn').addEventListener('click', () => {
    const gain = getPrestigeGain();
    if (gain <= 0) return;
    const ok = confirm(
      `Ascender reinicia seu Chakra, Aliados e Upgrades da run, mas concede +${gain} Fragmento(s) do Sábio permanente(s) ` +
      `(bônus total passaria de +${Math.round((getPrestigeMultiplier() - 1) * 100)}% para ` +
      `+${Math.round((1 + (state.prestigePoints + gain) * PRESTIGE_BONUS_PER_POINT - 1) * 100)}%). Continuar?`
    );
    if (ok) doPrestige();
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Tem certeza que quer reiniciar TODO o seu progresso, incluindo Fragmentos do Sábio e Conquistas?')) {
      localStorage.removeItem(SAVE_KEY);
      state = createFreshState();
      updateStats();
      refreshShop();
      refreshUpgrades();
      renderPrestige();
      renderAchievements();
    }
  });

  setInterval(tick, 100);
  setInterval(saveState, 5000);
  window.addEventListener('beforeunload', saveState);
}

init();

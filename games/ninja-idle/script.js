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

const ENEMIES = [
  { name: 'Bandido Errante', icon: '🥷', hp: 40, atk: 3, rewardChakra: 200, rewardScrolls: 5 },
  { name: 'Ronin Desertor', icon: '🗡️', hp: 90, atk: 6, rewardChakra: 800, rewardScrolls: 10 },
  { name: 'Ninja Renegado', icon: '🌀', hp: 180, atk: 10, rewardChakra: 3000, rewardScrolls: 18 },
  { name: 'Caçador Corrompido', icon: '🦉', hp: 320, atk: 16, rewardChakra: 12000, rewardScrolls: 30 },
  { name: 'Fera Selada Menor', icon: '🐺', hp: 550, atk: 24, rewardChakra: 50000, rewardScrolls: 50 },
  { name: 'Mercenário Rank-S', icon: '💀', hp: 900, atk: 34, rewardChakra: 220000, rewardScrolls: 80 },
  { name: 'Golem de Argila Ancestral', icon: '🗿', hp: 1400, atk: 46, rewardChakra: 900000, rewardScrolls: 130 },
  { name: 'Espectro Ressuscitado', icon: '👻', hp: 2200, atk: 60, rewardChakra: 4000000, rewardScrolls: 200 },
  { name: 'Comandante da Alvorada', icon: '🌒', hp: 3400, atk: 78, rewardChakra: 18000000, rewardScrolls: 320 },
  { name: 'Avatar do Caos Selado', icon: '👹', hp: 6000, atk: 100, rewardChakra: 90000000, rewardScrolls: 500 },
];

const BATTLE_UPGRADES = [
  { id: 'iron_fist', name: 'Punho de Ferro', icon: '👊', desc: '+5 de Ataque por nível.', baseCost: 10, costGrowth: 1.3 },
  { id: 'ninja_vitality', name: 'Vitalidade Ninja', icon: '❤️', desc: '+25 de Vida Máxima por nível.', baseCost: 8, costGrowth: 1.3 },
  { id: 'battle_fury', name: 'Fúria de Batalha', icon: '🔥', desc: '+5% de Ataque por nível.', baseCost: 40, costGrowth: 1.5 },
  { id: 'defensive_stance', name: 'Postura Defensiva', icon: '🛡️', desc: '-4% de dano recebido por nível (máx. 5).', baseCost: 40, costGrowth: 1.5, maxLevel: 5 },
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
  { id: 'battle_first_win', icon: '⚔️', name: 'Primeira Vitória', desc: 'Vença sua primeira batalha na Arena.', check: (s) => s.totalBattlesWon >= 1 },
  { id: 'battle_veteran', icon: '🎖️', name: 'Veterano de Guerra', desc: 'Vença 50 batalhas na Arena.', check: (s) => s.totalBattlesWon >= 50 },
  { id: 'battle_ladder_complete', icon: '🏅', name: 'Lenda da Arena', desc: 'Derrote o chefe final da trilha de batalhas.', check: (s) => s.enemyLadderIndex >= ENEMIES.length },
  { id: 'battle_endless_10', icon: '🌊', name: 'Onda Interminável', desc: 'Sobreviva a 10 ondas do Modo Interminável.', check: (s) => s.enemyLadderIndex >= ENEMIES.length + 10 },
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
    battleScrolls: 0,
    battleUpgrades: {},
    enemyLadderIndex: 0,
    enemyCurrentHp: null,
    playerCurrentHp: null,
    totalBattlesWon: 0,
    autoAttackEnabled: false,
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

  state.playerCurrentHp = getPlayerMaxHp();
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

function getBattleUpgradeLevel(id) {
  return state.battleUpgrades[id] || 0;
}

function getBattleUpgradeCost(upgrade) {
  const level = getBattleUpgradeLevel(upgrade.id);
  return Math.ceil(upgrade.baseCost * Math.pow(upgrade.costGrowth, level));
}

function getPlayerAttack() {
  const flat = 5 + getBattleUpgradeLevel('iron_fist') * 5;
  const percentBonus = 1 + getBattleUpgradeLevel('battle_fury') * 0.05;
  return Math.round(flat * percentBonus * getEffectiveMultiplier());
}

function getPlayerMaxHp() {
  return 50 + getBattleUpgradeLevel('ninja_vitality') * 25;
}

function getDamageReduction() {
  return Math.min(0.8, getBattleUpgradeLevel('defensive_stance') * 0.04);
}

function getEnemyForWave(waveIndexBeyondLadder) {
  const base = ENEMIES[ENEMIES.length - 1];
  const n = waveIndexBeyondLadder + 1;
  return {
    name: `Onda Interminável ${n}`,
    icon: '🌊',
    hp: Math.round(base.hp * Math.pow(1.5, n)),
    atk: Math.round(base.atk * Math.pow(1.3, n)),
    rewardChakra: Math.round(base.rewardChakra * Math.pow(1.6, n)),
    rewardScrolls: Math.round(base.rewardScrolls * Math.pow(1.4, n)),
  };
}

function getCurrentEnemy() {
  if (state.enemyLadderIndex < ENEMIES.length) return ENEMIES[state.enemyLadderIndex];
  return getEnemyForWave(state.enemyLadderIndex - ENEMIES.length);
}

function getEnemyCurrentHp() {
  const enemy = getCurrentEnemy();
  return state.enemyCurrentHp == null ? enemy.hp : state.enemyCurrentHp;
}

function randomizeAmount(base) {
  return Math.max(1, Math.round(base * (0.85 + Math.random() * 0.3)));
}

function logBattle(text, cssClass) {
  const log = document.getElementById('battle-log');
  const entry = document.createElement('div');
  if (cssClass) entry.className = cssClass;
  entry.textContent = text;
  log.prepend(entry);
  while (log.childNodes.length > 20) {
    log.removeChild(log.lastChild);
  }
}

function buyBattleUpgrade(upgrade) {
  const level = getBattleUpgradeLevel(upgrade.id);
  if (upgrade.maxLevel && level >= upgrade.maxLevel) return;
  const cost = getBattleUpgradeCost(upgrade);
  if (state.battleScrolls < cost) return;
  state.battleScrolls -= cost;
  state.battleUpgrades[upgrade.id] = level + 1;
  state.playerCurrentHp = getPlayerMaxHp();
  refreshBattleUpgrades();
  renderBattle();
  saveState();
}

function doAttack() {
  const enemy = getCurrentEnemy();
  let enemyHp = getEnemyCurrentHp();
  const playerAtk = getPlayerAttack();
  const dmgToEnemy = randomizeAmount(playerAtk);
  enemyHp -= dmgToEnemy;
  logBattle(`Você causou ${dmgToEnemy} de dano em ${enemy.name}.`);

  if (enemyHp <= 0) {
    state.totalBattlesWon += 1;
    state.chakra += enemy.rewardChakra;
    state.totalEarned += enemy.rewardChakra;
    state.lifetimeEarned += enemy.rewardChakra;
    state.battleScrolls += enemy.rewardScrolls;
    logBattle(
      `Você derrotou ${enemy.name}! +${formatNumber(enemy.rewardChakra)} chakra, +${enemy.rewardScrolls} pergaminhos.`,
      'victory'
    );
    state.enemyLadderIndex += 1;
    state.enemyCurrentHp = null;
    state.playerCurrentHp = getPlayerMaxHp();
    checkAchievements();
  } else {
    state.enemyCurrentHp = enemyHp;
    const rawEnemyDmg = randomizeAmount(enemy.atk);
    const dmgToPlayer = Math.max(0, Math.round(rawEnemyDmg * (1 - getDamageReduction())));
    state.playerCurrentHp -= dmgToPlayer;
    logBattle(`${enemy.name} revidou causando ${dmgToPlayer} de dano.`);
    if (state.playerCurrentHp <= 0) {
      logBattle('Você foi derrotado! Recuperou-se e pode tentar novamente.', 'defeat');
      state.playerCurrentHp = getPlayerMaxHp();
    }
  }

  renderBattle();
  updateStats();
  refreshShop();
  refreshUpgrades();
  refreshBattleUpgrades();
  saveState();
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
  renderBattle();
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

const battleUpgradeElements = {};

function buildBattleUpgrades() {
  const list = document.getElementById('battle-upgrades-list');
  list.innerHTML = '';
  BATTLE_UPGRADES.forEach((upgrade) => {
    const btn = document.createElement('button');
    btn.className = 'shop-item upgrade-item';
    btn.innerHTML = `
      <div class="icon">${upgrade.icon}</div>
      <div class="info">
        <div class="name">${upgrade.name} <span class="count">0</span></div>
        <div class="desc">${upgrade.desc}</div>
      </div>
      <div class="cost">
        <div class="price">0</div>
        <span class="cps">pergaminhos</span>
      </div>
    `;
    btn.addEventListener('click', () => buyBattleUpgrade(upgrade));
    list.appendChild(btn);
    battleUpgradeElements[upgrade.id] = {
      btn,
      countEl: btn.querySelector('.count'),
      priceEl: btn.querySelector('.price'),
    };
  });
  refreshBattleUpgrades();
}

function refreshBattleUpgrades() {
  BATTLE_UPGRADES.forEach((upgrade) => {
    const els = battleUpgradeElements[upgrade.id];
    if (!els) return;
    const level = getBattleUpgradeLevel(upgrade.id);
    const maxedOut = Boolean(upgrade.maxLevel && level >= upgrade.maxLevel);
    const cost = getBattleUpgradeCost(upgrade);
    els.countEl.textContent = level;
    els.priceEl.textContent = maxedOut ? 'Máximo' : formatNumber(cost);
    els.btn.disabled = maxedOut || state.battleScrolls < cost;
    els.btn.classList.toggle('purchased', maxedOut);
  });
}

function renderBattle() {
  const enemy = getCurrentEnemy();
  const enemyHp = Math.max(0, getEnemyCurrentHp());
  const enemyMaxHp = enemy.hp;
  const playerMaxHp = getPlayerMaxHp();
  const playerHp = Math.max(0, Math.min(playerMaxHp, state.playerCurrentHp == null ? playerMaxHp : state.playerCurrentHp));

  document.getElementById('enemy-name').textContent = enemy.name;
  document.getElementById('enemy-icon').textContent = enemy.icon;
  document.getElementById('enemy-hp-fill').style.width = `${(enemyHp / enemyMaxHp) * 100}%`;
  document.getElementById('enemy-hp-label').textContent = `${Math.round(enemyHp)} / ${enemyMaxHp}`;

  document.getElementById('player-hp-fill').style.width = `${(playerHp / playerMaxHp) * 100}%`;
  document.getElementById('player-hp-label').textContent = `${Math.round(playerHp)} / ${playerMaxHp}`;

  document.getElementById('player-attack').textContent = getPlayerAttack();
  document.getElementById('battle-scrolls').textContent = formatNumber(state.battleScrolls);

  const progressLabel =
    state.enemyLadderIndex < ENEMIES.length
      ? `Estágio ${state.enemyLadderIndex + 1}/${ENEMIES.length}`
      : `Modo Interminável — Onda ${state.enemyLadderIndex - ENEMIES.length + 1}`;
  document.getElementById('arena-progress').textContent = progressLabel;
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
    renderBattle();
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
  buildBattleUpgrades();
  renderBattle();
  renderPrestige();
  renderAchievements();
  checkAchievements();

  document.getElementById('train-btn').addEventListener('click', handleTrainClick);

  document.getElementById('attack-btn').addEventListener('click', doAttack);

  const autoAttackCheckbox = document.getElementById('auto-attack-checkbox');
  autoAttackCheckbox.checked = state.autoAttackEnabled;
  autoAttackCheckbox.addEventListener('change', () => {
    state.autoAttackEnabled = autoAttackCheckbox.checked;
    saveState();
  });

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
    if (confirm('Tem certeza que quer reiniciar TODO o seu progresso, incluindo Fragmentos do Sábio, Conquistas e a Arena?')) {
      localStorage.removeItem(SAVE_KEY);
      state = createFreshState();
      state.playerCurrentHp = getPlayerMaxHp();
      updateStats();
      refreshShop();
      refreshUpgrades();
      refreshBattleUpgrades();
      renderBattle();
      renderPrestige();
      renderAchievements();
      autoAttackCheckbox.checked = false;
    }
  });

  setInterval(tick, 100);
  setInterval(() => {
    if (state.autoAttackEnabled) doAttack();
  }, 1200);
  setInterval(saveState, 5000);
  window.addEventListener('beforeunload', saveState);
}

init();

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

const PRESTIGE_DIVISOR = 1_000_000;
const PRESTIGE_BONUS_PER_POINT = 0.02;

let state = {
  chakra: 0,
  totalEarned: 0,
  clickPower: 1,
  owned: {},
  prestigePoints: 0,
  lastSeen: Date.now(),
};

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

function getTotalCps() {
  return UNITS.reduce((sum, unit) => sum + unit.baseCps * getUnitCount(unit.id), 0);
}

function getPrestigeMultiplier() {
  return 1 + state.prestigePoints * PRESTIGE_BONUS_PER_POINT;
}

function getEffectiveCps() {
  return getTotalCps() * getPrestigeMultiplier();
}

function getEffectiveClickPower() {
  return state.clickPower * getPrestigeMultiplier();
}

function getPrestigeGain() {
  return Math.floor(Math.cbrt(state.totalEarned / PRESTIGE_DIVISOR));
}

function doPrestige() {
  const gain = getPrestigeGain();
  if (gain <= 0) return;
  state.prestigePoints += gain;
  state.chakra = 0;
  state.totalEarned = 0;
  state.owned = {};
  updateStats();
  refreshShop();
  renderPrestige();
  saveState();
}

function getCurrentRank() {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (state.totalEarned >= rank.threshold) {
      current = rank;
    }
  }
  return current;
}

function getNextRank() {
  const currentIndex = RANKS.findIndex((r) => r === getCurrentRank());
  return RANKS[currentIndex + 1] || null;
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

function updateStats() {
  document.getElementById('chakra-value').textContent = formatNumber(state.chakra);
  document.getElementById('cps-value').textContent = formatNumber(getEffectiveCps());

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
  spawnFloatingGain(event.clientX, event.clientY, amount);
  updateStats();
  refreshShop();
  renderPrestige();
}

function tick() {
  const cps = getEffectiveCps();
  if (cps > 0) {
    const delta = cps / 10;
    state.chakra += delta;
    state.totalEarned += delta;
    updateStats();
    refreshShop();
    renderPrestige();
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
  renderPrestige();

  document.getElementById('train-btn').addEventListener('click', handleTrainClick);

  document.getElementById('prestige-btn').addEventListener('click', () => {
    const gain = getPrestigeGain();
    if (gain <= 0) return;
    const ok = confirm(
      `Ascender reinicia seu Chakra e seus aliados, mas concede +${gain} Fragmento(s) do Sábio permanente(s) ` +
      `(bônus total passaria de +${Math.round((getPrestigeMultiplier() - 1) * 100)}% para ` +
      `+${Math.round((1 + (state.prestigePoints + gain) * PRESTIGE_BONUS_PER_POINT - 1) * 100)}%). Continuar?`
    );
    if (ok) doPrestige();
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Tem certeza que quer reiniciar TODO o seu progresso, incluindo os Fragmentos do Sábio?')) {
      localStorage.removeItem(SAVE_KEY);
      state = {
        chakra: 0,
        totalEarned: 0,
        clickPower: 1,
        owned: {},
        prestigePoints: 0,
        lastSeen: Date.now(),
      };
      updateStats();
      refreshShop();
      renderPrestige();
    }
  });

  setInterval(tick, 100);
  setInterval(saveState, 5000);
  window.addEventListener('beforeunload', saveState);
}

init();

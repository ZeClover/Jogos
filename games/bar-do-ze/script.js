const SAVE_KEY = 'bar-do-ze-save-v2';

const INGREDIENTS = {
  gelo: { name: 'Gelo', icon: '🧊' },
  destilado: { name: 'Destilado', icon: '🥃' },
  limao: { name: 'Limão', icon: '🍋' },
  refrigerante: { name: 'Água com Gás', icon: '🥤' },
  laranja: { name: 'Suco de Laranja', icon: '🍊' },
  xarope: { name: 'Xarope', icon: '🍯' },
  menta: { name: 'Menta', icon: '🌿' },
  cereja: { name: 'Cereja', icon: '🍒' },
  sal: { name: 'Sal', icon: '🧂' },
  coco: { name: 'Leite de Coco', icon: '🥥' },
  abacaxi: { name: 'Suco de Abacaxi', icon: '🍍' },
};

const RECIPES = [
  {
    id: 'caipirinha',
    name: 'Caipirinha',
    icon: '🍈',
    unlockDay: 1,
    steps: [
      { type: 'add', ingredient: 'limao', label: 'Corte e adicione o limão' },
      { type: 'mash', verb: 'Socar', count: 7, time: 3, label: 'Socar o limão com açúcar' },
      { type: 'add', ingredient: 'destilado', label: 'Adicione a cachaça' },
      { type: 'add', ingredient: 'gelo', label: 'Adicione o gelo' },
      { type: 'mash', verb: 'Mexer', count: 5, time: 2.5, label: 'Mexa bem' },
    ],
  },
  {
    id: 'mojito',
    name: 'Mojito',
    icon: '🌿',
    unlockDay: 1,
    steps: [
      { type: 'mash', verb: 'Socar', count: 7, time: 3, label: 'Socar a menta com limão' },
      { type: 'add', ingredient: 'destilado', label: 'Adicione o rum' },
      { type: 'add', ingredient: 'gelo', label: 'Adicione o gelo' },
      { type: 'add', ingredient: 'refrigerante', label: 'Complete com água com gás' },
      { type: 'mash', verb: 'Mexer', count: 5, time: 2.5, label: 'Mexa bem' },
    ],
  },
  {
    id: 'cuba_libre',
    name: 'Cuba Libre',
    icon: '🥤',
    unlockDay: 1,
    steps: [
      { type: 'add', ingredient: 'destilado', label: 'Adicione o rum' },
      { type: 'add', ingredient: 'refrigerante', label: 'Complete com refrigerante de cola' },
      { type: 'add', ingredient: 'limao', label: 'Adicione uma rodela de limão' },
      { type: 'mash', verb: 'Mexer', count: 4, time: 2.5, label: 'Mexa bem' },
    ],
  },
  {
    id: 'margarita',
    name: 'Margarita',
    icon: '🍹',
    unlockDay: 2,
    steps: [
      { type: 'add', ingredient: 'destilado', label: 'Adicione a tequila' },
      { type: 'add', ingredient: 'limao', label: 'Adicione o limão' },
      { type: 'mash', verb: 'Balançar', count: 10, time: 3.5, label: 'Balance a coqueteleira' },
      { type: 'garnish', ingredient: 'sal', label: 'Salgue a borda do copo' },
    ],
  },
  {
    id: 'whisky_sour',
    name: 'Whisky Sour',
    icon: '🥃',
    unlockDay: 2,
    steps: [
      { type: 'add', ingredient: 'destilado', label: 'Adicione o whisky' },
      { type: 'add', ingredient: 'limao', label: 'Adicione o limão' },
      { type: 'add', ingredient: 'xarope', label: 'Adicione o xarope' },
      { type: 'mash', verb: 'Balançar', count: 9, time: 3, label: 'Balance a coqueteleira' },
      { type: 'garnish', ingredient: 'cereja', label: 'Finalize com uma cereja' },
    ],
  },
  {
    id: 'gin_tonica',
    name: 'Gin Tônica',
    icon: '🍸',
    unlockDay: 3,
    steps: [
      { type: 'add', ingredient: 'destilado', label: 'Adicione o gin' },
      { type: 'add', ingredient: 'gelo', label: 'Adicione o gelo' },
      { type: 'add', ingredient: 'refrigerante', label: 'Complete com água tônica' },
      { type: 'garnish', ingredient: 'menta', label: 'Finalize com uma folha de menta' },
    ],
  },
  {
    id: 'pina_colada',
    name: 'Piña Colada',
    icon: '🍍',
    unlockDay: 3,
    steps: [
      { type: 'add', ingredient: 'destilado', label: 'Adicione o rum' },
      { type: 'add', ingredient: 'coco', label: 'Adicione o leite de coco' },
      { type: 'add', ingredient: 'abacaxi', label: 'Adicione o suco de abacaxi' },
      { type: 'pour', verb: 'Bater no liquidificador', label: 'Bata até o ponto certo — nem cedo, nem demais', target: [55, 78] },
    ],
  },
  {
    id: 'tequila_sunrise',
    name: 'Tequila Sunrise',
    icon: '🌅',
    unlockDay: 4,
    steps: [
      { type: 'add', ingredient: 'destilado', label: 'Adicione a tequila' },
      { type: 'add', ingredient: 'laranja', label: 'Complete com suco de laranja' },
      { type: 'pour', verb: 'Derramar a grenadine devagar', label: 'Pare bem no fundo, sem misturar demais', target: [15, 35] },
      { type: 'garnish', ingredient: 'cereja', label: 'Finalize com uma cereja' },
    ],
  },
];

const UPGRADES = [
  {
    id: 'patience',
    name: '⏱️ Treino de Agilidade',
    desc: '+2s de paciência para todos os clientes.',
    baseCost: 25,
    costGrowth: 1.5,
    maxLevel: 8,
  },
  {
    id: 'payout',
    name: '💵 Fidelização',
    desc: '+10% no valor de cada pedido correto.',
    baseCost: 30,
    costGrowth: 1.6,
    maxLevel: 8,
  },
  {
    id: 'patience_days',
    name: '🍀 Segunda Chance',
    desc: '+1 erro seguido permitido antes de fechar o expediente.',
    baseCost: 40,
    costGrowth: 1.8,
    maxLevel: 3,
  },
];

function createFreshState() {
  return {
    started: false,
    day: 1,
    money: 0,
    bestDay: 1,
    bestCombo: 0,
    combo: 0,
    consecutiveFails: 0,
    served: 0,
    failed: 0,
    requiredCustomers: 5,
    upgrades: {},
    lastSeen: Date.now(),
  };
}

let state = createFreshState();
let round = null;

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      state = Object.assign(state, JSON.parse(raw));
    }
  } catch (e) {
    console.warn('Falha ao carregar save', e);
  }
}

function saveState() {
  state.lastSeen = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function getUpgradeLevel(id) {
  return state.upgrades[id] || 0;
}

function getUpgradeCost(upgrade) {
  return Math.ceil(upgrade.baseCost * Math.pow(upgrade.costGrowth, getUpgradeLevel(upgrade.id)));
}

function getUnlockedRecipes() {
  return RECIPES.filter((r) => r.unlockDay <= state.day);
}

function getPatienceSeconds(recipe) {
  const base = Math.max(10, 14 - (state.day - 1) * 0.6) + recipe.steps.length * 3.5;
  return base + getUpgradeLevel('patience') * 2;
}

function getRequiredCustomers() {
  return 5 + Math.floor((state.day - 1) / 2);
}

function getMaxConsecutiveFails() {
  return 3 + getUpgradeLevel('patience_days');
}

function getPayoutMultiplier() {
  return 1 + getUpgradeLevel('payout') * 0.1;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(name) {
  document.getElementById('screen-intro').hidden = name !== 'intro';
  document.getElementById('screen-day').hidden = name !== 'day';
  document.getElementById('screen-summary').hidden = name !== 'summary';
  document.getElementById('screen-shop').hidden = name !== 'shop';
}

function renderQueue() {
  const row = document.getElementById('queue-row');
  row.innerHTML = '';
  const remaining = state.requiredCustomers - state.served - state.failed - 1;
  const previewCount = Math.max(0, Math.min(5, remaining));
  for (let i = 0; i < previewCount; i++) {
    const span = document.createElement('span');
    span.className = 'queue-icon';
    span.textContent = '🧍';
    row.appendChild(span);
  }
}

function renderTopbar() {
  document.getElementById('day-number').textContent = state.day;
  document.getElementById('money-value').textContent = state.money;
  document.getElementById('combo-value').textContent = state.combo;
}

function setLog(text, isFail) {
  const log = document.getElementById('lz-log');
  log.textContent = text;
  log.classList.toggle('fail', Boolean(isFail));
}

function updatePatienceBar() {
  const fill = document.getElementById('patience-fill');
  const ratio = Math.max(0, round.timeLeft / round.timeTotal);
  fill.style.width = `${ratio * 100}%`;
  fill.classList.toggle('low', ratio <= 0.5 && ratio > 0.2);
  fill.classList.toggle('critical', ratio <= 0.2);
}

function renderStepDots() {
  const dots = document.getElementById('step-dots');
  dots.innerHTML = '';
  round.recipe.steps.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'step-dot';
    if (i < round.stepIndex) dot.classList.add('done');
    else if (i === round.stepIndex) dot.classList.add('current');
    dots.appendChild(dot);
  });
}

function applyPatiencePenalty(seconds) {
  round.timeLeft = Math.max(0, round.timeLeft - seconds);
  updatePatienceBar();
  if (round.timeLeft <= 0) {
    clearInterval(round.timerId);
    handleCustomerLeft('timeout');
  }
}

function stopStepMechanics() {
  if (round.mashTimerId) clearInterval(round.mashTimerId);
  if (round.pourTimerId) clearInterval(round.pourTimerId);
}

function renderCurrentStep() {
  const step = round.recipe.steps[round.stepIndex];
  const label = document.getElementById('step-label');
  const interaction = document.getElementById('step-interaction');
  label.textContent = step.label;
  interaction.innerHTML = '';
  renderStepDots();

  if (step.type === 'add' || step.type === 'garnish') {
    const correctId = step.ingredient;
    const otherIds = Object.keys(INGREDIENTS).filter((id) => id !== correctId);
    const distractors = shuffle(otherIds).slice(0, 3);
    const options = shuffle([correctId, ...distractors]);

    const row = document.createElement('div');
    row.className = 'choice-row';
    options.forEach((id) => {
      const ing = INGREDIENTS[id];
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span class="icon">${ing.icon}</span><span class="name">${ing.name}</span>`;
      btn.addEventListener('click', () => {
        if (id === correctId) {
          advanceStep();
        } else {
          btn.classList.add('wrong');
          setTimeout(() => btn.classList.remove('wrong'), 300);
        }
      });
      row.appendChild(btn);
    });
    interaction.appendChild(row);
  } else if (step.type === 'mash') {
    round.mashCount = 0;
    round.mashTimeLeft = step.time;

    const btn = document.createElement('button');
    btn.className = 'mash-btn';
    btn.textContent = step.verb + '!';

    const counter = document.createElement('div');
    counter.className = 'mash-counter';
    counter.textContent = `0 / ${step.count}`;

    const track = document.createElement('div');
    track.className = 'mash-timer-track';
    const fill = document.createElement('div');
    fill.className = 'mash-timer-fill';
    track.appendChild(fill);

    btn.addEventListener('click', () => {
      round.mashCount += 1;
      counter.textContent = `${round.mashCount} / ${step.count}`;
      if (round.mashCount >= step.count) {
        stopStepMechanics();
        advanceStep();
      }
    });

    interaction.appendChild(btn);
    interaction.appendChild(counter);
    interaction.appendChild(track);

    clearInterval(round.mashTimerId);
    round.mashTimerId = setInterval(() => {
      round.mashTimeLeft -= 0.05;
      const ratio = Math.max(0, round.mashTimeLeft / step.time);
      fill.style.width = `${ratio * 100}%`;
      if (round.mashTimeLeft <= 0) {
        clearInterval(round.mashTimerId);
        applyPatiencePenalty(3);
        if (round) renderCurrentStep();
      }
    }, 50);
  } else if (step.type === 'pour') {
    round.pourPhase = 0;
    const speed = 0.05 + Math.min(0.05, state.day * 0.004);

    const track = document.createElement('div');
    track.className = 'pour-track';
    const zone = document.createElement('div');
    zone.className = 'pour-zone';
    zone.style.left = `${step.target[0]}%`;
    zone.style.width = `${step.target[1] - step.target[0]}%`;
    const indicator = document.createElement('div');
    indicator.className = 'pour-indicator';
    track.appendChild(zone);
    track.appendChild(indicator);

    const stopBtn = document.createElement('button');
    stopBtn.className = 'pour-stop-btn';
    stopBtn.textContent = 'Parar!';
    stopBtn.addEventListener('click', () => {
      const value = round.pourValue;
      if (value >= step.target[0] && value <= step.target[1]) {
        clearInterval(round.pourTimerId);
        advanceStep();
      } else {
        applyPatiencePenalty(3);
      }
    });

    interaction.appendChild(track);
    interaction.appendChild(stopBtn);

    clearInterval(round.pourTimerId);
    round.pourTimerId = setInterval(() => {
      round.pourPhase += speed;
      round.pourValue = 50 + 50 * Math.sin(round.pourPhase);
      indicator.style.left = `${round.pourValue}%`;
    }, 30);
  }
}

function advanceStep() {
  if (!round) return;
  stopStepMechanics();
  round.stepIndex += 1;
  if (round.stepIndex >= round.recipe.steps.length) {
    handleOrderComplete();
  } else {
    renderCurrentStep();
  }
}

function startNextCustomer() {
  if (state.served + state.failed >= state.requiredCustomers) {
    endDay();
    return;
  }
  const recipe = shuffle(getUnlockedRecipes())[0];
  const timeTotal = getPatienceSeconds(recipe);
  round = {
    recipe,
    stepIndex: 0,
    timeTotal,
    timeLeft: timeTotal,
  };
  document.getElementById('recipe-name').textContent = `${recipe.icon} ${recipe.name}`;
  renderQueue();
  renderTopbar();
  updatePatienceBar();
  renderCurrentStep();
  setLog('');

  clearInterval(round.timerId);
  round.timerId = setInterval(() => {
    round.timeLeft -= 0.1;
    updatePatienceBar();
    if (round.timeLeft <= 0) {
      clearInterval(round.timerId);
      handleCustomerLeft('timeout');
    }
  }, 100);
}

function handleOrderComplete() {
  if (!round) return;
  clearInterval(round.timerId);
  stopStepMechanics();
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.consecutiveFails = 0;
  const comboBonus = 1 + Math.min(1, state.combo * 0.05);
  const basePay = 12 + round.recipe.steps.length * 5;
  const earned = Math.round(basePay * getPayoutMultiplier() * comboBonus);
  state.money += earned;
  state.served += 1;
  setLog(`+$${earned}! ${round.recipe.name} perfeito.`, false);
  saveState();
  round = null;
  setTimeout(startNextCustomer, 600);
}

function handleCustomerLeft(reason) {
  if (!round) return;
  clearInterval(round.timerId);
  stopStepMechanics();
  state.combo = 0;
  state.consecutiveFails += 1;
  state.failed += 1;
  setLog(reason === 'timeout' ? 'O cliente foi embora sem paciência!' : 'Deu ruim no preparo, o cliente desistiu!', true);
  saveState();
  round = null;

  if (state.consecutiveFails >= getMaxConsecutiveFails()) {
    setTimeout(() => endDay(true), 700);
  } else {
    setTimeout(startNextCustomer, 700);
  }
}

function endDay(early) {
  if (round) {
    clearInterval(round.timerId);
    stopStepMechanics();
    round = null;
  }
  state.bestDay = Math.max(state.bestDay, state.day);
  saveState();

  showScreen('summary');
  document.getElementById('summary-text').textContent =
    (early ? 'Você fechou o balcão mais cedo hoje — muitos pedidos errados seguidos. ' : 'Expediente concluído! ') +
    `Atendidos: ${state.served} | Perdidos: ${state.failed} | Melhor combo: ${state.bestCombo} | Dinheiro total: $${state.money}.`;
}

function renderShop() {
  document.getElementById('shop-money').textContent = state.money;
  document.getElementById('next-day-number').textContent = state.day + 1;
  const root = document.getElementById('shop-upgrade-rows');
  root.innerHTML = '';
  UPGRADES.forEach((upgrade) => {
    const level = getUpgradeLevel(upgrade.id);
    const maxed = level >= upgrade.maxLevel;
    const cost = getUpgradeCost(upgrade);
    const row = document.createElement('div');
    row.className = 'shop-row';
    row.innerHTML = `
      <div class="shop-info">${upgrade.name} (Nv. ${level}/${upgrade.maxLevel})<small>${upgrade.desc}</small></div>
    `;
    const btn = document.createElement('button');
    btn.textContent = maxed ? 'Máximo' : `$${cost}`;
    btn.disabled = maxed || state.money < cost;
    btn.addEventListener('click', () => {
      if (maxed || state.money < cost) return;
      state.money -= cost;
      state.upgrades[upgrade.id] = level + 1;
      saveState();
      renderShop();
    });
    row.appendChild(btn);
    root.appendChild(row);
  });
}

function startDay() {
  state.served = 0;
  state.failed = 0;
  state.combo = 0;
  state.consecutiveFails = 0;
  state.requiredCustomers = getRequiredCustomers();
  saveState();
  showScreen('day');
  startNextCustomer();
}

function init() {
  loadState();

  document.getElementById('record-text').textContent =
    state.bestDay > 1 || state.money > 0
      ? `Recorde: Dia ${state.bestDay} | Melhor combo: ${state.bestCombo} | Dinheiro acumulado: $${state.money}`
      : '';

  if (state.started) {
    showScreen('shop');
    renderShop();
  } else {
    showScreen('intro');
  }

  document.getElementById('start-btn').addEventListener('click', () => {
    state.started = true;
    saveState();
    startDay();
  });

  document.getElementById('to-shop-btn').addEventListener('click', () => {
    showScreen('shop');
    renderShop();
  });

  document.getElementById('next-day-btn').addEventListener('click', () => {
    state.day += 1;
    saveState();
    startDay();
  });

  window.addEventListener('beforeunload', saveState);
}

init();

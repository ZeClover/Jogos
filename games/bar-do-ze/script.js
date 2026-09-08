const SAVE_KEY = 'bar-do-ze-save-v2';

const INGREDIENTS = {
  gelo: { name: 'Gelo', icon: '🧊' },
  cachaca: { name: 'Cachaça', icon: '🥃' },
  rum: { name: 'Rum', icon: '🥃' },
  tequila: { name: 'Tequila', icon: '🥃' },
  whisky: { name: 'Whisky', icon: '🥃' },
  gin: { name: 'Gin', icon: '🍸' },
  vodka: { name: 'Vodka', icon: '🥃' },
  limao: { name: 'Limão', icon: '🍋' },
  refrigerante: { name: 'Água com Gás', icon: '🥤' },
  cola: { name: 'Refrigerante de Cola', icon: '🥤' },
  tonica: { name: 'Água Tônica', icon: '🫧' },
  gengibre: { name: 'Refrigerante de Gengibre', icon: '🫚' },
  citrico: { name: 'Refrigerante Cítrico', icon: '🧃' },
  laranja: { name: 'Suco de Laranja', icon: '🍊' },
  xarope: { name: 'Xarope', icon: '🍯' },
  menta: { name: 'Menta', icon: '🌿' },
  cereja: { name: 'Cereja', icon: '🍒' },
  sal: { name: 'Sal', icon: '🧂' },
  coco: { name: 'Leite de Coco', icon: '🥥' },
  creme_leite: { name: 'Creme de Leite', icon: '🥛' },
  abacaxi: { name: 'Suco de Abacaxi', icon: '🍍' },
  azeitona: { name: 'Azeitona', icon: '🫒' },
  pepino: { name: 'Pepino', icon: '🥒' },
  tomate: { name: 'Suco de Tomate', icon: '🍅' },
  cafe: { name: 'Café Espresso', icon: '☕' },
};

const SIMON_ICONS = ['🍋', '🥃', '🍯', '🍒'];

const CUSTOMERS = [
  { name: 'Marina', avatar: '👩' },
  { name: 'Léo', avatar: '🧑' },
  { name: 'Dona Célia', avatar: '👵' },
  { name: 'Seu Joaquim', avatar: '👴' },
  { name: 'Bia', avatar: '👩‍🦱' },
  { name: 'Rafa', avatar: '🧔' },
  { name: 'Duda', avatar: '👱‍♀️' },
  { name: 'Théo', avatar: '👨‍🦰' },
  { name: 'Sol', avatar: '🧕' },
  { name: 'Igor', avatar: '👨' },
  { name: 'Vivi', avatar: '👩‍🦳' },
  { name: 'Caíque', avatar: '👦' },
  { name: 'Renata', avatar: '👩‍🦲' },
  { name: 'Pedrinho', avatar: '🧒' },
];

const DIALOGUE = {
  caipirinha: ['Depois desse calor, só uma Caipirinha bem gelada resolve!', 'Faz uma Caipirinha capricho, hoje o dia foi difícil.'],
  mojito: ['Tô com vontade de um Mojito bem refrescante!', 'Um Mojito, por favor — com bastante hortelã.'],
  cuba_libre: ['Me vê uma Cuba Libre, rapidinho!', 'Uma Cuba Libre pra comemorar o fim do expediente.'],
  margarita: ['Sextou! Bora de Margarita.', 'Uma Margarita bem salgada na borda, por favor.'],
  whisky_sour: ['Hoje o clima pede um Whisky Sour.', 'Um Whisky Sour bem equilibrado, se puder.'],
  gin_tonica: ['Um Gin Tônica bem geladinho, por favor.', 'Tô testando gins novos, me faz um Gin Tônica.'],
  pina_colada: ['Fecha os olhos e imagina uma praia... me traz uma Piña Colada.', 'Uma Piña Colada bem cremosa, por favor!'],
  tequila_sunrise: ['Um Tequila Sunrise, quero ver aquele degradê bonito.', 'Capricha no Tequila Sunrise, é pro Instagram.'],
  dry_martini: ['Um Dry Martini. Mexido, nunca batido.', 'Me vê um Dry Martini, sofisticado como eu.'],
  screwdriver: ['Só um Parafuso simples, sem enrolação.', 'Um Parafuso bem gelado, por favor.'],
  bloody_mary: ['Ressaca pesada hoje... um Bloody Mary salva.', 'Capricha no tempero do meu Bloody Mary.'],
  moscow_mule: ['Um Moscow Mule, adoro aquele gostinho de gengibre.', 'Me faz um Moscow Mule bem gelado.'],
  daiquiri: ['Um Daiquiri clássico, por favor.', 'Tô com vontade de um Daiquiri bem cítrico.'],
  white_russian: ['Um White Russian, bem cremoso.', 'Me faz um White Russian, hoje o dia pede.'],
  paloma: ['Uma Paloma bem refrescante pra esse calor.', 'Nunca provei, mas quero uma Paloma!'],
  espresso_martini: ['Preciso de cafeína... um Espresso Martini, por favor.', 'Um Espresso Martini bem espumoso.'],
  sex_on_beach: ['Um Sex on the Beach, bem tropical.', 'Me faz um Sex on the Beach caprichado.'],
  caipiroska: ['Gosto mais de vodka. Uma Caipiroska, por favor.', 'Uma Caipiroska bem batida, por favor.'],
};

const RECIPES = [
  {
    id: 'caipirinha',
    name: 'Caipirinha',
    icon: '🍈',
    unlockDay: 1,
    steps: [
      { type: 'add', ingredient: 'limao', label: 'Corte e adicione o limão' },
      { type: 'tapmove', icon: '🍋', count: 8, time: 6, label: 'Socar o limão que foge pelo copo!' },
      { type: 'add', ingredient: 'cachaca', label: 'Adicione a cachaça' },
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
      { type: 'rhythm', target: [42, 58], hitsNeeded: 3, label: 'Acerte o ponto certo 3 vezes seguidas!' },
      { type: 'add', ingredient: 'rum', label: 'Adicione o rum' },
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
      { type: 'add', ingredient: 'rum', label: 'Adicione o rum' },
      { type: 'add', ingredient: 'cola', label: 'Complete com refrigerante de cola' },
      { type: 'add', ingredient: 'limao', label: 'Adicione uma rodela de limão' },
      { type: 'dragfill', target: [65, 85], label: 'Segure para encher até a linha certa' },
    ],
  },
  {
    id: 'margarita',
    name: 'Margarita',
    icon: '🍹',
    unlockDay: 2,
    steps: [
      { type: 'add', ingredient: 'tequila', label: 'Adicione a tequila' },
      { type: 'add', ingredient: 'limao', label: 'Adicione o limão' },
      { type: 'altmash', count: 10, time: 5, label: 'Balance alternando os lados da coqueteleira!' },
      { type: 'garnish', ingredient: 'sal', label: 'Salgue a borda do copo' },
    ],
  },
  {
    id: 'whisky_sour',
    name: 'Whisky Sour',
    icon: '🥃',
    unlockDay: 2,
    steps: [
      { type: 'add', ingredient: 'whisky', label: 'Adicione o whisky' },
      { type: 'add', ingredient: 'limao', label: 'Adicione o limão' },
      { type: 'add', ingredient: 'xarope', label: 'Adicione o xarope' },
      { type: 'simon', length: 4, label: 'Decore e repita a sequência do coquetel!' },
      { type: 'garnish', ingredient: 'cereja', label: 'Finalize com uma cereja' },
    ],
  },
  {
    id: 'gin_tonica',
    name: 'Gin Tônica',
    icon: '🍸',
    unlockDay: 3,
    steps: [
      { type: 'add', ingredient: 'gin', label: 'Adicione o gin' },
      { type: 'selecttap', target: 'gelo', count: 5, gridSize: 9, label: 'Toque só no gelo, evite o resto!' },
      { type: 'add', ingredient: 'tonica', label: 'Complete com água tônica' },
      { type: 'garnish', ingredient: 'menta', label: 'Finalize com uma folha de menta' },
    ],
  },
  {
    id: 'pina_colada',
    name: 'Piña Colada',
    icon: '🍍',
    unlockDay: 3,
    steps: [
      { type: 'add', ingredient: 'rum', label: 'Adicione o rum' },
      { type: 'add', ingredient: 'coco', label: 'Adicione o leite de coco' },
      { type: 'add', ingredient: 'abacaxi', label: 'Adicione o suco de abacaxi' },
      { type: 'sustain', target: [45, 65], holdTime: 2.5, label: 'Mantenha o ponteiro do liquidificador na faixa certa!' },
    ],
  },
  {
    id: 'tequila_sunrise',
    name: 'Tequila Sunrise',
    icon: '🌅',
    unlockDay: 4,
    steps: [
      { type: 'add', ingredient: 'tequila', label: 'Adicione a tequila' },
      { type: 'add', ingredient: 'laranja', label: 'Complete com suco de laranja' },
      { type: 'pour', verb: 'Derramar a grenadine devagar', label: 'Pare bem no fundo, sem misturar demais', target: [15, 35] },
      { type: 'garnish', ingredient: 'cereja', label: 'Finalize com uma cereja' },
    ],
  },
  // Drinques extras — comprados na loja com dinheiro, além das evoluções.
  {
    id: 'dry_martini',
    name: 'Dry Martini',
    icon: '🍸',
    cost: 70,
    steps: [
      { type: 'add', ingredient: 'gin', label: 'Adicione o gin' },
      { type: 'add', ingredient: 'gelo', label: 'Adicione o gelo' },
      { type: 'mash', verb: 'Mexer', count: 6, time: 3, label: 'Mexa bem (nunca agite!)' },
      { type: 'garnish', ingredient: 'azeitona', label: 'Finalize com uma azeitona' },
    ],
  },
  {
    id: 'screwdriver',
    name: 'Parafuso',
    icon: '🍊',
    cost: 45,
    steps: [
      { type: 'add', ingredient: 'vodka', label: 'Adicione a vodka' },
      { type: 'add', ingredient: 'laranja', label: 'Complete com suco de laranja' },
      { type: 'mash', verb: 'Mexer', count: 4, time: 2, label: 'Mexa bem' },
    ],
  },
  {
    id: 'bloody_mary',
    name: 'Bloody Mary',
    icon: '🍅',
    cost: 90,
    steps: [
      { type: 'add', ingredient: 'vodka', label: 'Adicione a vodka' },
      { type: 'add', ingredient: 'tomate', label: 'Adicione o suco de tomate' },
      { type: 'add', ingredient: 'sal', label: 'Tempere com sal' },
      { type: 'mash', verb: 'Mexer', count: 5, time: 2.5, label: 'Mexa bem' },
      { type: 'garnish', ingredient: 'limao', label: 'Finalize com limão' },
    ],
  },
  {
    id: 'moscow_mule',
    name: 'Moscow Mule',
    icon: '🥒',
    cost: 100,
    steps: [
      { type: 'add', ingredient: 'vodka', label: 'Adicione a vodka' },
      { type: 'add', ingredient: 'limao', label: 'Adicione o limão' },
      { type: 'add', ingredient: 'gengibre', label: 'Complete com refrigerante de gengibre' },
      { type: 'garnish', ingredient: 'pepino', label: 'Finalize com uma rodela de pepino' },
    ],
  },
  {
    id: 'daiquiri',
    name: 'Daiquiri',
    icon: '🍋',
    cost: 60,
    steps: [
      { type: 'add', ingredient: 'rum', label: 'Adicione o rum' },
      { type: 'add', ingredient: 'limao', label: 'Adicione o limão' },
      { type: 'add', ingredient: 'xarope', label: 'Adicione o xarope' },
      { type: 'mash', verb: 'Balançar', count: 8, time: 3, label: 'Balance a coqueteleira' },
    ],
  },
  {
    id: 'white_russian',
    name: 'White Russian',
    icon: '☕',
    cost: 110,
    steps: [
      { type: 'add', ingredient: 'vodka', label: 'Adicione a vodka' },
      { type: 'add', ingredient: 'cafe', label: 'Adicione o licor de café' },
      { type: 'add', ingredient: 'creme_leite', label: 'Complete com creme de leite' },
      { type: 'mash', verb: 'Mexer', count: 5, time: 2.5, label: 'Mexa bem' },
    ],
  },
  {
    id: 'paloma',
    name: 'Paloma',
    icon: '🍊',
    cost: 75,
    steps: [
      { type: 'add', ingredient: 'tequila', label: 'Adicione a tequila' },
      { type: 'add', ingredient: 'citrico', label: 'Complete com refrigerante cítrico' },
      { type: 'add', ingredient: 'limao', label: 'Adicione o limão' },
      { type: 'garnish', ingredient: 'sal', label: 'Salgue a borda do copo' },
    ],
  },
  {
    id: 'espresso_martini',
    name: 'Espresso Martini',
    icon: '☕',
    cost: 120,
    steps: [
      { type: 'add', ingredient: 'vodka', label: 'Adicione a vodka' },
      { type: 'add', ingredient: 'cafe', label: 'Adicione o café espresso' },
      { type: 'add', ingredient: 'xarope', label: 'Adicione o xarope' },
      { type: 'mash', verb: 'Balançar', count: 9, time: 3, label: 'Balance bem até formar espuma' },
    ],
  },
  {
    id: 'sex_on_beach',
    name: 'Sex on the Beach',
    icon: '🍑',
    cost: 85,
    steps: [
      { type: 'add', ingredient: 'vodka', label: 'Adicione a vodka' },
      { type: 'add', ingredient: 'laranja', label: 'Adicione o suco de laranja' },
      { type: 'add', ingredient: 'abacaxi', label: 'Adicione o suco de abacaxi' },
      { type: 'garnish', ingredient: 'cereja', label: 'Finalize com uma cereja' },
    ],
  },
  {
    id: 'caipiroska',
    name: 'Caipiroska',
    icon: '🍈',
    cost: 55,
    steps: [
      { type: 'add', ingredient: 'limao', label: 'Corte e adicione o limão' },
      { type: 'mash', verb: 'Socar', count: 6, time: 2.5, label: 'Socar o limão com açúcar' },
      { type: 'add', ingredient: 'vodka', label: 'Adicione a vodka' },
      { type: 'add', ingredient: 'gelo', label: 'Adicione o gelo' },
      { type: 'mash', verb: 'Mexer', count: 4, time: 2, label: 'Mexa bem' },
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
    purchasedRecipes: {},
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
  return RECIPES.filter((r) => (r.unlockDay && r.unlockDay <= state.day) || state.purchasedRecipes[r.id]);
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

function placeRandom(el) {
  const left = 10 + Math.random() * 70;
  const top = 15 + Math.random() * 55;
  el.style.left = `${left}%`;
  el.style.top = `${top}%`;
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

function renderCustomerLine() {
  if (!round || !round.customer) return;
  document.getElementById('customer-avatar').textContent = round.customer.avatar;
  document.getElementById('customer-name').textContent = round.customer.name;
  document.getElementById('customer-quote').textContent = `"${round.quote}"`;
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
  if (!round) return;
  if (round.stepTimerId) clearInterval(round.stepTimerId);
  if (round.simonTimeouts) round.simonTimeouts.forEach((t) => clearTimeout(t));
  round.simonTimeouts = [];
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

    clearInterval(round.stepTimerId);
    round.stepTimerId = setInterval(() => {
      round.mashTimeLeft -= 0.05;
      const ratio = Math.max(0, round.mashTimeLeft / step.time);
      fill.style.width = `${ratio * 100}%`;
      if (round.mashTimeLeft <= 0) {
        clearInterval(round.stepTimerId);
        applyPatiencePenalty(3);
        if (round) renderCurrentStep();
      }
    }, 50);
  } else if (step.type === 'tapmove') {
    round.tapCount = 0;
    round.tapTimeLeft = step.time;

    const area = document.createElement('div');
    area.className = 'tapmove-area';
    const target = document.createElement('button');
    target.className = 'tapmove-target';
    target.textContent = step.icon || '🍋';
    placeRandom(target);
    area.appendChild(target);

    const counter = document.createElement('div');
    counter.className = 'mash-counter';
    counter.textContent = `0 / ${step.count}`;

    const track = document.createElement('div');
    track.className = 'mash-timer-track';
    const fill = document.createElement('div');
    fill.className = 'mash-timer-fill';
    track.appendChild(fill);

    target.addEventListener('click', () => {
      round.tapCount += 1;
      counter.textContent = `${round.tapCount} / ${step.count}`;
      if (round.tapCount >= step.count) {
        stopStepMechanics();
        advanceStep();
      } else {
        placeRandom(target);
      }
    });

    interaction.appendChild(area);
    interaction.appendChild(counter);
    interaction.appendChild(track);

    clearInterval(round.stepTimerId);
    round.stepTimerId = setInterval(() => {
      round.tapTimeLeft -= 0.05;
      const ratio = Math.max(0, round.tapTimeLeft / step.time);
      fill.style.width = `${ratio * 100}%`;
      if (round.tapTimeLeft <= 0) {
        clearInterval(round.stepTimerId);
        applyPatiencePenalty(3);
        if (round) renderCurrentStep();
      }
    }, 50);
  } else if (step.type === 'rhythm') {
    round.rhythmPhase = 0;
    round.rhythmHits = 0;
    round.rhythmValue = 50;
    const speed = 0.07 + Math.min(0.05, state.day * 0.003);

    const track = document.createElement('div');
    track.className = 'pour-track';
    const zone = document.createElement('div');
    zone.className = 'pour-zone';
    zone.style.left = `${step.target[0]}%`;
    zone.style.width = `${step.target[1] - step.target[0]}%`;
    const needle = document.createElement('div');
    needle.className = 'pour-indicator';
    track.appendChild(zone);
    track.appendChild(needle);

    const counter = document.createElement('div');
    counter.className = 'mash-counter';
    counter.textContent = `0 / ${step.hitsNeeded}`;

    const hitBtn = document.createElement('button');
    hitBtn.className = 'pour-stop-btn';
    hitBtn.textContent = 'Bater!';
    hitBtn.addEventListener('click', () => {
      const value = round.rhythmValue;
      if (value >= step.target[0] && value <= step.target[1]) {
        round.rhythmHits += 1;
        counter.textContent = `${round.rhythmHits} / ${step.hitsNeeded}`;
        if (round.rhythmHits >= step.hitsNeeded) {
          clearInterval(round.stepTimerId);
          advanceStep();
        }
      } else {
        round.rhythmHits = 0;
        counter.textContent = `0 / ${step.hitsNeeded}`;
        hitBtn.classList.add('wrong');
        setTimeout(() => hitBtn.classList.remove('wrong'), 300);
        applyPatiencePenalty(1.5);
      }
    });

    interaction.appendChild(track);
    interaction.appendChild(counter);
    interaction.appendChild(hitBtn);

    clearInterval(round.stepTimerId);
    round.stepTimerId = setInterval(() => {
      round.rhythmPhase += speed;
      round.rhythmValue = 50 + 50 * Math.sin(round.rhythmPhase);
      needle.style.left = `${round.rhythmValue}%`;
    }, 30);
  } else if (step.type === 'dragfill') {
    round.fillValue = 0;
    round.fillHolding = false;
    const speed = 3.2;

    const track = document.createElement('div');
    track.className = 'fill-track';
    const zone = document.createElement('div');
    zone.className = 'fill-zone';
    zone.style.bottom = `${step.target[0]}%`;
    zone.style.height = `${step.target[1] - step.target[0]}%`;
    const level = document.createElement('div');
    level.className = 'fill-level';
    track.appendChild(zone);
    track.appendChild(level);

    const btn = document.createElement('button');
    btn.className = 'fill-btn';
    btn.textContent = 'Segure para Encher';

    const stopFilling = () => {
      if (!round || !round.fillHolding) return;
      round.fillHolding = false;
      clearInterval(round.stepTimerId);
      const value = round.fillValue;
      if (value >= step.target[0] && value <= step.target[1]) {
        advanceStep();
      } else {
        applyPatiencePenalty(3);
        round.fillValue = 0;
        level.style.height = '0%';
      }
    };

    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (!round) return;
      round.fillHolding = true;
      clearInterval(round.stepTimerId);
      round.stepTimerId = setInterval(() => {
        if (!round) return;
        round.fillValue = Math.min(100, round.fillValue + speed);
        level.style.height = `${round.fillValue}%`;
        if (round.fillValue >= 100) {
          stopFilling();
        }
      }, 30);
    });
    btn.addEventListener('pointerup', stopFilling);
    btn.addEventListener('pointerleave', stopFilling);
    btn.addEventListener('pointercancel', stopFilling);

    interaction.appendChild(track);
    interaction.appendChild(btn);
  } else if (step.type === 'altmash') {
    round.altCount = 0;
    round.altLast = null;
    round.altTimeLeft = step.time;

    const row = document.createElement('div');
    row.className = 'alt-row';
    const leftBtn = document.createElement('button');
    leftBtn.className = 'alt-btn';
    leftBtn.textContent = '⬅️';
    const rightBtn = document.createElement('button');
    rightBtn.className = 'alt-btn';
    rightBtn.textContent = '➡️';

    const counter = document.createElement('div');
    counter.className = 'mash-counter';
    counter.textContent = `0 / ${step.count}`;

    const track = document.createElement('div');
    track.className = 'mash-timer-track';
    const fill = document.createElement('div');
    fill.className = 'mash-timer-fill';
    track.appendChild(fill);

    const press = (side, btn) => {
      if (round.altLast !== side) {
        round.altLast = side;
        round.altCount += 1;
        counter.textContent = `${round.altCount} / ${step.count}`;
        if (round.altCount >= step.count) {
          stopStepMechanics();
          advanceStep();
        }
      } else {
        btn.classList.add('wrong');
        setTimeout(() => btn.classList.remove('wrong'), 200);
      }
    };
    leftBtn.addEventListener('click', () => press('left', leftBtn));
    rightBtn.addEventListener('click', () => press('right', rightBtn));

    row.appendChild(leftBtn);
    row.appendChild(rightBtn);
    interaction.appendChild(row);
    interaction.appendChild(counter);
    interaction.appendChild(track);

    clearInterval(round.stepTimerId);
    round.stepTimerId = setInterval(() => {
      round.altTimeLeft -= 0.05;
      const ratio = Math.max(0, round.altTimeLeft / step.time);
      fill.style.width = `${ratio * 100}%`;
      if (round.altTimeLeft <= 0) {
        clearInterval(round.stepTimerId);
        applyPatiencePenalty(3);
        if (round) renderCurrentStep();
      }
    }, 50);
  } else if (step.type === 'simon') {
    const length = step.length || 4;
    round.simonSeq = Array.from({ length }, () => SIMON_ICONS[Math.floor(Math.random() * SIMON_ICONS.length)]);
    round.simonUserIndex = 0;
    round.simonTimeouts = [];

    const status = document.createElement('p');
    status.className = 'lz-text';
    status.textContent = 'Observe a sequência...';

    const grid = document.createElement('div');
    grid.className = 'simon-grid';
    const buttons = SIMON_ICONS.map((icon) => {
      const btn = document.createElement('button');
      btn.className = 'simon-btn';
      btn.textContent = icon;
      btn.disabled = true;
      grid.appendChild(btn);
      return btn;
    });

    interaction.appendChild(status);
    interaction.appendChild(grid);

    const enableInput = () => {
      if (!round) return;
      status.textContent = 'Repita a sequência!';
      buttons.forEach((btn) => (btn.disabled = false));
    };

    const playSequence = () => {
      round.simonSeq.forEach((icon, i) => {
        const t1 = setTimeout(() => {
          const btn = buttons[SIMON_ICONS.indexOf(icon)];
          btn.classList.add('active');
          const t2 = setTimeout(() => btn.classList.remove('active'), 380);
          round.simonTimeouts.push(t2);
        }, i * 650);
        round.simonTimeouts.push(t1);
      });
      const tEnd = setTimeout(enableInput, round.simonSeq.length * 650);
      round.simonTimeouts.push(tEnd);
    };

    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        if (btn.disabled || !round) return;
        const icon = SIMON_ICONS[i];
        if (icon === round.simonSeq[round.simonUserIndex]) {
          btn.classList.add('active');
          setTimeout(() => btn.classList.remove('active'), 150);
          round.simonUserIndex += 1;
          if (round.simonUserIndex >= round.simonSeq.length) {
            advanceStep();
          }
        } else {
          buttons.forEach((b) => (b.disabled = true));
          status.textContent = 'Errou! Observe de novo...';
          applyPatiencePenalty(2.5);
          setTimeout(() => {
            if (round) renderCurrentStep();
          }, 500);
        }
      });
    });

    playSequence();
  } else if (step.type === 'selecttap') {
    round.selectFound = 0;
    const gridSize = step.gridSize || 9;
    const targetCount = step.count;
    const targetId = step.target;
    const otherIds = shuffle(Object.keys(INGREDIENTS).filter((id) => id !== targetId));
    const cells = [];
    for (let i = 0; i < targetCount; i++) cells.push(targetId);
    for (let i = cells.length; i < gridSize; i++) cells.push(otherIds[i % otherIds.length]);
    const shuffled = shuffle(cells);

    const grid = document.createElement('div');
    grid.className = 'select-grid';
    const counter = document.createElement('div');
    counter.className = 'mash-counter';
    counter.textContent = `0 / ${targetCount}`;

    shuffled.forEach((id) => {
      const ing = INGREDIENTS[id];
      const cell = document.createElement('button');
      cell.className = 'select-cell';
      cell.innerHTML = `<span class="icon">${ing.icon}</span>`;
      cell.addEventListener('click', () => {
        if (cell.disabled) return;
        if (id === targetId) {
          cell.disabled = true;
          cell.classList.add('done');
          round.selectFound += 1;
          counter.textContent = `${round.selectFound} / ${targetCount}`;
          if (round.selectFound >= targetCount) {
            advanceStep();
          }
        } else {
          cell.classList.add('wrong');
          setTimeout(() => cell.classList.remove('wrong'), 300);
          applyPatiencePenalty(1.5);
        }
      });
      grid.appendChild(cell);
    });

    interaction.appendChild(grid);
    interaction.appendChild(counter);
  } else if (step.type === 'sustain') {
    round.sustainValue = 20;
    round.sustainHolding = false;
    round.sustainProgress = 0;
    const holdTimeMs = (step.holdTime || 2.5) * 1000;
    const push = 3.2;
    const gravity = 2.2;

    const track = document.createElement('div');
    track.className = 'pour-track';
    const zone = document.createElement('div');
    zone.className = 'pour-zone';
    zone.style.left = `${step.target[0]}%`;
    zone.style.width = `${step.target[1] - step.target[0]}%`;
    const needle = document.createElement('div');
    needle.className = 'pour-indicator';
    track.appendChild(zone);
    track.appendChild(needle);

    const progressTrack = document.createElement('div');
    progressTrack.className = 'mash-timer-track';
    const progressFill = document.createElement('div');
    progressFill.className = 'mash-timer-fill';
    progressFill.style.width = '0%';
    progressTrack.appendChild(progressFill);

    const btn = document.createElement('button');
    btn.className = 'fill-btn';
    btn.textContent = 'Segurar';

    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (!round) return;
      round.sustainHolding = true;
    });
    btn.addEventListener('pointerup', () => {
      if (!round) return;
      round.sustainHolding = false;
    });
    btn.addEventListener('pointerleave', () => {
      if (!round) return;
      round.sustainHolding = false;
    });
    btn.addEventListener('pointercancel', () => {
      if (!round) return;
      round.sustainHolding = false;
    });

    interaction.appendChild(track);
    interaction.appendChild(progressTrack);
    interaction.appendChild(btn);

    clearInterval(round.stepTimerId);
    round.stepTimerId = setInterval(() => {
      if (!round) return;
      round.sustainValue += (round.sustainHolding ? push : -gravity) * 0.3;
      round.sustainValue = Math.max(0, Math.min(100, round.sustainValue));
      needle.style.left = `${round.sustainValue}%`;

      const inZone = round.sustainValue >= step.target[0] && round.sustainValue <= step.target[1];
      if (inZone) {
        round.sustainProgress += 30;
        progressFill.style.width = `${Math.min(100, (round.sustainProgress / holdTimeMs) * 100)}%`;
        if (round.sustainProgress >= holdTimeMs) {
          clearInterval(round.stepTimerId);
          advanceStep();
        }
      } else {
        round.sustainProgress = 0;
        progressFill.style.width = '0%';
      }
    }, 30);
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
        clearInterval(round.stepTimerId);
        advanceStep();
      } else {
        applyPatiencePenalty(3);
      }
    });

    interaction.appendChild(track);
    interaction.appendChild(stopBtn);

    clearInterval(round.stepTimerId);
    round.stepTimerId = setInterval(() => {
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
  const customer = shuffle(CUSTOMERS)[0];
  const lines = DIALOGUE[recipe.id] || [`Um(a) ${recipe.name}, por favor!`];
  const quote = shuffle(lines)[0];
  round = {
    recipe,
    stepIndex: 0,
    timeTotal,
    timeLeft: timeTotal,
    customer,
    quote,
  };
  document.getElementById('recipe-name').textContent = `${recipe.icon} ${recipe.name}`;
  renderCustomerLine();
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

  const upgradeRoot = document.getElementById('shop-upgrade-rows');
  upgradeRoot.innerHTML = '';
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
    upgradeRoot.appendChild(row);
  });

  const drinkRoot = document.getElementById('shop-drink-rows');
  drinkRoot.innerHTML = '';
  RECIPES.filter((r) => r.cost).forEach((recipe) => {
    const owned = Boolean(state.purchasedRecipes[recipe.id]);
    const row = document.createElement('div');
    row.className = 'shop-row';
    row.innerHTML = `
      <div class="shop-info">${recipe.icon} ${recipe.name}<small>${recipe.steps.length} passos no preparo</small></div>
    `;
    const btn = document.createElement('button');
    btn.textContent = owned ? 'Desbloqueado' : `$${recipe.cost}`;
    btn.disabled = owned || state.money < recipe.cost;
    btn.addEventListener('click', () => {
      if (owned || state.money < recipe.cost) return;
      state.money -= recipe.cost;
      state.purchasedRecipes[recipe.id] = true;
      saveState();
      renderShop();
    });
    row.appendChild(btn);
    drinkRoot.appendChild(row);
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

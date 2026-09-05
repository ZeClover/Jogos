const SAVE_KEY = 'relic-quest-save-v1';
const REQUIRED_ENCOUNTERS = 5;
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
    arrivalLore: null,
    enemies: [
      { name: 'Lobo Selvagem', icon: '🐺', img: 'assets/lobo-selvagem.png', hp: 18, atk: 5, exp: 8, gold: 6, special: { name: 'Mordida Feroz', multiplier: 1.6, chance: 0.3 } },
      { name: 'Bandido da Estrada', icon: '🗡️', img: 'assets/bandido-da-estrada.png', hp: 22, atk: 6, exp: 10, gold: 9, special: { name: 'Golpe Traiçoeiro', multiplier: 1.5, chance: 0.28 } },
      { name: 'Aranha Gigante', icon: '🕷️', img: 'assets/aranha-gigante.png', hp: 16, atk: 7, exp: 9, gold: 7, special: { name: 'Picada Paralisante', multiplier: 1.7, chance: 0.25 } },
      { name: 'Corvo Sombrio', icon: '🐦‍⬛', hp: 14, atk: 6, exp: 9, gold: 7, special: { name: 'Bicada Certeira', multiplier: 1.8, chance: 0.3 } },
      { name: 'Trasgo da Floresta', icon: '👹', hp: 24, atk: 7, exp: 11, gold: 9, special: { name: 'Investida Selvagem', multiplier: 1.6, chance: 0.3 } },
    ],
    boss: { name: 'Guardião de Musgo', icon: '🌲', img: 'assets/guardiao-de-musgo.png', hp: 70, atk: 9, exp: 40, gold: 35, special: { name: 'Esporos Tóxicos', multiplier: 1.8, chance: 0.35 } },
  },
  {
    title: 'Colinas Áridas',
    flavor: 'O vento quente levanta poeira sobre as colinas rachadas.',
    arrivalLore:
      'Com a primeira Relíquia em mãos, um sussurro gélido ecoa em sua mente — o Guardião de Musgo não agia por vontade própria. Algo mais antigo o corrompia, algo que vem das colinas adiante.',
    enemies: [
      { name: 'Escorpião de Pedra', icon: '🦂', img: 'assets/escorpiao-de-pedra.png', hp: 30, atk: 10, exp: 14, gold: 12, special: { name: 'Ferroada Certeira', multiplier: 1.7, chance: 0.3 } },
      { name: 'Nômade Hostil', icon: '🏹', img: 'assets/nomade-hostil.png', hp: 34, atk: 11, exp: 16, gold: 14, special: { name: 'Flecha Certeira', multiplier: 1.6, chance: 0.3 } },
      { name: 'Harpia', icon: '🦅', img: 'assets/harpia.png', hp: 26, atk: 13, exp: 15, gold: 11, special: { name: 'Investida Aérea', multiplier: 1.7, chance: 0.28 } },
      { name: 'Víbora das Dunas', icon: '🐍', hp: 22, atk: 12, exp: 13, gold: 10, special: { name: 'Picada Venenosa', multiplier: 1.9, chance: 0.25 } },
      { name: 'Abutre Faminto', icon: '🦴', hp: 32, atk: 9, exp: 14, gold: 12, special: { name: 'Mergulho Predatório', multiplier: 1.6, chance: 0.3 } },
    ],
    boss: { name: 'Golem de Areia', icon: '🏜️', img: 'assets/golem-de-areia.png', hp: 130, atk: 15, exp: 70, gold: 65, special: { name: 'Tempestade de Areia', multiplier: 1.8, chance: 0.35 } },
  },
  {
    title: 'Ruínas Submersas',
    flavor: 'Água escura pinga das colunas antigas. Ecos de vozes esquecidas ressoam.',
    arrivalLore:
      'Runas entalhadas em pedra sussurram um aviso: "O Rei que dormia despertou quando o último selo rachou." A areia guarda segredos de uma guerra esquecida.',
    enemies: [
      { name: 'Esqueleto Afogado', icon: '💀', img: 'assets/esqueleto-afogado.png', hp: 46, atk: 15, exp: 22, gold: 18, special: { name: 'Golpe Afogado', multiplier: 1.6, chance: 0.3 } },
      { name: 'Sereia Amaldiçoada', icon: '🧜', img: 'assets/sereia-amaldicoada.png', hp: 40, atk: 18, exp: 24, gold: 20, special: { name: "Jato d'Água", multiplier: 1.8, chance: 0.32 } },
      { name: 'Caranguejo Gigante', icon: '🦀', img: 'assets/caranguejo-gigante.png', hp: 54, atk: 14, exp: 23, gold: 19, special: { name: 'Pinça Esmagadora', multiplier: 1.7, chance: 0.3 } },
      { name: 'Enguia Elétrica Amaldiçoada', icon: '🐍', hp: 36, atk: 17, exp: 21, gold: 17, special: { name: 'Choque Elétrico', multiplier: 1.9, chance: 0.28 } },
      { name: 'Polvo Espectral', icon: '🐙', hp: 44, atk: 16, exp: 22, gold: 18, special: { name: 'Jato de Tinta', multiplier: 1.6, chance: 0.3 } },
    ],
    boss: { name: 'Kraken Menor', icon: '🐙', img: 'assets/kraken-menor.png', hp: 210, atk: 22, exp: 110, gold: 100, special: { name: 'Abraço das Profundezas', multiplier: 1.9, chance: 0.35 } },
  },
  {
    title: 'Montanha Gélida',
    flavor: 'O frio corta como lâminas. A neve esconde passos silenciosos.',
    arrivalLore:
      'Um espectro sussurra antes de se dissolver na água escura: "Ele já foi um de nós. Um herói, como você, até vestir a coroa amaldiçoada."',
    enemies: [
      { name: 'Lobo de Gelo', icon: '🐺', img: 'assets/lobo-de-gelo.png', hp: 62, atk: 20, exp: 32, gold: 26, special: { name: 'Mordida Congelante', multiplier: 1.6, chance: 0.3 } },
      { name: 'Yeti Jovem', icon: '❄️', img: 'assets/yeti-jovem.png', hp: 70, atk: 22, exp: 35, gold: 29, special: { name: 'Investida Brutal', multiplier: 1.7, chance: 0.3 } },
      { name: 'Espírito Congelante', icon: '👻', img: 'assets/espirito-congelante.png', hp: 56, atk: 24, exp: 33, gold: 27, special: { name: 'Toque Gélido', multiplier: 1.8, chance: 0.28 } },
      { name: 'Urso Polar Feroz', icon: '🐻', hp: 66, atk: 21, exp: 33, gold: 27, special: { name: 'Garra Congelante', multiplier: 1.7, chance: 0.3 } },
      { name: 'Coruja das Neves', icon: '🦉', hp: 50, atk: 23, exp: 31, gold: 25, special: { name: 'Rajada Gélida', multiplier: 1.8, chance: 0.28 } },
    ],
    boss: { name: 'Dragão de Gelo Adormecido', icon: '🐉', img: 'assets/dragao-de-gelo.png', hp: 320, atk: 30, exp: 170, gold: 150, special: { name: 'Sopro Congelante', multiplier: 2.0, chance: 0.35 } },
  },
  {
    title: 'Fortaleza Sombria',
    flavor: 'Os portões negros se abrem. O ar pesa com a presença do Rei Sombrio.',
    arrivalLore:
      'No topo da montanha, o gelo racha revelando símbolos de aviso: além destes portões, o Rei Sombrio aguarda — não como um monstro, mas como o que resta de um homem que um dia jurou proteger este reino.',
    enemies: [
      { name: 'Cavaleiro Sombrio', icon: '🗡️', img: 'assets/cavaleiro-sombrio.png', hp: 90, atk: 28, exp: 48, gold: 40, special: { name: 'Golpe das Trevas', multiplier: 1.7, chance: 0.3 } },
      { name: 'Espectro', icon: '👻', img: 'assets/espectro.png', hp: 80, atk: 32, exp: 50, gold: 42, special: { name: 'Toque Espectral', multiplier: 1.8, chance: 0.3 } },
      { name: 'Sentinela de Ferro', icon: '🛡️', img: 'assets/sentinela-de-ferro.png', hp: 100, atk: 26, exp: 46, gold: 38, special: { name: 'Investida Blindada', multiplier: 1.6, chance: 0.3 } },
      { name: 'Arqueiro Sombrio', icon: '🏹', hp: 76, atk: 30, exp: 47, gold: 39, special: { name: 'Flecha Perfurante', multiplier: 1.9, chance: 0.28 } },
      { name: 'Necromante Menor', icon: '💀', hp: 70, atk: 27, exp: 49, gold: 41, special: { name: 'Drenar Vida', multiplier: 1.5, chance: 0.3, drain: true } },
    ],
    boss: { name: 'Rei Sombrio', icon: '👑', img: 'assets/rei-sombrio.png', hp: 500, atk: 38, exp: 0, gold: 0, special: { name: 'Fúria Sombria', multiplier: 2.0, chance: 0.35 } },
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
  const cleared = Math.min(state.encountersCleared, REQUIRED_ENCOUNTERS);
  for (let i = 0; i < REQUIRED_ENCOUNTERS; i++) {
    const dot = document.createElement('div');
    dot.className = 'encounter-dot' + (i < cleared ? ' cleared' : '');
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
  const loreEl = document.getElementById('region-lore');
  loreEl.textContent = region.arrivalLore || '';
  loreEl.hidden = !region.arrivalLore;
  document.getElementById('region-flavor').textContent = region.flavor;
  renderHeroPanel();
  renderEncounterTrack();
  document.getElementById('explore-btn').hidden = false;
  document.getElementById('boss-btn').hidden = state.encountersCleared < REQUIRED_ENCOUNTERS;
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
  while (log.childNodes.length > 40) {
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

function getAliveEnemies() {
  return currentBattle.enemies.filter((e) => e.alive);
}

function getCurrentTargetIndex() {
  return currentBattle.enemies.findIndex((e) => e.alive);
}

function buildBattleEnemies() {
  const row = document.getElementById('enemies-row');
  row.innerHTML = '';
  currentBattle.enemies.forEach((e, i) => {
    const slot = document.createElement('div');
    slot.className = 'battle-enemy-slot';
    slot.innerHTML = `
      <div class="portrait-frame enemy-portrait" id="enemy-icon-${i}"></div>
      <div class="battle-name-row"><span id="enemy-name-${i}"></span></div>
      <div class="bar-track"><div class="bar-fill hp" id="enemy-hp-fill-${i}"></div></div>
      <span class="bar-label" id="enemy-hp-label-${i}"></span>
    `;
    row.appendChild(slot);
  });
}

function renderBattle() {
  const slots = document.querySelectorAll('.battle-enemy-slot');
  currentBattle.enemies.forEach((e, i) => {
    setPortrait(document.getElementById(`enemy-icon-${i}`), e.template.img, e.template.icon, e.template.name);
    document.getElementById(`enemy-name-${i}`).textContent = e.template.name;
    const hp = Math.max(0, e.hp);
    document.getElementById(`enemy-hp-fill-${i}`).style.width = `${(hp / e.maxHp) * 100}%`;
    document.getElementById(`enemy-hp-label-${i}`).textContent = `${Math.round(hp)}/${e.maxHp}`;
    if (slots[i]) slots[i].classList.toggle('defeated', !e.alive);
  });
  const targetIdx = getCurrentTargetIndex();
  slots.forEach((el, i) => el.classList.toggle('target', i === targetIdx));
  document.getElementById('flee-btn').hidden = currentBattle.isBoss;
  renderHeroPanel();
}

function startBattle(templates, isBoss) {
  currentBattle = {
    enemies: templates.map((t) => ({ template: t, hp: t.hp, maxHp: t.hp, alive: true })),
    isBoss,
    playerDefending: false,
  };
  showScreen('battle');
  clearBattleLog();
  if (templates.length === 1) {
    logBattleMsg(`Um ${templates[0].name} apareceu!`, 'info');
  } else {
    logBattleMsg(`${templates.length} inimigos apareceram: ${templates.map((t) => t.name).join(', ')}!`, 'info');
  }
  buildBattleEnemies();
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

function applyDamageToTarget(atk) {
  const targetIdx = getCurrentTargetIndex();
  if (targetIdx === -1) return;
  const target = currentBattle.enemies[targetIdx];
  const { dmg, isCrit } = computeDamageToEnemy(atk);
  target.hp -= dmg;
  logBattleMsg(`${state.heroName} atacou ${target.template.name}! ${isCrit ? 'CRÍTICO! ' : ''}${dmg} de dano.`, 'dmg-enemy');
  if (target.hp <= 0) {
    target.alive = false;
    logBattleMsg(`${target.template.name} foi derrotado!`, 'info');
  }
}

function doPlayerAttack() {
  applyDamageToTarget(getTotalAtk());
  resolveAfterPlayerAction();
}

function useSkill(skill) {
  if (state.mp < skill.mpCost) return;
  state.mp -= skill.mpCost;
  applyDamageToTarget(Math.round(getTotalAtk() * skill.multiplier));
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
  if (getAliveEnemies().length === 0) {
    handleVictory();
    return;
  }
  setBattleMenuEnabled(false);
  setTimeout(() => {
    getAliveEnemies().forEach((enemy) => {
      const special = enemy.template.special;
      const useSpecial = special && Math.random() < special.chance;
      const baseAtk = useSpecial ? Math.round(enemy.template.atk * special.multiplier) : enemy.template.atk;
      const { dmg, isCrit } = computeDamageFromEnemy(baseAtk);
      const finalDmg = currentBattle.playerDefending ? Math.round(dmg * 0.5) : dmg;
      state.hp -= finalDmg;
      logBattleMsg(
        useSpecial
          ? `${enemy.template.name} usou ${special.name}! ${isCrit ? 'CRÍTICO! ' : ''}${finalDmg} de dano.`
          : `${enemy.template.name} atacou! ${isCrit ? 'CRÍTICO! ' : ''}${finalDmg} de dano.`,
        'dmg-player'
      );
      if (useSpecial && special.drain) {
        const healAmt = Math.round(finalDmg * 0.5);
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmt);
        logBattleMsg(`${enemy.template.name} drenou ${healAmt} de vida!`, 'info');
      }
    });
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
  const isBoss = currentBattle.isBoss;
  const enemies = currentBattle.enemies;
  setBattleMenuEnabled(false);

  let totalExp = 0;
  let totalGold = 0;
  enemies.forEach((e) => {
    totalExp += e.template.exp;
    totalGold += e.template.gold;
  });

  if (enemies.length === 1) {
    logBattleMsg(`Você derrotou ${enemies[0].template.name}! +${totalExp} EXP, +${totalGold} ouro.`, 'info');
  } else {
    logBattleMsg(`Grupo derrotado! +${totalExp} EXP, +${totalGold} ouro.`, 'info');
  }
  state.exp += totalExp;
  state.gold += totalGold;

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
    `Diante do trono em ruínas, ${state.heroName} finalmente compreende: o Rei Sombrio um dia foi um herói ` +
    `como você, consumido pela própria coroa. Com as cinco Relíquias reunidas, o selo se refaz e a escuridão ` +
    `recua para as sombras de onde veio. Eldrin respira livre outra vez — mas em algum lugar, a coroa ` +
    `amaldiçoada ainda espera por outro tolo corajoso o bastante para tocá-la. Nível final: ${state.level}. ` +
    `Sua lenda será cantada por gerações.`;
}

function showVictoryScreen() {
  showScreen('victory');
  renderVictoryText();
}

function rollEncounterGroup(region) {
  const r = Math.random();
  const size = r < 0.45 ? 1 : r < 0.8 ? 2 : 3;
  const group = [];
  for (let i = 0; i < size; i++) {
    group.push(region.enemies[Math.floor(Math.random() * region.enemies.length)]);
  }
  return group;
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
    startBattle(rollEncounterGroup(region), false);
  });

  document.getElementById('boss-btn').addEventListener('click', () => {
    startBattle([REGIONS[state.regionIndex].boss], true);
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

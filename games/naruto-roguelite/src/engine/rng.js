// PRNG determinístico (mulberry32) + hash de string (FNV-1a 32-bit).
// Sem dependências externas. Não usar Math.random() em nenhum sistema de jogo
// (ver CANON_RULES.md #44 — Seed / RNG centralizado).

/** Hash FNV-1a 32-bit de uma string, para derivar seeds numéricas a partir de texto. */
export function hashString(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Cria um gerador mulberry32 a partir de uma seed numérica (uint32).
 * Retorna uma função `next()` que produz floats em [0, 1).
 */
export function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Stream de RNG nomeada e reproduzível: envolve mulberry32 com utilitários
 * comuns de jogo (float, int, escolha ponderada, embaralhar, chance %).
 */
export class RngStream {
  constructor(seed, name = 'default') {
    this.name = name;
    this.seed = seed >>> 0;
    this._next = mulberry32(this.seed);
    this.callCount = 0;
  }

  /** Float em [0, 1). */
  float() {
    this.callCount += 1;
    return this._next();
  }

  /** Inteiro em [min, max] (inclusive nos dois extremos). */
  int(min, max) {
    if (max < min) throw new Error(`RngStream.int: max (${max}) < min (${min})`);
    return min + Math.floor(this.float() * (max - min + 1));
  }

  /** true com probabilidade `chance` (0..1). */
  chance(chance) {
    return this.float() < chance;
  }

  /** Elemento aleatório de um array não vazio. */
  pick(array) {
    if (!array.length) throw new Error('RngStream.pick: array vazio');
    return array[this.int(0, array.length - 1)];
  }

  /**
   * Escolha ponderada. `entries` é uma lista de { item, weight }.
   * Pesos <= 0 nunca são escolhidos.
   */
  weightedPick(entries) {
    const total = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
    if (total <= 0) throw new Error('RngStream.weightedPick: soma de pesos deve ser > 0');
    let roll = this.float() * total;
    for (const entry of entries) {
      const weight = Math.max(0, entry.weight);
      if (roll < weight) return entry.item;
      roll -= weight;
    }
    return entries[entries.length - 1].item;
  }

  /** Fisher-Yates determinístico; não muta o array de entrada. */
  shuffle(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = this.int(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

/** Cria uma RngStream a partir de uma seed textual ou numérica. */
export function createRngStream(seed, name = 'default') {
  const numericSeed = typeof seed === 'number' ? seed >>> 0 : hashString(String(seed));
  return new RngStream(numericSeed, name);
}

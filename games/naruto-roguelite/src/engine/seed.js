// Gerenciador central de Seed. Toda geração procedural (mapa, combate, loot,
// eventos) deve puxar sua RNG daqui — nunca instanciar RngStream solta com um
// valor arbitrário (ver CANON_RULES.md #44).

import { RNG_STREAMS } from './enums.js';
import { createRngStream, hashString } from './rng.js';

/** Gera uma seed textual legível e razoavelmente única para uma nova run. */
export function generateSeedString() {
  const timePart = Date.now().toString(36);
  const randomPart = Math.floor(Math.random() * 0xffffffff).toString(36);
  return `${timePart}-${randomPart}`.toUpperCase();
}

/**
 * SeedManager: a partir de uma seed mestre (string ou número), deriva streams
 * de RNG independentes e reproduzíveis por nome (ex: "map", "combat", "loot",
 * "event", ou qualquer nome customizado, ex: "boss:BOSS_ZABUZA_001").
 *
 * A mesma seed mestre + o mesmo nome de stream sempre produzem a mesma
 * sequência de números, independente de quantas outras streams já foram
 * criadas/consumidas — cada stream vive isolada.
 */
export class SeedManager {
  constructor(masterSeed) {
    this.masterSeed = String(masterSeed);
    this._streams = new Map();
  }

  /** Obtém (criando se necessário) a stream nomeada. */
  stream(name) {
    if (!this._streams.has(name)) {
      const derivedSeed = hashString(`${this.masterSeed}::${name}`);
      this._streams.set(name, createRngStream(derivedSeed, name));
    }
    return this._streams.get(name);
  }

  get map() { return this.stream(RNG_STREAMS.MAP); }

  get combat() { return this.stream(RNG_STREAMS.COMBAT); }

  get loot() { return this.stream(RNG_STREAMS.LOOT); }

  get event() { return this.stream(RNG_STREAMS.EVENT); }

  /** Estado serializável para debug/telemetria (não é necessário para reprodutibilidade). */
  debugState() {
    return {
      masterSeed: this.masterSeed,
      streams: Array.from(this._streams.entries()).map(([name, s]) => ({
        name, seed: s.seed, callCount: s.callCount,
      })),
    };
  }
}

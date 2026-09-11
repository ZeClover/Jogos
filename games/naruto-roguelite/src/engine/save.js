// Save/load com armazenamento injetável (localStorage no browser, memória em
// testes/Node), versionamento de schema e migração. Ver CANON_RULES.md #43.
//
// Dois "slots" lógicos são esperados pelo design: "account" (progressão
// permanente) e "run" (campanha em andamento). Autosave é apenas uma escrita
// no slot "run" chamada com frequência pela camada de apresentação — não é
// um mecanismo separado aqui.

export const CURRENT_SCHEMA_VERSION = 1;

/** Storage em memória — usado como fallback fora do browser (ex: testes). */
export function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => { map.set(key, String(value)); },
    removeItem: (key) => { map.delete(key); },
  };
}

function defaultStorage() {
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  return createMemoryStorage();
}

export class SaveError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'SaveError';
    if (cause) this.cause = cause;
  }
}

export class SaveManager {
  /**
   * @param {object} [options]
   * @param {{getItem, setItem, removeItem}} [options.storage] - adapter (default: localStorage ou memória).
   * @param {string} [options.namespace] - prefixo das chaves de storage.
   * @param {Record<number, (data: any) => any>} [options.migrations] - migração da versão N para N+1,
   *   indexada pela versão de origem (ex: migrations[1] leva dados da v1 para v2).
   */
  constructor({ storage = defaultStorage(), namespace = 'naruto-roguelite', migrations = {} } = {}) {
    this.storage = storage;
    this.namespace = namespace;
    this.migrations = migrations;
  }

  _key(slot) {
    return `${this.namespace}:${slot}`;
  }

  /** Grava `data` em `slot`, envolvido com metadados de versionamento. */
  save(slot, data) {
    const envelope = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      data,
    };
    try {
      this.storage.setItem(this._key(slot), JSON.stringify(envelope));
    } catch (err) {
      throw new SaveError(`Falha ao salvar slot "${slot}"`, err);
    }
    return envelope;
  }

  /**
   * Lê `slot`. Retorna `null` se não houver save. Aplica migrações em cadeia
   * até `CURRENT_SCHEMA_VERSION` quando o save é de uma versão anterior.
   */
  load(slot) {
    const raw = this.storage.getItem(this._key(slot));
    if (raw === null || raw === undefined) return null;

    let envelope;
    try {
      envelope = JSON.parse(raw);
    } catch (err) {
      throw new SaveError(`Save corrompido no slot "${slot}" (JSON inválido)`, err);
    }

    let { schemaVersion, data } = envelope;
    while (schemaVersion < CURRENT_SCHEMA_VERSION) {
      const migrate = this.migrations[schemaVersion];
      if (!migrate) {
        throw new SaveError(
          `Sem migração registrada de schemaVersion ${schemaVersion} para ${schemaVersion + 1} (slot "${slot}")`,
        );
      }
      data = migrate(data);
      schemaVersion += 1;
    }

    return { ...envelope, schemaVersion, data };
  }

  has(slot) {
    return this.storage.getItem(this._key(slot)) !== null;
  }

  delete(slot) {
    this.storage.removeItem(this._key(slot));
  }
}

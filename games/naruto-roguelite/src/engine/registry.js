// Registro genérico de entidades de dados indexadas por ID estável.
// Cada tipo de conteúdo (personagens, jutsus, itens, ...) usa uma Registry
// própria. Mantém a engine "data-driven": nada aqui sabe o que é um Naruto,
// só sabe indexar e validar objetos com um `id`.

import { isValidId } from './ids.js';

export class DuplicateIdError extends Error {
  constructor(id) {
    super(`ID duplicado registrado: ${id}`);
    this.name = 'DuplicateIdError';
    this.id = id;
  }
}

export class InvalidIdError extends Error {
  constructor(id, expectedPrefix) {
    super(`ID inválido "${id}": esperado prefixo "${expectedPrefix}_" e formato PREFIXO_..._NNN`);
    this.name = 'InvalidIdError';
    this.id = id;
    this.expectedPrefix = expectedPrefix;
  }
}

export class Registry {
  /**
   * @param {string} idPrefix - prefixo esperado dos IDs (ex: "CHAR", "JUT").
   * @param {string} [label] - nome legível para mensagens de erro.
   */
  constructor(idPrefix, label = idPrefix) {
    this.idPrefix = idPrefix;
    this.label = label;
    this._items = new Map();
  }

  /** Registra uma entidade `{ id, ... }`. Lança erro em ID inválido ou duplicado. */
  register(entity) {
    const { id } = entity ?? {};
    if (!isValidId(id, this.idPrefix)) {
      throw new InvalidIdError(id, this.idPrefix);
    }
    if (this._items.has(id)) {
      throw new DuplicateIdError(id);
    }
    this._items.set(id, entity);
    return entity;
  }

  /** Registra várias entidades de uma vez, na ordem dada. */
  registerAll(entities) {
    return entities.map((entity) => this.register(entity));
  }

  get(id) {
    return this._items.get(id);
  }

  has(id) {
    return this._items.has(id);
  }

  all() {
    return Array.from(this._items.values());
  }

  get size() {
    return this._items.size;
  }

  /** Remove todas as entidades. Útil em testes; evitar em runtime de jogo. */
  clear() {
    this._items.clear();
  }
}

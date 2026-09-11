// Registries de conteúdo do jogo. Vazias no Marco 0 — passam a ser
// populadas em lotes a partir do Marco 3 (Jutsus) e Marco 4 (Personagens),
// conforme docs/design/12_PERSONAGENS_VERTICAL_SLICE.md e
// 13_JUTSUS_VERTICAL_SLICE.md (ver PROJECT_STATUS.md para o marco atual).

import { Registry } from '../engine/registry.js';

export const characters = new Registry('CHAR', 'Personagens (versões)');
export const jutsus = new Registry('JUT', 'Jutsus');
export const items = new Registry('ITEM', 'Itens');
export const bosses = new Registry('BOSS', 'Bosses');
export const enemies = new Registry('ENEMY', 'Inimigos');
export const regions = new Registry('REG', 'Regiões');
export const events = new Registry('EVENT', 'Eventos');
export const statuses = new Registry('STATUS', 'Estados');
export const passives = new Registry('PASSIVE', 'Passivas');
export const reactions = new Registry('REACTION', 'Reações');
export const tags = new Registry('TAG', 'Tags');
export const factions = new Registry('FACTION', 'Facções');
export const missions = new Registry('MISSION', 'Templates de Missão');
export const summons = new Registry('SUMMON', 'Invocações');
export const endings = new Registry('ENDING', 'Finais');
export const achievements = new Registry('ACHIEVEMENT', 'Conquistas');

/** Todas as registries, indexadas pelo mesmo nome usado nos exports acima. */
export const registries = {
  characters, jutsus, items, bosses, enemies, regions, events, statuses,
  passives, reactions, tags, factions, missions, summons, endings, achievements,
};

/** Resumo de tamanho por registry — usado no dev console e em PROJECT_STATUS.md. */
export function summarizeRegistries() {
  return Object.fromEntries(
    Object.entries(registries).map(([name, registry]) => [name, registry.size]),
  );
}

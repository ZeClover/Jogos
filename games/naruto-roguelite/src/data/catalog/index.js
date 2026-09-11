// Popula as Registries de conteúdo (src/data/index.js) com o vocabulário
// canônico de Tags/Estados/Reações e os primeiros lotes de Jutsus/
// Passivas/Personagens. Importar este barrel (em vez dos arquivos
// individuais fora de ordem) garante que Tags/Estados já existem antes de
// Reações/Jutsus, e que Jutsus/Passivas já existem antes de Personagens
// (cujo loadout os referencia) — nenhum desses arquivos valida isso em si
// (Registry não verifica referências cruzadas, validators.js faz isso sob
// demanda), mas a ordem de import evita confusão.
export * from './tags.js';
export * from './statuses.js';
export * from './reactions.js';
export * from './jutsus.js';
export * from './passives.js';
export * from './characters.js';

// Roteiro do Vertical Slice (Marco 6, PROMPT MESTRE §54): sequência linear
// de 3 combates no País das Ondas, culminando no boss Zabuza Momochi.
//
// Isto NÃO é o sistema de Missões/Mapa (Marco 7, PROMPT MESTRE §53) — não
// tem nós de mapa, ramificação, recompensas ou geração. É só o script fixo
// que costura o conteúdo dos Marcos 1-5 (Combate, Effect Engine, Jutsus,
// Personagens, Inimigos/IA) em algo jogável de ponta a ponta pela UI real
// (`play.html`/`src/ui/game.js`). Por isso vive fora de `src/data/catalog/`
// (não é um "tipo de conteúdo" com Registry/ID formal, CANON_RULES D008) —
// ver DECISIONS.md D019.
export const VERTICAL_SLICE_ENCOUNTERS = [
  {
    id: 'VS_ENCOUNTER_01_EMBOSCADA',
    name: 'Emboscada na Estrada',
    description: 'Bandidos armados bloqueiam a estrada para o País das Ondas.',
    enemyIds: ['ENEMY_WAVES_BANDIT_001', 'ENEMY_WAVES_BANDIT_001'],
  },
  {
    id: 'VS_ENCOUNTER_02_MERCENARIOS',
    name: 'Mercenários de Gatō',
    description: 'Mercenários contratados por Gatō tentam impedir a passagem pela ponte.',
    enemyIds: ['ENEMY_WAVES_MERCENARY_001', 'ENEMY_WAVES_BANDIT_001'],
  },
  {
    id: 'VS_ENCOUNTER_03_ZABUZA',
    name: 'Zabuza Momochi',
    description: 'O Demônio Oculto da Névoa aparece na ponte, bloqueando o caminho para Tazuna.',
    enemyIds: ['BOSS_ZABUZA_001'],
    isBoss: true,
  },
];

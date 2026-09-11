// Catálogo de Templates de Missão (Marco 7) — transcrito dos tipos de
// objetivo de docs/design/04_RUN_MAPA_MISSOES_REGIOES.md/CANON_RULES.md
// ("nunca apenas mate todos"). Só os tipos com resolução mecânica real
// (combate via CombatState, ver src/engine/run/missionResult.js) ganham
// Template aqui — o vocabulário completo (MISSION_OBJECTIVE_TYPES,
// enums.js) já existe, mas ESCOLTA/INFILTRACAO/ESPIONAGEM/etc. dependem de
// mecânica não-combate (furtividade, NPC a proteger, investigação) que
// ainda não existe; cadastrar um Template "vazio" para eles seria fabricar
// conteúdo sem base (CANON_RULES #30/#79) — ver DECISIONS.md D020.
import { missions } from '../index.js';

export const MISSION_TEMPLATES = [
  {
    id: 'MISSION_BATALHA_001',
    objectiveType: 'BATALHA',
    name: 'Confronto Armado',
    description: 'Elimine ou repila os inimigos que bloqueiam o caminho.',
  },
  {
    id: 'MISSION_DEFESA_001',
    objectiveType: 'DEFESA',
    name: 'Defesa de Posição',
    description: 'Segure a posição contra o ataque até vencer.',
  },
  {
    id: 'MISSION_CACA_001',
    objectiveType: 'CACA',
    name: 'Caçada',
    description: 'Rastreie e derrote um alvo de elite antes que ele escape.',
  },
  {
    id: 'MISSION_DUELO_001',
    objectiveType: 'DUELO',
    name: 'Duelo Decisivo',
    description: 'Um confronto direto contra um adversário de peso, sem espaço para erro.',
  },
];

missions.registerAll(MISSION_TEMPLATES);

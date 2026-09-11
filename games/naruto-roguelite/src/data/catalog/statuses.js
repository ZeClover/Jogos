// Catálogo de Estados — vocabulário completo de
// docs/design/01_COMBATE_TAGS_ESTADOS_REACOES.md. Cada entrada é dado puro
// consumido genericamente pelo Effect Engine (src/engine/combat/effects.js):
// registrar um Estado aqui não exige nenhum código novo no motor — só um
// dos campos abaixo (`dot`, `controlType`) liga um comportamento genérico
// já existente.
//
// Campos (todos exigidos por CANON_RULES.md #Estados: duração, stacks,
// categoria, remoção, resistência — resistência é sempre via o atributo
// secundário `resistenciaEstado`, não um campo por Estado):
//   category      CONTROLE | DANO_CONTINUO | DEBUFF | BUFF | PERCEPCAO | MENTAL | AMBIENTE
//   stacks        aceita múltiplas aplicações? (aumenta `stacks` até maxStacks)
//   maxStacks     teto de stacks (1 = não empilha)
//   baseDuration  rodadas por padrão (sobrescrevível por quem aplica)
//   removal       TEMPO (expira sozinho) | CURA (precisa de efeito de limpeza,
//                 ex: Kai — ainda não existe como ação no Marco 2) | ACAO_ALVO
//                 (alvo sai sozinho ao agir, ex: Oculto quebra ao atacar)
//   controlType   true = sujeito à resistência adaptativa de controle
//                 (CANON_RULES #31: 100% -> 70% -> 40% -> imune na mesma luta)
//   dot           null | { stat: 'hp'|'chakra', percentPerStack: number } —
//                 dano/dreno automático no fim de cada rodada em que está ativo
//
// Números de duração/dot são provisórios (o doc não fixa a maioria deles) —
// ver DECISIONS.md D015, ajustáveis no Marco 9 sem mudar a arquitetura.

import { statuses } from '../index.js';

export const STATUS_DEFINITIONS = [
  {
    id: 'STATUS_MOLHADO_001', name: 'Molhado', category: 'AMBIENTE', stacks: false, maxStacks: 1, baseDuration: 3, removal: 'TEMPO', controlType: false, dot: null,
  },
  {
    id: 'STATUS_QUEIMANDO_001', name: 'Queimando', category: 'DANO_CONTINUO', stacks: true, maxStacks: 3, baseDuration: 3, removal: 'TEMPO', controlType: false, dot: { stat: 'hp', percentPerStack: 8 },
  },
  {
    id: 'STATUS_ELETRIFICADO_001', name: 'Eletrificado', category: 'DANO_CONTINUO', stacks: false, maxStacks: 1, baseDuration: 2, removal: 'TEMPO', controlType: false, dot: { stat: 'hp', percentPerStack: 6 },
  },
  {
    id: 'STATUS_CONGELADO_001', name: 'Congelado', category: 'CONTROLE', stacks: false, maxStacks: 1, baseDuration: 1, removal: 'TEMPO', controlType: true, dot: null,
  },
  {
    id: 'STATUS_LAMA_001', name: 'Lama', category: 'AMBIENTE', stacks: false, maxStacks: 1, baseDuration: 2, removal: 'TEMPO', controlType: false, dot: null,
  },
  {
    id: 'STATUS_SANGRANDO_001', name: 'Sangrando', category: 'DANO_CONTINUO', stacks: true, maxStacks: 3, baseDuration: 3, removal: 'TEMPO', controlType: false, dot: { stat: 'hp', percentPerStack: 5 },
  },
  {
    id: 'STATUS_FERIDO_001', name: 'Ferido', category: 'DEBUFF', stacks: false, maxStacks: 1, baseDuration: 3, removal: 'TEMPO', controlType: false, dot: null,
  },
  {
    id: 'STATUS_DESEQUILIBRADO_001', name: 'Desequilibrado', category: 'DEBUFF', stacks: false, maxStacks: 1, baseDuration: 1, removal: 'TEMPO', controlType: false, dot: null,
  },
  {
    id: 'STATUS_DERRUBADO_001', name: 'Derrubado', category: 'CONTROLE', stacks: false, maxStacks: 1, baseDuration: 1, removal: 'TEMPO', controlType: true, dot: null,
  },
  {
    id: 'STATUS_DESARMADO_001', name: 'Desarmado', category: 'DEBUFF', stacks: false, maxStacks: 1, baseDuration: 2, removal: 'TEMPO', controlType: false, dot: null,
  },
  {
    id: 'STATUS_IMOBILIZADO_001', name: 'Imobilizado', category: 'CONTROLE', stacks: false, maxStacks: 1, baseDuration: 2, removal: 'TEMPO', controlType: true, dot: null,
  },
  {
    id: 'STATUS_ATORDOADO_001', name: 'Atordoado', category: 'CONTROLE', stacks: false, maxStacks: 1, baseDuration: 1, removal: 'TEMPO', controlType: true, dot: null,
  },
  {
    id: 'STATUS_PARALISADO_001', name: 'Paralisado', category: 'CONTROLE', stacks: false, maxStacks: 1, baseDuration: 1, removal: 'TEMPO', controlType: true, dot: null,
  },
  {
    id: 'STATUS_SILENCIADO_001', name: 'Silenciado', category: 'CONTROLE', stacks: false, maxStacks: 1, baseDuration: 2, removal: 'TEMPO', controlType: true, dot: null,
  },
  {
    id: 'STATUS_SELADO_001', name: 'Selado', category: 'CONTROLE', stacks: false, maxStacks: 1, baseDuration: 2, removal: 'CURA', controlType: true, dot: null,
  },
  {
    id: 'STATUS_CONFUSO_001', name: 'Confuso', category: 'CONTROLE', stacks: false, maxStacks: 1, baseDuration: 2, removal: 'TEMPO', controlType: true, dot: null,
  },
  {
    id: 'STATUS_MEDO_001', name: 'Medo', category: 'DEBUFF', stacks: false, maxStacks: 1, baseDuration: 2, removal: 'TEMPO', controlType: false, dot: null,
  },
  {
    id: 'STATUS_CHAKRA_PERTURBADO_001', name: 'Chakra Perturbado', category: 'DEBUFF', stacks: false, maxStacks: 1, baseDuration: 2, removal: 'TEMPO', controlType: false, dot: null,
  },
  {
    id: 'STATUS_DRENADO_001', name: 'Drenado', category: 'DANO_CONTINUO', stacks: true, maxStacks: 2, baseDuration: 3, removal: 'TEMPO', controlType: false, dot: { stat: 'chakra', percentPerStack: 10 },
  },
  {
    id: 'STATUS_MARCADO_001', name: 'Marcado', category: 'DEBUFF', stacks: false, maxStacks: 1, baseDuration: 3, removal: 'TEMPO', controlType: false, dot: null,
  },
  {
    id: 'STATUS_EXPOSTO_001', name: 'Exposto', category: 'DEBUFF', stacks: false, maxStacks: 1, baseDuration: 2, removal: 'TEMPO', controlType: false, dot: null,
  },
  {
    id: 'STATUS_VULNERAVEL_001', name: 'Vulnerável', category: 'DEBUFF', stacks: true, maxStacks: 2, baseDuration: 2, removal: 'TEMPO', controlType: false, dot: null,
  },
  {
    id: 'STATUS_FOCADO_001', name: 'Focado', category: 'BUFF', stacks: false, maxStacks: 1, baseDuration: 2, removal: 'TEMPO', controlType: false, dot: null,
  },
  {
    id: 'STATUS_OCULTO_001', name: 'Oculto', category: 'PERCEPCAO', stacks: false, maxStacks: 1, baseDuration: 2, removal: 'ACAO_ALVO', controlType: false, dot: null,
  },
  {
    id: 'STATUS_RASTREADO_001', name: 'Rastreado', category: 'PERCEPCAO', stacks: false, maxStacks: 1, baseDuration: 3, removal: 'TEMPO', controlType: false, dot: null,
  },
  {
    id: 'STATUS_PROTEGIDO_001', name: 'Protegido', category: 'BUFF', stacks: false, maxStacks: 1, baseDuration: 2, removal: 'TEMPO', controlType: false, dot: null,
  },
  {
    id: 'STATUS_QUEBRADO_001', name: 'Quebrado', category: 'DEBUFF', stacks: false, maxStacks: 1, baseDuration: 2, removal: 'TEMPO', controlType: false, dot: null,
  },
  {
    id: 'STATUS_GENJUTSU_001', name: 'Genjutsu', category: 'MENTAL', stacks: false, maxStacks: 1, baseDuration: 2, removal: 'CURA', controlType: true, dot: null,
  },
  {
    id: 'STATUS_EXAUSTO_001', name: 'Exausto', category: 'DEBUFF', stacks: false, maxStacks: 1, baseDuration: 2, removal: 'TEMPO', controlType: false, dot: null,
  },
];

export const STATUS_CATEGORIES = Object.freeze([
  'CONTROLE', 'DANO_CONTINUO', 'DEBUFF', 'BUFF', 'PERCEPCAO', 'MENTAL', 'AMBIENTE',
]);

statuses.registerAll(STATUS_DEFINITIONS);

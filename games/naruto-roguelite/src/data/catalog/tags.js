// Catálogo de Tags — vocabulário fechado de CANON_RULES.md #Tags/#Estados
// e docs/design/01 e 15 (elementos base + Hyōton, citado no doc 01 na
// reação "Molhado+Hyōton=Congelamento facilitado"). Popula a Registry
// `tags` declarada em src/data/index.js — importe este módulo (por efeito
// colateral) antes de consultar `tags.get(...)`.
//
// "NÃO crie tags que nenhum sistema reconhece" (CANON_RULES #14): todas as
// entradas abaixo já são consumidas pelo Effect Engine (natureza ativa
// reações; estilo/entrega/efeito ficam disponíveis para filtros de UI e
// para jutsus reais a partir do Marco 3).

import { tags } from '../index.js';

export const TAG_DEFINITIONS = [
  // Natureza
  { id: 'TAG_KATON_001', name: 'Katon', category: 'NATUREZA' },
  { id: 'TAG_RAITON_001', name: 'Raiton', category: 'NATUREZA' },
  { id: 'TAG_SUITON_001', name: 'Suiton', category: 'NATUREZA' },
  { id: 'TAG_FUTON_001', name: 'Fūton', category: 'NATUREZA' },
  { id: 'TAG_DOTON_001', name: 'Doton', category: 'NATUREZA' },
  { id: 'TAG_HYOTON_001', name: 'Hyōton', category: 'NATUREZA' },
  // Estilo
  { id: 'TAG_NINJUTSU_001', name: 'Ninjutsu', category: 'ESTILO' },
  { id: 'TAG_TAIJUTSU_001', name: 'Taijutsu', category: 'ESTILO' },
  { id: 'TAG_GENJUTSU_001', name: 'Genjutsu', category: 'ESTILO' },
  { id: 'TAG_HIDEN_001', name: 'Hiden', category: 'ESTILO' },
  { id: 'TAG_DOJUTSU_001', name: 'Dōjutsu', category: 'ESTILO' },
  // Entrega
  { id: 'TAG_PROJETIL_001', name: 'Projétil', category: 'ENTREGA' },
  { id: 'TAG_AREA_001', name: 'Área', category: 'ENTREGA' },
  { id: 'TAG_BARREIRA_001', name: 'Barreira', category: 'ENTREGA' },
  { id: 'TAG_INVOCACAO_001', name: 'Invocação', category: 'ENTREGA' },
  { id: 'TAG_CLONE_001', name: 'Clone', category: 'ENTREGA' },
  // Efeito
  { id: 'TAG_IMPACTO_001', name: 'Impacto', category: 'EFEITO' },
  { id: 'TAG_PERFURACAO_001', name: 'Perfuração', category: 'EFEITO' },
  { id: 'TAG_QUEBRA_001', name: 'Quebra', category: 'EFEITO' },
  { id: 'TAG_EXECUCAO_001', name: 'Execução', category: 'EFEITO' },
  { id: 'TAG_SENSORIAL_001', name: 'Sensorial', category: 'EFEITO' },
];

export const TAG_CATEGORIES = Object.freeze(['NATUREZA', 'ESTILO', 'ENTREGA', 'EFEITO']);

tags.registerAll(TAG_DEFINITIONS);

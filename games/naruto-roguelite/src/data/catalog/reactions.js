// Catálogo de Reações — combinações explícitas de
// docs/design/01_COMBATE_TAGS_ESTADOS_REACOES.md. Uma Reação dispara
// quando o alvo já tem `triggerStateId` ativo e a ação recebida carrega
// `triggerTagId`.
//
// Campos:
//   triggerStateId   Estado que precisa estar ativo no alvo
//   triggerTagId     Tag que a ação recebida precisa carregar
//   resultStateId    Estado aplicado como resultado (pode ser o mesmo
//                    triggerStateId — nesse caso o Effect Engine só
//                    empilha/estende a duração, sem código especial)
//   guaranteedApply  true = ignora resistência (a própria combinação já é
//                    a regra, "X+Y=Z" no doc, sem qualificador); false =
//                    ainda pode ser resistido, só fica mais fácil (`chance`)
//   chance           usado só quando guaranteedApply=false
//
// Reações não implementadas nesta versão (documentadas em DECISIONS.md
// D015): "Óleo+Katon" (Óleo não é um Estado catalogado — doc só o cita de
// passagem) e "Katon+Suiton=Vapor/Névoa" (Névoa é um Campo de batalha, não
// um Estado por combatente — Campos ficam fora do Marco 2).

import { reactions } from '../index.js';

export const REACTION_DEFINITIONS = [
  {
    id: 'REACTION_ELETRIFICACAO_001',
    name: 'Eletrificação',
    triggerStateId: 'STATUS_MOLHADO_001',
    triggerTagId: 'TAG_RAITON_001',
    resultStateId: 'STATUS_ELETRIFICADO_001',
    guaranteedApply: true,
  },
  {
    id: 'REACTION_CONGELAMENTO_FACILITADO_001',
    name: 'Congelamento Facilitado',
    triggerStateId: 'STATUS_MOLHADO_001',
    triggerTagId: 'TAG_HYOTON_001',
    resultStateId: 'STATUS_CONGELADO_001',
    guaranteedApply: false,
    chance: 0.75,
  },
  {
    id: 'REACTION_PROPAGACAO_QUEIMANDO_001',
    name: 'Propagação',
    triggerStateId: 'STATUS_QUEIMANDO_001',
    triggerTagId: 'TAG_FUTON_001',
    resultStateId: 'STATUS_QUEIMANDO_001',
    guaranteedApply: false,
    chance: 0.75,
  },
  {
    id: 'REACTION_LAMA_001',
    name: 'Lama',
    // "Molhado" representa genericamente "chão/alvo recém-atingido por
    // Suiton" — reaproveitado aqui em vez de criar um segundo Estado só
    // para marcar umidade (ver DECISIONS.md D015).
    triggerStateId: 'STATUS_MOLHADO_001',
    triggerTagId: 'TAG_DOTON_001',
    resultStateId: 'STATUS_LAMA_001',
    guaranteedApply: true,
  },
  {
    id: 'REACTION_DERRUBADO_001',
    name: 'Derrubado por Impacto',
    triggerStateId: 'STATUS_DESEQUILIBRADO_001',
    triggerTagId: 'TAG_IMPACTO_001',
    resultStateId: 'STATUS_DERRUBADO_001',
    guaranteedApply: true,
  },
];

/** Limite de reações automáticas processadas por ação (CANON_RULES.md #13 — evita loops). */
export const MAX_REACTIONS_PER_ACTION = 4;

reactions.registerAll(REACTION_DEFINITIONS);

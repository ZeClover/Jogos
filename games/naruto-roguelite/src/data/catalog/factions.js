// Catálogo de Facções (Marco 9, docs/design/06_EVENTOS_RELACOES_FACCOES_
// NARRATIVA.md) — as 14 facções nomeadas explicitamente no doc. Cada
// entrada é só {id, name, description}: o doc não dá mais dado nenhum
// (sem stats, sem loadout, sem território detalhado) — description é um
// resumo de 1 linha do que a facção já É no cânon (geografia/papel básico
// de vila oculta), não uma invenção de identidade/mecânica nova (CANON_
// RULES #30/#79). Reputação por facção é o sistema real (ver
// src/engine/progression/reputation.js) — este catálogo só nomeia QUEM
// pode ter reputação. Ver DECISIONS.md D026.
import { factions } from '../index.js';

export const FACTION_DEFINITIONS = [
  { id: 'FACTION_KONOHA_001', name: 'Konohagakure', description: 'Vila oculta da Folha, no País do Fogo — lar do esquadrão jogável.' },
  { id: 'FACTION_SUNA_001', name: 'Sunagakure', description: 'Vila oculta da Areia, no País do Vento.' },
  { id: 'FACTION_KIRI_001', name: 'Kirigakure', description: 'Vila oculta da Névoa, no País da Água.' },
  { id: 'FACTION_KUMO_001', name: 'Kumogakure', description: 'Vila oculta da Nuvem, no País do Raio.' },
  { id: 'FACTION_IWA_001', name: 'Iwagakure', description: 'Vila oculta da Pedra, no País da Terra.' },
  { id: 'FACTION_AME_001', name: 'Amegakure', description: 'Vila oculta da Chuva, pequena e isolada politicamente.' },
  { id: 'FACTION_OTO_001', name: 'Otogakure', description: 'Vila oculta do Som, de fundação recente.' },
  { id: 'FACTION_TAKI_001', name: 'Takigakure', description: 'Vila oculta da Cachoeira, uma vila menor fora das 5 Grandes Nações.' },
  { id: 'FACTION_KUSA_001', name: 'Kusagakure', description: 'Vila oculta da Grama, uma vila menor fora das 5 Grandes Nações.' },
  { id: 'FACTION_PAIS_DO_FERRO_001', name: 'País do Ferro', description: 'Nação neutra protegida por samurais, tradicional sede de encontros diplomáticos entre Kages.' },
  { id: 'FACTION_AKATSUKI_001', name: 'Akatsuki', description: 'Organização de nukenin de elite com uma agenda própria, à margem de todas as vilas.' },
  { id: 'FACTION_ANBU_001', name: 'ANBU', description: 'Força de operações especiais de Konoha, subordinada diretamente ao Hokage.' },
  { id: 'FACTION_RAIZ_001', name: 'Raiz (Ne)', description: 'Facção secreta dentro da estrutura da ANBU, respondendo a uma cadeia de comando própria.' },
  { id: 'FACTION_NUKENIN_001', name: 'Nukenin', description: 'Categoria de ninjas renegados sem vínculo formal com nenhuma vila — agrupa ameaças recorrentes sem vila de origem ativa na run, como Zabuza Momochi.' },
];

factions.registerAll(FACTION_DEFINITIONS);

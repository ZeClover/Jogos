// Catálogo de Passivas — Lote 01 (Vertical Slice). Só uma passiva é
// nomeada em docs/design/12_PERSONAGENS_VERTICAL_SLICE.md (Cabeça-Dura, do
// Naruto); as outras 3 Genin não têm passiva citada nessa fonte. Cataloga-se
// o que existe; não se inventa passiva para preencher espaço (CANON_RULES
// #79 — poucas fichas boas > muitas rasas).
//
// `effect: null` — o doc nomeia a passiva mas não descreve o que ela faz
// mecanicamente. Catalogá-la com efeito nenhum é honesto; inventar um
// bônus agora seria fabricar um número de balanceamento sem base (mesmo
// espírito de D012/D015/D016). Ganha `effect` real quando houver fonte.

import { passives } from '../index.js';

export const PASSIVE_DEFINITIONS = [
  {
    id: 'PASSIVE_CABECA_DURA_001',
    name: 'Cabeça-Dura',
    description: 'Passiva de Naruto Uzumaki (Genin). Mecânica ainda não especificada pelo documento de design.',
    effect: null,
  },
];

passives.registerAll(PASSIVE_DEFINITIONS);

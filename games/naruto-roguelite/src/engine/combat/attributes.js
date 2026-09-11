// Atributos de combate. Ver CANON_RULES.md #Combate e
// docs/design/01_COMBATE_TAGS_ESTADOS_REACOES.md.
//
// Referência de stats por rank (doc 01), só para calibrar os defaults:
// Genin HP 80–140 / Chakra 60–120; Chūnin 120–220 / 100–180;
// Jōnin 200–350 / 150–280; Kage 350+ / 300+.

/** Atributos primários — todo combatente precisa dos 12. */
export const PRIMARY_ATTRIBUTE_DEFAULTS = Object.freeze({
  hpMax: 100,
  chakraMax: 100,
  taijutsu: 10,
  ninjutsu: 10,
  genjutsu: 10,
  defesaFisica: 10,
  defesaChakra: 10,
  controleChakra: 10,
  velocidade: 10,
  precisao: 0,
  evasao: 0,
  resistenciaMental: 10,
});

/** Atributos secundários (doc 01: crítico, penetração, regen, eficiência, resistências). */
export const SECONDARY_ATTRIBUTE_DEFAULTS = Object.freeze({
  critChance: 0.05,
  critMultiplier: 1.5,
  penetracaoFisica: 0,
  penetracaoChakra: 0,
  regenChakra: 0,
  eficiencia: 0, // redução percentual de custo de Chakra, 0..1
  resistenciaEstado: 0,
  resistenciaInterrupcao: 0,
});

/**
 * Monta um bloco de atributos completo a partir de overrides parciais.
 * Não valida faixas por rank aqui — isso é responsabilidade de quem monta
 * a ficha de personagem/inimigo (Marco 4/5), não da engine de combate.
 */
export function createAttributes(overrides = {}) {
  return {
    ...PRIMARY_ATTRIBUTE_DEFAULTS,
    ...SECONDARY_ATTRIBUTE_DEFAULTS,
    ...overrides,
  };
}

// Equipamento persistente (Marco 10, D029, docs/design/03_ITENS_
// EQUIPAMENTOS_ECONOMIA.md — "Build = personagem + jutsu + passiva +
// equipamento + ferramenta + consumível"). Mesmo espírito do resto da
// Engine: função pura, não conhece o catálogo de Itens — quem chama
// (characterBridge.js, por sua vez chamado pela UI) já resolve o
// itemId em uma ficha real antes de passar pra cá. Diferente de
// Item consumível (`actions.js#handleItem`, gasta 1 unidade em
// combate), Equipamento nunca se gasta: o bônus só é aplicado 1 vez, ao
// montar o Combatente.
export function applyEquipmentBonuses(attributes, itemDefs) {
  for (const def of itemDefs) {
    for (const { attribute, amount } of def.statBonus ?? []) {
      attributes[attribute] = (attributes[attribute] ?? 0) + amount;
    }
  }
}

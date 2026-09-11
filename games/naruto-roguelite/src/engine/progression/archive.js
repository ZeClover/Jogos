// Arquivo Ninja (Marco 8, PROMPT MESTRE §40): "registra progressivamente
// o que o jogador aprendeu" — personagens, jutsus, inimigos, bosses,
// regiões etc. Genérico por Content ID; não conhece categorias
// específicas — quem chama decide o que revelar e quando (normalmente:
// ao encontrar um inimigo/boss pela 1ª vez em combate, ou concluir uma
// Região). Conteúdo não descoberto aparece como "???" (CANON_RULES —
// "Descoberta gradual: não despejar todo o conteúdo desbloqueável de uma
// vez"). Serializável em JSON puro (array, não Set) para o accountState.
export function createArchive() {
  return { discoveredIds: [] };
}

/** Marca `id` como descoberto. Devolve `true` só se era novo (idempotente). */
export function discover(archive, id) {
  if (!id || archive.discoveredIds.includes(id)) return false;
  archive.discoveredIds.push(id);
  return true;
}

/** `discover` em lote — devolve quantos IDs eram realmente novos. */
export function discoverAll(archive, ids) {
  return ids.filter((id) => discover(archive, id)).length;
}

export function isDiscovered(archive, id) {
  return archive.discoveredIds.includes(id);
}

/** Nome real se já descoberto, `"???"` caso contrário. */
export function archiveLabel(archive, id, registry) {
  if (!isDiscovered(archive, id)) return '???';
  return registry.get(id)?.name ?? id;
}

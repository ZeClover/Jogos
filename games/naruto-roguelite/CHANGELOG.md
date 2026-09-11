# CHANGELOG — Naruto Roguelite

Formato livre, em ordem cronológica reversa (mais recente primeiro). Este
changelog é interno ao subprojeto `games/naruto-roguelite/`.

## Marco 3 — Jutsus

### Adicionado

- `src/data/catalog/jutsus.js` — as 12 fichas do Vertical Slice (doc 13):
  Kage Bunshin, Rasengan, Katon: Gōkakyū, Chidori, Kagemane, Kawarimi,
  Uzumaki Naruto Rendan, Shishi Rendan, Kai, First Aid, Shadow Setup,
  Analyze. Registradas na Registry `jutsus`.
- `src/engine/combat/jutsu.js` — `resolveJutsuFields` (mescla ficha do
  catálogo + override da action), `isOnCooldown`/`setCooldown`/
  `tickCooldowns`.
- `effects.js`: `armReaction`/`tryEvadeWithReaction` (Kawarimi) e
  `cleanseCurableStates` (Kai).
- `actions.js`: `handleJutsu` reescrito com 5 efeitos (`DAMAGE`, `HEAL`,
  `CLEANSE`, `ARM_REACTION`, `UTILITY`); `resolveAttack` (usado por
  ATAQUE_BASICO e JUTSU/DAMAGE) agora checa Kawarimi antes de rolar
  acerto; slot de uma ação JUTSU com `jutsuId` respeita o que a ficha
  pede (ex: Kawarimi usa REACAO automaticamente).
- `positions.js`: alcances `ALLY` (suporte, mesmo lado) e `AREA` (alvo
  único, isento de Kawarimi); parâmetro renomeado de `enemyTeam` para
  `sideMembers` (agora serve tanto ataque quanto suporte).
- `combatant.js`: `cooldowns` (Map) e `pendingReaction`.
- `state.js`: `CombatState` aceita `jutsuCatalog`, tica cooldowns a cada
  fim de rodada.
- `enums.js`: `JUTSU_CATEGORIES`, `JUTSU_EFFECTS`, `JUTSU_RANGES`.
- Dev console: combate de demonstração passa a usar jutsus reais via
  `jutsuId` (Gōkakyū, Kawarimi); painel de Catálogo lista as 12 fichas.
- 28 novos testes (`tests/combat/jutsu.test.js`,
  `tests/combat/jutsu_integration.test.js`, extensão de
  `tests/combat/positions.test.js` e `tests/data/catalog.test.js`) —
  total do projeto: 181 testes.
- DECISIONS.md D016 (campo `effect`, Kawarimi pull-based, cooldowns,
  simplificações por jutsu).

### Validado

- `npm test`: 181/181 passando.
- Dev console testado em Chromium headless (Playwright): combate roda
  usando Gōkakyū/Kawarimi reais do catálogo, sem erros de página.

## Marco 2 — Effect Engine

### Adicionado

- `src/data/catalog/tags.js` — 21 Tags canônicas (natureza, estilo,
  entrega, efeito), registradas na Registry `tags`.
- `src/data/catalog/statuses.js` — os 29 Estados do doc 01, como dado
  puro (categoria, stacks, duração, remoção, `controlType`, `dot`).
- `src/data/catalog/reactions.js` — 5 Reações concretas (Eletrificação,
  Congelamento Facilitado, Propagação, Lama, Derrubado por Impacto).
- `src/data/catalog/index.js` — barrel que popula as três Registries por
  efeito colateral, em ordem segura.
- `src/engine/combat/effects.js` — Effect Engine: `tryApplyState`,
  `removeState`, `hasState`/`getActiveState`, `tickStates` (DoT +
  duração + expiração), `resolveReactions` (com limite de 4 por ação),
  `attackerBonusFromTargetStates` (bônus contra Imobilizado).
- `combatant.js` ganhou `states[]` e `controlApplications` (Map).
- `actions.js`: `JUTSU` aceita `tags`/`appliesStates`, aplica Estados e
  resolve Reações ao acertar; bônus de acerto/crítico contra Imobilizado
  em `ATAQUE_BASICO` e `JUTSU`.
- `state.js`: `CombatState` aceita `statusCatalog`/`reactionCatalog`,
  tica Estados no fim de cada rodada; corrigido para não iniciar uma
  rodada nova se dano contínuo decidir o combate no fim da rodada
  anterior.
- Painel "Catálogo" e atualização do painel "Combate" no dev console
  (Estados ativos, dano contínuo e Reações aparecem no log).
- 30 novos testes (`tests/combat/effects.test.js`,
  `tests/combat/effect_integration.test.js`, `tests/data/catalog.test.js`)
  — total do projeto: 153 testes.
- DECISIONS.md D015 registrando as decisões de escopo/fórmula do Effect
  Engine.

### Validado

- `npm test`: 153/153 passando.
- Dev console (painéis Combate + Catálogo) testado em Chromium headless
  (Playwright): Queimando aplica/resiste/causa dano contínuo visível no
  log, sem erros de página.

## Marco 1 — Combate Mínimo

### Adicionado

- `src/engine/combat/attributes.js` — os 12 atributos primários do doc 01
  + secundários (crítico, penetração, regen, eficiência, resistências).
- `src/engine/combat/combatant.js` — combatente de runtime (HP/Chakra
  atuais, posição, guarda, orçamento de ação).
- `src/engine/combat/damage.js` — mitigação por diminishing returns,
  acerto (20–100%), crítico, mapeamento categoria→defesa (ver DECISIONS.md
  D012).
- `src/engine/combat/positions.js` — Frente/Centro/Trás e gating de
  alcance MELEE/RANGED/SELF.
- `src/engine/combat/turnOrder.js` — ordem de turno por Velocidade +
  variação RNG, via `SeedManager.combat`.
- `src/engine/combat/actions.js` — handlers de ATAQUE_BASICO, JUTSU
  (genérico), DEFENDER, MOVER, TROCAR; orçamento por slot
  (Principal/Rápida/Reação); stubs explícitos para ITEM/PREPARAR/
  INTERAGIR.
- `src/engine/combat/state.js` — `CombatState`: laço de rodadas
  pull-based, persistência/regen de Chakra, fim de combate, log
  estruturado.
- `ACTION_BUDGET_PER_ROUND` em `src/engine/enums.js`.
- Painel "Combate" no dev console, com um 1v1 de demonstração ponta a
  ponta e seed ajustável.
- 54 novos testes automatizados (`tests/combat/`) cobrindo atributos,
  dano, posições, ordem de turno, ações e um combate completo
  determinístico — total do projeto: 123 testes.
- DECISIONS.md D012–D014 registrando as decisões de fórmula/escopo do
  Combate Mínimo.

### Validado

- `npm test`: 123/123 passando.
- Dev console (painel de Combate) testado em Chromium headless
  (Playwright): roda um 1v1 até o fim, reproduz o mesmo resultado com a
  mesma seed, sem erros de página.

## Marco 0 — Fundação

### Adicionado

- Estrutura do projeto (`games/naruto-roguelite/`) separando Engine / Data
  / Presentation, conforme a arquitetura data-driven exigida pelo design.
- Documentação de design commitada em `docs/design/` (17 documentos do
  pacote recebido + `17_PROMPT_MESTRE.md`, transcrito do prompt mestre da
  conversa já que o zip veio sem ele).
- Engine core:
  - `src/engine/enums.js` — vocabulários canônicos (ranks, posições, tipos
    de ação, resultados de missão, reputação/relação, atos, streams de
    RNG, prefixos de ID).
  - `src/engine/ids.js` — validação e utilitários de ID estável.
  - `src/engine/rng.js` + `src/engine/seed.js` — RNG determinística
    (mulberry32) com streams nomeadas e reproduzíveis via `SeedManager`.
  - `src/engine/registry.js` — registro genérico de entidades por ID.
  - `src/engine/validators.js` — validadores data-driven (IDs duplicados,
    campos obrigatórios, tags/estados inválidos, referências quebradas,
    assets ausentes do manifesto).
  - `src/engine/save.js` — save/load com storage injetável, slots
    (account/run), versionamento de schema e migração em cadeia.
  - `src/engine/types.js` — JSDoc typedefs das entidades centrais.
- `src/data/index.js` — uma Registry vazia por tipo de conteúdo, pronta
  para os Marcos 3/4.
- `src/content/asset_manifest.js` — 67 entradas P0 (Asset ID + prompt
  visual completo, transcritas de `docs/design/15`) + 58 itens de backlog
  P1, gerador de placeholder SVG e resolvedor de asset que nunca bloqueia
  por falta de arte.
- Dev console (`index.html`, `style.css`, `src/ui/devconsole.js`) —
  diagnóstico visual da engine no browser (RNG/Seed, registries, Asset
  Manifest, validadores, save/load).
- 69 testes automatizados (`node --test`, sem dependências externas)
  cobrindo toda a engine core.
- Arquivos de continuidade: `PROJECT_STATUS.md`, `DECISIONS.md`,
  `CANON_RULES.md`, este `CHANGELOG.md`.

### Validado

- `npm test`: 69/69 passando.
- Dev console testado em Chromium headless (Playwright): carrega sem erros,
  todas as seções funcionam, round-trip de save confirmado interativamente.

# CHANGELOG — Naruto Roguelite

Formato livre, em ordem cronológica reversa (mais recente primeiro). Este
changelog é interno ao subprojeto `games/naruto-roguelite/`.

## Marco 7 — Run / Missões / Mapa

### Adicionado

- `src/engine/run/mapGenerator.js` — `generateRegionMap`/`findNode`:
  grafo ramificado determinístico (2 camadas de nó comum + 1 de boss),
  sem nós inalcançáveis.
- `src/engine/run/missionResult.js` — `resolveMissionResult`: resultado
  graduado (Sucesso Perfeito/Sucesso/Sucesso Parcial/Falha/Desastre) a
  partir do HP%/baixas do esquadrão após o combate.
- `src/engine/run/reclassify.js` — `maybeReclassifyNode` (15% de chance,
  memoizada por nó) + `reinforceSquad` (cura 25% ao custo de 1 dia).
- `src/engine/run/runState.js` — `createRun`/`availableNodes`/
  `resolveNode`/`spendReinforceDay`: calendário, Crônica, status
  IN_PROGRESS/VICTORY/DEFEAT; serializável em JSON puro.
- `src/data/catalog/regions.js` — Região País das Ondas (pool de Inimigo
  por tier + boss + pesos de tipo de nó).
- `src/data/catalog/missions.js` — 4 Templates de Missão (Batalha,
  Defesa, Caça, Duelo); vocabulário completo de 20 tipos de objetivo em
  `MISSION_OBJECTIVE_TYPES` (enums.js), só 4 com mecânica real.
- `enums.js`: `NODE_TYPES`, `MISSION_OBJECTIVE_TYPES`, `RUN_STATUSES`.
- `run.html` + `src/ui/run.js` — Modo Run jogável: Introdução (seed
  customizável) -> Mapa (nós clicáveis, Crônica) -> [Reclassificação
  quando aplicável] -> Batalha/Descanso -> Vitória/Derrota. Link cruzado
  com `play.html` (Vertical Slice continua disponível).
- 26 novos testes (`tests/run/*.test.js`,
  `tests/data/regions_missions_catalog.test.js`) — total do projeto:
  287 testes.
- DECISIONS.md D020 (escopo de nó/objetivo, resultado graduado,
  reclassificação, tamanho do mapa, identidade de Região, calendário,
  pendências explícitas) e D021 (UI do Modo Run duplica lógica de
  batalha de `game.js` deliberadamente, sem módulo compartilhado ainda).

### Validado

- `npm test`: 287/287 passando.
- `run.html` testado em Chromium headless (Playwright) em múltiplas
  seeds: ponta a ponta até Vitória, passando por nó Descanso (cura
  confirmada); um seed com reclassificação testado explicitamente —
  tela de escolha renderiza e "Recuar" preserva o estado reclassificado;
  sem erros de console em nenhum caso.

## Marco 6 — Vertical Slice

### Adicionado

- `play.html` + `src/ui/game.js` + `play.css` — primeira UI jogável real
  do projeto (dev console continua só diagnóstico, D011); tema
  "pergaminho/dossiê ninja" seguindo a Style Bible (doc 14). Consome o
  mesmo motor de combate dos Marcos 1-5 sem duplicar regra nenhuma.
- `src/data/vertical_slice.js` — `VERTICAL_SLICE_ENCOUNTERS`: roteiro
  fixo de 3 combates (Emboscada na Estrada, Mercenários de Gatō, Zabuza),
  fora do sistema de Missões/Mapa (isso é Marco 7).
- `src/engine/combat/campaign.js` — `snapshotSquad`/`applySquadSnapshot`/
  `survivingIds`: carrega HP/Chakra/recurso exclusivo do esquadrão entre
  os 3 combates; quem cai (HP 0) fica de fora dos combates seguintes.
- Fluxo completo: tela de Esquadrão (os 4 Genin, Custo 8/12) -> Batalha
  (turno do jogador por clique ação->alvo; inimigos resolvidos
  automaticamente por `chooseAction`, IA do Marco 5) -> Vitória do
  Vertical Slice ou Derrota, com opção de jogar de novo.
- `/index.html` (hub do site): novo card "Naruto Roguelite" linkando
  para `games/naruto-roguelite/play.html` — cumpre DECISIONS.md D007.
- 11 novos testes (`tests/combat/campaign.test.js`,
  `tests/data/vertical_slice.test.js`) — total do projeto: 250 testes.
  A UI jogável (`game.js`) é toda DOM — validada via Playwright, sem
  testes Node.
- DECISIONS.md D019 (UI separada do dev console, roteiro fixo fora de
  Missões/Mapa, campanha só com HP/Chakra/recurso entre combates,
  esquadrão fixo sem tela de seleção, posições iniciais uniformes,
  fallback de Defender, renderização por string com listener delegado).

### Validado

- `npm test`: 250/250 passando.
- `play.html` testado em Chromium headless (Playwright): jogado de ponta
  a ponta (ação->alvo, Ataque Básico e um Jutsu real) através dos 3
  combates até a tela de Vitória final, sem erros de console; HP/Chakra
  do esquadrão confirmadamente carregando entre combates; IA dos
  inimigos agindo sozinha, turno sempre avançando.

## Marco 5 — Inimigos e IA

### Adicionado

- `effects.js`: `attackerBonusFromTargetStates` passa a receber as `tags`
  do ataque recebido; penaliza acerto contra Oculto (`-20%`) exceto com a
  Tag Sensorial — fecha o item deferido D015 #8.
- `src/engine/combat/ai.js` — `chooseAction(state, actor, {level,
  bossId})`: estratégias genéricas `BASICA`/`INTERMEDIARIA`/`ELITE` +
  `BOSS_AI_PROFILES` (perfil bespoke por boss); `zabuzaAction` (ataca na
  Fase 1, lança Kirigakure/Oculto ao entrar na Fase 2, intensifica na
  Fase 3).
- `src/engine/combat/enemyBridge.js` — `createCombatantFromEnemy`/
  `createCombatantFromBoss`.
- `src/data/catalog/enemies.js` — 4 arquétipos do País das Ondas
  (Bandido, Mercenário, Ninja de Kiri, Elite de Kiri).
- `src/data/catalog/bosses.js` — Zabuza Momochi: HP 320/Chakra 200, 3
  fases por %HP com telegraphs, fraquezas mecânicas, loadout.
- `src/data/catalog/jutsus.js` — 13ª ficha: `JUT_KIRIGAKURE_NO_JUTSU_001`
  (Kirigakure no Jutsu, autorada para o boss — não existia no doc 13).
- `enums.js`: `AI_LEVELS`, `ENEMY_TIERS`. `types.js`: `Boss` estendido
  (`aiLevel`/`aiProfile`/`loadout`/`phases`, novo typedef `BossPhase`),
  novo typedef `Enemy`.
- `state.js`: `enemySideIds` tornado público (usado pela IA para listar
  alvos vivos do lado oposto).
- Dev console: novo painel "Inimigos e Boss" (tabela de arquétipos +
  fases/telegraphs/fraquezas de Zabuza) e novo painel "Boss Fight"
  (combate real Naruto-vs-Zabuza controlado por IA, seed ajustável).
- 28 novos testes (`tests/combat/ai.test.js`,
  `tests/data/enemies_bosses_catalog.test.js`,
  `tests/combat/boss_fight_integration.test.js`, extensão de
  `tests/combat/effects.test.js` e `tests/combat/positions.test.js`) —
  total do projeto: 239 testes.
- DECISIONS.md D018 (Oculto/Sensorial, IA genérica vs. perfil de boss
  bespoke, fases por %HP, Kirigakure autorado, stats provisórios,
  fraquezas mecânicas).

### Validado

- `npm test`: 239/239 passando.
- Dev console testado em Chromium headless (Playwright): painel
  "Inimigos e Boss" lista os 4 arquétipos e as 3 fases de Zabuza, painel
  "Boss Fight" roda um combate completo Naruto-real vs Zabuza-real até um
  vencedor, com o log mostrando a transição de Fase 1 (Ataque Básico)
  para Fase 2 (Kirigakure no Jutsu), sem erros de página.

## Marco 4 — Personagens

### Adicionado

- `src/data/catalog/characters.js` — os 4 Genin do Vertical Slice (doc
  12): Naruto, Sasuke, Sakura, Shikamaru, com squadCost/rank/role/HP/
  Chakra do doc, recurso exclusivo, loadout (Kawarimi como reação nos 4).
- `src/data/catalog/passives.js` — Cabeça-Dura (Naruto), única passiva
  nomeada no doc 12.
- `combatant.js`: campo `resource` (`{id, name, max, current}`) +
  `gainResource`/`spendResource`.
- `actions.js`: `handleJutsu` aplica `jutsuDef.grantsResource` ao próprio
  ator quando o cast tem sucesso (Kage Bunshin +2 Clones, Analyze +1
  Planejamento).
- `src/engine/combat/characterBridge.js` — `createCombatantFromCharacter`,
  `computeSquadCost`, `isSquadWithinBudget`.
- `types.js`: `CharacterVersion` estendido (`role`, `pendingAtivas`/
  `pendingSuprema`, `evolutionNotes`); novo typedef `Passive`.
- Dev console: painel "Personagens" (custo, rank, HP/Chakra, recurso,
  loadout com marcadores "pendente"); combate de demonstração passa a
  usar o Naruto Genin real (`CHAR_NARUTO_GENIN_001`) com seu loadout de
  verdade.
- 30 novos testes (`tests/combat/resource.test.js`,
  `tests/combat/characterBridge.test.js`,
  `tests/combat/character_integration.test.js`,
  `tests/data/characters_catalog.test.js`) — total do projeto: 211 testes.
- DECISIONS.md D017 (stats provisórios guiados por role, loadout honesto
  com pendingAtivas/pendingSuprema, recurso exclusivo genérico, passiva
  sem mecânica ainda, Custo de Esquadrão).

### Validado

- `npm test`: 211/211 passando.
- Dev console testado em Chromium headless (Playwright): painel de
  Personagens mostra os 4 Genin (Custo de Esquadrão 8/12), combate roda
  com o Naruto real usando Rasengan/Kage Bunshin/Clones, sem erros de
  página.

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

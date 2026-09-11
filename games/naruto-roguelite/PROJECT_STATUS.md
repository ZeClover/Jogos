# PROJECT_STATUS — Naruto Roguelite

> Leia este arquivo (+ `DECISIONS.md` + `CANON_RULES.md`) no início de
> qualquer sessão nova antes de tomar decisões estruturais. Nunca assuma
> que uma nova conversa significa projeto novo (PROMPT MESTRE §71-72).

## Marco atual

**MARCO 0 — FUNDAÇÃO: concluído e validado.**
**MARCO 1 — COMBATE MÍNIMO: concluído e validado.**
**MARCO 2 — EFFECT ENGINE: concluído e validado.**
**MARCO 3 — JUTSUS: concluído e validado.**
**MARCO 4 — PERSONAGENS: concluído e validado.**
**MARCO 5 — INIMIGOS E IA: concluído e validado.**
**MARCO 6 — VERTICAL SLICE: concluído e validado.**
**MARCO 7 — RUN / MISSÕES / MAPA: concluído e validado.**
**MARCO 8 — PROGRESSÃO: concluído e validado.**
**MARCO 9 — PROTÓTIPO 3 ATOS: concluído e validado (gerador procedural + 3 Regiões/Atos com boss autorado cada + sistema de Facções/Reputação).**
**MARCO 10 — EXPANSÃO: em andamento (1º lote: Itens consumíveis, ver abaixo).**

Próximo: continuar o Marco 10 com mais lotes de conteúdo (ver "Próximo passo").

## Visão geral do projeto

Roguelite tático por turnos ambientado no universo Naruto. Documentação
completa de design em `docs/design/00` a `16` + `17_PROMPT_MESTRE.md`
(constituição operacional). Regras não-negociáveis resumidas em
`CANON_RULES.md`. Decisões técnicas registradas em `DECISIONS.md`.

## Concluído (Marco 0)

- **Estrutura do projeto**: `games/naruto-roguelite/` com separação
  Engine (`src/engine/`) / Data (`src/data/`, `src/content/`) /
  Presentation (`src/ui/`, `index.html`, `style.css`), conforme
  CANON_RULES.md.
- **Documentação de design commitada** em `docs/design/` (17 docs +
  Prompt Mestre), para continuidade entre sessões.
- **Vocabulários canônicos** (`src/engine/enums.js`): ranks, posições,
  tipos/slots de ação, resultados de missão, níveis de reputação/relação,
  nomes de Ato, nomes de RNG streams, prefixos de ID de conteúdo e de
  asset, status de asset.
- **IDs estáveis** (`src/engine/ids.js`): validação de formato
  `PREFIXO_..._NNN`, extração de prefixo, geração de Asset ID a partir de
  categoria+contentId, próximo ID sequencial disponível.
- **RNG/Seed centralizada** (`src/engine/rng.js`, `src/engine/seed.js`):
  PRNG mulberry32 determinístico, hash FNV-1a para derivar seeds de
  string, `SeedManager` com streams nomeadas independentes
  (map/combat/loot/event + custom), utilitários (`int`, `pick`,
  `weightedPick`, `shuffle`, `chance`).
- **Registry genérica** (`src/engine/registry.js`): registro de entidades
  por ID com validação de prefixo e detecção de duplicata.
- **Validadores data-driven** (`src/engine/validators.js`): IDs
  duplicados, campos obrigatórios ausentes, tags/estados desconhecidos,
  referências não resolvidas, entradas de asset ausentes no manifesto.
- **Save/Load** (`src/engine/save.js`): `SaveManager` com storage
  injetável (localStorage ou memória), slots independentes (`account`,
  `run`, ...), versionamento de schema e cadeia de migração.
- **Registries de conteúdo** (`src/data/index.js`): uma Registry vazia por
  tipo (personagens, jutsus, itens, bosses, inimigos, regiões, eventos,
  estados, passivas, reações, tags, facções, missões, invocações, finais,
  conquistas) — prontas para o Marco 3/4 populá-las em lotes.
- **Asset Manifest** (`src/content/asset_manifest.js`): 67 entradas P0
  formais (Asset ID + prompt visual completo, todas com Style Bible
  embutida), transcritas fielmente de `docs/design/15`; 58 itens no
  backlog P1 (nome apenas, sem ID cunhado ainda — ver DECISIONS.md D009);
  gerador de placeholder SVG por categoria (`placeholderDataUri`) e
  resolvedor `resolveAssetSrc` que nunca bloqueia por falta de arte.
- **Dev console** (`index.html` + `src/ui/devconsole.js`): página de
  diagnóstico que carrega a engine via ES Modules no browser e exercita
  ao vivo RNG/Seed, registries, Asset Manifest, validadores e save/load.
- **Testes automatizados**: 287 casos (`node --test`, zero dependências)
  cobrindo Marco 0 (ids, rng, seed, registry, validators, save, asset
  manifest, data registries), Marco 1 (atributos, dano/defesa/acerto,
  posições/alcance, ordem de turno, ações, CombatState ponta a ponta),
  Marco 2 (Effect Engine), Marco 3 (Jutsus), Marco 4 (Personagens),
  Marco 5 (Inimigos e IA), Marco 6 (campanha/roteiro), Marco 7 (mapa/
  missão/reclassificação/run), Marco 8 (Maestria/Arquivo/Ameaça/conta) e
  Marco 9 (gerador procedural de inimigo — ver abaixo; as UIs jogáveis em
  si não têm testes Node, são validadas via Playwright).

### Concluído (Marco 1 — Combate Mínimo)

- **Atributos** (`src/engine/combat/attributes.js`): os 12 primários do
  doc 01 (HP, Chakra, Taijutsu, Ninjutsu, Genjutsu, Defesa Física, Defesa
  de Chakra, Controle de Chakra, Velocidade, Precisão, Evasão, Resistência
  Mental) + secundários (crítico, dano crítico, penetração física/chakra,
  regen de Chakra, eficiência, resistências).
- **Combatente** (`src/engine/combat/combatant.js`): instância de combate
  com HP/Chakra atuais, posição, guarda e orçamento de ação por rodada.
- **Dano/defesa/acerto** (`src/engine/combat/damage.js`): mitigação por
  diminishing returns (`Defesa/(Defesa+100)`), acerto limitado a
  20–100%, crítico (5% base, ×1.5), penetração, guarda — fórmulas
  transcritas do doc 01. Mapeamento categoria→defesa (Taijutsu→Defesa
  Física, Ninjutsu→Defesa de Chakra, Genjutsu→Resistência Mental) e a
  relação entre Power de jutsu e atributos do atacante ficam registradas
  como decisão provisória em DECISIONS.md D012.
- **Posições/alcance** (`src/engine/combat/positions.js`): Frente/Centro/
  Trás, alcance MELEE só mira a linha de frente ocupada do time inimigo
  (recalculada dinamicamente conforme personagens caem), RANGED mira
  qualquer linha, SELF só o próprio ator.
- **Ordem de turno** (`src/engine/combat/turnOrder.js`): Velocidade +
  pequena variação RNG (stream de combate), recalculada a cada rodada.
- **Ações** (`src/engine/combat/actions.js`): ATAQUE_BASICO, JUTSU
  (genérico, sem Tags/Estados — isso é Marco 2), DEFENDER, MOVER, TROCAR
  implementados; orçamento por slot (Principal/Rápida/Reação) reforçado
  pelo dispatcher; ITEM/PREPARAR/INTERAGIR são stubs explícitos
  `NOT_IMPLEMENTED_YET` (ver DECISIONS.md D013/D014 — dependem de sistemas
  de marcos futuros).
- **CombatState** (`src/engine/combat/state.js`): laço de rodadas
  pull-based (quem controla chama `applyAction`), Chakra persiste e
  regenera só no fim da rodada (não reseta por batalha), guarda/orçamento
  resetam a cada rodada nova, log estruturado de eventos, detecção de fim
  de combate e vencedor.
- **Dev console**: painel "Combate" roda um 1v1 de demonstração ponta a
  ponta (Ataque Básico + Jutsu genérico) com seed ajustável e log legível.

### Concluído (Marco 2 — Effect Engine)

- **Catálogo de Tags** (`src/data/catalog/tags.js`): 21 tags canônicas do
  doc 01/15 (natureza: Katon/Raiton/Suiton/Fūton/Doton/Hyōton; estilo:
  Ninjutsu/Taijutsu/Genjutsu/Hiden/Dōjutsu; entrega: Projétil/Área/
  Barreira/Invocação/Clone; efeito: Impacto/Perfuração/Quebra/Execução/
  Sensorial), registradas na Registry `tags`.
- **Catálogo de Estados** (`src/data/catalog/statuses.js`): os 29 Estados
  do doc 01, cada um como dado puro (categoria, stacks/maxStacks, duração
  base, remoção, `controlType`, `dot` opcional) — nenhum Estado exige
  código específico no motor, ver DECISIONS.md D015.
- **Catálogo de Reações** (`src/data/catalog/reactions.js`): 5 Reações
  concretas do doc (Eletrificação, Congelamento Facilitado, Propagação,
  Lama, Derrubado por Impacto); "Óleo+Katon" e "Katon+Suiton=Vapor"
  deliberadamente fora de escopo (D015 #6).
- **Effect Engine** (`src/engine/combat/effects.js`): `tryApplyState`
  (resistência via `resistenciaEstado` + resistência adaptativa de
  controle 100%/70%/40%/imune, stacking/refresh de duração), `tickStates`
  (dano/dreno contínuo no fim da rodada + expiração), `removeState`,
  `resolveReactions` (Estado gatilho + Tag recebida -> Estado resultado,
  limitado a 4 por ação), `attackerBonusFromTargetStates` (bônus de
  acerto/crítico contra Imobilizado — única checagem "hardcoded" do
  motor, justificada em D015 #8).
- **Integração ao combate**: `combatant.js` ganhou `states[]` e
  `controlApplications`; `JUTSU` aceita `tags`/`appliesStates` e devolve
  `appliedStates`/`reactions` no resultado; `CombatState` aceita
  `statusCatalog`/`reactionCatalog` e tica Estados no fim de cada rodada
  (com correção para não iniciar uma rodada nova se um DoT decidir o
  combate primeiro).
- **Dev console**: painel de Combate agora mostra Estados ativos, dano
  contínuo e Reações disparadas linha a linha; novo painel "Catálogo"
  com contagem de Tags/Estados/Reações.

### Concluído (Marco 3 — Jutsus)

- **Catálogo de Jutsus** (`src/data/catalog/jutsus.js`): as 12 fichas do
  Vertical Slice (`docs/design/13`) — Kage Bunshin, Rasengan, Katon:
  Gōkakyū, Chidori, Kagemane, Kawarimi, Uzumaki Naruto Rendan, Shishi
  Rendan, Kai, First Aid, Shadow Setup, Analyze — com os números finais
  do doc (Power/Accuracy/Custo/Cooldown), registradas na Registry
  `jutsus`. Simplificações documentadas por jutsu (sinergia com Clones,
  Sharingan, manutenção de Kagemane etc.) em DECISIONS.md D016.
- **Ponte dado→motor** (`src/engine/combat/jutsu.js`): `resolveJutsuFields`
  mescla a ficha do catálogo com a `action` (override pontual permitido);
  `isOnCooldown`/`setCooldown`/`tickCooldowns` — cooldown por combatente,
  tickado a cada fim de rodada.
- **Cinco efeitos de jutsu** em `handleJutsu` (`actions.js`): `DAMAGE`
  (default, com bônus de acerto/crítico contra Imobilizado herdado do
  Marco 2), `HEAL`, `CLEANSE` (remove Estados com `removal: 'CURA'`,
  usado por Kai), `ARM_REACTION` (Kawarimi) e `UTILITY` (efeitos sem
  dano/cura, ex: Shadow Setup aplicando Focado em si mesmo).
- **Kawarimi funcional**: arma uma esquiva no turno do usuário (consome
  Chakra + slot REACAO), que dispara automaticamente no próximo golpe
  single-target elegível — falha contra AoE, ataques inevitáveis e
  enquanto o próprio usuário está Imobilizado (`effects.js#
  tryEvadeWithReaction`). Primeiro uso real do slot REACAO desde o
  Marco 1.
- **Novos alcances**: `ALLY` (suporte/cura, mesmo lado incluindo o
  próprio ator) e `AREA` (nesta versão, alvo único nomeado — isento de
  Kawarimi; resolução multi-alvo real fica para quando houver
  necessidade concreta, ver D016 #5).
- **Rasengan "quebra guarda"**: campo `ignoresGuard` zera a guarda do
  alvo só para aquele golpe.
- **Dev console**: combate de demonstração agora usa fichas reais via
  `jutsuId` (Gōkakyū, Kawarimi quando o Chakra está baixo); painel de
  Catálogo lista as 12 fichas.

### Concluído (Marco 4 — Personagens)

- **Catálogo de Personagens** (`src/data/catalog/characters.js`): os 4
  Genin do Vertical Slice (`docs/design/12`) — Naruto, Sasuke, Sakura,
  Shikamaru — com squadCost/rank/role/HP/Chakra do doc, distribuição de
  atributos provisória guiada pelo `role` (DECISIONS.md D017 #1),
  recurso exclusivo (Clones/Pressão Uchiha/Foco/Planejamento), loadout
  com Kawarimi como reação nos 4. `loadout.ativas`/`suprema` só contêm
  jutsus com ficha real; nomes do doc sem ficha viram `pendingAtivas`/
  `pendingSuprema` (D017 #2) — nenhum jutsu ou passiva foi inventado
  para preencher slot.
- **Catálogo de Passivas** (`src/data/catalog/passives.js`): só
  Cabeça-Dura (Naruto), a única passiva nomeada no doc 12, com
  `effect: null` (mecânica não especificada — D017 #5).
- **Recurso exclusivo genérico** (`combatant.js`): `resource: { id, name,
  max, current }` + `gainResource`/`spendResource`; jutsus com
  `grantsResource` na ficha (Kage Bunshin +2 Clones, Analyze +1
  Planejamento) alimentam automaticamente ao acertar (D017 #4).
- **Ponte dado→motor** (`src/engine/combat/characterBridge.js`):
  `createCombatantFromCharacter` (monta um Combatente completo a partir
  da ficha), `computeSquadCost`/`isSquadWithinBudget` (orçamento padrão
  12, CANON_RULES #18).
- **Dev console**: novo painel "Personagens" com os 4 Genin (custo, rank,
  HP/Chakra, recurso, ativas, suprema, passiva, incl. marcadores
  "pendente"); combate de demonstração agora usa o Naruto Genin REAL
  (`CHAR_NARUTO_GENIN_001`) com seu loadout de verdade (Rasengan/Kage
  Bunshin/Kawarimi) em vez de um fixture ad-hoc.

### Concluído (Marco 5 — Inimigos e IA)

- **Oculto x Sensorial** (`src/engine/combat/effects.js`):
  `attackerBonusFromTargetStates` agora recebe as `tags` do ataque
  recebido; contra um alvo Oculto, todo ataque sofre `-20%` de acerto
  (`OCULTO_EVASION_PENALTY`), exceto ataques com a Tag Sensorial — fecha
  o item deferido D015 #8, ver DECISIONS.md D018 #1.
- **Módulo de IA** (`src/engine/combat/ai.js`): `chooseAction(state,
  actor, {level, bossId})` — estratégias genéricas `BASICA` (ataca o
  primeiro alvo vivo), `INTERMEDIARIA` (foca o alvo com menos HP, se
  defende com HP crítico) e `ELITE` (foca o alvo mais fraco, recua para
  Trás e depois se defende com HP crítico); nível `BOSS` delega a um
  perfil bespoke em `BOSS_AI_PROFILES` (D018 #2/#3).
- **Catálogo de Inimigos** (`src/data/catalog/enemies.js`): 4 arquétipos
  do País das Ondas — Bandido (COMMON/BASICA), Mercenário (VETERAN/
  INTERMEDIARIA), Ninja de Kiri (SPECIALIST/INTERMEDIARIA), Elite de Kiri
  (ELITE/ELITE) — stats provisórios (D018 #6).
- **Boss Zabuza Momochi** (`src/data/catalog/bosses.js`): HP 320/Chakra
  200, `aiLevel: 'BOSS'`, 3 fases por %HP (Ataque Direto 60-100%, Névoa
  Cerrada 25-60%, Desespero 0-25%) cada uma com telegraph (CANON_RULES
  #83) e `behaviorNote`; `weaknesses` mecânicas (não só flavor, D018 #8);
  loadout com o novo jutsu `JUT_KIRIGAKURE_NO_JUTSU_001` (Kirigakure no
  Jutsu — Rank B, Ninjutsu+Suiton, aplica Oculto garantido por 3 rodadas,
  autorado agora por não existir no doc 13, ver D018 #5).
- **Perfil de IA de Zabuza** (`zabuzaAction` em `ai.js`): ataca
  normalmente na Fase 1; lança Kirigakure (fica Oculto) ao entrar na Fase
  2, se ainda não estiver Oculto e tiver Chakra/cooldown livres;
  intensifica o ataque básico na Fase 3.
- **Ponte inimigo/boss->combatente** (`src/engine/combat/enemyBridge.js`):
  `createCombatantFromEnemy`/`createCombatantFromBoss` (alias, D018 #7).
- **Dev console**: novo painel "Inimigos e Boss" (tabela de arquétipos +
  fases/telegraphs/fraquezas de Zabuza) e novo painel "Boss Fight" —
  combate real e completo via `CombatState` entre o Naruto Genin real
  (plano fixo: Rasengan quando o Chakra alcança) e o Zabuza real
  controlado por `chooseAction`, com seed ajustável.
- **Testes de integração ponta a ponta** (`boss_fight_integration.test.js`):
  combate Naruto-real vs Zabuza-real controlado por IA sempre termina em
  tempo finito, Zabuza entra em Oculto ao alcançar a Fase 2 dentro de um
  combate real, mesma seed produz o mesmo desfecho.

### Concluído (Marco 6 — Vertical Slice)

- **UI jogável real** (`play.html` + `src/ui/game.js` + `play.css`):
  primeira tela de jogo de verdade do projeto — diferente do dev console
  de diagnóstico (D011). Tema visual "ninja dossier/pergaminho" seguindo
  a Style Bible (doc 14, ver DECISIONS.md D019 #1). Usa o MESMO motor de
  combate dos Marcos 1-5 (`CombatState`/`resolveAction`/`chooseAction`) —
  a UI só lê estado e monta ações, nenhuma regra de jogo duplicada.
- **Roteiro do Vertical Slice** (`src/data/vertical_slice.js`):
  `VERTICAL_SLICE_ENCOUNTERS` — 3 combates lineares (Emboscada na
  Estrada -> Mercenários de Gatō -> Zabuza), fora do sistema de
  Missões/Mapa real (Marco 7, D019 #2).
- **Campanha entre combates** (`src/engine/combat/campaign.js`):
  `snapshotSquad`/`applySquadSnapshot`/`survivingIds` — carrega HP/
  Chakra/recurso exclusivo dos sobreviventes de um combate para o
  próximo; quem cai fica de fora dos combates seguintes (D019 #4).
- **Fluxo de jogo completo**: tela de Esquadrão (os 4 Genin, Custo 8/12,
  sem seleção — D019 #5) -> 3 telas de Batalha (turno do jogador com
  escolha de ação/alvo por clique; turnos de inimigo resolvidos
  automaticamente por `chooseAction` com pequeno atraso visual, D019
  #7/#8) -> tela de Vitória do Vertical Slice ou Derrota, com "jogar de
  novo".
- **Hub principal** (`/index.html`, raiz do site): novo card "Naruto
  Roguelite" linkando para `games/naruto-roguelite/play.html` — primeira
  vez que este jogo fica visível para quem visita o site (D007 cumprida).
- 11 novos testes (`tests/combat/campaign.test.js`,
  `tests/data/vertical_slice.test.js`) — total do projeto: 250 testes. A
  UI jogável em si (`game.js`) não tem testes Node (é toda DOM) — validada
  via Playwright (ver Validado).
- DECISIONS.md D019 (UI separada do dev console, roteiro fixo fora de
  Missões/Mapa, campanha sem persistência de run real, sem seleção de
  esquadrão, posições iniciais uniformes, IA/fallback consistentes com o
  Marco 5, renderização por string HTML com listener delegado).

### Concluído (Marco 7 — Run / Missões / Mapa)

- **Gerador de Mapa** (`src/engine/run/mapGenerator.js`): grafo
  ramificado determinístico (via `seedManager.map`) — 2 camadas de nó
  comum (MISSAO/ELITE/DESCANSO, sorteados pelos pesos da Região) + 1
  camada final de nó BOSS; todo nó tem garantia de ao menos 1 aresta de
  entrada (sem nó inalcançável), ver DECISIONS.md D020 #4.
- **Resultado graduado de missão** (`src/engine/run/missionResult.js`):
  Sucesso Perfeito/Sucesso/Sucesso Parcial/Falha/Desastre a partir do
  HP%/baixas do esquadrão após o combate (D020 #2) — Falha não encerra a
  run, só Desastre.
- **Reclassificação de rank** (`src/engine/run/reclassify.js`):
  `maybeReclassifyNode` (15% de chance, memoizada por nó) + as 3
  escolhas do doc mapeadas para mecânica real — continuar/recuar (outra
  rota disponível)/buscar reforço (`reinforceSquad`, +25% HP, custa 1
  dia via `spendReinforceDay`) — ver D020 #3.
- **Estado de Run** (`src/engine/run/runState.js`): `createRun`/
  `availableNodes`/`resolveNode` — calendário (1 dia por nó resolvido),
  Crônica (`chronicle`, um registro por nó concluído), status IN_PROGRESS/
  VICTORY/DEFEAT; serializável em JSON puro, pronto para o SaveManager
  (save de run em si ainda não fiado, D020 #9).
- **Catálogo de Regiões** (`src/data/catalog/regions.js`): País das
  Ondas — pool de Inimigo por tier + boss fixo + pesos de tipo de nó como
  identidade mecânica (D020 #5); identidade de loot adiada (Itens ainda
  não existe).
- **Catálogo de Templates de Missão** (`src/data/catalog/missions.js`):
  4 templates (Batalha, Defesa, Caça, Duelo) — só os tipos de objetivo
  com mecânica de combate real; os outros 16 do vocabulário completo
  (`MISSION_OBJECTIVE_TYPES`, enums.js) ficam sem Template até mecânica
  não-combate existir (D020 #1).
- **Modo Run jogável** (`run.html` + `src/ui/run.js`): tela de Introdução
  (seed opcional) -> Mapa (nós clicáveis, Crônica visível) -> [tela de
  Reclassificação quando aplicável] -> Batalha (mesmo HUD/ações do
  Marco 6) ou Descanso instantâneo -> Vitória (boss derrotado) ou Derrota
  (Desastre). Link cruzado com `play.html` (Vertical Slice continua
  disponível como roteiro fixo já validado).
- 26 novos testes (`tests/run/mapGenerator.test.js`,
  `tests/run/missionResult.test.js`, `tests/run/reclassify.test.js`,
  `tests/run/runState.test.js`, `tests/data/regions_missions_catalog.test.js`)
  — total do projeto: 287 testes.
- DECISIONS.md D020 (escopo de nó/objetivo, resultado graduado,
  reclassificação, tamanho do mapa, identidade de Região, calendário,
  serialização, pendências explícitas) e D021 (UI do Modo Run duplica
  lógica de batalha de `game.js` deliberadamente, sem extrair módulo
  compartilhado ainda).

### Concluído (Marco 8 — Progressão)

- **Maestria por personagem** (`src/engine/progression/mastery.js`):
  XP concedido a todo o esquadrão ao fim de cada Run (soma do resultado
  graduado de cada nó da Crônica, D020 #2), níveis 0-5; NÃO concede
  nenhum bônus mecânico/de estatística (D022 #1) — só conhecimento
  (Arquivo Ninja) e progresso exibido.
- **Arquivo Ninja** (`src/engine/progression/archive.js`): registro
  genérico por Content ID, `???` até ser descoberto; inimigos/bosses/
  região entram ao serem enfrentados em combate (D022 #3) — o próprio
  esquadrão não passa pelo Arquivo (já é conhecido desde o início).
- **Ameaça** (`src/engine/progression/threat.js`): libera a faixa 0-20
  inteira após a 1ª vitória de Run (PROMPT MESTRE §38); reaproveita só
  as alavancas já existentes — nível de IA de inimigo comum (Marco 5) e
  chance de reclassificação de missão (Marco 7) — nenhuma stat de
  combatente é tocada (D022 #4).
- **Estado de Conta** (`src/engine/progression/accountState.js`):
  `createAccountState`/`applyRunEnd` — une Maestria/Arquivo/Ameaça/
  vitórias num único objeto serializável, persistido via `SaveManager`
  (Marco 0) no slot `"account"` a cada fim de Run.
- **Modo Run integrado** (`src/ui/run.js`): painel "Progressão da Conta"
  na tela de Introdução (Maestria por Genin, Arquivo Ninja com `???`
  para o não descoberto, Vitórias/Runs jogadas); seletor de Nível de
  Ameaça quando liberado; resumo de XP/level-up/descobertas na tela de
  Vitória/Derrota.
- 27 novos testes (`tests/progression/mastery.test.js`,
  `tests/progression/archive.test.js`, `tests/progression/threat.test.js`,
  `tests/progression/accountState.test.js`) — total do projeto: 313 testes.
- DECISIONS.md D022 (Maestria sem bônus de status, XP por missão
  concluída para o esquadrão inteiro, Arquivo genérico por Content ID,
  Ameaça via IA/reclassificação sem tocar stats, `threatUnlocked`
  booleano, conta como único save novo, Pós-game/Economia Permanente
  fora de escopo).

### Concluído (Marco 9 — Protótipo 3 Atos, primeiro passo)

- **Gerador procedural de Inimigo** (`src/engine/generator/
  enemyGenerator.js`): `generateEnemy`/`generateMiniBoss` combinam Rank
  (curva de stats já calibrada no Marco 5) + Natureza (Tag já catalogada
  no Marco 2, +15% de sabor em 1 atributo) + Traço/Arma (bancos de
  palavras genéricos) — "Gerador combina peças validadas, não inventa
  tudo do zero" (doc 09). Nunca fabrica jutsu novo (só Ataque Básico);
  nunca registra na Registry `enemies` (ficha efêmera, D023 #1).
- **Mini-Boss como capstone sem boss autorado** (`mapGenerator.js#
  buildBossNode`): tier `MINI_BOSS` (`ENEMY_TIERS` desde o Marco 0,
  nunca usado até agora) com âncora de stats própria e IA `ELITE`
  genérica — honesto sobre não ser um Boss de verdade (fases/telegraph,
  CANON_RULES #30) sem fabricar um design que não existe ainda (D023 #3).
- **`map.generatedEnemies`**: objeto plano separado de `enemyIds`
  (compatibilidade total com a Região de pool fixo do Marco 7 — País das
  Ondas continua byte-a-byte igual, testado).
- **2ª Região: Floresta da Morte** (`src/data/catalog/regions.js`, Ato
  Ascensão, `useGenerator: true`) — cenário do Exame Chūnin (já citado
  como pós-game suportado, PROMPT MESTRE §39), sem personagens nomeados
  específicos do arco.
- **Modo Run com seleção de Região** (`src/ui/run.js`): seletor na
  Introdução; `buildEnemyTeam`/o card de nó no Mapa resolvem inimigo via
  `bosses` -> `enemies` -> `generatedEnemies`; corrigida uma tela de
  Vitória que estava fixa em "País das Ondas"/"Zabuza" mesmo jogando
  outra Região (bug pego na validação Playwright deste marco, ver
  Validado).
- 8 novos testes (`tests/generator/enemyGenerator.test.js`, extensão de
  `tests/run/mapGenerator.test.js` e `tests/data/regions_missions_catalog.test.js`)
  — total do projeto: 325 testes.
- DECISIONS.md D023 (gerador só combina peças validadas, Mini-Boss
  honesto em vez de Boss fabricado, `generatedEnemies` separado de
  `enemyIds`, Floresta da Morte como 2ª Região, "calibrar" interpretado
  como validar com mais conteúdo em vez de mudar fórmulas sem dado novo).
- **Boss autorado para a Floresta da Morte: Serpente da Floresta da
  Morte** (`src/data/catalog/bosses.js`) — fecha a pendência D023 #3.
  3 fases por %HP (Emboscada/Constrição/Fúria Feroz), perfil de IA
  bespoke `serpenteAction` (`ai.js`), 2 Jutsus novos só para este boss
  (`JUT_CONSTRICAO_SUFOCANTE_001` aplica Imobilizado,
  `JUT_MORDIDA_PERFURANTE_001` aplica Sangrando — ambos Estados já
  catalogados desde o Marco 2, nenhum novo criado). `region.bossId`
  agora aponta pra este boss (a Região continua `useGenerator: true`
  só para MISSAO/ELITE) — `mapGenerator.js` já suportava essa
  combinação híbrida sem nenhuma mudança de código.
- 9 novos testes (extensão de `tests/data/enemies_bosses_catalog.test.js`
  e `tests/combat/ai.test.js`, novo
  `tests/combat/serpente_fight_integration.test.js`) — total do
  projeto: 334 testes.
- DECISIONS.md D024 (Serpente como fera genérica em vez de personagem
  canônico nomeado, 3 fases seguindo o formato de Zabuza, 2 Jutsus
  novos reaproveitando Estados já catalogados, stats mais Taijutsu/menos
  Chakra que Zabuza, `bossId` real substituindo o Mini-Boss gerado).

### Concluído (Marco 9, pendências finais: Facções/Reputação + 3ª Região)

- **Catálogo de Facções** (`src/data/catalog/factions.js`): as 14
  facções nomeadas no doc 06 (Konoha, Suna, Kiri, Kumo, Iwa, Ame, Oto,
  Taki, Kusa, País do Ferro, Akatsuki, ANBU, Raiz, Nukenin), cada uma só
  `{id, name, description}` — o doc não dá mais dado nenhum.
- **Reputação de Facção** (`src/engine/progression/reputation.js`): um
  valor por facção em `[-50, 50]`, mapeado para os 5 `REPUTATION_LEVELS`
  já canonizados no Marco 0; ajusta com o resultado de cada missão da
  Crônica de uma Run (+8/+5/+2/-3/-8 para Sucesso Perfeito/Sucesso/
  Sucesso Parcial/Falha/Desastre, limiares provisórios). Persistida em
  `accountState.js` (nível conta, como Maestria/Arquivo/Ameaça) — cada
  Região agora tem um `factionId` opcional (a facção "dona"/anfitriã),
  ver DECISIONS.md D026.
- **UI**: painel "Progressão da Conta" (`run.js`) mostra a Reputação de
  toda Facção já descoberta; telas de Vitória/Derrota mostram o delta de
  reputação da run recém-terminada.
- **3ª Região/Ato: Suna** (`REG_SUNA_001`, Ato Mundo Shinobi,
  `useGenerator: true` para MISSAO/ELITE, mesmo padrão de D023) e um 3º
  boss autorado, o **Escorpião do Deserto** (`BOSS_ESCORPIAO_DESERTO_001`)
  — fera genérica do bioma, não personagem canônico nomeado (mesmo
  espírito de D024): 3 fases (Tocaia na Areia/Ferroada/Fúria das Pinças),
  2 Jutsus novos (`JUT_FERROADA_PARALISANTE_001` aplica Paralisado,
  `JUT_INVESTIDA_DAS_PINCAS_001` aplica Vulnerável — Estados já
  catalogados desde o Marco 2) e perfil de IA bespoke `escorpiaoAction`.
- 20 novos testes (`tests/data/factions_catalog.test.js`,
  `tests/progression/reputation.test.js`, novo
  `tests/combat/escorpiao_fight_integration.test.js`, extensão de
  `tests/combat/ai.test.js`, `tests/data/catalog.test.js`,
  `tests/data/enemies_bosses_catalog.test.js`,
  `tests/data/regions_missions_catalog.test.js` e
  `tests/progression/accountState.test.js`) — total do projeto: 371
  testes.
- DECISIONS.md D026 (Facções como dado mínimo do doc, Reputação numérica
  provisória com limiares documentados, Região->Facção 1:1, persistência
  em accountState, Suna como 3º Ato/Região, Escorpião do Deserto como
  3º boss autorado, Gerador de Missão completo do doc 04 continua fora
  de escopo).

### Concluído (Marco 10 — Expansão, 1º lote: Itens consumíveis)

- **Catálogo de Itens** (`src/data/catalog/items.js`): 6 itens
  consumíveis/ferramentas reaproveitando os Content IDs já pré-declarados
  no Asset Manifest do Marco 0 (Kunai, Shuriken, Bomba de Fumaça, Selo
  Explosivo, Pílula do Soldado, Antídoto) — nenhum nome novo inventado,
  ver DECISIONS.md D025 #2 (testado explicitamente contra o Asset
  Manifest em `items_catalog.test.js`).
- **`ACTION_TYPES.ITEM` implementado** (`handleItem` em
  `src/engine/combat/actions.js`): fecha o stub `NOT_IMPLEMENTED_YET`
  aberto desde o Marco 1 (D014). Reaproveita os 4 efeitos genéricos já
  existentes de Jutsu (`DAMAGE` via `resolveAttack`, `HEAL`, `CLEANSE`,
  `UTILITY` via `applyJutsuEffects`) + um efeito novo exclusivo de Item,
  `RESTORE_CHAKRA` (nenhum Jutsu do catálogo restaura Chakra ainda,
  D025 #3). Valida alcance (`isValidRangeTarget`) e consome 1 unidade do
  inventário (`consumeItem`) antes de aplicar o efeito.
- **Inventário do Combatente** (`src/engine/combat/combatant.js`): novo
  campo `inventory: Record<itemId, quantidade>` + `hasItem`/`consumeItem`.
- **Kit ninja padrão** (`characterBridge.js#DEFAULT_STARTING_KIT`): todo
  Personagem entra em combate com o mesmo kit fixo (2 Kunai, 1 Bomba de
  Fumaça, 1 Pílula do Soldado, 1 Antídoto) — sem Economia/loja/loadout de
  itens ainda, é provisório e documentado (D025 #4). Inventário NÃO
  persiste entre combates de uma Run (reseta a cada `CombatState` novo,
  diferente de HP/Chakra/recurso via `campaign.js` — D025 #5).
- **UI jogável** (`game.js` e `run.js`): itens do inventário aparecem
  como opções de ação normais no HUD de combate (rótulo com quantidade
  restante), com feedback de log dedicado para dano/cura/Chakra
  restaurado/Estados removidos.
- 19 novos testes (`tests/combat/inventory.test.js`,
  `tests/data/items_catalog.test.js`, extensão de
  `tests/combat/actions.test.js` e `tests/combat/characterBridge.test.js`)
  — total do projeto: 353 testes.
- DECISIONS.md D025 (escopo travado em itens consumíveis/ferramenta de
  uso único, reaproveitamento dos 6 Content IDs do Marco 0, `handleItem`
  reaproveitando os efeitos de Jutsu + `RESTORE_CHAKRA` novo, kit fixo por
  Personagem em vez de Economia, inventário não persistente entre
  combates, Equipamento/Economia da Run/Economia Permanente/Armas Lendárias
  explicitamente fora de escopo deste lote).

### Concluído (Marco 10 — Expansão, 2º lote: Economia da Run — Ryō)

- **Ryō** (`src/engine/run/economy.js` + `run.ryo` em `runState.js`):
  um valor simples por Run (não persiste entre runs, diferente de
  Reputação/Maestria/Arquivo/Ameaça, que são da conta) que soma a cada
  nó resolvido, por resultado de missão (`ryoForMissionResult`, mesmo
  padrão de `xpForMissionResult`/`deltaForMissionResult` dos lotes
  anteriores).
- **UI** (`run.js`): total de Ryō acumulado visível na tela de Mapa e
  nas telas de Vitória/Derrota.
- **Só o ganho existe neste lote — nenhum jeito de gastar Ryō ainda**
  (sem nó LOJA, sem preço em Item, sem UI de "atribuir a qual membro do
  esquadrão") — deliberado e documentado, mesmo espírito de D025 (Itens
  sem abrir Equipamento junto); a UI deixa isso explícito para não
  parecer bug.
- 4 novos testes (`tests/run/economy.test.js`, extensão de
  `tests/run/runState.test.js`) — total do projeto: 375 testes.
- DECISIONS.md D027 (Ryō como campo de Run não de conta, tabela fixa de
  valores por resultado de missão, gasto/loja/preço/atribuição de item
  comprado explicitamente fora de escopo deste lote).

## Validado

- `npm test` (`node --test`) dentro de `games/naruto-roguelite/`: **375/375
  passando**.
- Dev console verificado no Chromium headless (Playwright), Marcos 0-5:
  engine carrega sem erros de página, todos os módulos ES retornam HTTP
  200 (único 404 é o `favicon.ico` padrão do navegador), botões "Salvar
  demo"/"Limpar" fazem round-trip de save corretamente, seção de
  validadores detecta as 4 classes de problema esperadas, painel de
  Combate roda um 1v1 completo com o Naruto Genin real (Rasengan/Kage
  Bunshin/Clones aparecendo no HUD e no log), painel de Personagens
  mostra os 4 Genin com Custo de Esquadrão total 8/12, painel "Inimigos e
  Boss" lista os 4 arquétipos + as 3 fases de Zabuza, painel "Boss Fight"
  roda um combate completo Naruto-real vs Zabuza-real controlado por IA
  até um vencedor, com o log mostrando Zabuza usando Ataque Básico na
  Fase 1 e Kirigakure no Jutsu ao entrar na Fase 2.
- **UI jogável (`play.html`) verificada no Chromium headless
  (Playwright)**: tela de Esquadrão renderiza os 4 Genin com HP/Chakra/
  recurso corretos; "Iniciar Missão" entra no 1º combate; jogado de
  ponta a ponta clicando ação->alvo (Ataque Básico e um Jutsu real
  testados) através dos 3 combates até a tela de Vitória final
  ("País das Ondas protegido!"), sem nenhum erro de console (só o 404
  esperado do `favicon.ico`); confirmado que HP/Chakra do esquadrão
  realmente carrega de um combate para o outro (snapshot); confirmado
  que a IA dos inimigos age sozinha e o turno sempre avança mesmo
  quando a ação preferida falha.
- **Modo Run (`run.html`) verificado no Chromium headless (Playwright)**:
  tela de Introdução -> Mapa com seed customizada; jogado de ponta a
  ponta (múltiplas seeds) até a tela de Vitória, incluindo passar por um
  nó DESCANSO (cura confirmada) sem erros de console; um seed com nó
  reclassificado (`⚠️`) testado explicitamente — a tela de escolha
  Continuar/Recuar/Buscar Reforço renderiza corretamente e "Recuar"
  devolve ao Mapa com o nó ainda marcado como reclassificado (rank não
  re-sorteado); Crônica final confere com os nós realmente visitados.
- **Progressão (Marco 8) verificada no Chromium headless (Playwright)**:
  conta nova mostra Maestria 0/Arquivo 0-6/Ameaça bloqueada; uma Run
  jogada até a Vitória concede XP de Maestria (visível no resumo da
  tela final), descobre as entradas do Arquivo correspondentes aos
  inimigos/região realmente enfrentados (o resto continua `???`), e
  libera Ameaça; **persistência confirmada via `localStorage` real**
  (reload completo da página, não só re-render em memória) — a conta
  volta com Vitórias/Maestria/Arquivo intactos e o seletor de Nível de
  Ameaça aparece na Introdução.
- **Gerador procedural + Floresta da Morte (Marco 9) verificado no
  Chromium headless (Playwright)**: seletor de Região troca a descrição/
  mapa exibidos; nós de Missão/Elite mostram nomes gerados reais (ex:
  "Veterano de Doton (Traiçoeiro, Correntes)", "Elite de Raiton
  (Disciplinado, Espada Curta)"); combate contra inimigo gerado aplica
  dano/crítico/movimento normalmente; Run jogada até vencer o capstone
  Mini-Boss gerado ("Capitão de Hyōton..."), tela de Vitória mostra o
  nome certo da Região/inimigo (bug de texto fixo "País das Ondas/
  Zabuza" encontrado e corrigido durante esta validação); sem nenhum
  erro de página em nenhuma das execuções.
- **Boss autorado da Floresta da Morte (Marco 9) verificado no Chromium
  headless (Playwright)**: Run jogada até o nó "Confronto Final" contra
  a Serpente da Floresta da Morte real (não mais o Mini-Boss gerado);
  vitória confirmada com o nome certo do boss na tela final; sem erros
  de página.
- **Itens (Marco 10, 1º lote) verificado no Chromium headless
  (Playwright)**: em `play.html`, Kunai usado num combate real (Bandido)
  aparece como opção de ação com quantidade, aplica dano corretamente
  (HP 55→41), consome 1 unidade do inventário, turno avança normalmente;
  sem nenhum erro de console.
- **Facções/Reputação + Suna (Marco 9, pendências finais) verificado no
  Chromium headless (Playwright)**: um bug real foi pego nesta validação
  e corrigido antes do commit — `renderReputationEntries` (`run.js`)
  usava uma variável fora de escopo (`r.id` dentro de um `.filter`
  aninhado) e quebrava a tela de Introdução assim que havia alguma
  Região descoberta; corrigido (filtro e map combinados no mesmo
  `.filter`/`.map` sobre o mesmo array). Depois da correção: seletor de
  Região lista Suna; Run jogada de ponta a ponta em Suna (seed fixa) até
  a Vitória contra o Escorpião do Deserto real, sem erros de console;
  tela de Vitória mostra "Reputação com Sunagakure: +13"; voltando à
  Introdução, o painel "Progressão da Conta" mostra "Sunagakure: BOA
  (+13)"; **persistência confirmada via reload completo da página**
  (`localStorage` real, não só re-render em memória).
- **Economia da Run — Ryō (Marco 10, 2º lote) verificado no Chromium
  headless (Playwright)**: Run jogada de ponta a ponta; Ryō começa em 0
  na tela de Mapa e sobe conforme os nós são resolvidos (0 -> 85 ao
  longo da run testada); total final aparece corretamente na tela de
  Vitória com a nota "ainda sem loja pra gastar"; sem erros de console.
- Revisão manual do diff antes do commit.

## Em andamento

Marco 10 — Expansão: 1º e 2º lotes (Itens consumíveis, Economia da Run
— só o ganho de Ryō) concluídos; próximo lote a definir.

## Pendente (próximos marcos/aprofundamentos, não começados)

- Marco 9 — Protótipo 3 Atos: Gerador de Missão completo (facção/
  complicação/modificador/recompensa/flags do doc 04) — Facções já
  existem (D026), mas isso ainda não é o Gerador de Missão inteiro; um
  4º Ato/Região é sempre possível depois, sem pressa (CANON_RULES —
  "qualidade > quantidade").
- Marco 10 — Expansão: próximos lotes de conteúdo — fechar o ciclo de
  gasto da Economia da Run (nó LOJA, preço de Item, atribuição de
  compra a um membro do esquadrão — D027 #3/#4), Equipamento persistente
  (ARMA/CORPO/ACESSORIO), mais Personagens/Jutsus/Inimigos, etc.

## Bugs conhecidos

Nenhum.

## Assets faltantes

Nenhuma imagem foi gerada ainda (por design — PROMPT MESTRE §63: não gerar
sem pedido explícito do usuário).

- **67 entradas P0** com Asset ID + prompt visual completo, status
  `prompt_ready`, prontas para o usuário gerar e devolver para integração
  (personagens do vertical slice, Zabuza, jutsus iniciais, cenários do
  País das Ondas, inimigos genéricos, itens, ícones de estado, UI).
- **58 itens no backlog P1** (personagens/regiões/transformações/elementos
  secundários) — só têm nome; viram entrada formal quando o conteúdo
  correspondente for autorado.
- Ver `src/content/asset_manifest.js` para a lista completa e
  `resolveAssetSrc()` para os placeholders usados enquanto isso.

## Escala atual vs. meta de longo prazo

| Tipo | Atual | Meta |
|---|---|---|
| Personagens/versões | 4 | 500–800+ |
| Jutsus | 17 | 1.000–1.500+ |
| Passivas | 1 | 400–600+ |
| Itens | 6 | 500+ |
| Inimigos comuns | 4 (+ gerados proceduralmente) | — |
| Bosses/elites | 3 | 200–300+ |
| Eventos | 0 | 300+ |
| Templates de missão | 4 | 200+ |
| Regiões | 3 | 50+ |
| Facções | 14 (vocabulário do doc 06) | — (vocabulário fechado) |
| Conquistas | 0 | 500+ |
| Tags | 21 | — (vocabulário fechado) |
| Estados | 29 | — (vocabulário fechado) |
| Reações | 5 | — (cresce conforme combinações fizerem sentido) |

(Itens/etc. esperados em 0 até um marco futuro, em lotes, conforme
CANON_RULES.md "qualidade > quantidade". Personagens/Jutsus/Passivas
começaram com o lote do Vertical Slice (4/13/1, Marco 9 soma 2+2 Jutsus
dos bosses da Floresta da Morte e de Suna); Inimigos/Bosses com o
primeiro lote do País das Ondas (4/1, Marco 5), Marco 9 soma o 2º e 3º
Boss (Serpente, Escorpião do Deserto) e passa a gerar inimigos comuns/
elite proceduralmente na Floresta da Morte e em Suna; Templates de
Missão/Regiões com o primeiro lote do Marco 7 (4/1, Marco 9 soma a 2ª e
3ª Região); Facções com o vocabulário completo do doc 06 de uma vez (14,
Marco 9 — mesmo espírito de Tags/Estados: nomeado por inteiro no doc,
não "em lote"); Itens com o primeiro lote do Marco 10 (6 consumíveis/
ferramentas, reaproveitando os Content IDs do Marco 0) — próximos lotes
maiores vêm em Konoha Genins/etc. (PROMPT MESTRE §78). Tags/Estados/
Reações já são o vocabulário completo do doc 01 — não crescem "em lote"
do mesmo jeito.)

## Próximo passo

As duas pendências do Marco 9 (Protótipo 3 Atos) que o usuário pediu
para fechar antes de continuar o Marco 10 estão feitas: sistema de
Facções e Reputação (doc 06, D026) e uma 3ª Região/Ato — Suna, Ato Mundo
Shinobi, com o Escorpião do Deserto como 3º boss autorado. O Marco 9
está considerado concluído e validado por ora; o Gerador de Missão
completo do doc 04 (facção/complicação/modificador/recompensa/flags) e
um eventual 4º Ato ficam como aprofundamento futuro, sem bloquear nada.

Marco 10 — Expansão segue: o 1º lote (Itens consumíveis/ferramenta, 6
itens, `ACTION_TYPES.ITEM` funcional — D025) e o 2º lote (Economia da
Run — Ryō ganho por resultado de missão, sem loja pra gastar ainda —
D027) já foram entregues. Próximo lote a definir — candidatos: fechar o
ciclo de gasto do Ryō (nó LOJA, preço de Item, atribuição de compra a um
membro do esquadrão), Equipamento persistente do doc 03 (ARMA/CORPO/
ACESSORIO recalculando atributos), mais Personagens/Jutsus/Inimigos, ou
o Gerador de Missão completo agora que Facções existem.

Pendências explícitas que continuam em aberto de marcos anteriores:
salvar/carregar uma Run em andamento (D020 #9), "recuar" voltando uma
camada no mapa (D020 #9), persistência de cooldowns/Estados/inventário
entre nós de uma mesma run (D019 #4/D020 #6/D025 #5), passivas
alternativas/skins de Maestria com ficha real (D022 #1), Pós-game e
Economia Permanente com Legado/Tickets/Fragmentos (D022 #7), Equipamento
persistente (D025 #6), nó LOJA/preço de Item/gasto de Ryō (D027 #3/#4),
Gerador de Missão completo do doc 04 (D026 #8).

# CHANGELOG — Naruto Roguelite

Formato livre, em ordem cronológica reversa (mais recente primeiro). Este
changelog é interno ao subprojeto `games/naruto-roguelite/`.

## Primeira leva de arte real (127 imagens) substitui os placeholders SVG

### Adicionado

- `assets/<categoria>/<assetId>.png` — 127 imagens enviadas pelo usuário
  (geradas fora desta sessão; eu não gero imagem, PROMPT MESTRE §63),
  cobrindo personagens (retratos/full body/combate), o boss Zabuza,
  jutsus (ícone+arte), cenários, inimigos, itens, ícones de Estado/
  elemento/facção, UI (frames, nós de mapa, recursos, raridades,
  roleta, mapa) e efeitos de transformação.
- `src/content/asset_manifest.js` — `GENERATED_ASSET_IDS` (Set estático)
  marca as 127 entradas como `status: 'generated'`; 60 itens do
  `assetBacklogP1` promovidos a entradas formais (agora com `contentId`
  quando a entidade de catálogo já existe); 2 entradas novas de ícone de
  facção (`ICON_FACTION_KONOHA_001`/`ICON_FACTION_KIRI_001`); os 4
  sprites `COMBAT_ENEMY_*` ganharam `contentId` retroativo agora que as
  entidades `ENEMY_*` existem (Marco 5). `assetBacklogP1` fica vazio.
  Novo helper `findAssetIdByContent(contentId, category)`.
- `src/ui/game.js` — retrato real na tela de Esquadrão e retrato pequeno
  em cada card de combatente em Batalha (tenta COMBAT → ART → PORTRAIT,
  pois o boss só tem ART/PORTRAIT); `PORTRAIT_COLORS`/`PORTRAIT_EMOJI`
  removidos.
- `src/ui/run.js` — ícone real por tipo de nó no Mapa da Run
  (`UI_NODE_*`, DESCANSO mapeado pra `UI_NODE_HOSPITAL_001`).
- `play.css` — `.vs-portrait`/`.vs-combatant-portrait`/`.vs-node-icon`
  ajustados para `<img>` real (`object-fit`) em vez do bloco de cor +
  emoji anterior.
- DECISIONS.md D034.

### Validado

- `npm test`: 399/399 passando (2 testes de `asset_manifest.test.js`
  reescritos — a premissa "nenhuma imagem gerada" do Marco 0 não é mais
  verdade).
- `play.html`, `run.html` e `index.html` (dev console) testados em
  Chromium headless (Playwright): retratos dos 4 Genin aparecem na tela
  de Esquadrão e nos cards de combate em Batalha; ícones de nó (Mercador/
  Missão) aparecem no Mapa da Run; galeria do Asset Manifest no dev
  console mostra 127/127 `generated`; nenhum erro de console/rede além
  de um 404 de favicon.ico (sem relação com os assets).

## Jutsu passa a poder gastar o recurso exclusivo do ator (`requiresResource`)

### Adicionado

- `src/data/catalog/jutsus.js` — novo campo `requiresResource: { amount }`
  (mesmo formato de `grantsResource`); Bunshin Feint (Naruto) é o
  primeiro Jutsu a usar — exige e gasta 1 Clone de verdade.
- `src/engine/combat/actions.js` — `handleJutsu` checa e gasta o
  recurso (via `spendResource`) no mesmo momento do custo de Chakra;
  sem recurso suficiente, falha com `INSUFFICIENT_RESOURCE` sem
  consumir o turno. Novo `result.resourceSpent`.
- `src/ui/game.js`/`src/ui/run.js` — opção de ação desabilitada sem
  recurso suficiente (mesmo tratamento de Chakra insuficiente/
  cooldown); detalhe mostra "· exige N &lt;recurso&gt;".
- 3 novos testes (`tests/combat/actions.test.js`) — total do projeto:
  399 testes.
- DECISIONS.md D033 (fecha a lacuna registrada em D017/D032 #2; nenhuma
  sinergia adicional tipo Rasengan-com-Clones foi aberta neste lote).

### Validado

- `npm test`: 399/399 passando.
- `run.html` testado em Chromium headless (Playwright): com 0 Clones,
  Bunshin Feint aparece desabilitada com "exige 1 Clones"; após usar
  Kage Bunshin, a opção habilita e foi usada de fato num combate real;
  sem erros de console.

## Fichas reais para os 9 jutsus pendentes dos 4 Genin (fecha D017 #2)

### Adicionado

- `src/data/catalog/jutsus.js` — 9 fichas novas: Combo Improvisado/
  Bunshin Feint (Naruto), Shuriken Combo/Wire Trap (Sasuke), Chakra
  Focus/Precise Kunai/Inner Sakura (Sakura — suprema), Kunai Trap/Kage
  Mane Complete Restraint (Shikamaru — suprema) — nomes citados
  literalmente no doc 12, sem ficha em doc 13 até este lote; cada uma
  reaproveita só efeitos/Estados já catalogados.
- `src/data/catalog/characters.js` — os 4 Genin não têm mais
  `pendingAtivas`/`pendingSuprema`; Sakura e Shikamaru ganham Suprema
  de verdade pela primeira vez.
- 1 novo teste (`characters_catalog.test.js`) + extensão da contagem de
  Jutsus — total do projeto: 396 testes.
- DECISIONS.md D032 (mecânica reaproveitada, Bunshin Feint não consome
  o recurso Clones ainda — `spendResource` sem fiação em Jutsu —,
  `pendingAtivas`/`pendingSuprema` removidos por completo).

### Validado

- `npm test`: 396/396 passando.
- `run.html` testado em Chromium headless (Playwright): as 9 fichas
  aparecem na opção de ação do personagem certo; Bunshin Feint, Inner
  Sakura e Kage Mane Complete Restraint usados de verdade num combate;
  sem erros de console.

## Marco 10 — Expansão (5º lote: as 5 Armas Lendárias restantes)

### Adicionado

- `src/data/catalog/items.js` — as 5 Armas Lendárias que faltavam das 9
  citadas no doc 03: Kiba (+Velocidade/-Defesa de Chakra), Hiramekarei
  (+Defesa Física/-Velocidade), Nuibari (+Precisão/-Evasão), Kabutowari
  (+Taijutsu/-Precisão), Shibuki (+Genjutsu/-Defesa Física) — mesmo
  formato de D029, sem mudança de código (equipment.js/
  characterBridge.js/painel "Equipamento" já eram genéricos).
- Testes existentes (`items_catalog.test.js`) estendidos para os novos
  totais (15 Itens, 9 de Equipamento).
- DECISIONS.md D031 (as 5 Armas restantes, tradeoffs provisórios,
  diversifica atributos usados, CORPO/ACESSORIO/Economia de Armas
  continuam fora de escopo).

### Validado

- `npm test`: 395/395 passando.
- `run.html` testado em Chromium headless (Playwright): as 5 novas
  aparecem no seletor de Equipamento; equipando Kabutowari com seed
  fixa, Taijutsu do Naruto sobe de 32 para 46 (+14); sem erros de
  console.

## Salvar/carregar uma Run em andamento (fecha D020 #9)

### Adicionado

- `src/ui/run.js` — `saveRunProgress`/`continueSavedRun`: autosave no
  slot `'run'` do `SaveManager` (Marco 0) sempre que a tela de Mapa é
  exibida; botão "Continuar Run salva" na Introdução (Região/Dia/Ryō);
  save apagado quando a Run termina (Vitória/Derrota).
- 1 novo teste (`tests/run/runState.test.js` — round-trip de uma Run
  real por `SaveManager`) — total do projeto: 395 testes.
- DECISIONS.md D030 (autosave automático só no Mapa — nunca no meio de
  uma Batalha, RNG não perfeitamente contínua entre save/load, o que é
  salvo, save apagado ao terminar, sobrescrita simples sem confirmação
  de "abandonar").

### Validado

- `npm test`: 395/395 passando.
- `run.html` testado em Chromium headless (Playwright): recarga
  completa da página confirma o save em `localStorage`; "Continuar"
  retoma exatamente no Mapa; progresso do Dia 2 se mantém após um 2º
  reload+continue; save é apagado após a Vitória; sem erros de console.

## Marco 10 — Expansão (4º lote: Equipamento persistente — slot ARMA)

### Adicionado

- `src/data/catalog/items.js` — 4 Armas Lendárias (categoria ARMA):
  Kubikiribōchō, Kusanagi, Samehada, Gunbai — os 4 primeiros nomes da
  lista literal do doc 03; Content IDs novos (sem entrada no Asset
  Manifest, diferente do lote 01). Cada uma com `statBonus`
  (+1 atributo/-1 atributo, tradeoff real).
- `src/engine/combat/equipment.js` — `applyEquipmentBonuses`: soma o
  `statBonus` de cada Item de Equipamento no bloco de atributos,
  aplicado 1 vez na montagem do Combatente (não é ação de combate).
- `src/engine/combat/characterBridge.js` — `createCombatantFromCharacter`
  ganha o parâmetro `equippedItems` (fichas já resolvidas pela UI).
- `src/ui/run.js` — painel "Equipamento" na Introdução: 1 seletor de
  Arma por membro do esquadrão, livre e sem custo; o bônus aparece
  automaticamente em qualquer lugar que já lia `actor.attributes`.
- 12 novos testes (`tests/combat/equipment.test.js`, extensão de
  `tests/combat/characterBridge.test.js` e
  `tests/data/items_catalog.test.js`) — total do projeto: 394 testes.
- DECISIONS.md D029 (só slot ARMA com as 4 primeiras Armas Lendárias
  reais do doc, "muda estilo" simplificado para bônus fixo com
  tradeoff, aplicado 1 vez na montagem do Combatente, escolha livre por
  Run sem Economia de Armas, não vendível no nó LOJA, CORPO/ACESSORIO/
  Economia de Armas fora de escopo).

### Validado

- `npm test`: 394/394 passando.
- `run.html` testado em Chromium headless (Playwright): baseline do
  Ataque Básico do Naruto confere Taijutsu 32 (sem arma); equipando
  Kubikiribōchō com a mesma seed, o mesmo combate mostra Taijutsu 44
  (32+12, exatamente o `statBonus` da arma); sem erros de console.

## Marco 10 — Expansão (3º lote: nó LOJA fecha o ciclo do Ryō)

### Adicionado

- `src/engine/enums.js` — `NODE_TYPES.LOJA`.
- `src/engine/run/mapGenerator.js` — `buildLojaNode`: mesmo tratamento
  genérico de DESCANSO, sem `enemyIds`.
- `src/data/catalog/regions.js` — peso LOJA adicionado às 3 Regiões
  existentes.
- `src/data/catalog/items.js` — campo `price` em todo Item (10-32 Ryō,
  provisório).
- `src/engine/run/economy.js` — `canAfford`/`buyItem`: deduz `run.ryo` e
  soma 1 unidade em `run.purchasedInventory[characterId][itemId]` (novo
  campo de `runState.js`).
- `src/engine/combat/characterBridge.js` — `createCombatantFromCharacter`
  ganha o parâmetro `extraInventory`, somado por cima do
  `DEFAULT_STARTING_KIT` — é como o inventário comprado no LOJA chega ao
  Combatente em cada combate seguinte da mesma Run.
- `src/ui/run.js` — tela `SHOP`: seletor de "para quem comprar" + botão
  "Comprar" por Item (desabilitado sem Ryō suficiente); "Continuar
  viagem" resolve o nó (consome 1 dia) e volta ao Mapa.
- 13 novos testes (extensão de `tests/run/economy.test.js`,
  `tests/run/runState.test.js`, `tests/combat/characterBridge.test.js`,
  `tests/data/items_catalog.test.js`, `tests/run/mapGenerator.test.js`)
  — total do projeto: 385 testes.
- DECISIONS.md D028 (LOJA como nó genérico, preço provisório por Item,
  compra como bônus de inventário por Run — não pool compartilhado —,
  UI simples sem carrinho, visitar a loja consome 1 dia, Equipamento
  persistente continua fora de escopo).

### Validado

- `npm test`: 385/385 passando.
- `run.html` testado em Chromium headless (Playwright): Run jogada até
  ganhar Ryō, Kunai comprado para o Naruto no Mercador (Ryō 40 -> 25,
  contador de compras exibido), "Continuar viagem" avança o dia; no
  combate seguinte, confirmado que só o Naruto mostra "Kunai (3x)" (kit
  fixo + comprado) enquanto os outros membros do esquadrão continuam com
  "Kunai (2x)"; sem erros de console.

## Marco 10 — Expansão (2º lote: Economia da Run — Ryō)

### Adicionado

- `src/engine/run/economy.js` — `ryoForMissionResult`/`ryoForChronicle`:
  mesmo padrão de `mastery.js`/`reputation.js` (tabela fixa de valores
  por `MISSION_RESULTS`, provisória).
- `src/engine/run/runState.js` — campo `run.ryo`, somado a cada
  `resolveNode` de acordo com o resultado.
- `src/ui/run.js` — total de Ryō acumulado visível na tela de Mapa e
  nas telas de Vitória/Derrota.
- 4 novos testes (`tests/run/economy.test.js`, extensão de
  `tests/run/runState.test.js`) — total do projeto: 375 testes.
- DECISIONS.md D027 (Ryō como campo de Run, não de conta; só o ganho
  existe neste lote — loja/preço de item/atribuição de compra a um
  membro do esquadrão ficam para o próximo lote, mesmo espírito de
  D025 #1).

### Validado

- `npm test`: 375/375 passando.
- `run.html` testado em Chromium headless (Playwright): Ryō sobe de 0 a
  85 ao longo de uma Run completa, exibido corretamente no Mapa e na
  tela de Vitória; sem erros de console.

## Marco 9 — Pendências finais (Facções/Reputação + 3ª Região: Suna)

### Adicionado

- `src/data/catalog/factions.js` — catálogo de Facções: as 14 nomeadas
  no doc 06 (Konoha, Suna, Kiri, Kumo, Iwa, Ame, Oto, Taki, Kusa, País do
  Ferro, Akatsuki, ANBU, Raiz, Nukenin), só `{id, name, description}`.
- `src/engine/progression/reputation.js` — Reputação de Facção: valor
  por facção em `[-50, 50]`, mapeado para os 5 `REPUTATION_LEVELS`
  (Marco 0); ajusta com cada resultado de missão da Crônica de uma Run
  (+8/+5/+2/-3/-8 para Sucesso Perfeito/Sucesso/Sucesso Parcial/Falha/
  Desastre). Persistida em `accountState.js` (nível conta, como
  Maestria/Arquivo/Ameaça) — `applyRunEnd` ganha um `factionId` opcional.
- `src/data/catalog/regions.js` — toda Região ganha `factionId` opcional
  (País das Ondas -> Nukenin, Floresta da Morte -> Konoha, Suna -> Suna).
- `src/ui/run.js` — painel "Progressão da Conta" mostra a Reputação de
  toda Facção já descoberta; telas de Vitória/Derrota mostram o delta da
  run recém-terminada.
- **3ª Região: Suna** (`REG_SUNA_001`, Ato Mundo Shinobi, mesmo padrão de
  `useGenerator: true` da Floresta da Morte) e o 3º boss autorado,
  **Escorpião do Deserto** (`BOSS_ESCORPIAO_DESERTO_001`) — fera
  genérica do bioma, 3 fases (Tocaia na Areia/Ferroada/Fúria das
  Pinças), 2 Jutsus novos (`JUT_FERROADA_PARALISANTE_001` aplica
  Paralisado, `JUT_INVESTIDA_DAS_PINCAS_001` aplica Vulnerável) e perfil
  de IA bespoke `escorpiaoAction` (`ai.js`).
- 20 novos testes (`tests/data/factions_catalog.test.js`,
  `tests/progression/reputation.test.js`,
  `tests/combat/escorpiao_fight_integration.test.js`, extensão de
  `tests/combat/ai.test.js`, `tests/data/catalog.test.js`,
  `tests/data/enemies_bosses_catalog.test.js`,
  `tests/data/regions_missions_catalog.test.js` e
  `tests/progression/accountState.test.js`) — total do projeto: 371
  testes.
- DECISIONS.md D026 (Facções como dado mínimo do doc, Reputação
  numérica provisória, Região->Facção 1:1, persistência em
  accountState, Suna como 3º Ato/Região, Escorpião do Deserto como 3º
  boss, Gerador de Missão completo do doc 04 continua fora de escopo).

### Corrigido

- `src/ui/run.js#renderReputationEntries` — bug pego na validação
  Playwright desta rodada: usava uma variável fora de escopo (`r.id`
  dentro de um `.filter` aninhado depois de um `.map`), quebrando a tela
  de Introdução assim que havia alguma Região descoberta. Corrigido
  combinando o filtro e o map no mesmo `.filter`/`.map` sobre o array de
  Regiões.

### Validado

- `npm test`: 371/371 passando.
- `run.html` testado em Chromium headless (Playwright): seletor de
  Região lista Suna; Run jogada de ponta a ponta em Suna até a Vitória
  contra o Escorpião do Deserto real, sem erros de console; tela de
  Vitória mostra "Reputação com Sunagakure: +13"; painel "Progressão da
  Conta" mostra "Sunagakure: BOA (+13)"; persistência confirmada via
  reload completo da página (`localStorage` real).

## Marco 10 — Expansão (1º lote: Itens consumíveis)

### Adicionado

- `src/data/catalog/items.js` — catálogo de Itens: 6 consumíveis/
  ferramentas (Kunai, Shuriken, Bomba de Fumaça, Selo Explosivo, Pílula
  do Soldado, Antídoto), reaproveitando os Content IDs já pré-declarados
  no Asset Manifest do Marco 0 (nenhum nome novo inventado).
- `src/engine/enums.js` — `ITEM_CATEGORIES` (vocabulário completo do doc
  03) e `ITEM_EFFECTS` (`DAMAGE`/`HEAL`/`RESTORE_CHAKRA`/`CLEANSE`/
  `UTILITY`); `RESTORE_CHAKRA` é novo e exclusivo de Item.
- `src/engine/combat/actions.js` — `handleItem`: implementa
  `ACTION_TYPES.ITEM`, fechando o stub `NOT_IMPLEMENTED_YET` aberto desde
  o Marco 1 (D014). Reaproveita os efeitos genéricos de Jutsu (`DAMAGE`,
  `HEAL`, `CLEANSE`, `UTILITY`) e adiciona `RESTORE_CHAKRA`; valida
  alcance e consome 1 unidade do inventário antes de aplicar o efeito.
- `src/engine/combat/combatant.js` — campo `inventory` no Combatente +
  `hasItem`/`consumeItem`.
- `src/engine/combat/characterBridge.js` — `DEFAULT_STARTING_KIT`: kit
  ninja padrão (2 Kunai, 1 Bomba de Fumaça, 1 Pílula do Soldado, 1
  Antídoto) concedido a todo Personagem, provisório até haver
  Economia/loja/loadout real.
- `src/ui/game.js`/`src/ui/run.js`: itens do inventário aparecem como
  opções de ação no HUD de combate, com rótulo de quantidade e feedback
  de log dedicado (dano/cura/Chakra restaurado/Estados removidos).
- 19 novos testes (`tests/combat/inventory.test.js`,
  `tests/data/items_catalog.test.js`, extensão de
  `tests/combat/actions.test.js` e `tests/combat/characterBridge.test.js`)
  — total do projeto: 353 testes.
- DECISIONS.md D025 (escopo travado em consumível/ferramenta de uso
  único, reaproveitamento dos 6 Content IDs do Marco 0, `handleItem`
  reaproveitando efeitos de Jutsu + `RESTORE_CHAKRA` novo, kit fixo por
  Personagem em vez de Economia, inventário não persistente entre
  combates, Equipamento/Economia da Run/Economia Permanente/Armas
  Lendárias fora de escopo deste lote).

### Validado

- `npm test`: 353/353 passando.
- `play.html` testado em Chromium headless (Playwright): Kunai usado num
  combate real (Bandido) aparece com quantidade, aplica dano corretamente
  (HP 55→41), consome 1 unidade do inventário, turno avança normalmente;
  sem erros de console.

## Marco 9 — Protótipo 3 Atos (Gerador + 2ª Região + Boss autorado)

### Adicionado

- `src/engine/generator/enemyGenerator.js` — `generateEnemy`/
  `generateMiniBoss`: gerador procedural de Inimigo combinando Rank
  (curva já calibrada no Marco 5) + Natureza (Tag do Marco 2, +15% de
  sabor) + Traço/Arma (bancos de palavras genéricos); nunca fabrica
  jutsu, nunca registra na Registry `enemies` (ficha efêmera).
- `src/engine/run/mapGenerator.js`: Região com `useGenerator: true`
  monta MISSAO/ELITE via o gerador; sem `bossId`, o capstone vira um
  Mini-Boss gerado (tier `MINI_BOSS`, IA `ELITE` genérica) em vez de um
  Boss fabricado sem fases/telegraph reais. Novo campo
  `map.generatedEnemies` (objeto plano, serializável) guarda as fichas
  geradas separado de `enemyIds`; regiões de pool fixo (País das Ondas)
  continuam com o mesmo comportamento de antes, byte a byte.
- `src/data/catalog/regions.js` — 2ª Região: Floresta da Morte (Ato
  Ascensão, cenário do Exame Chūnin), `useGenerator: true`.
- `src/ui/run.js`: seletor de Região na Introdução; resolução de
  inimigo (`buildEnemyTeam`, cards do Mapa) passa a checar
  `generatedEnemies` além de `enemies`/`bosses`; corrigido bug pego na
  validação Playwright — a tela de Vitória estava fixa em "País das
  Ondas"/"Zabuza Momochi" mesmo jogando outra Região.
- 8 novos testes (`tests/generator/enemyGenerator.test.js`, extensão de
  `tests/run/mapGenerator.test.js` e
  `tests/data/regions_missions_catalog.test.js`) — total do projeto:
  325 testes.
- DECISIONS.md D023 (gerador só combina peças validadas, Mini-Boss
  honesto em vez de Boss fabricado, `generatedEnemies` separado de
  `enemyIds`, Floresta da Morte, "calibrar" interpretado como validar
  com mais conteúdo).

### Validado

- `npm test`: 325/325 passando.
- `run.html` testado em Chromium headless (Playwright): troca de Região
  atualiza mapa/descrição; nomes de inimigo gerado aparecem corretamente
  nos nós e no HUD de batalha; combate contra inimigo gerado (dano/
  crítico/movimento) funciona normalmente; Run completa até vencer o
  Mini-Boss capstone, com a tela de Vitória mostrando o nome certo da
  Região/inimigo após a correção do bug acima; sem erros de página.

### Adicionado (continuação — Boss autorado da Floresta da Morte)

- `src/data/catalog/bosses.js` — 2º Boss: Serpente da Floresta da Morte
  (fera genérica, não personagem canônico nomeado), 3 fases por %HP
  (Emboscada/Constrição/Fúria Feroz), fecha a pendência D023 #3.
- `src/data/catalog/jutsus.js` — 2 Jutsus novos só para este boss:
  `JUT_CONSTRICAO_SUFOCANTE_001` (aplica Imobilizado) e
  `JUT_MORDIDA_PERFURANTE_001` (aplica Sangrando) — ambos Estados já
  catalogados desde o Marco 2, nenhum novo criado.
- `src/engine/combat/ai.js` — `serpenteAction`: perfil de IA bespoke,
  mesmo formato de `zabuzaAction`.
- `src/data/catalog/regions.js` — Floresta da Morte ganha `bossId` real;
  `useGenerator: true` continua só para MISSAO/ELITE.
- 9 novos testes (extensão de `enemies_bosses_catalog.test.js` e
  `ai.test.js`, novo `serpente_fight_integration.test.js`) — total do
  projeto: 334 testes.
- DECISIONS.md D024.

### Validado (continuação)

- `npm test`: 334/334 passando.
- `run.html` testado em Chromium headless (Playwright): Run até o
  "Confronto Final" derrota a Serpente real (não mais o Mini-Boss
  gerado), tela de Vitória com o nome certo; sem erros de página.

## Marco 8 — Progressão

### Adicionado

- `src/engine/progression/mastery.js` — `xpForMissionResult`/
  `levelFromXp`/`grantMastery`/`xpToNextLevel`: Maestria por personagem
  (níveis 0-5), XP da graduação de missão do Marco 7; NÃO concede
  nenhum bônus de estatística (só conhecimento/progresso exibido).
- `src/engine/progression/archive.js` — `createArchive`/`discover`/
  `discoverAll`/`isDiscovered`/`archiveLabel`: Arquivo Ninja genérico
  por Content ID, `???` até descoberto.
- `src/engine/progression/threat.js` — `clampThreatLevel`/
  `effectiveAiLevel`/`effectiveReclassifyChance`: Ameaça (0-20) via
  upgrade de nível de IA de inimigo comum + chance de reclassificação
  de missão — nenhuma stat de combatente tocada.
- `src/engine/progression/accountState.js` — `createAccountState`/
  `applyRunEnd`: une Maestria/Arquivo/Ameaça/vitórias num estado
  serializável, salvo via `SaveManager` (slot `"account"`).
- `src/ui/run.js`: painel "Progressão da Conta" na Introdução (Maestria
  por Genin, Arquivo Ninja, Vitórias/Runs), seletor de Nível de Ameaça
  quando liberado, resumo de XP/level-up/descobertas na tela de fim de
  Run; conta carregada no boot e salva a cada fim de Run.
- 27 novos testes (`tests/progression/*.test.js`) — total do projeto:
  313 testes.
- DECISIONS.md D022 (Maestria sem bônus de status, XP por missão para o
  esquadrão inteiro, Arquivo genérico, Ameaça via IA/reclassificação,
  `threatUnlocked` booleano, conta como único save novo, Pós-game/
  Economia Permanente fora de escopo).

### Validado

- `npm test`: 313/313 passando.
- `run.html` testado em Chromium headless (Playwright): conta nova
  mostra Maestria 0/Arquivo 0-6/Ameaça bloqueada; uma Run até a Vitória
  concede XP/descobre entradas/libera Ameaça; **persistência confirmada
  via reload real de página** (não só memória) — Vitórias/Maestria/
  Arquivo voltam intactos e o seletor de Ameaça aparece.

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

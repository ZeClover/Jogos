# PROJECT_STATUS — Naruto Roguelite

> Leia este arquivo (+ `DECISIONS.md` + `CANON_RULES.md`) no início de
> qualquer sessão nova antes de tomar decisões estruturais. Nunca assuma
> que uma nova conversa significa projeto novo (PROMPT MESTRE §71-72).

## Marco atual

**MARCO 0 — FUNDAÇÃO: concluído e validado.**
**MARCO 1 — COMBATE MÍNIMO: concluído e validado.**
**MARCO 2 — EFFECT ENGINE: concluído e validado.**
**MARCO 3 — JUTSUS: concluído e validado.**

Próximo: **MARCO 4 — Personagens** (recursos exclusivos, passivas,
loadouts — fichas reais dos 4 Genin do Vertical Slice).

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
- **Testes automatizados**: 181 casos (`node --test`, zero dependências)
  cobrindo Marco 0 (ids, rng, seed, registry, validators, save, asset
  manifest, data registries), Marco 1 (atributos, dano/defesa/acerto,
  posições/alcance, ordem de turno, ações, CombatState ponta a ponta),
  Marco 2 (Effect Engine) e Marco 3 (Jutsus — ver abaixo).

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

## Validado

- `npm test` (`node --test`) dentro de `games/naruto-roguelite/`: **181/181
  passando**.
- Dev console verificado no Chromium headless (Playwright), Marcos 0-3:
  engine carrega sem erros de página, todos os módulos ES retornam HTTP
  200 (único 404 é o `favicon.ico` padrão do navegador), botões "Salvar
  demo"/"Limpar" fazem round-trip de save corretamente, seção de
  validadores detecta as 4 classes de problema esperadas, painel de
  Combate roda um 1v1 completo usando Gōkakyū/Kawarimi reais do
  catálogo, painel de Catálogo mostra 21 Tags/29 Estados/5 Reações/12
  Jutsus.
- Revisão manual do diff antes do commit.

## Em andamento

Nenhum item em andamento — Marcos 0-3 fechados.

## Pendente (próximos marcos, não começados)

- Marco 4 — Personagens (recursos, passivas, loadouts)
- Marco 5 — Inimigos e IA
- Marco 6 — Vertical Slice (Naruto/Sasuke/Sakura/Shikamaru Genin, País das
  Ondas, Zabuza) — é quando o hub principal (`/index.html`) deve passar a
  linkar para este jogo (ver DECISIONS.md D007)
- Marco 7 — Run / Missões / Mapa
- Marco 8 — Progressão
- Marco 9 — Protótipo 3 Atos
- Marco 10 — Expansão

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
| Personagens/versões | 0 | 500–800+ |
| Jutsus | 12 | 1.000–1.500+ |
| Passivas | 0 | 400–600+ |
| Itens | 0 | 500+ |
| Bosses/elites | 0 | 200–300+ |
| Eventos | 0 | 300+ |
| Templates de missão | 0 | 200+ |
| Regiões | 0 | 50+ |
| Conquistas | 0 | 500+ |
| Tags | 21 | — (vocabulário fechado) |
| Estados | 29 | — (vocabulário fechado) |
| Reações | 5 | — (cresce conforme combinações fizerem sentido) |

(Personagens/Itens/etc. esperados em 0 até o Marco 4+, em lotes, conforme
CANON_RULES.md "qualidade > quantidade". Jutsus começou com o lote do
Vertical Slice (12) — próximos lotes maiores vêm quando houver mais
personagens para equipá-los. Tags/Estados/Reações já são o vocabulário
completo do doc 01 — não crescem "em lote" do mesmo jeito.)

## Próximo passo

Iniciar **Marco 4 — Personagens**: fichas reais dos 4 Genin do Vertical
Slice (Naruto, Sasuke, Sakura, Shikamaru — `docs/design/12`), cada um com
loadout real (4 Ativas + 1 Reação + 1 Suprema + até 3 passivas, usando os
jutsus já catalogados), recurso exclusivo (Clones do Naruto, Planejamento
do Shikamaru — os primeiros a existir de verdade, destravando as
simplificações documentadas em D016 #7 para Kage Bunshin/Rasengan/Uzumaki
Naruto Rendan/Analyze), Custo de Esquadrão e passivas. É também a hora de
revisitar a relação Power↔atributo do atacante (D012) com dados reais de
personagem.

# PROJECT_STATUS — Naruto Roguelite

> Leia este arquivo (+ `DECISIONS.md` + `CANON_RULES.md`) no início de
> qualquer sessão nova antes de tomar decisões estruturais. Nunca assuma
> que uma nova conversa significa projeto novo (PROMPT MESTRE §71-72).

## Marco atual

**MARCO 0 — FUNDAÇÃO: concluído e validado.**
**MARCO 1 — COMBATE MÍNIMO: concluído e validado.**

Próximo: **MARCO 2 — Effect Engine** (Tags, Estados, Buffs/Debuffs, Reações,
duração).

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
- **Testes automatizados**: 123 casos (`node --test`, zero dependências)
  cobrindo Marco 0 (ids, rng, seed, registry, validators, save, asset
  manifest, data registries) e Marco 1 (atributos, dano/defesa/acerto,
  posições/alcance, ordem de turno, ações, CombatState ponta a ponta).

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
- **Dev console**: novo painel "Combate" roda um 1v1 de demonstração
  ponta a ponta (Ataque Básico + Jutsu genérico) com seed ajustável e log
  legível.

## Validado

- `npm test` (`node --test`) dentro de `games/naruto-roguelite/`: **123/123
  passando**.
- Dev console verificado no Chromium headless (Playwright), Marco 0 e
  Marco 1: engine carrega sem erros de página, todos os módulos ES
  retornam HTTP 200 (único 404 é o `favicon.ico` padrão do navegador),
  botões "Salvar demo"/"Limpar" fazem round-trip de save corretamente,
  seção de validadores detecta as 4 classes de problema esperadas, painel
  de Combate roda um 1v1 completo até decidir vencedor e reproduz o mesmo
  resultado ao reexecutar com a mesma seed.
- Revisão manual do diff antes do commit.

## Em andamento

Nenhum item em andamento — Marcos 0 e 1 fechados.

## Pendente (próximos marcos, não começados)

- Marco 2 — Effect Engine (Tags/Estados/Reações)
- Marco 3 — Jutsus (engine data-driven completa)
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
| Jutsus | 0 | 1.000–1.500+ |
| Passivas | 0 | 400–600+ |
| Itens | 0 | 500+ |
| Bosses/elites | 0 | 200–300+ |
| Eventos | 0 | 300+ |
| Templates de missão | 0 | 200+ |
| Regiões | 0 | 50+ |
| Conquistas | 0 | 500+ |

(Esperado nos Marcos 0-1 — conteúdo real chega a partir do Marco 3/4, em
lotes, conforme CANON_RULES.md "qualidade > quantidade".)

## Próximo passo

Iniciar **Marco 2 — Effect Engine**: catálogo de Tags e Estados
data-driven (duração, stacks, categoria, remoção, resistência), sistema de
Buffs/Debuffs genérico sobre `CombatState`, e Reações (Molhado+Raiton=
Eletrificação etc.) resolvidas a partir de combinações de Tag/Estado, com
o limite de 4 reações automáticas por ação (CANON_RULES.md). É também
quando o slot de Reação do combate ganha um uso real (ex: Kawarimi), e o
mapeamento categoria→defesa/Power de jutsu de D012 pode ser revisitado com
dados reais.

# PROJECT_STATUS — Naruto Roguelite

> Leia este arquivo (+ `DECISIONS.md` + `CANON_RULES.md`) no início de
> qualquer sessão nova antes de tomar decisões estruturais. Nunca assuma
> que uma nova conversa significa projeto novo (PROMPT MESTRE §71-72).

## Marco atual

**MARCO 0 — FUNDAÇÃO: concluído e validado.**

Próximo: **MARCO 1 — Combate Mínimo** (turnos, atributos, dano, defesa,
Chakra, ações, posições Frente/Centro/Trás).

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
- **Testes automatizados**: 69 casos (`node --test`, zero dependências)
  cobrindo ids, rng, seed, registry, validators, save (incl. migração de
  schema), asset manifest e data registries.

## Validado

- `npm test` (`node --test`) dentro de `games/naruto-roguelite/`: **69/69
  passando**.
- Dev console verificado no Chromium headless (Playwright): engine carrega
  sem erros de página, todos os módulos ES retornam HTTP 200 (único 404 é
  o `favicon.ico` padrão do navegador), botões "Salvar demo"/"Limpar"
  fazem round-trip de save corretamente, seção de validadores detecta as 4
  classes de problema esperadas contra um fixture propositalmente quebrado.
- Revisão manual do diff antes do commit.

## Em andamento

Nenhum item em andamento — Marco 0 fechado.

## Pendente (próximos marcos, não começados)

- Marco 1 — Combate Mínimo
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

(Esperado no Marco 0 — conteúdo real chega a partir do Marco 3/4, em lotes,
conforme CANON_RULES.md "qualidade > quantidade".)

## Próximo passo

Iniciar **Marco 1 — Combate Mínimo**: turnos, atributos, cálculo de
dano/defesa, gasto/persistência de Chakra dentro da missão, ações
(jutsu/ataque básico/defender/item/preparar/mover/trocar/interagir),
posições Frente/Centro/Trás e ordem de turno visível — usando a engine core
deste marco (RNG de combate via `SeedManager.combat`, Registry/validators
para as entidades novas).

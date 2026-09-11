# CHANGELOG — Naruto Roguelite

Formato livre, em ordem cronológica reversa (mais recente primeiro). Este
changelog é interno ao subprojeto `games/naruto-roguelite/`.

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

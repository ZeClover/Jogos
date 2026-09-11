# Naruto Roguelite

Roguelite tático por turnos ambientado no universo Naruto. Em
desenvolvimento incremental por marcos — ver `PROJECT_STATUS.md` para o
estado atual.

## Para retomar em uma nova sessão

Leia, nesta ordem: `PROJECT_STATUS.md` → `DECISIONS.md` → `CANON_RULES.md`
→ `docs/design/17_PROMPT_MESTRE.md` (se precisar do contexto completo do
processo). Não recomece o projeto do zero.

## Estrutura

```
docs/design/     documentação oficial de design (17 docs + Prompt Mestre)
src/engine/      regras universais, sem conhecimento de conteúdo específico
src/data/        registries de conteúdo do jogo (personagens, jutsus, ...)
src/content/     asset manifest e outros dados de suporte
src/ui/          camada de apresentação
tests/           testes automatizados (node --test)
index.html       dev console (Marco 0) — não é a UI final do jogo
```

## Rodar

- Testes: `npm test` (Node.js 18+, sem dependências).
- Dev console: sirva a pasta com qualquer servidor estático (ex: `npx serve`
  ou `python3 -m http.server`) e abra `index.html` — é um painel de
  diagnóstico da engine, não gameplay.

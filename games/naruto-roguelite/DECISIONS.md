# DECISIONS — Naruto Roguelite

Log de decisões técnicas tomadas como executor técnico do projeto (ver
PROMPT MESTRE §6 — decisões de arquitetura concreta/detalhes de
implementação são minhas para tomar; identidade do projeto não é).

---

## D001 — Sem TypeScript/bundler; JavaScript ES Modules + JSDoc

**Contexto:** o resto do repositório (`games/ninja-idle`, `games/relic-quest`
etc.) é HTML/CSS/JS puro, sem build step. O design doc pede arquitetura
data-driven com tipos claros, mas não exige uma linguagem específica.

**Decisão:** usar JavaScript moderno com ES Modules nativos (`<script
type="module">` no browser, `"type": "module"` no Node), documentando os
formatos de entidade via JSDoc `@typedef` (`src/engine/types.js`) em vez de
TypeScript.

**Motivo:** consistente com a convenção "zero build" do site; evita
introduzir um passo de compilação que o resto do projeto não tem (PROMPT
MESTRE §76 — não superarquitetar). JSDoc dá checagem leve em editores sem
esse custo.

## D002 — Testes: `node --test` nativo, sem dependências

**Decisão:** usar o test runner embutido do Node.js 18+ (`node --test`,
`node:test` + `node:assert/strict`), sem Jest/Vitest/Mocha.

**Motivo:** zero dependências para instalar/versionar, roda em qualquer
ambiente com Node, e é suficiente para testar lógica pura da engine (sem
DOM). `npm test` roda `node --test` (auto-discovery de `*.test.js`); passar
`tests/` como argumento posicional falha nesta versão do Node, por isso o
script usa o discovery automático.

## D003 — Projeto isolado em `games/naruto-roguelite/`

**Decisão:** todo código, dados e documentação de design deste jogo vivem
em `games/naruto-roguelite/`, como os outros minijogos do site. Os arquivos
de continuidade (`PROJECT_STATUS.md`, `CHANGELOG.md`, `DECISIONS.md`,
`CANON_RULES.md`) ficam na raiz dessa pasta — não na raiz do repositório,
que já tem seu próprio `README.md` cobrindo o site inteiro.

## D004 — Docs de design e Prompt Mestre commitados em `docs/design/`

**Contexto:** os 17 documentos de design chegaram como um upload efêmero
(zip), e o Prompt Mestre veio como texto direto na conversa (o zip é
"SEM_PROMPT_MESTRE" — sem ele).

**Decisão:** copiar os 17 `.md` do pacote + transcrever o Prompt Mestre
completo para `docs/design/00_...md` até `17_PROMPT_MESTRE.md`, commitados
no repositório.

**Motivo:** PROMPT MESTRE §71 exige que uma sessão futura consiga retomar o
projeto lendo os arquivos do repo — um upload de conversa não persiste
entre sessões.

## D005 — Save: storage injetável, namespaces e slots

**Decisão:** `SaveManager` recebe um adapter de storage (`getItem/setItem/
removeItem`), com fallback automático para `localStorage` no browser ou um
Map em memória fora dele (`createMemoryStorage`). Slots lógicos (`"account"`,
`"run"`, ou qualquer string) são independentes dentro de um namespace;
autosave é apenas uma chamada de `save("run", ...)` frequente da camada de
apresentação, não um mecanismo separado.

**Motivo:** permite testar save/load em Node (sem DOM) com o mesmo código
que roda no browser, e mantém "account save" vs "run save" (PROMPT MESTRE
§43) sem inventar dois sistemas distintos.

## D006 — RNG: mulberry32 + hash FNV-1a, streams nomeadas via `SeedManager`

**Decisão:** PRNG determinístico mulberry32 (32-bit, rápido, sem
dependências), com streams nomeadas derivadas via hash FNV-1a de
`"{seedMestre}::{nomeDaStream}"`. `SeedManager` cacheia streams por nome
(map/combat/loot/event são getters de conveniência; qualquer string
funciona como nome, ex: `"boss:BOSS_ZABUZA_001"`).

**Motivo:** PROMPT MESTRE §44 exige streams separadas e reprodutibilidade;
derivar por hash da seed+nome (em vez de, por exemplo, um contador global)
garante que streams são independentes entre si e que a ordem de criação não
afeta o resultado.

## D007 — Hub principal (`/index.html`) não alterado neste marco

**Decisão:** não adicionar um card para o Naruto Roguelite no hub
(`index.html` da raiz do repositório) ainda.

**Motivo:** o hub lista jogos jogáveis; o Marco 0 é só fundação (nenhuma
tela de jogo real existe). Adicionar agora criaria um link para uma página
de diagnóstico interno, confuso para quem visita o site. Revisitar esta
decisão no Marco 6 (Vertical Slice), quando houver algo jogável.

## D008 — Convenção de ID e prefixos

**Decisão:** todo ID segue `PREFIXO(_PARTE)*_NNN` (regex em
`src/engine/ids.js`). Prefixos de conteúdo (`CHAR`, `JUT`, `ITEM`, `BOSS`,
`ENEMY`, `REG`, `EVENT`, `MISSION`, `FACTION`, `PASSIVE`, `REACTION`, `TAG`,
`STATUS`, `SUMMON`, `ENDING`, `ACHIEVEMENT`, `FIELD`) são distintos dos
prefixos de Asset ID (`PORTRAIT`, `FULL`, `COMBAT`, `ICON`, `ART`, `BG`,
`UI`), que se combinam com o Content ID que representam (ex:
`PORTRAIT_CHAR_NARUTO_GENIN_001`). Ambas as listas vivem em
`src/engine/enums.js` e podem crescer sem quebrar nada — é um registro, não
uma whitelist rígida usada para bloquear features.

## D009 — Asset Manifest: só formaliza o que o doc já deu ID/prompt completo

**Contexto:** `docs/design/15_BIBLIOTECA_PROMPTS_VISUAIS_P0_P1.md` tem duas
seções de granularidade muito diferente: P0 (Asset ID exato + prompt
completo por item) e P1 (só uma lista de nomes, ex: "Kakashi Jōnin",
"Suna", "Katon").

**Decisão:** só os itens P0 viram entradas formais em `assetManifest`
(com `assetId`, `path`, `status: 'prompt_ready'`). Os itens P1 viram
`assetBacklogP1` — descritores simples `{ category, group, name }`, **sem**
inventar um Asset ID ou Content ID estável para eles agora.

**Motivo:** um ID é uma promessa de estabilidade (CANON_RULES.md — "IDs não
mudam por rename"). Cunhar `CHAR_KAKASHI_JONIN_001` hoje, antes de a ficha
do personagem existir, arrisca esse ID não bater com o que for realmente
autorado no Marco 4. Melhor deixar a lista como backlog legível e formalizar
ID+manifesto junto da ficha real, em lote (PROMPT MESTRE §78).

## D010 — Ícones de Estado do Asset Manifest sem `contentId` ainda

**Contexto:** a seção P0 "Status" do doc 15 usa nomes em inglês (BURNING,
WET, ELECTRIFIED...) como código do ícone, enquanto o catálogo de Estados
(doc 01) é em português (Queimando, Molhado, Eletrificado...) e só nasce
formalmente como entidades `STATUS_*` no Marco 2 (Effect Engine).

**Decisão:** as 10 entradas `ICON_STATUS_<CODE>_001` do manifesto ficam com
`contentId: null` e uma `note` mapeando para o nome canônico em português.
Elas ganham `contentId` real quando o catálogo de Estados for criado.

## D011 — Dev console do Marco 0 não é a UI final

**Decisão:** `index.html`/`src/ui/devconsole.js` é uma página de
diagnóstico (mostra RNG/Seed, registries, Asset Manifest, validadores,
save/load funcionando), não uma tentativa de UI de jogo. A UI real segue a
Style Bible e chega com o Vertical Slice (Marco 6).

**Motivo:** PROMPT MESTRE §90/§91 pede provar que cada marco "funciona",
não só "está implementado" — uma página que exercita a engine ao vivo no
browser é a forma mais direta de validar isso visualmente, sem inventar
telas de jogo que ainda não têm conteúdo real por trás.

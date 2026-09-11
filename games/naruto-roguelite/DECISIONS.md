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

## D012 — Fórmulas provisórias de combate do Marco 1

**Contexto:** `docs/design/01_COMBATE_TAGS_ESTADOS_REACOES.md` dá fórmulas
exatas para mitigação de defesa (`Defesa/(Defesa+100)`), faixa de acerto
(base ~90%, 20–100%) e crítico (5% base, 150% de dano), mas não especifica
como o "Power" de um jutsu (ex: Rasengan Power 65) se combina com os
atributos Taijutsu/Ninjutsu/Genjutsu do atacante — esse número de
balanceamento real só existe quando o Jutsu Engine (Marco 3) e o
balanceamento (Marco 9) tiverem dados reais para calibrar.

**Decisões (todas revisáveis no Marco 3/9, sem impacto em save/API pública):**

1. **Ataque Básico não tem jutsu por trás**, então seu "power" é
   diretamente o atributo Taijutsu do atacante — é a única fonte de dano
   disponível para essa ação, não uma escolha arbitrária.
2. **Jutsu genérico (Marco 1) usa `action.power` como dano pré-mitigação
   tal como fornecido pelo chamador**, sem multiplicar por
   Ninjutsu/Genjutsu do atacante. Motivo: qualquer fator de escala
   inventado agora (ex: `power * atributo/10`) seria um número de
   balanceamento fabricado sem base no doc, e o Marco 3 vai precisar
   recalibrar de qualquer forma com jutsus reais — melhor não fingir
   precisão que não existe ainda.
3. **Mapeamento categoria → defesa**: Taijutsu mitiga por Defesa Física,
   Ninjutsu por Defesa de Chakra, **Genjutsu por Resistência Mental** (não
   por Defesa de Chakra) — inferido da própria lista de atributos do doc
   01, que separa as duas stats; do contrário não haveria razão para
   Resistência Mental existir como atributo independente.
4. **Guarda de `DEFENDER`** = 30% da Defesa Física do ator, resetada no
   início da rodada seguinte — número provisório (o doc não especifica),
   escolhido para tornar Defender uma escolha tática relevante sem ser
   dominante.
5. **Eficiência** (atributo secundário) reduz o custo de Chakra de um
   Jutsu proporcionalmente (`custo * (1 - eficiencia)`), consistente com a
   descrição do doc ("eficiência" nas stats secundárias).

Nenhuma dessas fórmulas trava a arquitetura: `computeDamage`,
`computeAccuracy` etc. são funções puras e isoladas (`src/engine/combat/
damage.js`) — ajustar constantes ou a relação power/atributo no Marco 9 não
exige mexer no resto do motor de combate.

## D013 — Reações (Marco 2) não existem ainda; Ação Rápida/Reação são só orçamento

**Contexto:** o Combate Mínimo (Marco 1) precisa respeitar o orçamento de
1 Ação Principal + até 1 Ação Rápida + até 1 Reação por rodada (CANON_RULES
#Combate), mas o conteúdo que normalmente ocupa o slot de Reação (ex:
Kawarimi) é um Jutsu real com Tags/Estados — isso é Marco 2/3.

**Decisão:** `CombatState`/`resolveAction` fazem cumprir o orçamento por
slot (`ACTION_SLOTS.PRINCIPAL/RAPIDA/REACAO`) de forma genérica — qualquer
tipo de ação pode ser jogado em qualquer slot que o chamador especificar —
sem restringir ainda qual tipo de ação "pertence" a qual slot. Essa
restrição de conteúdo (ex: "só jutsus com `isReaction: true` podem usar o
slot REACAO") é responsabilidade de quem monta a ação a partir de dados
reais de Jutsu, não da engine genérica.

## D014 — `ITEM`/`PREPARAR`/`INTERAGIR` ficam como stub explícito

**Contexto:** esses três tipos de ação (doc 01) dependem de sistemas que
ainda não existem: Itens (Marco 3+), prep-time real de jutsu (precisa de
dados de Jutsu, Marco 3) e Missões/interação com cenário (Marco 7).

**Decisão:** em vez de simular um comportamento parcial para esses tipos,
`resolveAction` devolve `{ applied: false, reason: 'NOT_IMPLEMENTED_YET' }`
de forma explícita e testada. O enum `ACTION_TYPES` já os lista (contrato
estável desde o Marco 0), só o handler chega depois.

**Motivo:** uma implementação "pela metade" desses handlers seria pior do
que não ter nenhuma — daria a impressão de que funcionam. Um stub
explícito e testado é honesto sobre o que o Marco 1 cobre.

## D015 — Effect Engine (Marco 2): catálogo completo, mecânica seletiva

**Contexto:** `docs/design/01_COMBATE_TAGS_ESTADOS_REACOES.md` lista 29
Estados, ~20+ Tags e um punhado de Reações concretas ("Molhado+Raiton=
Eletrificação" etc.), mas não formaliza todos os números (duração exata,
% de dano contínuo) nem cobre todas as combinações imagináveis.

**Decisões:**

1. **Catálogo (dado) é completo; mecânica (código) é genérica.** Os 29
   Estados e ~21 Tags do doc foram todos registrados em
   `src/data/catalog/` — isso não é "conteúdo raso" (regra #79), é o
   vocabulário fechado que o próprio doc pede para existir (CANON_RULES
   #12/#14). Registrar um Estado não escreve nenhum código novo: o Effect
   Engine (`src/engine/combat/effects.js`) já sabe tickar duração, stacks,
   resistência e DoT para qualquer Estado, a partir só dos campos de dado
   (`category`, `stacks`, `maxStacks`, `baseDuration`, `removal`,
   `controlType`, `dot`).
2. **Duração/`dot.percentPerStack` são números provisórios** (o doc só dá
   valores exatos para poucos casos, ex: Kagemane no doc 13) — mesmo
   espírito da D012, revisáveis no Marco 9 sem mudar a arquitetura.
3. **`removal` é só metadado por enquanto.** `TEMPO` já é aplicado pelo
   motor (duração chega a 0 -> remove). `CURA` (Selado, Genjutsu) e
   `ACAO_ALVO` (Oculto) descrevem *como* o Estado deveria ser removido,
   mas nenhuma ação de limpeza (ex: Kai) existe ainda — isso é conteúdo de
   Jutsu (Marco 3). Não é um handler pela metade (D014): é um campo de
   dado descritivo, sem promessa de comportamento.
4. **Resistência a Estado é sempre via o atributo `resistenciaEstado`**
   (secundário, já existia desde o Marco 1) — não criei um canal de
   resistência por categoria. `resistenciaMental` continua sendo só a
   defesa contra dano de Genjutsu (D012 #3), papel distinto.
5. **Resistência adaptativa de controle (CANON_RULES #31, 100%/70%/40%/
   imune) generalizada para qualquer Estado com `controlType: true`**, não
   só bosses — mais simples e consistente; nada impede um Marco futuro
   (IA/bosses, Marco 5) de dar a bosses uma curva própria via dado, sem
   mexer no motor. O contador de aplicações só avança em aplicações
   *bem-sucedidas* (uma tentativa resistida não "ensina" nada ao alvo) e
   persiste a luta inteira, mesmo que o Estado em si já tenha expirado.
6. **Reações não implementadas:** "Óleo+Katon" (Óleo é citado de
   passagem no doc, sem ser um Estado catalogado — não inventei um) e
   "Katon+Suiton=Vapor/Névoa" (Névoa é um Campo de batalha, categoria
   distinta de Estado por combatente que doc 01 lista separadamente —
   Campos ficam fora de escopo até existir necessidade real). As 5
   Reações implementadas (Eletrificação, Congelamento Facilitado,
   Propagação, Lama, Derrubado) cobrem todas as combinações do doc que são
   só "Estado do alvo + Tag recebida -> novo Estado".
7. **"Molhado" faz dupla função** como marcador de "acabou de ser atingido
   por Suiton" tanto para a Reação de Eletrificação (+Raiton) quanto para
   Lama (+Doton) — evita inventar um segundo Estado só para "úmido"/"chão
   molhado" quando o doc já usa "Molhado" para ambos os contextos.
8. **Bônus de acerto/crítico contra Imobilizado é a única checagem
   "hardcoded"** do motor de combate (`IMOBILIZADO_STATE_ID` em
   `effects.js`) em vez de um campo de dado genérico tipo
   `grantsAttackerBonus`. Justificativa: é uma regra citada literalmente
   no doc ("Imobilizado+ataque de precisão=maior acerto/crítico"), não uma
   invenção; e checar `state === IMOBILIZADO` é equivalente em espírito a
   checar `action.type === JUTSU` — é vocabulário da própria engine
   (Estados são parte do contrato, não conteúdo de personagem), então não
   viola CANON_RULES #49 ("não escreva `if character === 'Naruto'`").
   Interações semelhantes sugeridas no doc (Quebrado+Impacto/Perfuração
   "sinergiza", Sensorial ignora bônus de Oculto) ficaram de fora deste
   marco por serem descritas de forma mais vaga — matéria para o Marco 3
   quando houver jutsus reais para calibrar o efeito.
9. **Effect Engine mora em `src/engine/combat/`**, não em um
   `src/engine/effects/` separado — por ora só combate consome Estados;
   mover para um módulo mais genérico é reversível caso Missões/Eventos
   (Marco 7) precisem aplicar Estados fora de combate.

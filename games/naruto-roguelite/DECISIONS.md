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

## D016 — Jutsus (Marco 3): campo `effect`, Kawarimi, cooldowns

**Contexto:** `docs/design/13_JUTSUS_VERTICAL_SLICE.md` dá 12 fichas reais
(Kage Bunshin, Rasengan, Gōkakyū, Chidori, Kagemane, Kawarimi, Uzumaki
Naruto Rendan, Shishi Rendan, Kai, First Aid, Shadow Setup, Analyze), mas
elas fazem coisas mecanicamente bem diferentes (dano, cura, limpar
Estado, armar uma esquiva, efeitos sem combate ainda implementado) — o
handler `JUTSU` do Marco 1/2 só sabia causar dano.

**Decisões:**

1. **Campo `effect` na ficha** (`DAMAGE` default | `HEAL` | `CLEANSE` |
   `ARM_REACTION` | `UTILITY`) decide qual ramo de `handleJutsu` roda. Não
   é um campo do template oficial do doc 02 — é a forma como o Marco 3
   organiza "o que a ficha realmente faz" dentro do motor genérico; os
   campos oficiais do template (Rank, Categoria, Natureza, Tags, Custo,
   Power, Accuracy, Range, Target, Prep, Cooldown, Estados, Condições)
   continuam todos presentes na ficha.
2. **`resolveJutsuFields` (jutsu.js) mescla a ficha do catálogo com a
   `action`** — a `action` (o que o chamador passa a `resolveAction`) pode
   sobrescrever qualquer campo pontualmente (útil em testes e, mais
   adiante, para upgrades de run no Marco 8 que ajustam um jutsu
   temporariamente sem reescrever o catálogo inteiro).
3. **Cooldown vive no combatente** (`combatant.cooldowns: Map<jutsuId,
   rounds>`), tickado a cada fim de rodada junto dos Estados. Só existe
   quando a ação carrega `jutsuId` — ações JUTSU genéricas (sem ficha,
   como usadas nos testes do Marco 1/2) continuam funcionando sem
   cooldown, mantendo compatibilidade retroativa total.
4. **Kawarimi implementado como "arma reação no próprio turno, dispara no
   próximo golpe elegível"** (`effects.js#armReaction`/
   `tryEvadeWithReaction`), não como uma interrupção de verdade. O motor é
   pull-based (só quem está na vez age); simular uma reação real ao golpe
   de outro combatente exigiria um mecanismo de interrupção que nada mais
   no jogo precisa ainda. Armar consome Chakra e o slot REACAO no ato;
   disparar é automático e gratuito no primeiro golpe single-target
   elegível (nem AoE, nem inevitável, nem com o defensor Imobilizado —
   as 3 exceções citadas no doc). `resolveAttack` (usado tanto por
   ATAQUE_BASICO quanto pelo ramo DAMAGE de JUTSU) é o único ponto que
   checa isso, então qualquer ataque single-target futuro herda o
   comportamento de graça.
5. **`range: 'ALLY'`** (novo, além de MELEE/RANGED/SELF do Marco 1) cobre
   jutsus de suporte (First Aid, Kai) — válido para qualquer vivo do
   mesmo lado do ator, incluindo ele mesmo. **`range: 'AREA'`** (Gōkakyū)
   nesta versão se comporta como RANGED (um alvo nomeado só) — a única
   diferença prática é que isenta o alvo de Kawarimi (`tryEvadeWithReaction`
   recusa `range === 'AREA'`), como o doc pede ("Kawarimi falha contra
   certos AoE"). Atingir todos os inimigos simultaneamente é adiado até
   haver necessidade real de resolução multi-alvo — implementar isso sem
   um caso de uso concreto seria superarquitetar.
6. **`ignoresGuard: true`** (Rasengan, "quebra guarda") zera o parâmetro
   `guard` passado para `computeDamage`, sem alterar a fórmula em si.
7. **Simplificações explícitas por jutsu** (documentadas também como
   `note` na própria ficha, para quem ler `jutsus.js` direto):
   - Kage Bunshin/Uzumaki Naruto Rendan: geração/consumo do recurso
     exclusivo "Clones" do Naruto — recursos exclusivos por personagem
     são Marco 4 (CANON_RULES #Recursos), cataloga-se a ficha, não o
     recurso.
   - Rasengan: sinergia de poder com número de Clones ativos — mesma
     razão, depende do recurso do item acima.
   - Chidori: bônus de accuracy com Sharingan ativo — Sharingan é
     transformação de personagem (Marco 4), não um Estado de combate;
     fica em 80% fixo.
   - Kagemane: "manutenção de 5 Chakra/rodada" para sustentar Imobilizado
     não implementada — o Estado expira pela duração normal (2 rodadas)
     em vez de precisar de pagamento contínuo do atacante. Sustentação
     por rodada é um mecanismo novo (dreno do CASTER, não do alvo — o
     `dot` do Effect Engine já dreno o alvo, não serve aqui) sem outro
     jutsu do lote pedindo o mesmo; melhor esperar um segundo caso de uso
     antes de generalizar.
   - Shadow Setup: "melhora o Kagemane por 2 rounds" modelado como o
     Estado genérico Focado (BUFF já catalogado) em si mesmo, não como um
     bônus específico ao próximo Kagemane — não existe ainda um hook de
     "sinergia entre jutsus nomeados".
   - Analyze: "revela informação e gera Planejamento" — Arquivo Ninja
     (Marco 7+) e o recurso "Planejamento" do Shikamaru (Marco 4) não
     existem; ficha catalogada com custo/slot corretos, sem efeito
     mecânico extra.
8. **Rank "Especial" do doc 13 (Analyze) virou `rank: 'E'` + `special:
   true`**, não um 9º valor no enum `RANKS` — CANON_RULES fecha os ranks
   em E/D/C/B/A/S/Kinjutsu/EX; "Especial" no doc 13 lê como descrição da
   natureza da ação (ação especial de utilidade), não uma nova categoria
   de poder.

## D017 — Personagens (Marco 4): stats provisórios, loadout honesto, recurso genérico

**Contexto:** `docs/design/12_PERSONAGENS_VERTICAL_SLICE.md` dá fichas
reais para os 4 Genin, mas de forma condensada: só HP/Chakra (+ Controle
de Chakra da Sakura) são números explícitos; os outros atributos
primários e vários jutsus citados no loadout de cada personagem não têm
ficha em `docs/design/13` (que só cobriu 12 jutsus, não todos os
nomeados no loadout dos 4 Genin).

**Decisões:**

1. **Atributos além de HP/Chakra/Controle de Chakra são uma distribuição
   provisória**, derivada do `role` que o doc dá para cada personagem
   (ex: Sasuke "Burst/Precisão/Execução" -> velocidade e precisão mais
   altas; Shikamaru "Controle/Planejamento" -> velocidade baixa,
   resistência mental alta). A alternativa — deixar todos nos defaults
   genéricos da engine — foi rejeitada: violaria CANON_RULES #93/#95
   diretamente ("cada versão precisa ter identidade", "não pode ser
   número diferente só") para as primeiras 4 fichas de personagem do
   projeto. Revisável no Marco 9 sem quebrar nada — `characters.js` é a
   única fonte, `characterBridge.js` sempre lê dali.
2. **Loadout só lista jutsus com ficha real** (`loadout.ativas`/
   `suprema`); nomes do doc 12 sem ficha (ex: "Combo Improvisado" do
   Naruto, "Inner Sakura" da Sakura) viram `pendingAtivas`/
   `pendingSuprema` — strings descritivas, não IDs inventados. Mesmo
   padrão do `assetBacklogP1` do Marco 0: documentar o que falta em vez
   de fabricar uma ficha rasa só para preencher o slot. Testado
   (`characters_catalog.test.js`) para garantir que todo personagem sem
   suprema real declara o pendente, nunca fica silenciosamente incompleto.
3. **Recurso exclusivo é um campo genérico único** no combatente
   (`resource: { id, name, max, current }`, `gainResource`/
   `spendResource` em `combatant.js`), não um sistema por personagem.
   Começa em `current: 0` — a maioria dos recursos (Clones, Planejamento)
   se constrói durante a luta, não vem cheia.
4. **`grantsResource` na ficha do jutsu é a única ponte entre jutsu e
   recurso.** Kage Bunshin (`+2 Clones`) e Analyze (`+1 Planejamento`)
   ganham esse campo porque o doc afirma isso literalmente ("gera 2
   clones", "gera Planejamento"); o valor de Analyze (1) é uma escolha
   conservadora para uma ação de custo 0, sem base textual para um número
   maior. **O que os recursos fazem além de existir e acumular** (ex:
   Rasengan consumir Clones para bônus, o que Foco/Pressão Uchiha
   habilitam) continua fora de escopo — sem essas regras descritas em
   lugar nenhum do pacote de design, implementá-las agora seria inventar
   balanceamento do zero. `spendResource` já existe pronta para quando
   essas regras aparecerem.
5. **Passiva "Cabeça-Dura" catalogada com `effect: null`.** É a única
   passiva nomeada no doc 12; as fichas de Sasuke/Sakura/Shikamaru
   Genin não citam passiva nenhuma, então elas ficam sem `passiveId` —
   não inventamos passivas genéricas para "completar" o quarteto.
6. **`characterBridge.js` (não `combatant.js`) sabe o que é uma
   `CharacterVersion`** — `combatant.js` continua genérico (não lê
   `loadout`/`role`/etc.), só ganha o campo `resource` opcional. Mesma
   separação Engine/Data que `jutsu.js` já seguia com fichas de Jutsu.
7. **Custo de Esquadrão**: `computeSquadCost`/`isSquadWithinBudget`
   (orçamento padrão 12, CANON_RULES #18) implementados agora como
   utilidade pura, mesmo sem uma tela de montagem de equipe ainda
   (isso é Marco 7) — é barato de fazer certo desde já e evita
   reinventar a soma depois.

## D018 — Inimigos e IA (Marco 5): Oculto/Sensorial, IA genérica vs. perfil de boss, fases por %HP

**Contexto:** `docs/design/15_BIBLIOTECA_PROMPTS_VISUAIS_P0_P1.md`/doc 12
listam os arquétipos de inimigo comum do País das Ondas e o primeiro boss
do Vertical Slice (Zabuza), mas nenhum doc dá números de atributo exatos
para eles nem especifica uma máquina de fases formal — só descreve o
comportamento em prosa (névoa, tática de emboscada, etc.).

**Decisões:**

1. **Interação Oculto x Sensorial fecha o item deferido D015#8.**
   `attackerBonusFromTargetStates` agora recebe as `incomingTags` do
   ataque; contra um alvo com o Estado Oculto, todo ataque sofre
   `-20%` de acerto (`OCULTO_EVASION_PENALTY`), **exceto** se carregar a
   Tag Sensorial (`TAG_SENSORIAL_001`) — regra citada literalmente no doc
   ("Sensorial ignora bônus/penalidade de Oculto"). Nenhum jutsu do
   Vertical Slice tem essa tag ainda, então na prática a Fase 2 de Zabuza
   é genuinamente mais difícil de acertar por enquanto — isso é o
   comportamento pretendido, não uma lacuna.
2. **IA genérica por nível (`BASICA`/`INTERMEDIARIA`/`ELITE`) é
   estratégia pura de dado→ação**, sem estado próprio: lê `state`/`actor`
   a cada chamada de `chooseAction` e decide (alvo mais fraco, recuar
   quando o HP está crítico, etc.) — nenhuma dessas estratégias conhece
   personagens específicos, só os campos genéricos do combatente.
3. **Perfil de boss é uma função bespoke hardcoded (`BOSS_AI_PROFILES`),
   não um "sistema de fases" data-driven genérico.** Com um único boss no
   projeto até agora, inventar um formato abstrato de fases orientado a
   dado (condições, prioridades, etc.) seria superarquitetar sem um
   segundo caso de uso para validar o formato (CANON_RULES #76). A ficha
   de dado do boss (`bosses.js`) já declara `phases` (id/hpRange/
   telegraph/behaviorNote) como **documentação estrutural e validável**
   (testada para cobertura 0–100% sem furos/sobreposição, e todo phase
   tem telegraph — CANON_RULES #83), mas quem decide a ação de fato é
   `zabuzaAction`, lendo o HP% do combatente ao vivo. Revisitar esta
   decisão (extrair um motor de fases genérico) quando um segundo boss
   precisar do mesmo padrão.
4. **Fases por %HP, não por gatilho de evento.** Fase 1 (Ataque Direto,
   60–100%), Fase 2 (Névoa Cerrada / Oculto via Kirigakure, 25–60%), Fase
   3 (Desespero, 0–25%) — consistente com a descrição do doc 12/13
   ("perde a paciência conforme o combate avança") e mais simples de
   testar deterministicamente do que um gatilho de N rodadas.
5. **`JUT_KIRIGAKURE_NO_JUTSU_001` (Kirigakure no Jutsu) é uma ficha nova,
   não pré-existente no doc 13** — o doc 13 só cobriu os 12 jutsus dos 4
   Genin jogáveis, nunca os de Zabuza. Como CANON_RULES #30 exige que todo
   boss tenha mecânica real (não só flavor text), a ficha foi autorada
   agora seguindo o mesmo template das demais (Rank B, Ninjutsu+Suiton,
   custo 15, Cooldown 3, `effect: UTILITY`, aplica Oculto garantido por 3
   rodadas) e registrada no catálogo geral de Jutsus — não em um catálogo
   "só de boss" separado, para não duplicar o motor de resolução de
   jutsu.
6. **Stats de inimigo comum (`enemies.js`) são números provisórios**,
   seguindo o mesmo espírito da D012/D017: tier crescente
   (COMMON→VETERAN→SPECIALIST→ELITE) mapeado para HP/atributos
   crescentes, não-ninjas (Bandido) com `chakraMax: 0` (não usam jutsu).
   Revisável no Marco 9 sem tocar na arquitetura — `createCombatantFromEnemy`
   só lê `stats` do catálogo.
7. **`createCombatantFromEnemy`/`createCombatantFromBoss` são o mesmo
   bridge** (a segunda é um alias da primeira) — bosses não têm nenhum
   campo mecânico adicional que o combatente genérico precise conhecer
   (fases/IA são lidas direto da ficha pelo chamador do combate, não pelo
   bridge).
8. **Fraquezas (`weaknesses`) de Zabuza são texto estruturado, não só
   flavor** — descrevem interações mecânicas reais já implementadas (a
   curva de resistência adaptativa favorece controlar cedo; a tag
   Sensorial ignora a penalidade de Oculto), testado
   (`enemies_bosses_catalog.test.js`) só quanto à presença/não-vazio, não
   quanto ao conteúdo exato do texto.

## D019 — Vertical Slice (Marco 6): UI real, roteiro fixo, campanha sem Marco 7

**Contexto:** PROMPT MESTRE §54 define o Vertical Slice como "primeiro
objetivo jogável completo": os 4 Genin, País das Ondas, Zabuza. Mas
"jogável" pressupõe uma UI real controlada por humano (D011 — o dev
console é só diagnóstico) e uma sequência de combates que carregue
estado entre eles — nenhum dos dois é "Combate" (Marco 1-5) puro, e nenhum
dos dois é o sistema de Missões/Mapa completo (Marco 7).

**Decisões:**

1. **Nova UI jogável separada do dev console**: `play.html` +
   `src/ui/game.js` + `play.css`, todos novos — `index.html`/
   `devconsole.js`/`style.css` continuam intocados como página de
   diagnóstico (D011). `play.css` segue a Style Bible (doc 14) — "ninja
   dossier / pergaminho moderno / RPG tático" — paleta clara de
   pergaminho/madeira/selo, deliberadamente diferente do tema escuro do
   dev console.
2. **Roteiro fixo do Vertical Slice, não um sistema de Missões/Mapa.**
   `src/data/vertical_slice.js` (`VERTICAL_SLICE_ENCOUNTERS`) é uma lista
   plana de 3 combates (Emboscada na Estrada -> Mercenários de Gatō ->
   Zabuza) referenciando IDs reais de `enemies`/`bosses`. Deliberadamente
   NÃO vive em `src/data/catalog/` nem ganha um prefixo de ID formal
   (`ENCOUNTER_*`) — não é um "tipo de conteúdo" com Registry própria
   (CANON_RULES D008), é o roteiro específico desta demo, para não
   antecipar o desenho real de nós de mapa/ramificação/recompensa que é
   trabalho do Marco 7. Validado (`tests/data/vertical_slice.test.js`) só
   quanto a referências resolvidas e estrutura básica, não quanto a
   "regras de missão" que ainda não existem.
3. **Bandidos/Mercenários dos 2 primeiros encontros são um encontro
   composto (2 inimigos), não um "arquétipo de emboscada" novo** — reusa
   o catálogo de Inimigos do Marco 5 tal como está; a "dificuldade
   crescente" do roteiro vem só da composição de inimigos por combate,
   sem inventar stats novos.
4. **Estado do esquadrão carrega entre combates (HP/Chakra/recurso
   exclusivo), mas SEM persistência real de "run"** (isso é Marco 7/
   save de run). `src/engine/combat/campaign.js`
   (`snapshotSquad`/`applySquadSnapshot`) é a única ponte: tira uma foto
   dos sobreviventes ao fim de um combate e a aplica sobre os
   combatentes recém-criados do próximo. Combatente com HP 0 não entra
   no snapshot — fica de fora dos combates seguintes (permadeath dentro
   da mesma sessão do slice). Cooldowns/Estados NÃO são carregados
   (resetam a cada novo `CombatState`) — simplificação deliberada: o
   motor não tem uma noção de "tempo entre combates" (viagem, descanso)
   que justificaria decidir se um cooldown deveria persistir ou não;
   carregar só HP/Chakra/recurso já cria peso tático real (chegar
   machucado ou sem Chakra no Zabuza) sem inventar essa regra.
5. **Sem tela de seleção de esquadrão** — o Vertical Slice sempre usa os
   4 Genin (Custo 8/12, já validado no Marco 4). `computeSquadCost`/
   `isSquadWithinBudget` (D017 #7) já existem prontos para quando o
   Marco 7 precisar de uma tela real de montagem de esquadrão com
   escolha; construir essa UI agora, sem outros personagens
   disponíveis, seria antecipar trabalho sem uso real.
6. **Posição inicial padrão (Centro) para os 4 Genin**, em vez de uma
   formação tática pré-definida por `role`. `MOVER` (Marco 1) já está
   exposto como ação jogável — o jogador decide a formação durante o
   combate. Motivo prático: `resolveAttack` só permite MELEE contra a
   linha de frente OCUPADA do alvo (positions.js); uma formação mista
   fixa faria a IA genérica (Marco 5, que não é ciente de alcance) errar
   Ataques Básicos com frequência sempre que mirasse alguém fora da
   linha de frente — caindo no fallback Defender do passo 8 mais do que
   deveria. Times de inimigo continuam só na linha Frente pelo mesmo
   motivo.
7. **`chooseAction` decide toda ação de inimigo na UI, sem exceção** —
   igual ao dev console (Marco 5): a UI só sabe qual `aiLevel`/
   `aiProfile` usar (lido da própria ficha de Inimigo/Boss), nunca
   decide a ação em si. Cada turno de IA tem um atraso fixo de 500ms
   (`AI_STEP_DELAY_MS`) só para dar ritmo visual — não é parte da regra
   de jogo.
8. **Fallback de Defender quando a ação escolhida pela IA falha**
   (chakra insuficiente, cooldown, fora de alcance) — mesmo padrão do
   dev console (Marco 5), trocado de "Ataque Básico" para "Defender" por
   ser incondicionalmente válido (sem exigir alvo/alcance), garantindo
   que o turno sempre avança sem duplicar a lógica de escolha de alvo.
9. **Renderização por string HTML completa a cada mudança de estado**
   (sem framework, sem virtual DOM) com um único listener delegado de
   clique em `#app` — consistente com a abordagem já usada no dev
   console (`mount()`/re-render total). Ações do jogador usam
   `data-option-index` (índice na lista de opções recalculada a cada
   render, determinística para o mesmo estado) e `data-target-id`
   (clique no card do combatente-alvo) em vez de formulários.

## D020 — Run/Mapa/Missões (Marco 7): escopo dos tipos de nó/objetivo, resultado graduado, reclassificação

**Contexto:** `docs/design/04_RUN_MAPA_MISSOES_REGIOES.md`/CANON_RULES.md
pedem um sistema bem mais amplo do que o Combate sozinho cobre: mapa
ramificado com "múltiplos tipos de nó (missão, elite, boss, evento, loja,
hospital, treino, recrutamento, dungeon, descanso, segredo...)", 20 tipos
de objetivo de missão, resultado graduado, reclassificação de rank com 3
escolhas, região com "identidade mecânica e de loot". Boa parte disso
depende de sistemas que ainda não existem (Itens/Economia — doc 03 — para
loja/hospital; Eventos — doc 06 — para evento/segredo; Progressão para
treino/recrutamento).

**Decisões:**

1. **Vocabulário completo, mecânica seletiva** — mesmo padrão do D015 #1.
   `NODE_TYPES` (enums.js) só lista `MISSAO`/`ELITE`/`BOSS`/`DESCANSO`
   (os 4 com mecânica real hoje); `MISSION_OBJECTIVE_TYPES` lista os 20
   tipos do doc como vocabulário fechado, mas só 4 (`BATALHA`, `DEFESA`,
   `CACA`, `DUELO`) ganham Template de Missão real
   (`src/data/catalog/missions.js`) — os demais (Escolta, Infiltração,
   Espionagem, Resgate, Sabotagem...) exigem mecânica não-combate
   (proteger um NPC, furtividade, investigação) que não existe; cadastrar
   um Template "vazio" para eles fabricaria conteúdo sem base
   (CANON_RULES #30/#79).
2. **Resultado graduado de missão** (`src/engine/run/missionResult.js`):
   fórmula provisória baseada em HP% do esquadrão + nº de baixas após o
   combate (Sucesso Perfeito: 0 baixas e ≥85% HP total; Sucesso: 0 baixas
   e ≥50%; Sucesso Parcial: 0 baixas com HP baixo OU exatamente 1 baixa;
   Falha: 2+ baixas; Desastre: o esquadrão perdeu o combate) — mesmo
   espírito da D012 (número sem base textual exata, revisável no
   Marco 9 sem mudar a arquitetura). Falha não encerra a run (CANON_RULES);
   só Desastre encerra (`runState.js#resolveNode`).
3. **Reclassificação mapeada para 3 escolhas mecânicas reais**, sem
   inventar um sistema de reforços/NPCs: "continuar" = luta a versão
   reclassificada tal como está; "recuar" = volta ao mapa e escolhe outro
   nó dentre os já disponíveis (se só houver 1 rota, o jogador
   eventualmente precisa decidir — não há "voltar uma camada", o mapa é
   só progressivo); "buscar reforço" = cura 25% do HP máximo do
   esquadrão (`reinforceSquad`) ao custo de +1 dia no calendário
   (`spendReinforceDay`), sem desfazer a reclassificação. Chance de
   reclassificar é 15% por nó comum (não-Descanso, não-Boss), sorteada
   uma única vez por nó (memoizada via `node.reclassified`) na primeira
   vez que ele aparece como disponível — não a cada render.
4. **Mapa: 2 camadas de nó comum + 1 camada final de Boss**, 2 nós por
   camada comum, cada nó conectando a 1-2 nós da camada seguinte (a
   "ramificação 2-4 rotas" do CANON_RULES nesta escala pequena vira
   "às vezes 1 rota, às vezes 2" — layouts maiores/mais camadas ficam
   para quando houver mais de 1 Região e mais conteúdo de inimigo por
   tier para sustentar mapas maiores sem repetição). Todo nó da camada
   seguinte tem garantia de ao menos 1 aresta de entrada (testado) —
   nenhum nó fica inalcançável.
5. **Região = pool de Inimigo por tier + boss fixo + pesos de tipo de
   nó**, isso já é "identidade mecânica" real (doc: "não só visual") —
   uma 2ª Região com pool/pesos diferentes já jogaria de forma
   perceptivelmente diferente. Identidade de LOOT fica adiada até Itens/
   Economia (doc 03) existir — `lootIdentityNote` documenta isso na
   própria ficha em vez de inventar drops.
6. **Calendário = 1 dia por nó resolvido** (missão, descanso, ou pedido
   de reforço) — implementação mais simples da regra "calendário avança
   com missões, descanso e viagem" sem modelar viagem como um passo
   separado (não há mapa geográfico real com distância, só o grafo de
   nós).
7. **`runState` é serializável em JSON puro** (sem Map/Set/classe) —
   preparado para o SaveManager (Marco 0) salvar/carregar sem adaptação,
   mas o Marco 7 NÃO fiou essa integração (sem autosave/tela de
   carregar); ver item 9 abaixo para o que fica pendente.
8. **Eventos globais que avançam mesmo ignorados, reputação por facção,
   crônica com epílogo dinâmico** (CANON_RULES — Narrativa) ficam de
   fora — dependem do sistema de Eventos/Facções (doc 06), que não
   existe. A Crônica implementada aqui é só o registro
   dia-a-dia/nó-a-nó dos resultados de missão (sem narrativa gerada),
   base honesta para quando Eventos existir.
9. **Pendências explícitas para um marco futuro** (não fabricadas
   agora): salvar/carregar uma Run em andamento via SaveManager (a
   estrutura já é serializável, só falta a UI); nós LOJA/HOSPITAL/
   TREINO/RECRUTAMENTO/DUNGEON/SEGREDO/EVENTO; mais de 1 Região;
   Sucesso/Falha de missão afetando reputação de facção; "recuar"
   permitir voltar uma camada (hoje só permite escolher outra rota já
   disponível na mesma camada).

## D021 — UI do Modo Run (`run.html`) duplica lógica de batalha de `game.js`, não extrai módulo compartilhado ainda

**Contexto:** `src/ui/run.js` (Modo Run, Marco 7) precisa da mesma tela de
batalha que `src/ui/game.js` (Vertical Slice, Marco 6) já tem — HUD de
combatentes, painel de ações, log formatado, tudo em cima do MESMO motor
de combate (nenhuma regra de jogo é duplicada, só a camada de
apresentação).

**Decisão:** `run.js` traz sua própria cópia (levemente adaptada) das
funções de renderização de batalha em vez de extrair um módulo
`battleView.js` compartilhado agora.

**Motivo:** extrair esse módulo exigiria refatorar `game.js` (já validado
via Playwright no Marco 6) para parar de ler o estado `G` module-level
direto e passar tudo por parâmetro — um risco real de regressão sob a
pressão de entregar o Marco 7 inteiro (engine + dados + UI) na mesma
sessão. Prefiro pagar a duplicação agora, documentada, a arriscar quebrar
uma UI que já funciona. **Revisitar esta decisão** (extrair
`src/ui/battleView.js` de verdade) assim que aparecer um 3º consumidor
real da tela de batalha, ou em uma sessão dedicada só a esse refactor com
tempo para re-validar as duas UIs via Playwright depois.

## D022 — Progressão (Marco 8): Maestria sem bônus de status, Ameaça via IA, Arquivo Ninja genérico

**Contexto:** PROMPT MESTRE §2/§37/§38/§40 e CANON_RULES.md — Economia e
Progressão são explícitos: a progressão permanente deve dar principalmente
"novas opções" (personagens, jutsus, regiões, conhecimento), **nunca**
"enormes bônus permanentes de estatística"; Maestria é "por versão de
personagem, ganha jogando, nunca comprada"; Ameaça (0-20) libera após a
1ª vitória e sobe a dificuldade "via IA/composição/mecânica/modificadores
... não apenas HP/dano"; o Arquivo Ninja "registra progressivamente o que
o jogador aprendeu", com conteúdo não descoberto como `???`.

**Decisões:**

1. **Maestria não concede nenhum poder mecânico extra neste marco** — só
   XP/nível acumulados e exibidos (`src/engine/progression/mastery.js`).
   O doc lista "passivas alternativas/skins/pequenas flexibilidades" como
   o que a Maestria destrava, mas os 4 Genin do Vertical Slice só têm 1
   passiva catalogada no total (Cabeça-Dura, D017 #5) e nenhuma
   alternativa/skin com ficha real — inventar o que cada nível
   "libera" mecanicamente fabricaria conteúdo sem base (CANON_RULES
   #30/#79), e "poder mecânico" seria exatamente o tipo de bônus de
   estatística que o doc pede para NÃO existir. Maestria aqui já cumpre
   a parte de "conhecimento" (ver item 3) honestamente; "passivas
   alternativas" fica pendente para quando existirem fichas reais de
   passiva alternativa por personagem.
2. **XP de Maestria vem do resultado graduado de missão** (D020 #2) —
   `xpForMissionResult` (30/20/10/5/0 por Perfeito/Sucesso/Parcial/Falha/
   Desastre, números provisórios no mesmo espírito de D012/D017/D020) —
   e é concedido a TODO o esquadrão que participou da Run inteira (não só
   quem "bateu o golpe final"), somando o XP de cada nó da Crônica de
   uma vez ao fim da Run (`applyRunEnd`). Simplificação deliberada: não
   há registro de XP por ação individual dentro do combate, só por
   missão concluída — granularidade menor seria over-engineering sem uso
   real ainda (nada lê XP "por combatente que participou de X turnos").
3. **Arquivo Ninja é genérico por Content ID** (`src/engine/progression/
   archive.js`) — não conhece "inimigo" vs "boss" vs "região", só um
   array de IDs descobertos; `archiveLabel(archive, id, registry)`
   decide o nome real ou `???` lendo de QUALQUER Registry (enemies/
   bosses/regions hoje; characters/jutsus/etc. quando fizer sentido). Os
   4 Genin do esquadrão NÃO passam pelo Arquivo (o jogador já os conhece
   desde o início — não há "descoberta" de quem você mesmo controla);
   só inimigos/bosses/região entram, descobertos ao serem enfrentados em
   combate (`buildEnemyTeam` alimenta `R.encounteredIds`, aplicado à
   conta no fim da Run). Descoberta é por CONTA (entre runs), não por
   Run individual — uma Run não teve "névoa de guerra" no mapa (os nós
   sempre mostram o nome real do inimigo antes da luta, D020 já
   assumia isso); o Arquivo é só o registro histórico agregado.
4. **Ameaça reaproveita só as duas alavancas já implementadas**
   (`src/engine/progression/threat.js`): nível de IA (`ai.js`, Marco 5 —
   inimigo comum "sobe" 1 nível de IA a partir de Ameaça 8) e chance de
   reclassificação de missão (`reclassify.js`, Marco 7 — +1 ponto
   percentual por nível de Ameaça). Nenhuma stat de combatente é tocada
   — cumpre "não apenas HP/dano" com precisão porque literalmente não
   mexe em HP/dano nenhum. Bosses não sobem de nível de IA (já usam o
   próprio perfil bespoke, `aiLevel: 'BOSS'`, que não está no mapa de
   upgrade). Limiares (8 de Ameaça para o upgrade de IA, +1pp/nível de
   reclassificação, teto 90%) são números provisórios, mesmo espírito
   das decisões anteriores.
5. **`threatUnlocked` é um booleiro simples, não um contador incremental**
   — a primeira vitória libera a FAIXA INTEIRA 0-20 para escolha (o doc
   diz "liberar níveis de Ameaça" após a 1ª vitória, não "libera 1 nível
   por vitória"); o jogador escolhe o nível na tela de Introdução do
   Modo Run quando liberado.
6. **`accountState` é o único estado novo salvo de verdade neste
   marco** (`src/engine/progression/accountState.js`, slot `"account"`
   do `SaveManager` já existente desde o Marco 0) — carregado uma vez no
   boot de `run.js`, salvo a cada fim de Run (`finalizeRunIfEnded`). O
   estado de Run em si (`runState.js`, Marco 7) continua só na memória
   da aba — salvar/carregar uma Run em andamento segue como pendência
   explícita (D020 #9), não é o mesmo problema que salvar a conta.
7. **Pós-game (Boss Rush/Endless/Nukenin/etc., PROMPT MESTRE §39) e
   Roletas/Economia Permanente com Legado/Tickets/Fragmentos
   (CANON_RULES — Economia e Progressão) ficam de fora** — dependem de
   muito mais conteúdo (vários bosses, itens, modos) do que o projeto
   tem hoje; implementá-los agora com 1 boss e 0 itens seria construir
   um sistema vazio. `victories`/`runsPlayed` já ficam registrados em
   `accountState` como base para quando isso for retomado.

## D023 — Protótipo 3 Atos (Marco 9): Gerador procedural de Inimigo, Mini-Boss como capstone, 2ª Região

**Contexto:** PROMPT MESTRE §53 (Marco 9) pede calibrar os números
provisórios acumulados desde o Marco 1 e expandir para pelo menos mais um
Ato. `docs/design/09_BALANCEAMENTO_E_GERADOR.md` é explícito sobre COMO
expandir: "Gerador combina peças validadas, não inventa tudo do zero" —
e `docs/design/05_INIMIGOS_ELITES_BOSSES.md` já descreve um Gerador de
Inimigo (Origem + Rank + Natureza + Especialização + Arma + Traço + Jutsu
+ Modificador) e cita nomes de bosses canônicos (Gaara, Itachi, Pain...)
só como EXEMPLOS do nível de profundidade esperado — não como fichas
prontas para autorar sem base real de números/fases.

**Decisões:**

1. **Inimigo gerado é efêmero, nunca registrado na Registry `enemies`.**
   `generateEnemy`/`generateMiniBoss`
   (`src/engine/generator/enemyGenerator.js`) devolvem um objeto solto
   com ID sintético (`GEN_<rank>_<n>`) sem promessa de estabilidade entre
   runs (CANON_RULES "IDs não mudam por rename" é sobre conteúdo
   AUTORADO permanente — um `GEN_*` não é isso). Fichas geradas também
   não entram no Arquivo Ninja (D022 #3) — só conteúdo estável do
   catálogo é "descoberto" de verdade.
2. **O Gerador só combina peças já validadas em marcos anteriores, sem
   fabricar jutsu novo**: a curva de stats por tier já calibrada no
   Marco 5 (D018 #6, mesmos números-âncora de `enemies.js`) e as 6 Tags
   de Natureza já catalogadas no Marco 2 (D015 #1) — cada Natureza dá só
   um bônus de sabor de +15% em UM atributo (mesmo espírito das
   associações natureza/mecânica de D015/D018, não uma regra nova).
   Todo inimigo gerado usa exclusivamente Ataque Básico — nenhum golpe
   especial é inventado sem ficha real, mesma disciplina de D018 sobre
   Bandido/Mercenário não terem jutsu. Nome/Título vem de bancos de
   palavras genéricos (Traço + Arma), sem citar nenhum nome canônico
   específico do universo Naruto.
3. **Capstone de Região sem boss autorado é um Mini-Boss gerado, não um
   Boss de verdade.** CANON_RULES #30 exige de um Boss "identidade,
   fases, telegraph, counters, fraquezas mecânicas" — um Zabuza de
   verdade (D018) leva design real que este marco não tem base para
   fabricar para uma 2ª Região sem doc específico. `ENEMY_TIERS` já
   listava `MINI_BOSS` desde o Marco 0 sem nunca ter sido usado — agora
   ganha uma âncora de stats própria (acima de ELITE) e usa a estratégia
   `ELITE` genérica de `ai.js` (Marco 5) em vez de um `aiProfile`
   bespoke, honesto sobre não ser um "Boss" no sentido pleno do
   CANON_RULES. `mapGenerator.js#buildBossNode` decide entre boss real
   (`region.bossId`) e mini-boss gerado (`region.useGenerator` sem
   `bossId`) — o node continua marcado `isBoss: true`/tipo `BOSS` (é o
   fim da Run de qualquer forma), só o rank cai de A para B para refletir
   a diferença.
4. **`map.generatedEnemies` é um objeto plano separado de `enemyIds`**
   (`src/engine/run/mapGenerator.js`) — `node.enemyIds` continua só um
   array de strings (compatível com D020, testado), e as fichas geradas
   completas ficam à parte, indexadas por id, ainda serializáveis em
   JSON puro (mantém D020 #7). `buildEnemyTeam` (`run.js`) resolve um
   `enemyId` tentando `bosses` -> `enemies` -> `generatedEnemies`, nessa
   ordem.
5. **2ª Região: Floresta da Morte, Ato Ascensão** — local canônico já
   citado como pós-game suportado no PROMPT MESTRE §39 ("Chūnin Exam"),
   usada aqui só como cenário/ambientação (sem citar personagens
   nomeados específicos do arco). `useGenerator: true`, sem
   `enemyPoolByTier`/`bossId` — todo o pool de inimigo e o capstone vêm
   do Gerador. Prova que o sistema de Região (D020) já suporta os dois
   modos (pool fixo autorado E gerado) sem mudar `mapGenerator.js` para
   quem usa pool fixo (País das Ondas continua byte-a-byte igual,
   testado).
6. **"Calibrar os números provisórios" (Marco 9) neste passo foi, na
   prática, VALIDAR que eles seguem coerentes com mais conteúdo** (Run
   completa na Floresta da Morte jogada via Playwright, sem HP
   desproporcional/combate impossível) em vez de reabrir cada fórmula
   das D012/D017/D020/D022 uma a uma sem dado empírico novo que
   justifique mudar algum número específico — mudar por mudar seria
   inventar calibração sem base, o oposto do que CANON_RULES pede.
   Nenhuma fórmula foi alterada neste marco; revisar de novo quando
   houver mais Atos/Regiões para comparar.

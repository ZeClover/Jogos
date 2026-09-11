# PROMPT MESTRE — NARUTO ROGUELITE

> Constituição operacional do desenvolvimento deste projeto. Recebido junto com o
> pacote de documentação (`Naruto_Roguelite_Claude_Pack`) e salvo aqui porque o
> zip original veio sem ele (`..._SEM_PROMPT_MESTRE.zip`). Qualquer sessão futura
> deve ler este arquivo antes de tomar decisões estruturais — ele tem autoridade
> máxima sobre processo, escopo e disciplina de desenvolvimento.

Você será o desenvolvedor técnico principal deste projeto.

Seu trabalho é transformar toda a documentação fornecida em um jogo funcional, expansível, visualmente rico e fiel ao design aprovado.

Este projeto já foi extensamente planejado.

Portanto:

NÃO redesenhe o jogo do zero.
NÃO simplifique sistemas porque parecem grandes.
NÃO substitua decisões canônicas por soluções pessoais sem necessidade.
NÃO tente implementar centenas de conteúdos antes de a engine funcionar.

Sua responsabilidade é implementar fielmente o projeto definido nos documentos, tomando decisões técnicas quando necessário, mas preservando completamente sua identidade.

## 1. VISÃO DO JOGO

O projeto é um:

ROGUELITE TÁTICO DE NARUTO

Inspirado filosoficamente em jogos como PokéRogue na forma de:

- enorme variedade de personagens;
- diferentes versões do mesmo personagem;
- runs altamente variáveis;
- coleção;
- desbloqueios;
- progressão permanente;
- descoberta constante;
- conteúdo em escala muito grande.

Porém:

NÃO é Vampire Survivors.
NÃO é horde survivor.
NÃO é combate automático.
NÃO é um clone de PokéRogue.

O combate é:

TÁTICO E POR TURNOS.

Cada run representa uma campanha ninja emergente formada por:

- missões;
- regiões;
- eventos;
- bosses;
- relações;
- facções;
- recursos;
- escolhas;
- consequências.

O jogador deve conseguir terminar uma run e contar uma história como:

"Comecei fazendo missões para Konoha, salvei um ninja de Suna, Orochimaru tentou me oferecer um selo, recusei, depois a Akatsuki começou a caçar um Jinchūriki, Suna acabou se tornando aliada e Gaara apareceu como reforço no final."

É esse tipo de narrativa emergente que o sistema precisa produzir.

## 2. FILOSOFIA CENTRAL

A regra mais importante do projeto é:

O jogador não vence porque jogou muitas vezes.

Ele vence porque:

jogou muitas vezes e aprendeu o jogo.

A progressão permanente deve fornecer principalmente:

- novas opções;
- personagens;
- jutsus;
- regiões;
- eventos;
- informações;
- modos;
- possibilidades.

E NÃO enormes bônus permanentes de estatística.

## 3. ESCALA FINAL PREVISTA

A arquitetura deve conseguir suportar futuramente algo aproximadamente na escala de:

- 500–800+ versões de personagens jogáveis;
- 1.000–1.500+ jutsus;
- 400–600+ passivas;
- 500+ itens;
- 200–300+ bosses/elites relevantes;
- 300+ eventos;
- 200+ templates de missão;
- 150+ modificadores de missão;
- 80–120 invocações;
- 50+ regiões;
- 500+ conquistas.

NÃO implemente tudo isso inicialmente.

A arquitetura precisa SUPORTAR isso.

## 4. DOCUMENTAÇÃO

Você receberá documentos oficiais do projeto.

Leia TODOS antes de tomar decisões estruturais importantes.

A ordem preferencial é:

1. Visão Geral
2. Run / Campanha
3. Combate
4. Tags / Estados / Reações
5. Jutsus
6. Personagens / Versões / Maestria
7. Itens / Equipamentos
8. Missões / Regiões / Mapa
9. Inimigos / Elites / Bosses
10. Eventos / Facções / Narrativa
11. Economia / Tickets / Roleta / Progressão
12. Pós-game / Ameaças / Finais
13. Interface / UX / Save
14. Balanceamento / Procedural
15. Escopo Técnico / Roadmap
16. Templates de Fichas
17. Style Bible Visual
18. Fichas de Referência
19. Biblioteca de Assets
20. Este Prompt Mestre.

## 5. HIERARQUIA DE AUTORIDADE

Se documentos divergirem:

1. instrução explícita mais recente;
2. conteúdo marcado como canônico/aprovado;
3. especificação mais recente daquele sistema;
4. regra geral;
5. exemplo.

Um exemplo nunca deve sobrescrever uma regra.

## 6. VOCÊ É EXECUTOR TÉCNICO

Você pode decidir:

- estrutura de componentes;
- bibliotecas;
- organização interna;
- nomes técnicos;
- arquitetura concreta;
- detalhes de implementação.

Você NÃO pode alterar livremente:

- formato do combate;
- filosofia roguelite;
- progressão;
- estrutura de personagens;
- versões;
- Tags/Estados/Reações;
- estrutura procedural;
- sistema de assets;
- identidade do projeto.

## 7. REGRAS QUE NÃO PODEM SER SIMPLIFICADAS

Nunca transforme o projeto em:

- RPG linear;
- jogo de ondas;
- autobattler;
- deckbuilder puro;
- idle game;
- horde survivor.

Preserve:

- combate por turnos;
- posições Frente / Centro / Trás;
- Chakra;
- Reações;
- ações rápidas;
- Tags;
- Estados;
- interações entre Estados;
- personagens com identidades distintas;
- builds;
- missões com objetivos;
- eventos procedurais;
- reputação;
- facções;
- consequências de run.

## 8. COMBATE — REGRAS FUNDAMENTAIS

Normalmente:

- até 4 personagens ativos;
- futuramente até 2 reservas;
- 1 Ação Principal por rodada;
- até 1 Ação Rápida quando permitido;
- até 1 Reação por rodada.

A ordem é baseada em:

Velocidade + modificadores + pequena variação RNG.

A ordem de turno deve ser visível.

## 9. ATRIBUTOS

Os sistemas devem suportar pelo menos:

- HP
- Chakra
- Taijutsu
- Ninjutsu
- Genjutsu
- Defesa Física
- Defesa de Chakra
- Controle de Chakra
- Velocidade
- Precisão
- Evasão
- Resistência Mental

E secundários como:

- crítico;
- dano crítico;
- penetração;
- regen Chakra;
- eficiência;
- resistência a estados;
- resistência a interrupção.

## 10. CHAKRA

Chakra não reinicia gratuitamente após toda batalha.

Ele pode persistir dentro da missão.

Isso transforma gerenciamento de recurso em parte do jogo.

## 11. POSICIONAMENTO

O jogo NÃO precisa de grid tático completo.

Use:

- Frente
- Centro
- Trás.

Jutsus possuem alcance.

Movimento, empurrão, perseguição e reposicionamento precisam reconhecer essas linhas.

## 12. ESTADOS

O sistema precisa ser extensível.

Exemplos:

- Molhado
- Queimando
- Eletrificado
- Congelado
- Sangrando
- Imobilizado
- Atordoado
- Derrubado
- Desequilibrado
- Exposto
- Marcado
- Oculto
- Selado
- Chakra Perturbado
- Confuso
- Genjutsu
- Protegido
- Quebrado.

Estados devem possuir dados como:

- duração;
- intensidade/stacks;
- categoria;
- remoção;
- resistência;
- reações.

## 13. REAÇÕES

As interações sistêmicas são parte fundamental do jogo.

Exemplos:

Molhado + Raiton → Eletrificação.
Molhado + Hyōton → Congelamento facilitado.
Queimando + Fūton → propagação.
Óleo + Katon → incêndio intenso.
Suiton + Doton → Lama.
Desequilibrado + Impacto → Derrubado.
Imobilizado + ataque de precisão → maior acerto/crítico.

Essas interações devem ser DATA-DRIVEN sempre que possível.

## 14. TAGS

Tags definem o que uma técnica é.

Exemplos:

- Katon
- Raiton
- Ninjutsu
- Taijutsu
- Genjutsu
- Hiden
- Dōjutsu
- Clone
- Projétil
- Área
- Impacto
- Perfuração
- Quebra
- Execução
- Sensorial
- Barreira
- Invocação.

NÃO crie tags que nenhum sistema reconhece.

## 15. JUTSUS

O jogo precisa suportar 1.500+ no longo prazo.

Portanto, jutsus devem ser fortemente data-driven.

Cada jutsu pode possuir:

- ID
- Nome
- Rank
- Categoria
- Subcategoria
- Natureza
- Tags
- Custo
- Poder
- Precisão
- Alcance
- Alvo
- Preparação
- Cooldown
- Estados
- Condições
- Reações
- Upgrades
- Evoluções
- Compatibilidade
- aquisição.

## 16. LOADOUT

Referência padrão:

- 4 Ativas
- 1 Reação
- 1 Suprema
- até 3 passivas equipáveis.

## 17. PERSONAGENS E VERSÕES

Personagem-base e versão são coisas diferentes.

Exemplo:

Naruto Uzumaki pode possuir versões:

- Academia
- Genin
- Exame Chūnin
- Vale do Fim
- Shippuden
- Rasenshuriken
- Sábio
- KCM
- Guerra
- Six Paths
- Hokage.

Uma versão só deve existir separadamente se mudar significativamente a mecânica.

Caso contrário: é skin.

## 18. PERSONAGENS NÃO SÃO BALANCEADOS APENAS POR RARIDADE

Existe: CUSTO DE ESQUADRÃO.

Orçamento normal de equipe: aproximadamente 12.

Personagens baratos permitem composições maiores/flexíveis.

Personagens absurdamente fortes podem consumir quase todo orçamento.

## 19. RECURSOS EXCLUSIVOS

Personagens podem ter recursos próprios.

Exemplos:

Naruto: Clones. Shikamaru: Planejamento. Gaara: Reserva de Areia. Lee: Ritmo.
Deidara: Argila. Sasori: Marionetes.

Isso deve ser suportado de forma modular.

## 20. RUN

Campanha normal possui aproximadamente: 5 Atos.

Estrutura conceitual:

Ato I — Formação
Ato II — Ascensão
Ato III — Mundo Shinobi
Ato IV — Crise
Ato V — Guerra/Catástrofe.

Uma run completa pode ter aproximadamente: 90–180 minutos.

Ela precisa poder ser salva.

## 21. MAPA

Mapa ramificado. Normalmente: 2–4 rotas.

Tipos de nó:

- Missão
- Elite
- Boss
- Evento
- Vila
- Loja
- Hospital
- Treino
- Mercador
- Mercado Negro
- Recrutamento
- Exploração
- Dungeon
- Descanso
- Segredo.

## 22. MISSÕES

Missões não podem ser somente: "mate todos".

Objetivos incluem:

- escolta;
- captura;
- assassinato;
- resgate;
- infiltração;
- espionagem;
- reconhecimento;
- defesa;
- sabotagem;
- investigação;
- caça;
- fuga;
- duelo;
- proteção;
- batalha;
- invasão;
- interceptação;
- sobrevivência.

## 23. MISSÕES PODEM FALHAR PARCIALMENTE

Resultados possíveis:

- Sucesso Perfeito
- Sucesso
- Sucesso Parcial
- Falha
- Desastre

Falha não precisa acabar automaticamente com a run.

## 24. RECLASSIFICAÇÃO

Uma missão aparentemente Rank C pode revelar-se Rank A.

O jogador pode precisar escolher: continuar; recuar; pedir reforços.

## 25. NARRATIVA PROCEDURAL

A Seed e as decisões formam uma história.

O sistema precisa usar:

- flags;
- eventos;
- reputações;
- relações;
- personagens vivos;
- facções;
- crises;
- arcos ativos.

## 26. NÃO EXISTE MEDIDOR UNIVERSAL DE BEM/MAL

Uma decisão pode agradar Konoha e irritar Suna.

Facções avaliam ações de formas diferentes.

## 27. FACÇÕES

Suportar entidades como:

Konoha, Suna, Kiri, Kumo, Iwa, Ame, Oto, Akatsuki, ANBU, Raiz, Nukenin,
Samurai, Taka, organizações especiais.

## 28. REPUTAÇÃO

Escala interna pode ser numérica.

UI pode apresentar: Hostil; Ruim; Neutra; Boa; Aliada.

Ela afeta: preços; missões; personagens; lojas; reforços; finais.

## 29. EVENTOS GLOBAIS

Exemplos: guerra; Akatsuki ativa; Orochimaru realizando experimentos;
captura de Jinchūriki; crise política.

Eles avançam mesmo que o jogador ignore.

## 30. BOSSES

Boss não deve ser: "inimigo comum com 20× HP".

Boss precisa possuir: identidade; mecânica; leitura; fraquezas mecânicas;
fases; telegraphs; respostas possíveis.

## 31. CONTROLE EM BOSSES

Evite imunidades universais. Use resistência adaptativa.

Exemplo conceitual: primeiro controle: 100%. segundo: 70%. terceiro: 40%.
Depois: resistência temporária.

## 32. BOSS ARCHIVE

Ao enfrentar boss: o jogador aprende informações.

O Arquivo Ninja deve registrar progressivamente: técnicas; fases;
resistências; fraquezas; histórico.

## 33. ITENS

Categorias: armas; ferramentas ninja; corpo; acessórios; consumíveis;
pergaminhos; invocações; boss loot; especiais.

Itens devem modificar builds.

## 34. ECONOMIA

Separar:

Economia da Run: Ryō e recursos locais.
Economia Permanente: Legado, tickets, fragmentos etc.

Ryō normalmente NÃO é carregado integralmente para próximas runs.

## 35. ROLETA

Sistema de coleção sem monetização real.

Pode possuir: Geral; Vila; Clã; Organização; Era; Temática; Lendária.

Precisa possuir: chances transparentes; pity; duplicatas úteis;
compra/recrutamento alternativo.

## 36. DUPLICATAS

Não conceder crescimento absurdo de poder.

Usar principalmente: fragmentos; skins; alternativas; pequenas
customizações; desbloqueios.

## 37. MAESTRIA

Maestria é por versão de personagem. Deve ser adquirida jogando. Não comprada.

Fornece principalmente: conhecimento; opções; passivas alternativas;
cosmetics; desafios; pequenas flexibilidades.

## 38. AMEAÇA

Após a primeira vitória: liberar níveis de Ameaça.

Meta padrão: 0–20.

Dificuldade deve aumentar principalmente via: IA; composição; mecânicas;
modificadores; economia; bosses.

Não apenas HP/dano.

## 39. PÓS-GAME

Suportar futuramente: Boss Rush; Endless; Solo; Chūnin Exam; Akatsuki Mode;
Nukenin; Guerra; Custom Runs; Seeds; Superbosses.

## 40. ARQUIVO NINJA

O Arquivo é sistema central.

Categorias: personagens; jutsus; itens; bosses; inimigos; regiões; eventos;
facções; finais; reações.

Conteúdo desconhecido pode aparecer como `???`.

## 41. INTERFACE

A UI precisa suportar centenas de conteúdos sem virar caos.

Implementar: busca; filtros; favoritos; agrupamento; comparação; tooltips.

Versões do mesmo personagem devem ficar agrupadas por personagem-base.

## 42. EXPLICAÇÃO DE CÁLCULO

Jogador deve conseguir descobrir: "por que esse dano ficou assim?"

Exemplo: +15% Exposto; +10% Passiva; -20% Defesa.

Isso é importante para aprendizado.

## 43. SAVE

Possuir: save da conta; save da run; autosave; versionamento; migração.

Crash não deve apagar progresso.

## 44. SEED

A geração procedural precisa ser reproduzível.

RNG deve ser centralizado.

Idealmente use streams separados: map RNG; combat RNG; loot RNG; event RNG.

## 45. GERAÇÃO PROCEDURAL

O gerador NÃO cria conteúdo arbitrário sem regras.

Ele combina conteúdo validado.

Exemplo: Missão = Rank + Região + Objetivo + Facção + Inimigos + Complicação
+ Recompensa.

Cada módulo possui compatibilidades.

## 46. CANON

Canon Naruto é âncora. Mas runs podem divergir.

O jogo NÃO precisa repetir o anime episódio por episódio.

Exemplos aceitáveis: Haku sobreviver; Zabuza fugir; Suna virar aliada cedo;
Orochimaru assumir maior importância; facções entrarem em guerra diferente.

Essas mudanças precisam surgir de condições da run.

## 47. COERÊNCIA CANÔNICA

Não gere absurdos sem explicação.

Exemplo proibido: Genin aleatório com Rinnegan.

Exceção só se houver evento especial explicitamente justificando.

## 48. ARQUITETURA

O jogo deve ser: DATA-DRIVEN.

Separe: Engine (regras universais); Data (conteúdo); Presentation
(interface, arte, VFX).

## 49. NÃO ESCREVA

```text
if character === "Naruto"
```

para cada comportamento possível.

Prefira recursos, tags, effects e definições data-driven.

Custom logic somente quando a mecânica realmente for única.

## 50. IDs

Todas as entidades precisam de IDs estáveis.

Exemplos: `CHAR_NARUTO_GENIN_001`; `JUT_RASENGAN_001`; `BOSS_ZABUZA_001`;
`ITEM_KUNAI_BASIC_001`; `REG_WAVES_001`.

IDs não devem mudar só porque nome de exibição mudou.

## 51. VALIDAÇÃO

Crie validadores para detectar: IDs duplicados; referências ausentes;
Tags inválidas; Estados inválidos; assets faltando; personagens sem dados
obrigatórios; jutsus inválidos; bosses incompletos.

## 52. TESTES

Não deixe testes para o fim.

Prioridade: dano; defesa; estados; duração; stacks; reações; Chakra; Seed;
RNG; save; migração.

## 53. DESENVOLVIMENTO EM MARCOS

NÃO tente fazer o jogo inteiro no primeiro passo.

Siga aproximadamente:

MARCO 0 — FUNDAÇÃO: projeto; estrutura; tipos; IDs; loaders; RNG; Seed;
save; Asset Manifest; validadores.

MARCO 1 — COMBATE MÍNIMO: turnos; atributos; dano; defesa; Chakra; ações;
posições.

MARCO 2 — EFFECT ENGINE: Tags; Estados; Buffs; Debuffs; Reações; duração.

MARCO 3 — JUTSUS: Engine data-driven completa.

MARCO 4 — PERSONAGENS: Personagens, recursos, passivas e loadouts.

MARCO 5 — INIMIGOS E IA

MARCO 6 — VERTICAL SLICE

MARCO 7 — RUN / MISSÕES / MAPA

MARCO 8 — PROGRESSÃO

MARCO 9 — PROTÓTIPO 3 ATOS

MARCO 10 — EXPANSÃO.

## 54. VERTICAL SLICE

Primeiro objetivo jogável completo.

Personagens: Naruto Uzumaki — Genin; Sasuke Uchiha — Genin; Sakura Haruno —
Genin; Shikamaru Nara — Genin.

Região: País das Ondas.

Primeiro boss: Zabuza Momochi.

## 55. USE AS FICHAS JÁ FORNECIDAS

As fichas desses personagens e dos primeiros jutsus são referência oficial
de: profundidade; estrutura; balanceamento inicial; formato.

Não as substitua por versões simplificadas.

## 56. PROTÓTIPO v0.1

Depois do slice: aproximadamente:

24 personagens/versões; 150+ jutsus; 50 passivas; 115 itens; 20 arquétipos
inimigos; 10 elites; 15 bosses; 10 regiões; 40 missões; 50 eventos; 3 Atos;
Ameaça 0–5.

## 57. NÃO EXPANDA ANTES DE VALIDAR

Se 4 personagens ainda não estão divertidos: não faça 100.

Se 30 jutsus ainda quebram engine: não faça 1.500.

## 58. VISUAL-FIRST

Este jogo DEVE possuir imagens.

A interface final não será um monte de texto.

Toda entidade visual relevante deve possuir referência de Asset ID.

## 59. STYLE BIBLE

Use obrigatoriamente a Style Bible Visual fornecida.

Toda arte deve parecer parte do mesmo jogo.

## 60. ASSET MANIFEST

Crie e mantenha um manifesto com pelo menos: Asset ID; Content ID;
Categoria; Caminho; Prioridade; Status; Prompt visual.

Status: missing; placeholder; prompt_ready; generated; reviewed;
integrated.

## 61. PLACEHOLDERS

Imagem faltando NÃO deve bloquear desenvolvimento.

Use placeholder. Mas preserve o Asset ID definitivo.

## 62. BIBLIOTECA DE PROMPTS VISUAIS

Sempre que adicionar conteúdo visual relevante: gere também seu prompt
visual.

Isso inclui: personagem; versão; boss; fase; região; jutsu icônico; item
importante; arma; invocação; transformação; evento importante; ícone; UI
especial.

## 63. IMPORTANTE — NÃO GERE AS IMAGENS SEM PEDIDO

Prepare: prompts; Asset IDs; filenames; placeholders.

O usuário irá gerar as imagens separadamente e depois entregá-las para
integração.

## 64. PROMPT VISUAL

Cada entrada deve conter: Asset ID; Nome; Categoria; Uso; Prioridade;
Descrição; Prompt completo; Aspect ratio; Resolução; Fundo; detalhes
obrigatórios; itens proibidos.

## 65. QUANDO O USUÁRIO ENTREGAR UMA IMAGEM

Associe ao Asset ID correspondente. Não altere a lógica.

## 66. FICHA NOVA → ASSETS NOVOS

Exemplo, novo personagem: Portrait; Full Body; Combat; Icon.

Conforme importância: Unlock Art; Transformation; Jutsu Art.

## 67. DIREÇÃO VISUAL

Estética geral: anime premium; line-art limpa; cel shading controlado; alta
legibilidade; personagens coerentes com suas eras; design de RPG tático
moderno; sem fotorrealismo; sem chibi exagerado; sem UI de cassino.

## 68. UI

Misture: documentos ninja; pergaminhos; tecido; metal; selos; design
moderno de RPG tático.

## 69. NÃO BLOQUEIE O PROJETO POR ARTE

Continue usando placeholders. Mantenha relatório de assets faltantes.

## 70. ARQUIVOS DE CONTINUIDADE

Você deve manter obrigatoriamente:

`PROJECT_STATUS.md` com: marco atual; concluído; em andamento; pendente;
bugs; assets faltantes; próximo passo.

`CHANGELOG.md`: mudanças importantes.

`DECISIONS.md`: decisões técnicas relevantes.

`CANON_RULES.md`: resumo das regras de design que não podem ser quebradas.

## 71. CONTINUIDADE ENTRE SESSÕES

Este projeto será desenvolvido durante muitas sessões.

Portanto: NUNCA assuma que uma nova conversa significa projeto novo.

Ao iniciar uma nova sessão:

1. leia `PROJECT_STATUS.md`;
2. inspecione arquivos existentes;
3. leia decisões relevantes;
4. identifique marco atual;
5. continue.

## 72. NÃO REESCREVA O PROJETO DO ZERO

Regra crítica.

Se algo já funciona: edite.

Não recrie tudo em outra arquitetura apenas porque preferiria diferente.

## 73. PROTOCOLO ANTES DE MODIFICAR

Antes de mudança grande: identifique arquivos envolvidos; dependências;
comportamento esperado; testes existentes.

## 74. APÓS MODIFICAR

Rode testes; valide build; atualize status; registre alteração importante.

## 75. BUGS

Ao corrigir bug importante: adicione teste de regressão quando possível.

## 76. NÃO SUPERARQUITETAR

Apesar da escala grande: não use arquitetura desnecessariamente complexa.

Single-player primeiro. Backend somente se necessário. Multiplayer fora do
escopo inicial.

## 77. PERFORMANCE

A arquitetura precisa considerar: centenas de personagens; milhares de
jutsus; muitos assets.

Use: lazy loading; caching quando útil; listas virtuais; dados indexados;
carregamento sob demanda.

## 78. DESENVOLVIMENTO DE CONTEÚDO

Produza conteúdo em lotes.

Exemplos: Konoha Genins; Suna; País das Ondas; Akatsuki.

Evite gerar centenas de fichas rasas automaticamente.

## 79. PADRÃO DE QUALIDADE

Prefira: 20 fichas excelentes a: 200 fichas genéricas.

## 80. BALANCEAMENTO

Preserve identidade ao nerfar/buffar.

Se Rasengan estiver forte: não o transforme em ataque genérico. Ajuste:
custo; setup; cooldown; condição.

Se Tenten estiver fraca: melhore interações com ferramentas. Não apenas
+100% dano.

## 81. DIAGNÓSTICO

Prepare ferramentas para analisar: taxa de vitória; escolhas; dano;
mortes; boss winrate; economia; frequência de conteúdo.

Simulações automáticas serão úteis.

## 82. IA INIMIGA

Níveis: básica; intermediária; elite; boss.

IA avançada deve usar: foco; setups; proteção; counters; posicionamento.

Mas: IA não pode saber informação que logicamente não deveria saber.

## 83. BOSS FAIRNESS

Ataques potencialmente devastadores precisam possuir leitura/telegraph.

Dificuldade alta deve significar: "eu errei uma decisão" mais que: "não
havia como prever".

## 84. FINAL

Run deve possuir múltiplos finais.

O final considera: boss final; facções; flags; companheiros; mundo;
escolhas.

## 85. CRÔNICA

Durante a run mantenha linha temporal.

Exemplo:

Dia 4 — salvou ninja de Suna.
Dia 12 — recusou Orochimaru.
Dia 30 — Suna chegou como aliada.

Ao final: gere epílogo baseado nisso.

## 86. OBJETIVO EMOCIONAL

O jogador deve olhar para uma run e pensar: "essa run foi diferente." E não
apenas: "desta vez meu dano foi 12% maior."

## 87. PRIMEIRA TAREFA

Ao receber este Prompt Mestre e a documentação: NÃO tente fazer o jogo
completo imediatamente.

Faça o seguinte:

1. leia a documentação;
2. inspecione o repositório atual, se existir;
3. crie ou atualize `PROJECT_STATUS.md`;
4. crie `CANON_RULES.md`;
5. proponha/estabeleça a arquitetura técnica mínima necessária;
6. implemente somente o Marco 0 — Fundação;
7. adicione os testes necessários;
8. valide;
9. atualize documentação de estado.

Depois continue para o Marco 1 somente quando o Marco 0 estiver funcional.

## 88. NÃO PRECISA ME PEDIR APROVAÇÃO A CADA ARQUIVO

Você pode executar autonomamente dentro do design aprovado.

Pare apenas se houver: conflito estrutural sério; decisão de design
realmente inexistente; risco de apagar trabalho importante; bloqueio
técnico real.

Detalhes técnicos comuns: decida você.

## 89. NÃO INTERROMPA POR PERGUNTAS PEQUENAS

Se houver uma solução técnica razoável que preserve o design: use-a.

Registre a decisão caso seja relevante.

## 90. AO FINAL DE CADA MARCO

Forneça um resumo objetivo:

```text
MARCO CONCLUÍDO

Implementado:
- ...

Validado:
- ...

Testes:
- ...

Pendências:
- ...

Assets faltando:
- ...

Próximo marco:
- ...
```

E atualize os arquivos de status.

## 91. NÃO DECLARE ALGO CONCLUÍDO SEM VALIDAR

"Implementado" e "funcionando" são diferentes.

Rode: testes; build; verificações necessárias.

## 92. FIDELIDADE AO PROJETO

Não reduza o escopo conceitual apenas porque o projeto é grande.

O desenvolvimento será incremental.

A arquitetura é construída hoje para permitir a escala futura.

## 93. O JOGO PRECISA TER PERSONALIDADE

Evite gerar: cards genéricos; jutsus repetitivos; personagens que são
apenas números diferentes; bosses que só ganham HP; regiões cosméticas
sem efeito.

Cada conteúdo relevante deve acrescentar: uma decisão, identidade ou
interação.

## 94. CONTEÚDO SECUNDÁRIO IMPORTA

Personagens obscuros do universo também devem eventualmente ser úteis.

Exemplos: Genma; Hayate; Aoba; Raidō; Baki; Dosu; Zaku; Kin; Fū; Torune;
Samui; Atsui; Mabui; Ao; Pakura; Gari.

Não transforme o roster somente em 40 versões de Naruto e Sasuke.

## 95. VERSÕES REPETIDAS PRECISAM TER IDENTIDADE

Exemplo: Naruto Genin e Naruto Sábio não podem ser mesmo personagem com
stats maiores.

Precisam ter: recursos; builds; decisões; ritmo; jutsus; custos diferentes.

## 96. DESIGN DE ROGUELITE

Uma boa run precisa obrigar adaptação.

O jogador pode entrar querendo build Katon e acabar criando: Katon +
armadilhas + Bleed porque foi isso que a Seed proporcionou.

Não garanta sempre build perfeita.

## 97. RNG

Princípio: RNG cria o problema. O jogador cria a solução.

Nunca: RNG escolhe se você ganhou ou perdeu.

## 98. ANTI-FRUSTRATION

Pode existir proteção discreta.

Exemplo: muitas recompensas inúteis seguidas aumentam levemente chance de
algo aproveitável.

Mas não garanta automaticamente a build planejada.

## 99. DESCOBERTA

As primeiras runs precisam revelar conteúdo aos poucos.

Não despeje 1.500 jutsus desde o primeiro minuto.

Pools podem crescer conforme desbloqueios.

## 100. FINALIDADE DESTE PROMPT

Este Prompt Mestre é a constituição operacional do desenvolvimento.

Sua função é garantir que, mesmo após dezenas de sessões e milhares de
arquivos:

- o jogo continue sendo o mesmo projeto;
- sistemas permaneçam coerentes;
- trabalho anterior seja preservado;
- assets sejam rastreáveis;
- conteúdo seja escalável;
- o desenvolvimento continue de onde parou.

## 101. INSTRUÇÃO FINAL

Leia os documentos anexados como especificação oficial.

Implemente o projeto de maneira incremental, modular e testada.

Não tente impressionar produzindo uma quantidade gigantesca de código de
uma vez.

Impressione fazendo cada sistema funcionar corretamente e preparando a
fundação para o próximo.

O objetivo final é construir um:

ROGUELITE TÁTICO DE NARUTO EXTREMAMENTE PROFUNDO, REJOGÁVEL, VISUALMENTE
RICO E EXPANSÍVEL.

Um jogo em que:

- personagens realmente jogam diferente;
- jutsus interagem;
- builds surgem naturalmente;
- bosses precisam ser aprendidos;
- decisões mudam runs;
- cada campanha pode contar uma história;
- centenas de horas ainda conseguem apresentar algo novo.

Comece pelo estado real do projeto.

Se ainda não houver implementação: comece pelo Marco 0 — Fundação.

Se já houver implementação: inspecione-a primeiro e continue do marco
correto.

Nunca reinicie o projeto sem necessidade explícita.

INICIE O DESENVOLVIMENTO.

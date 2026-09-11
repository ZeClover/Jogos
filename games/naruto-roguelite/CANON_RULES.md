# CANON_RULES — Naruto Roguelite

Resumo de referência rápida das regras de design que **não podem ser
quebradas ou simplificadas**, mesmo sob pressão de prazo, escala ou
preferência técnica pessoal. Fonte completa: `docs/design/` (17 documentos +
`17_PROMPT_MESTRE.md`). Em caso de dúvida, a hierarquia de autoridade é:

1. Instrução explícita mais recente do usuário.
2. Conteúdo marcado como canônico/aprovado nos docs.
3. Especificação mais recente daquele sistema.
4. Regra geral.
5. Exemplo (um exemplo nunca sobrescreve uma regra).

## Identidade do jogo

- Roguelite **tático por turnos**, não horde-survivor, não autobattler, não
  idle, não deckbuilder puro, não RPG linear.
- Inspiração filosófica em PokéRogue (variedade, coleção, runs variáveis,
  progressão horizontal) — não um clone mecânico dele.
- Regra central: o jogador vence porque **aprendeu o jogo**, não porque
  acumulou bônus permanentes de stat.
- Progressão permanente = mais opções (personagens, jutsus, regiões,
  eventos, modos), não poder bruto.

## Combate (obrigatório preservar)

- Até 4 personagens ativos (futuramente +2 reservas).
- 1 Ação Principal, até 1 Ação Rápida, até 1 Reação por rodada.
- Posições **Frente / Centro / Trás** (não é grid tático completo).
- Ordem de turno = Velocidade + modificadores + variação RNG pequena;
  sempre visível ao jogador.
- Chakra **persiste dentro da missão** — não reseta de graça a cada batalha.
- Atributos mínimos: HP, Chakra, Taijutsu, Ninjutsu, Genjutsu, Defesa
  Física, Defesa de Chakra, Controle de Chakra, Velocidade, Precisão,
  Evasão, Resistência Mental (+ secundários: crítico, dano crítico,
  penetração, regen, eficiência, resistência a estado/interrupção).

## Tags, Estados, Reações

- Tags definem o que uma técnica *é* (Katon, Ninjutsu, Área, Perfuração...).
  Nunca criar tag que nenhum sistema lê.
- Estados são extensíveis e carregam duração, stacks, categoria, remoção,
  resistência e reações associadas.
- Reações entre Estados/Tags são **data-driven** (ex: Molhado + Raiton =
  Eletrificação). Máximo sugerido de 4 reações automáticas por ação, para
  evitar loops infinitos.

## Jutsus e Loadout

- Jutsus fortemente data-driven (meta de 1.500+ no longo prazo).
- Loadout padrão: 4 Ativas + 1 Reação + 1 Suprema + até 3 passivas
  equipáveis.

## Personagens e Versões

- Personagem-base ≠ versão. Uma versão só existe separada se muda a
  **mecânica**; senão é skin.
- Versões do mesmo personagem precisam ter identidade real: recursos,
  builds, ritmo, custos diferentes — nunca "mesmo personagem com stats
  maiores" (ex: Naruto Genin ≠ Naruto Sábio em jogabilidade).
- Custo de Esquadrão: orçamento padrão de equipe ≈ 12. Balanceamento não é
  só raridade.
- Recursos exclusivos por personagem são suportados de forma modular (ex:
  Clones do Naruto, Planejamento do Shikamaru, Areia do Gaara).
- Roster não pode virar "40 versões de Naruto e Sasuke": personagens
  secundários (Genma, Baki, Fū, Samui, etc.) precisam ser eventualmente
  úteis.

## Run / Campanha

- ~5 Atos: Formação, Ascensão, Mundo Shinobi, Crise, Guerra/Catástrofe.
- Run completa: ~90–180 min, sempre saveável.
- Mapa ramificado, 2–4 rotas, múltiplos tipos de nó (missão, elite, boss,
  evento, loja, hospital, treino, recrutamento, dungeon, descanso, segredo...).
- Seed determina mapa, eventos, loot, bosses, lojas e modificadores —
  reproduzível.

## Missões

- Nunca apenas "mate todos": escolta, captura, infiltração, resgate,
  sabotagem, duelo, sobrevivência etc.
- Resultados graduais: Sucesso Perfeito / Sucesso / Sucesso Parcial / Falha
  / Desastre. Falha não precisa encerrar a run.
- Reclassificação de rank é possível (C pode virar A); jogador escolhe
  continuar, recuar ou pedir reforço.

## Narrativa, Facções, Eventos

- Sem medidor universal de bem/mal — facções reagem de formas diferentes à
  mesma ação.
- Reputação por facção (Hostil → Aliada) afeta preços, missões, reforços,
  finais.
- Eventos globais avançam mesmo se o jogador ignorar.
- No máximo ~3 grandes arcos procedurais simultâneos.
- Canon é âncora, não prisão: divergências (Haku sobrevive, Suna alia cedo
  etc.) precisam ter causa rastreável na run — nunca um absurdo sem
  explicação (ex: Genin aleatório com Rinnegan).
- Crônica da run registra decisões por dia → epílogo dinâmico no final.

## Bosses

- Nunca "inimigo comum com HP× maior". Precisa de identidade, fases,
  telegraph, fraquezas mecânicas, counters.
- Controle usa **resistência adaptativa** (100% → 70% → 40% → resistência
  temporária), nunca imunidade universal.
- Ataques devastadores sempre têm leitura/telegraph — dificuldade alta deve
  parecer "eu errei uma decisão", não "impossível de prever".
- Arquivo Ninja registra progressivamente o que o jogador aprendeu sobre
  cada boss.

## Economia e Progressão

- Economia da Run (Ryō, materiais) é separada da Economia Permanente
  (Legado, Tickets, Fragmentos) — Ryō normalmente não carrega entre runs.
- Roletas têm chance transparente, pity, e nunca duplicata = +poder direto
  (fragmentos/skins/desbloqueios laterais, sim).
- Maestria é por versão de personagem, ganha jogando, nunca comprada.
- Ameaça 0–20 pós primeira vitória; dificuldade sobe via IA/composição/
  mecânica/modificadores — não apenas HP/dano.

## RNG e Determinismo

- RNG **sempre** centralizada via Seed (streams nomeadas: map, combat,
  loot, event, ou customizadas). Nunca `Math.random()` solto em lógica de
  jogo.
- Princípio: **RNG cria o problema, o jogador cria a solução.** RNG nunca
  decide sozinha vitória/derrota.
- Descoberta gradual: não despejar todo o conteúdo desbloqueável de uma vez.

## Arquitetura

- **Data-driven**: separar Engine (regras universais) / Data (conteúdo) /
  Presentation (UI, arte, VFX). Evitar `if character === "Naruto"` para
  comportamento — preferir tags/effects/recursos data-driven; lógica custom
  só quando a mecânica é realmente única.
- IDs estáveis, formato `PREFIXO_NOME..._NNN` (ex: `CHAR_NARUTO_GENIN_001`).
  Nunca mudam por causa de rename de display name.
- Validadores obrigatórios: IDs duplicados, referências quebradas,
  tags/estados inválidos, campos obrigatórios ausentes, assets faltando.
- Não superarquitetar: single-player primeiro, sem backend/multiplayer no
  escopo inicial.

## Visual / Assets

- Jogo é visual-first — toda entidade relevante tem Asset ID rastreável no
  Asset Manifest (Asset ID, Content ID, categoria, caminho, prioridade,
  status, prompt).
- Placeholder nunca bloqueia desenvolvimento, mas o Asset ID definitivo é
  sempre preservado.
- **Nunca gerar imagens sem pedido explícito do usuário** — preparar
  prompts/IDs/paths e aguardar.
- Seguir a Style Bible (`docs/design/14_STYLE_BIBLE_VISUAL.md`): anime
  premium, line-art limpa, cel shading controlado; sem fotorrealismo, sem
  chibi exagerado, sem UI de cassino.

## Processo / Continuidade entre sessões

- Nunca reescrever o projeto do zero. Se algo funciona, editar.
- Sempre ler `PROJECT_STATUS.md` + `DECISIONS.md` no início de uma nova
  sessão antes de decidir qualquer coisa estrutural.
- Desenvolvimento em marcos (0 Fundação → 10 Expansão); não pular marcos,
  não expandir conteúdo antes de o sistema anterior estar validado (ex: não
  fazer 1.500 jutsus se 30 ainda quebram a engine).
- Qualidade > quantidade: preferir poucas fichas excelentes a muitas fichas
  genéricas.
- Ao corrigir bug relevante, adicionar teste de regressão.
- Nunca declarar algo "concluído" sem rodar testes/validadores.

Ver `docs/design/17_PROMPT_MESTRE.md` para o texto completo e autoritativo
— este arquivo é um resumo de consulta rápida, não substitui o original.

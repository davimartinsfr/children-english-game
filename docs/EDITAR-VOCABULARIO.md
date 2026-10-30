# Como mudar o vocabulário

Todas as palavras ficam num único arquivo: **`js/vocabulary.js`**. Dá para abrir com o Bloco de Notas (botão direito → Abrir com → Bloco de Notas).

## Formato de uma palavra

```js
{ id: 'cap', word: 'cap', plural: 'caps', art: 'cap', color: '#2e7d32', pt: 'boné', ptPlural: 'bonés', ptGender: 'm', turmas: [1, 2, 3] },
```

| Campo | O que é |
|---|---|
| `id` | nome interno, único, sem espaços |
| `word` | a palavra em inglês (singular) |
| `plural` | o plural em inglês |
| `alwaysPlural: true` | use **no lugar de `plural`** para palavras que só existem no plural (jeans, shorts, trousers, shoes, sunglasses...). O jogo vai dizer "these/those are jeans" e nunca "a jeans". |
| `art` | qual desenho usar (lista abaixo) |
| `color` | cor do desenho, em código hexadecimal (ex.: `#e53935` = vermelho) |
| `pt` | a palavra em português (singular), para a vendedora traduzir |
| `ptPlural` | o plural em português |
| `ptAlwaysPlural: true` | use **no lugar de `ptPlural`** quando em português também é sempre plural (*sapatos*, *meias*, *óculos de sol*). Se em português é singular (*calça jeans*), não coloque nem `ptPlural` nem `ptAlwaysPlural`. |
| `ptGender` | `'m'` (o chapéu, este, aquele) ou `'f'` (a saia, esta, aquela) |
| `turmas` | em quais turmas a palavra aparece |

## Exemplos

Tirar o *backpack* da Turma 1: apague a linha dele, ou troque `turmas: [1]` por `turmas: []`.

Colocar o *tie* (gravata) na Turma 1 usando o desenho de outra roupa não fica bom. Para ter um desenho novo, alguém precisa adicioná-lo em `js/clothes-art.js`.

Colocar *sweater* também na Turma 1:

```js
{ id: 'sweater', word: 'sweater', plural: 'sweaters', art: 'sweater', color: '#43a047', pt: 'suéter', ptPlural: 'suéteres', ptGender: 'm', turmas: [1, 2, 3] },
```

## Desenhos disponíveis (`art`)

`tshirt`, `shirt`, `blouse`, `sweater`, `cardigan`, `jacket`, `bikerjacket`, `coat`, `raincoat`, `tracksuit`,
`dress`, `skirt`, `tanktop`, `jeans`, `trousers`, `shorts`, `hat`, `cap`, `beanie`, `scarf`, `gloves`, `socks`,
`shoes`, `trainers`, `boots`, `rubberboots`, `sandals`, `heels`, `backpack`, `sunglasses`

Duas palavras podem usar o mesmo desenho (como *sweater* e *jumper*). O jogo nunca coloca as duas na mesma ordem, para não confundir.

## Cuidados

- Mantenha as vírgulas e as aspas simples `'...'` iguais às outras linhas.
- Cada turma precisa de **pelo menos 5 palavras** com desenhos diferentes.
- As cores (`colours`, no fim do arquivo) também têm `pt` com as quatro formas: `['vermelho', 'vermelha', 'vermelhos', 'vermelhas']`.
- Depois de salvar, recarregue o jogo no navegador (F5).
- Se o jogo parar de abrir, provavelmente faltou uma vírgula ou aspa. Compare com as linhas de cima ou baixe o ZIP de novo.

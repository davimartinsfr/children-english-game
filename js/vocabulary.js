/*
 * VOCABULÁRIO DO JOGO — este arquivo pode ser editado!
 * Veja docs/EDITAR-VOCABULARIO.md para o passo a passo.
 *
 * Cada roupa tem:
 *   id            nome interno único (sem espaços)
 *   word          palavra em inglês (singular)
 *   plural        plural em inglês
 *   alwaysPlural  true para palavras que são sempre plural (jeans, shoes...):
 *                 o jogo usa "these/those are ..." e nunca "a jeans"
 *   art           qual desenho usar (lista em js/clothes-art.js)
 *   color         cor padrão do desenho
 *   pt            a palavra em português (singular), usada na tradução falada
 *   ptPlural      plural em português
 *   ptAlwaysPlural true quando em português também é sempre plural (sapatos, meias...)
 *   ptGender      'm' (o/este/aquele) ou 'f' (a/esta/aquela)
 *   turmas        em quais turmas a palavra aparece (1, 2 e/ou 3)
 */
window.VOCAB = {
  items: [
    // Turma 1 (folhas "Clothes" e "Demonstratives" da Turma 1)
    { id: 'dress',    word: 'dress',    plural: 'dresses',   art: 'dress',    color: '#e53935', pt: 'vestido', ptPlural: 'vestidos', ptGender: 'm', turmas: [1, 2, 3] },
    { id: 'jeans',    word: 'jeans',    alwaysPlural: true,  art: 'jeans',    color: '#3b6fb6', pt: 'calça jeans', ptGender: 'f', turmas: [1, 2, 3] },
    { id: 'shoes',    word: 'shoes',    alwaysPlural: true,  art: 'shoes',    color: '#8d5524', pt: 'sapatos', ptAlwaysPlural: true, ptGender: 'm', turmas: [1, 2, 3] },
    { id: 'hat',      word: 'hat',      plural: 'hats',      art: 'hat',      color: '#e8b04a', pt: 'chapéu', ptPlural: 'chapéus', ptGender: 'm', turmas: [1, 2, 3] },
    { id: 'skirt',    word: 'skirt',    plural: 'skirts',    art: 'skirt',    color: '#8e5bd6', pt: 'saia', ptPlural: 'saias', ptGender: 'f', turmas: [1, 2, 3] },
    { id: 'jacket',   word: 'jacket',   plural: 'jackets',   art: 'jacket',   color: '#4a90d9', pt: 'jaqueta', ptPlural: 'jaquetas', ptGender: 'f', turmas: [1, 2, 3] },
    { id: 'shorts',   word: 'shorts',   alwaysPlural: true,  art: 'shorts',   color: '#f08a24', pt: 'shorts', ptAlwaysPlural: true, ptGender: 'm', turmas: [1, 2, 3] },
    { id: 'coat',     word: 'coat',     plural: 'coats',     art: 'coat',     color: '#9c6b3e', pt: 'casaco', ptPlural: 'casacos', ptGender: 'm', turmas: [1, 2, 3] },
    { id: 'cap',      word: 'cap',      plural: 'caps',      art: 'cap',      color: '#2e7d32', pt: 'boné', ptPlural: 'bonés', ptGender: 'm', turmas: [1, 2, 3] },
    { id: 'backpack', word: 'backpack', plural: 'backpacks', art: 'backpack', color: '#f4511e', pt: 'mochila', ptPlural: 'mochilas', ptGender: 'f', turmas: [1] },
    { id: 'scarf',    word: 'scarf',    plural: 'scarves',   art: 'scarf',    color: '#00acc1', pt: 'cachecol', ptPlural: 'cachecóis', ptGender: 'm', turmas: [1, 2, 3] },
    { id: 'trainers', word: 'trainers', alwaysPlural: true,  art: 'trainers', color: '#ef5350', pt: 'tênis', ptAlwaysPlural: true, ptGender: 'm', turmas: [1, 2, 3] },
    { id: 'socks',    word: 'socks',    alwaysPlural: true,  art: 'socks',    color: '#ab47bc', pt: 'meias', ptAlwaysPlural: true, ptGender: 'f', turmas: [1, 2, 3] },
    { id: 'tshirt',   word: 'T-shirt',  plural: 'T-shirts',  art: 'tshirt',   color: '#1e88e5', pt: 'camiseta', ptPlural: 'camisetas', ptGender: 'f', turmas: [1, 2, 3] },
    { id: 'gloves',   word: 'gloves',   alwaysPlural: true,  art: 'gloves',   color: '#6d4c41', pt: 'luvas', ptAlwaysPlural: true, ptGender: 'f', turmas: [1, 2, 3] },
    { id: 'boots',    word: 'boots',    alwaysPlural: true,  art: 'boots',    color: '#795548', pt: 'botas', ptAlwaysPlural: true, ptGender: 'f', turmas: [1, 2, 3] },

    // Turma 2 (adiciona estas)
    { id: 'sweater',  word: 'sweater',  plural: 'sweaters', art: 'sweater',  color: '#43a047', pt: 'suéter', ptPlural: 'suéteres', ptGender: 'm', turmas: [2, 3] },
    { id: 'jumper',   word: 'jumper',   plural: 'jumpers',  art: 'sweater',  color: '#7cb342', pt: 'blusa de frio', ptPlural: 'blusas de frio', ptGender: 'f', turmas: [2] },
    { id: 'trousers', word: 'trousers', alwaysPlural: true, art: 'trousers', color: '#546e7a', pt: 'calça', ptGender: 'f', turmas: [2, 3] },
    { id: 'sandals',  word: 'sandals',  alwaysPlural: true, art: 'sandals',  color: '#ff7043', pt: 'sandálias', ptAlwaysPlural: true, ptGender: 'f', turmas: [2, 3] },
    { id: 'shirt',    word: 'shirt',    plural: 'shirts',   art: 'shirt',    color: '#90caf9', pt: 'camisa', ptPlural: 'camisas', ptGender: 'f', turmas: [2, 3] },

    // Turma 3 (texto da Sarah e homework do Mark)
    { id: 'tracksuit',   word: 'tracksuit',    plural: 'tracksuits',    art: 'tracksuit',   color: '#3949ab', pt: 'agasalho', ptPlural: 'agasalhos', ptGender: 'm', turmas: [3] },
    { id: 'highheels',   word: 'high heels',   alwaysPlural: true,      art: 'heels',       color: '#d81b60', pt: 'sapatos de salto', ptAlwaysPlural: true, ptGender: 'm', turmas: [3] },
    { id: 'blouse',      word: 'blouse',       plural: 'blouses',       art: 'blouse',      color: '#f48fb1', pt: 'blusa', ptPlural: 'blusas', ptGender: 'f', turmas: [3] },
    { id: 'tanktop',     word: 'tank top',     plural: 'tank tops',     art: 'tanktop',     color: '#26a69a', pt: 'regata', ptPlural: 'regatas', ptGender: 'f', turmas: [3] },
    { id: 'bikerjacket', word: 'biker jacket', plural: 'biker jackets', art: 'bikerjacket', color: '#37474f', pt: 'jaqueta de couro', ptPlural: 'jaquetas de couro', ptGender: 'f', turmas: [3] },
    { id: 'cardigan',    word: 'cardigan',     plural: 'cardigans',     art: 'cardigan',    color: '#a1887f', pt: 'cardigã', ptPlural: 'cardigãs', ptGender: 'm', turmas: [3] },
    { id: 'beanie',      word: 'beanie',       plural: 'beanies',       art: 'beanie',      color: '#ef5350', pt: 'gorro', ptPlural: 'gorros', ptGender: 'm', turmas: [3] },
    { id: 'raincoat',    word: 'raincoat',     plural: 'raincoats',     art: 'raincoat',    color: '#fdd835', pt: 'capa de chuva', ptPlural: 'capas de chuva', ptGender: 'f', turmas: [3] },
    { id: 'rubberboots', word: 'rubber boots', alwaysPlural: true,      art: 'rubberboots', color: '#2e7d32', pt: 'botas de borracha', ptAlwaysPlural: true, ptGender: 'f', turmas: [3] },
    { id: 'sunglasses',  word: 'sunglasses',   alwaysPlural: true,      art: 'sunglasses',  color: '#263238', pt: 'óculos de sol', ptAlwaysPlural: true, ptGender: 'm', turmas: [3] }
  ],

  // Cores usadas na Turma 2 ("I like those red shoes!")
  // pt: [masculino, feminino, masculino plural, feminino plural]
  colours: [
    { name: 'red',    hex: '#e53935', pt: ['vermelho', 'vermelha', 'vermelhos', 'vermelhas'] },
    { name: 'green',  hex: '#43a047', pt: ['verde', 'verde', 'verdes', 'verdes'] },
    { name: 'blue',   hex: '#1e88e5', pt: ['azul', 'azul', 'azuis', 'azuis'] },
    { name: 'yellow', hex: '#fdd835', pt: ['amarelo', 'amarela', 'amarelos', 'amarelas'] },
    { name: 'black',  hex: '#3a3a3a', pt: ['preto', 'preta', 'pretos', 'pretas'] }
  ]
};

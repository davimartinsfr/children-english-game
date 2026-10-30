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
 *   turmas        em quais turmas a palavra aparece (1, 2 e/ou 3)
 */
window.VOCAB = {
  items: [
    // Turma 1 (folhas "Clothes" e "Demonstratives" da Turma 1)
    { id: 'dress',    word: 'dress',    plural: 'dresses',   art: 'dress',    color: '#e53935', turmas: [1, 2, 3] },
    { id: 'jeans',    word: 'jeans',    alwaysPlural: true,  art: 'jeans',    color: '#3b6fb6', turmas: [1, 2, 3] },
    { id: 'shoes',    word: 'shoes',    alwaysPlural: true,  art: 'shoes',    color: '#8d5524', turmas: [1, 2, 3] },
    { id: 'hat',      word: 'hat',      plural: 'hats',      art: 'hat',      color: '#e8b04a', turmas: [1, 2, 3] },
    { id: 'skirt',    word: 'skirt',    plural: 'skirts',    art: 'skirt',    color: '#8e5bd6', turmas: [1, 2, 3] },
    { id: 'jacket',   word: 'jacket',   plural: 'jackets',   art: 'jacket',   color: '#4a90d9', turmas: [1, 2, 3] },
    { id: 'shorts',   word: 'shorts',   alwaysPlural: true,  art: 'shorts',   color: '#f08a24', turmas: [1, 2, 3] },
    { id: 'coat',     word: 'coat',     plural: 'coats',     art: 'coat',     color: '#9c6b3e', turmas: [1, 2, 3] },
    { id: 'cap',      word: 'cap',      plural: 'caps',      art: 'cap',      color: '#2e7d32', turmas: [1, 2, 3] },
    { id: 'backpack', word: 'backpack', plural: 'backpacks', art: 'backpack', color: '#f4511e', turmas: [1] },
    { id: 'scarf',    word: 'scarf',    plural: 'scarves',   art: 'scarf',    color: '#00acc1', turmas: [1, 2, 3] },
    { id: 'trainers', word: 'trainers', alwaysPlural: true,  art: 'trainers', color: '#ef5350', turmas: [1, 2, 3] },
    { id: 'socks',    word: 'socks',    alwaysPlural: true,  art: 'socks',    color: '#ab47bc', turmas: [1, 2, 3] },
    { id: 'tshirt',   word: 'T-shirt',  plural: 'T-shirts',  art: 'tshirt',   color: '#1e88e5', turmas: [1, 2, 3] },
    { id: 'gloves',   word: 'gloves',   alwaysPlural: true,  art: 'gloves',   color: '#6d4c41', turmas: [1, 2, 3] },
    { id: 'boots',    word: 'boots',    alwaysPlural: true,  art: 'boots',    color: '#795548', turmas: [1, 2, 3] },

    // Turma 2 (adiciona estas)
    { id: 'sweater',  word: 'sweater',  plural: 'sweaters', art: 'sweater',  color: '#43a047', turmas: [2, 3] },
    { id: 'jumper',   word: 'jumper',   plural: 'jumpers',  art: 'sweater',  color: '#7cb342', turmas: [2] },
    { id: 'trousers', word: 'trousers', alwaysPlural: true, art: 'trousers', color: '#546e7a', turmas: [2, 3] },
    { id: 'sandals',  word: 'sandals',  alwaysPlural: true, art: 'sandals',  color: '#ff7043', turmas: [2, 3] },
    { id: 'shirt',    word: 'shirt',    plural: 'shirts',   art: 'shirt',    color: '#90caf9', turmas: [2, 3] },

    // Turma 3 (texto da Sarah e homework do Mark)
    { id: 'tracksuit',   word: 'tracksuit',    plural: 'tracksuits',    art: 'tracksuit',   color: '#3949ab', turmas: [3] },
    { id: 'highheels',   word: 'high heels',   alwaysPlural: true,      art: 'heels',       color: '#d81b60', turmas: [3] },
    { id: 'blouse',      word: 'blouse',       plural: 'blouses',       art: 'blouse',      color: '#f48fb1', turmas: [3] },
    { id: 'tanktop',     word: 'tank top',     plural: 'tank tops',     art: 'tanktop',     color: '#26a69a', turmas: [3] },
    { id: 'bikerjacket', word: 'biker jacket', plural: 'biker jackets', art: 'bikerjacket', color: '#37474f', turmas: [3] },
    { id: 'cardigan',    word: 'cardigan',     plural: 'cardigans',     art: 'cardigan',    color: '#a1887f', turmas: [3] },
    { id: 'beanie',      word: 'beanie',       plural: 'beanies',       art: 'beanie',      color: '#ef5350', turmas: [3] },
    { id: 'raincoat',    word: 'raincoat',     plural: 'raincoats',     art: 'raincoat',    color: '#fdd835', turmas: [3] },
    { id: 'rubberboots', word: 'rubber boots', alwaysPlural: true,      art: 'rubberboots', color: '#2e7d32', turmas: [3] },
    { id: 'sunglasses',  word: 'sunglasses',   alwaysPlural: true,      art: 'sunglasses',  color: '#263238', turmas: [3] }
  ],

  // Cores usadas na Turma 2 ("I like those red shoes!")
  colours: [
    { name: 'red',    hex: '#e53935' },
    { name: 'green',  hex: '#43a047' },
    { name: 'blue',   hex: '#1e88e5' },
    { name: 'yellow', hex: '#fdd835' },
    { name: 'black',  hex: '#3a3a3a' }
  ]
};

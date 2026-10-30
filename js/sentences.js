/*
 * Todas as frases do jogo saem daqui: ordens da vendedora, respostas certas
 * e explicações quando a criança erra.
 *
 * Uma "coisa" no cenário é: { item, zone: 'here' | 'there', count, colour }
 *   here  = perto da vendedora  -> this / these
 *   there = longe (over there)  -> that / those
 * Palavras marcadas com *asteriscos* aparecem destacadas na tela.
 */
(function (root) {
  var ORDERS = {
    1: ['Bring me {np}!', 'Get {np}!', 'I want {np}!'],
    2: ['I like {np}!', 'Bring me {np}!', 'Can I have {np}?', 'I want {np}!'],
    3: ['Pass me {np}, please!', 'Can I try on {np}?', 'I love {np}!', 'Bring me {np}!']
  };

  // Rótulos dos blocos da Turma 3, na mesma forma da folha de exercícios.
  var BLOCKS = ['THIS IS', 'THESE ARE', "THAT'S", 'THOSE ARE'];

  function pick(list, rnd) { return list[Math.floor((rnd || Math.random)() * list.length)]; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function plain(s) { return s.replace(/\*/g, ''); }

  function isPlural(e) { return !!e.item.alwaysPlural || e.count > 1; }

  function demonstrative(e) {
    if (e.zone === 'here') return isPlural(e) ? 'these' : 'this';
    return isPlural(e) ? 'those' : 'that';
  }

  function noun(e, opts) {
    var word = isPlural(e) && !e.item.alwaysPlural ? e.item.plural : e.item.word;
    return (opts && opts.useColours && e.colour ? e.colour.name + ' ' : '') + word;
  }

  function article(word) { return /^[aeiou]/i.test(word) ? 'an' : 'a'; }

  // "These are boots" / "That is a cap" / "That's a cap" (Turma 3)
  function statement(e, opts) {
    var dem = demonstrative(e);
    var np = noun(e, opts);
    if (isPlural(e)) return '*' + cap(dem) + '* are ' + np;
    if (dem === 'that' && opts && opts.contract) return "*That's* " + article(np) + ' ' + np;
    return '*' + cap(dem) + '* is ' + article(np) + ' ' + np;
  }

  // "It's a hat" / "They're jeans" — sem demonstrative (fase só de vocabulário)
  function itStatement(e) {
    var np = noun(e);
    return isPlural(e) ? "They're " + np : "It's " + article(np) + ' ' + np;
  }

  function out(text) { return { text: text, speech: plain(text) }; }

  var Sentences = {
    BLOCKS: BLOCKS,
    isPlural: isPlural,
    demonstrative: demonstrative,
    noun: noun,
    plain: plain,

    // mode: 'vocab' (só a palavra), 'singular' ou 'all'
    order: function (e, mode, turma, opts, rnd) {
      if (mode === 'vocab') return out('Get the *' + noun(e, opts) + '*!');
      var np = '*' + demonstrative(e) + '* ' + noun(e, opts);
      return out(pick(ORDERS[turma] || ORDERS[1], rnd).replace('{np}', np));
    },

    correct: function (e, opts) { return out(statement(e, opts) + '!'); },

    wrong: function (target, picked, mode, opts) {
      if (mode === 'vocab') return out('Oops! ' + itStatement(picked) + '. Get the *' + noun(target, opts) + '*!');
      return out('Oops! ' + statement(picked, opts) + '. I want *' + demonstrative(target) + '* ' + noun(target, opts) + '!');
    },

    // Turma 3: blocos THIS IS / THESE ARE / THAT'S / THOSE ARE
    question: function () { return out('Hit the right *block* for the flashing clothes!'); },
    answerBlock: function (e) {
      var plural = isPlural(e);
      if (e.zone === 'here') return plural ? 'THESE ARE' : 'THIS IS';
      return plural ? 'THOSE ARE' : "THAT'S";
    },
    questionHint: function (e) {
      return out('Oops! Look: it is *' + (e.zone === 'here' ? 'here' : 'over there') + '* and "' + noun(e) +
        '" is *' + (isPlural(e) ? 'plural' : 'singular') + '*.');
    }
  };

  root.Sentences = Sentences;
  if (typeof module !== 'undefined' && module.exports) module.exports = Sentences;
})(typeof window !== 'undefined' ? window : globalThis);

/*
 * Todas as frases do jogo saem daqui: ordens da vendedora, respostas certas
 * e explicações quando a criança erra. Cada frase vem em inglês e em
 * português (a vendedora fala as duas, uma depois da outra).
 *
 * Uma "coisa" no cenário é: { item, zone: 'here' | 'there', count, colour }
 *   here  = perto da vendedora  -> this / these   (este / estes)
 *   there = longe (over there)  -> that / those   (aquele / aqueles)
 * Palavras marcadas com *asteriscos* aparecem destacadas na tela.
 */
(function (root) {
  // [inglês, português]. {np} = "*those* boots", {pt} = "*aquelas* botas", {dpt} = "*daquelas* botas"
  var ORDERS = {
    1: [['Bring me {np}!', 'Me traga {pt}!'], ['Get {np}!', 'Pegue {pt}!'], ['I want {np}!', 'Eu quero {pt}!']],
    2: [['I like {np}!', 'Eu gosto {dpt}!'], ['Bring me {np}!', 'Me traga {pt}!'],
      ['Can I have {np}?', 'Posso ficar com {pt}?'], ['I want {np}!', 'Eu quero {pt}!']],
    3: [['Pass me {np}, please!', 'Me passe {pt}, por favor!'], ['Can I try on {np}?', 'Posso experimentar {pt}?'],
      ['I love {np}!', 'Eu amo {pt}!'], ['Bring me {np}!', 'Me traga {pt}!']]
  };

  var PT_DEM = {
    here: { m: ['este', 'estes'], f: ['esta', 'estas'] },
    there: { m: ['aquele', 'aqueles'], f: ['aquela', 'aquelas'] }
  };

  function pick(list, rnd) { return list[Math.floor((rnd || Math.random)() * list.length)]; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  // Tira os * e os emojis (a voz do computador leria o nome do emoji).
  function plain(s) {
    return s.replace(/\*/g, '').replace(/[←-⇿☀-➿️]|\ud83c[\udc00-\udfff]|\ud83d[\udc00-\udfff]|\ud83e[\udc00-\udfff]/g, '')
      .replace(/\s+([,.!?])/g, '$1').replace(/\s+/g, ' ').trim();
  }

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

  // --- português: gênero e número seguem a palavra em português ---
  // (jeans é plural em inglês, mas "calça jeans" é singular)
  function ptIsPlural(e) { return e.item.alwaysPlural ? !!e.item.ptAlwaysPlural : e.count > 1; }
  function ptFem(e) { return e.item.ptGender === 'f'; }

  function ptNoun(e, opts) {
    var pl = ptIsPlural(e);
    var word = pl && !e.item.ptAlwaysPlural ? e.item.ptPlural : e.item.pt;
    if (opts && opts.useColours && e.colour && e.colour.pt) word += ' ' + e.colour.pt[(ptFem(e) ? 1 : 0) + (pl ? 2 : 0)];
    return word;
  }

  function ptDem(e) { return PT_DEM[e.zone][ptFem(e) ? 'f' : 'm'][ptIsPlural(e) ? 1 : 0]; }
  function ptThe(e) { return (ptFem(e) ? 'a' : 'o') + (ptIsPlural(e) ? 's' : ''); }
  function ptOne(e) { return ptFem(e) ? 'uma' : 'um'; }

  // "Estas são botas" / "Aquele é um boné"
  function ptStatement(e, opts) {
    if (ptIsPlural(e)) return '*' + cap(ptDem(e)) + '* são ' + ptNoun(e, opts);
    return '*' + cap(ptDem(e)) + '* é ' + ptOne(e) + ' ' + ptNoun(e, opts);
  }

  function ptItStatement(e) {
    return ptIsPlural(e) ? 'São ' + ptNoun(e) : 'É ' + ptOne(e) + ' ' + ptNoun(e);
  }

  var WHERE = { here: '*here* ✋', there: '*over there* 👉' };
  var PT_WHERE = { here: '*aqui perto* ✋', there: '*lá longe* 👉' };

  function out(text, ptText) {
    return { text: text, speech: plain(text), ptText: ptText, ptSpeech: plain(ptText) };
  }

  var Sentences = {
    isPlural: isPlural,
    demonstrative: demonstrative,
    noun: noun,
    plain: plain,

    // mode: 'vocab' (só a palavra), 'singular' ou 'all'
    order: function (e, mode, turma, opts, rnd) {
      if (mode === 'vocab') return out('Get the *' + noun(e, opts) + '*!', 'Pegue ' + ptThe(e) + ' *' + ptNoun(e, opts) + '*!');
      var np = '*' + demonstrative(e) + '* ' + noun(e, opts);
      var pt = '*' + ptDem(e) + '* ' + ptNoun(e, opts);
      var dpt = '*d' + ptDem(e) + '* ' + ptNoun(e, opts);
      var tpl = pick(ORDERS[turma] || ORDERS[1], rnd);
      return out(tpl[0].replace('{np}', np), tpl[1].replace('{pt}', pt).replace('{dpt}', dpt));
    },

    correct: function (e, opts) { return out(statement(e, opts) + '!', ptStatement(e, opts) + '!'); },

    // Explica só o que estava errado: a roupa, o lugar (perto/longe) ou a quantidade (um/vários).
    wrong: function (target, picked, mode, opts) {
      if (mode === 'vocab') {
        return out('Oops! ' + itStatement(picked) + '. Get the *' + noun(target, opts) + '*!',
          'Ops! ' + ptItStatement(picked) + '. Pegue ' + ptThe(target) + ' *' + ptNoun(target, opts) + '*!');
      }
      var sameThing = picked.item.id === target.item.id &&
        (!(opts && opts.useColours) || picked.colour.name === target.colour.name);
      var zoneDiff = picked.zone !== target.zone;
      var numDiff = isPlural(picked) !== isPlural(target);
      var want = '*' + demonstrative(target) + '* ' + noun(target, opts);
      var ptWant = '*' + ptDem(target) + '* ' + ptNoun(target, opts);

      if (sameThing && zoneDiff && !numDiff) {
        var pl = isPlural(picked), ptPl = ptIsPlural(picked);
        return out('Oops! *' + cap(demonstrative(picked)) + '* ' + (pl ? 'are ' : 'is ') + WHERE[picked.zone] +
            '. I want ' + want + ', ' + WHERE[target.zone] + '!',
          'Ops! *' + cap(ptDem(picked)) + '* ' + (ptPl ? 'estão ' : 'está ') + PT_WHERE[picked.zone] +
            '. Eu quero ' + ptWant + ', ' + PT_WHERE[target.zone] + '!');
      }
      if (sameThing && numDiff && !zoneDiff) {
        var en = isPlural(picked)
          ? '*' + cap(demonstrative(picked)) + '* are *many* ' + noun(picked, opts)
          : '*' + cap(demonstrative(picked)) + '* is just *one* ' + noun(picked, opts);
        var pt = isPlural(picked)
          ? '*' + cap(ptDem(picked)) + '* são *vários* ' + ptNoun(picked, opts)
          : '*' + cap(ptDem(picked)) + '* é só *' + ptOne(picked) + '* ' + ptNoun(picked, opts);
        return out('Oops! ' + en + '. I want ' + want + '!', 'Ops! ' + pt + '. Eu quero ' + ptWant + '!');
      }
      if (sameThing) {
        return out('Oops! ' + statement(picked, opts) + '. I want ' + want + ', ' + WHERE[target.zone] + '!',
          'Ops! ' + ptStatement(picked, opts) + '. Eu quero ' + ptWant + ', ' + PT_WHERE[target.zone] + '!');
      }
      return out('Oops! ' + statement(picked, opts) + '. I want ' + want + '!',
        'Ops! ' + ptStatement(picked, opts) + '. Eu quero ' + ptWant + '!');
    }
  };

  root.Sentences = Sentences;
  if (typeof module !== 'undefined' && module.exports) module.exports = Sentences;
})(typeof window !== 'undefined' ? window : globalThis);

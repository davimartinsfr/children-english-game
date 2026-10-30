/*
 * Ranking das duplas, SEPARADO POR TURMA.
 * Cada turma tem a sua própria lista no navegador ("wardrobeRun.ranking.1", ".2", ".3")
 * e toda leitura confere o número da turma de cada resultado, então as turmas nunca se misturam.
 * Cada dupla aparece uma vez só, com o seu melhor resultado.
 */
window.WR = window.WR || {};

WR.Ranking = (function () {
  var memory = {};  // se o navegador bloquear o localStorage, guarda só enquanto a página estiver aberta

  function storageKey(turma) { return 'wardrobeRun.ranking.' + turma; }
  function validTurma(turma) { return turma === 1 || turma === 2 || turma === 3; }

  function read(turma) {
    var raw;
    try { raw = localStorage.getItem(storageKey(turma)); } catch (e) { raw = memory[storageKey(turma)]; }
    var list;
    try { list = JSON.parse(raw || '[]'); } catch (e) { list = []; }
    if (!Array.isArray(list)) return [];
    return list.filter(function (r) {
      return r && r.turma === turma && Array.isArray(r.names) && r.names.length && typeof r.score === 'number';
    });
  }

  function write(turma, list) {
    var raw = JSON.stringify(list);
    try { localStorage.setItem(storageKey(turma), raw); } catch (e) { memory[storageKey(turma)] = raw; }
  }

  function better(a, b) {
    if (a.score !== b.score) return b.score - a.score;
    if (a.correct !== b.correct) return b.correct - a.correct;
    return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
  }

  // "Ana & Bia" e "bia & ana" são a mesma dupla.
  function pairKey(names) {
    return names.map(function (n) { return n.trim().toLowerCase(); }).sort().join('|');
  }

  return {
    pairKey: pairKey,

    list: function (turma) {
      if (!validTurma(turma)) return [];
      return read(turma).sort(better);
    },

    // Guarda o resultado (se for o melhor da dupla) e devolve a posição da dupla.
    add: function (turma, result) {
      if (!validTurma(turma)) return null;
      var entry = {
        turma: turma,
        names: result.names.map(function (n) { return n.trim(); }),
        score: result.score,
        correct: result.correct,
        time: result.time,
        date: new Date().toISOString()
      };
      var key = pairKey(entry.names);
      var list = read(turma);
      var previous = null;
      list = list.filter(function (r) {
        if (pairKey(r.names) !== key) return true;
        previous = r;
        return false;
      });
      var best = previous && better(previous, entry) <= 0 ? previous : entry;
      list.push(best);
      list.sort(better);
      write(turma, list);
      return {
        list: list,
        position: list.indexOf(best) + 1,
        newBest: best === entry,
        previous: previous,
        key: key
      };
    },

    reset: function (turma) {
      if (!validTurma(turma)) return;
      try { localStorage.removeItem(storageKey(turma)); } catch (e) { /* ignore */ }
      delete memory[storageKey(turma)];
    },

    // Desenha a tabela do ranking dentro de um elemento (sem innerHTML com nomes).
    render: function (el, list, opts) {
      opts = opts || {};
      el.textContent = '';
      if (!list.length) {
        var empty = document.createElement('p');
        empty.className = 'ranking-empty';
        empty.textContent = 'Nenhuma dupla jogou ainda nesta turma.';
        el.appendChild(empty);
        return;
      }
      var ol = document.createElement('ol');
      ol.className = 'ranking-list';
      list.slice(0, opts.limit || 10).forEach(function (r, i) {
        var li = document.createElement('li');
        if (opts.highlight && pairKey(r.names) === opts.highlight) li.className = 'me';
        var pos = document.createElement('span');
        pos.className = 'pos';
        pos.textContent = ['🥇', '🥈', '🥉'][i] || (i + 1) + 'º';
        var names = document.createElement('span');
        names.className = 'who';
        names.textContent = r.names.join(' & ');
        var score = document.createElement('span');
        score.className = 'pts';
        score.textContent = '⭐ ' + r.score;
        var meta = document.createElement('span');
        meta.className = 'meta';
        meta.textContent = r.correct + (r.correct === 1 ? ' acerto' : ' acertos') + (r.time ? ' · ' + r.time + ' s' : '');
        li.appendChild(pos);
        li.appendChild(names);
        li.appendChild(score);
        li.appendChild(meta);
        ol.appendChild(li);
      });
      el.appendChild(ol);
    }
  };
})();

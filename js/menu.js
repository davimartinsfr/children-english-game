/*
 * Menu inicial: guarda as escolhas da professora e abre o jogo.
 */
(function () {
  var COLORS = ['#e53935', '#1e88e5', '#43a047', '#fb8c00', '#8e24aa', '#00897b'];
  var KEY = 'wardrobeRun.menu';
  var form = document.getElementById('menu-form');

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  function getNum(k) { try { return Number(localStorage.getItem(k)) || 0; } catch (e) { return 0; } }

  var saved = load();

  // bolinhas de cor de cada jogador
  document.querySelectorAll('.swatches').forEach(function (box) {
    var player = box.getAttribute('data-player');
    var chosen = saved['c' + player] || COLORS[player - 1];
    box.innerHTML = '<span class="swatch-label">Jogador ' + player + '</span>' + COLORS.map(function (c) {
      return '<label class="swatch"><input type="radio" name="c' + player + '" value="' + c + '"' +
        (c === chosen ? ' checked' : '') + '><span style="background:' + c + '"></span></label>';
    }).join('');
  });

  ['turma', 'players', 'time', 'goal'].forEach(function (name) {
    if (saved[name] === undefined) return;
    var input = form.querySelector('input[name="' + name + '"][value="' + saved[name] + '"]');
    if (input) input.checked = true;
  });
  form.querySelector('input[name="sayit"]').checked = saved.sayit === '1';

  function values() {
    var v = {};
    ['turma', 'players', 'time', 'goal', 'c1', 'c2'].forEach(function (name) {
      var el = form.querySelector('input[name="' + name + '"]:checked');
      v[name] = el ? el.value : '';
    });
    v.sayit = form.querySelector('input[name="sayit"]').checked ? '1' : '0';
    return v;
  }

  function refreshProgress() {
    var v = values();
    var total = getNum('wardrobeRun.class.' + v.turma);
    document.getElementById('class-progress').textContent =
      'Turma ' + v.turma + ': ' + total + ' / ' + v.goal + ' acertos' + (total >= Number(v.goal) ? ' 🏆' : '');
    document.querySelector('.swatches[data-player="2"]').style.opacity = v.players === '2' ? 1 : 0.35;
  }

  form.addEventListener('change', function () { save(values()); refreshProgress(); });

  document.getElementById('btn-reset').addEventListener('click', function () {
    var t = values().turma;
    if (!confirm('Zerar o placar da Turma ' + t + '?')) return;
    try { localStorage.removeItem('wardrobeRun.class.' + t); } catch (e) { /* ignore */ }
    refreshProgress();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = values();
    save(v);
    location.href = 'game.html?' + new URLSearchParams(v).toString();
  });

  refreshProgress();
})();

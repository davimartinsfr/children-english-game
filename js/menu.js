/*
 * Menu inicial: guarda as escolhas da professora e abre o jogo.
 */
(function () {
  var COLORS = ['#e53935', '#1e88e5', '#43a047', '#fb8c00', '#8e24aa', '#00897b'];
  var KEY = 'wardrobeRun.menu';
  var form = document.getElementById('menu-form');

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* ignore */ } }

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

  ['turma', 'players', 'time'].forEach(function (name) {
    if (saved[name] === undefined) return;
    var input = form.querySelector('input[name="' + name + '"][value="' + saved[name] + '"]');
    if (input) input.checked = true;
  });
  form.querySelector('input[name="sayit"]').checked = saved.sayit === '1';

  function values() {
    var v = {};
    ['turma', 'players', 'time', 'c1', 'c2'].forEach(function (name) {
      var el = form.querySelector('input[name="' + name + '"]:checked');
      v[name] = el ? el.value : '';
    });
    v.sayit = form.querySelector('input[name="sayit"]').checked ? '1' : '0';
    return v;
  }

  // Mostra só o ranking da turma escolhida.
  function refreshProgress() {
    var v = values();
    var turma = Number(v.turma);
    document.getElementById('ranking-title').textContent = '🏆 Ranking das duplas · Turma ' + turma;
    WR.Ranking.render(document.getElementById('ranking'), WR.Ranking.list(turma), { limit: 100 });
    document.querySelector('.swatches[data-player="2"]').style.opacity = v.players === '2' ? 1 : 0.35;
  }

  form.addEventListener('change', function () { save(values()); refreshProgress(); });

  document.getElementById('btn-reset').addEventListener('click', function () {
    var t = Number(values().turma);
    if (!confirm('Apagar o ranking da Turma ' + t + '? As outras turmas não mudam.')) return;
    WR.Ranking.reset(t);
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

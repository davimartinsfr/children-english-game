/*
 * Liga tudo na tela do jogo: lê as opções do menu, roda o loop e cuida das telas
 * de "pronto", pausa e fim de rodada.
 */
(function () {
  var params = new URLSearchParams(location.search);
  function num(name, def, allowed) {
    var v = Number(params.get(name));
    return allowed.indexOf(v) >= 0 ? v : def;
  }
  function color(name, def) {
    var v = params.get(name);
    return /^#[0-9a-fA-F]{6}$/.test(v || '') ? v : def;
  }

  var opts = {
    turma: num('turma', 1, [1, 2, 3]),
    players: num('players', 2, [1, 2]),
    colors: [color('c1', '#e53935'), color('c2', '#1e88e5')],
    time: num('time', 90, [60, 90, 120]),
    sayIt: params.get('sayit') === '1'
  };
  var cfg = WR.TURMAS[opts.turma];
  WR.Audio.rate = cfg.speechRate;

  // localStorage pode falhar (modo anônimo etc.): aí guarda só na memória.
  var memory = {};
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return memory[k]; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { memory[k] = v; } }
  };
  var layout = Number(store.get('wardrobeRun.layout')) || 0;

  var canvas = document.getElementById('game');
  var stage = document.getElementById('stage');
  var ctx = canvas.getContext('2d');

  function resize() {
    var scale = Math.min(window.innerWidth / WR.W, window.innerHeight / WR.H);
    var w = Math.floor(WR.W * scale), h = Math.floor(WR.H * scale);
    stage.style.width = w + 'px';
    stage.style.height = h + 'px';
    stage.style.fontSize = Math.max(10, 16 * scale) + 'px';
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  window.addEventListener('resize', resize);
  resize();

  var $ = function (id) { return document.getElementById(id); };
  function show(id) {
    ['overlay-ready', 'overlay-pause', 'overlay-end'].forEach(function (o) { $(o).classList.toggle('hidden', o !== id); });
  }

  var round;

  function newRound() {
    round = new WR.Round({
      turma: opts.turma, players: opts.players, colors: opts.colors,
      time: opts.time, sayIt: opts.sayIt, layout: layout
    });
    round.on('end', showEnd);
    $('ready-subtitle').textContent = 'Turma ' + opts.turma + ' · ' + cfg.title + ' · Loja ' + (layout + 1);
    $('ready-controls').innerHTML = opts.players === 2
      ? '<span><b style="color:' + opts.colors[0] + '">Jogador 1</b>: A D andar · W pular · S descer</span>' +
        '<span><b style="color:' + opts.colors[1] + '">Jogador 2</b>: ← → andar · ↑ pular · ↓ descer</span>'
      : '<span><b style="color:' + opts.colors[0] + '">Jogador</b>: A D ou ← → andar · W ou ↑ pular</span>';
    $('name1').value = '';
    $('name2').value = '';
    $('names-error').classList.add('hidden');
    show('overlay-ready');
    $('name1').focus();
  }

  // Os nomes são obrigatórios: é assim que a dupla entra no ranking da turma.
  function readNames() {
    var inputs = opts.players === 2 ? [$('name1'), $('name2')] : [$('name1')];
    var names = inputs.map(function (el) { return el.value.replace(/\s+/g, ' ').trim(); });
    var empty = inputs.filter(function (el, i) { return !names[i]; })[0];
    var error = '';
    if (empty) {
      error = opts.players === 2 ? 'Escreva o nome dos dois jogadores.' : 'Escreva o nome do jogador.';
    } else if (names.length === 2 && names[0].toLowerCase() === names[1].toLowerCase()) {
      error = 'Os dois nomes estão iguais. Escreva o nome de cada jogador.';
      empty = inputs[1];
    }
    $('names-error').textContent = error;
    $('names-error').classList.toggle('hidden', !error);
    if (error) { empty.focus(); return null; }
    return names;
  }

  function start() {
    if (round.state !== 'ready') return;
    var names = readNames();
    if (!names) return;
    if (document.activeElement) document.activeElement.blur();
    WR.Audio.unlock();
    round.setNames(names);
    show(null);
    round.start();
  }

  function showEnd(res) {
    $('end-title').textContent = round.hearts <= 0 ? 'Good try! 💪' : "Time's up! 🎉";
    $('end-stars').innerHTML = [1, 2, 3].map(function (i) {
      return '<span class="' + (i <= res.stars ? 'on' : 'off') + '">★</span>';
    }).join('');
    $('end-score').textContent = '⭐ ' + res.score + ' pontos · ' + res.correct + (res.correct === 1 ? ' acerto' : ' acertos');
    $('end-list').innerHTML = res.practiced.slice(-6).map(function (s) {
      return '<li>' + s.en + ' <span class="pt">' + s.pt + '</span></li>';
    }).join('') || '<li>—</li>';

    var saved = WR.Ranking.add(opts.turma, { names: round.names, score: res.score, correct: res.correct, time: opts.time });
    var rank = '';
    if (saved) {
      rank = saved.position === 1 ? '🏆 1º lugar da Turma ' + opts.turma + '!'
        : saved.position + 'º lugar de ' + saved.list.length + ' na Turma ' + opts.turma;
      if (!saved.newBest) rank += ' (recorde de vocês: ⭐ ' + saved.previous.score + ')';
      else if (saved.previous) rank += ' · novo recorde! 🎉';
    }
    $('end-rank').textContent = rank;
    $('end-ranking-title').textContent = 'Ranking da Turma ' + opts.turma + ':';
    WR.Ranking.render($('end-ranking'), saved ? saved.list : [], { limit: 5, highlight: saved && saved.key });
    show('overlay-end');
  }

  function nextPair() {
    layout = (layout + 1) % WR.LAYOUTS.length;
    store.set('wardrobeRun.layout', String(layout));
    newRound();
  }

  var pausedFrom = null;
  function togglePause() {
    if (round.state === 'paused') {
      round.state = pausedFrom;
      pausedFrom = null;
      show(null);
    } else if (['playing', 'lock', 'sayit'].indexOf(round.state) >= 0) {
      pausedFrom = round.state;
      round.state = 'paused';
      WR.Audio.stopSpeech();
      show('overlay-pause');
    }
  }

  function toggleFullscreen() {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    } catch (e) { /* sem tela cheia */ }
  }

  $('btn-start').addEventListener('click', function () { this.blur(); start(); });
  $('names-form').addEventListener('input', function () { $('names-error').classList.add('hidden'); });
  $('names-form').addEventListener('submit', function (e) { e.preventDefault(); start(); });
  $('btn-next').addEventListener('click', function () { this.blur(); nextPair(); });

  window.addEventListener('keydown', function (e) {
    if (e.repeat) return;
    // digitando um nome: as teclas são do campo, não do jogo
    if (e.target && e.target.tagName === 'INPUT') {
      if (e.code === 'Enter' || e.code === 'NumpadEnter') { e.preventDefault(); start(); }
      return;
    }
    switch (e.code) {
      case 'Enter':
      case 'NumpadEnter':
        e.preventDefault();
        if (round.state === 'ready') start();
        else if (round.state === 'end') nextPair();
        else if (round.state === 'sayit') round.confirmSayIt(true);
        break;
      case 'Backspace': if (round.state === 'sayit') round.confirmSayIt(false); break;
      case 'Space': togglePause(); break;
      case 'KeyF': toggleFullscreen(); break;
      case 'KeyM':
        WR.Audio.voiceOn = !WR.Audio.voiceOn;
        if (!WR.Audio.voiceOn) WR.Audio.stopSpeech();
        break;
      case 'KeyN': if (round.state !== 'paused') round.skip(); break;
      case 'KeyR': if (round.state !== 'paused') round.repeat(); break;
      case 'Escape': location.href = 'index.html'; break;
    }
  });

  // Para os testes automáticos poderem olhar o estado do jogo.
  WR.debug = { get round() { return round; }, start: start, nextPair: nextPair };

  var STEP = 1 / 60;
  var last = performance.now(), acc = 0, clock = 0;
  function frame(now) {
    acc += Math.min(0.1, (now - last) / 1000);
    last = now;
    while (acc >= STEP) {
      round.update(STEP);
      WR.Input.endFrame();
      clock += STEP;
      acc -= STEP;
    }
    ctx.setTransform(canvas.width / WR.W, 0, 0, canvas.height / WR.H, 0, 0);
    WR.draw(ctx, round, clock);
    requestAnimationFrame(frame);
  }

  newRound();
  requestAnimationFrame(frame);
})();

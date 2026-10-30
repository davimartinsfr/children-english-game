/*
 * Regras de uma rodada: sorteia as ordens, coloca as roupas no cenário,
 * confere se a dupla pegou a roupa certa, conta pontos, corações e tempo.
 */
window.WR = window.WR || {};

(function () {
  var S = window.Sentences;

  function rand(n) { return Math.floor(Math.random() * n); }
  function choice(list) { return list[rand(list.length)]; }
  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = rand(i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function other(zone) { return zone === 'here' ? 'there' : 'here'; }
  function defaultColour(item) { return { name: '', hex: item.color }; }

  // Chave que diz quando duas coisas no cenário teriam a mesma resposta.
  function key(e, mode, useColours) {
    if (mode === 'vocab') return e.item.art;
    return [e.item.id, e.zone, S.isPlural(e), useColours ? e.colour.name : ''].join('|');
  }

  /*
   * Monta uma ordem: a roupa certa + "pegadinhas".
   *   - mesma roupa na outra zona      -> treina this x that
   *   - mesma roupa, 1 x várias        -> treina this x these
   *   - mesma roupa, outra cor (T2)    -> treina as cores
   *   - outras roupas                  -> treina o vocabulário
   */
  WR.buildOrder = function (turma, mode, lastId) {
    var cfg = WR.TURMAS[turma];
    var useColours = !!cfg.useColours;
    var pool = window.VOCAB.items.filter(function (it) { return it.turmas.indexOf(turma) >= 0; });
    var candidates = pool.filter(function (it) {
      return it.id !== lastId && (mode !== 'singular' || !it.alwaysPlural);
    });
    var item = choice(candidates);
    var colourOf = function () { return useColours ? choice(window.VOCAB.colours) : defaultColour(item); };
    var pluralCount = function () { return 2 + rand(2); };

    var target = { item: item, zone: choice(['here', 'there']), count: 1, colour: colourOf(), isTarget: true };
    if (mode === 'all' && !item.alwaysPlural && Math.random() < 0.5) target.count = pluralCount();

    var list = [target];
    function same(changes) {
      var e = { item: item, zone: target.zone, count: target.count, colour: target.colour };
      for (var k in changes) e[k] = changes[k];
      list.push(e);
    }

    if (mode === 'singular') {
      same({ zone: other(target.zone) });
    } else if (mode === 'all') {
      same({ zone: other(target.zone), count: target.count > 1 ? pluralCount() : 1 });
      if (!item.alwaysPlural) same({ count: target.count > 1 ? 1 : pluralCount() });
      if (useColours) {
        var otherColours = window.VOCAB.colours.filter(function (c) { return c.name !== target.colour.name; });
        same({ colour: choice(otherColours) });
      }
    }

    // outras roupas (desenhos diferentes, para não confundir sweater com jumper)
    var usedArts = {};
    usedArts[item.art] = true;
    shuffle(pool).forEach(function (it) {
      if (list.length >= cfg.itemsPerOrder || usedArts[it.art]) return;
      usedArts[it.art] = true;
      var count = 1;
      if (mode === 'all' && !it.alwaysPlural && Math.random() < 0.4) count = pluralCount();
      list.push({
        item: it, zone: choice(['here', 'there']), count: count, filler: true,
        colour: useColours ? choice(window.VOCAB.colours) : defaultColour(it)
      });
    });

    // segurança: nenhuma pegadinha pode ter a mesma resposta da roupa certa
    var tk = key(target, mode, useColours);
    list = list.filter(function (e) { return e === target || key(e, mode, useColours) !== tk; });
    return { target: target, entities: list };
  };

  // A vaga fica perto de algum jogador? (para a roupa não nascer em cima dele)
  function nearPlayer(level, slot, players, size) {
    var pos = WR.slotPos(level, slot);
    var box = { x: pos.x - size / 2 - 60, y: pos.y - size - 60, w: size + 120, h: size + 120 };
    return (players || []).some(function (p) { return WR.overlaps(p, box); });
  }

  // Coloca cada roupa numa vaga livre da sua zona, longe dos jogadores se der.
  WR.placeEntities = function (level, entities, players, size) {
    var free = shuffle(level.slots);
    var far = free.filter(function (s) { return !nearPlayer(level, s, players, size); });
    free = far.concat(free.filter(function (s) { return far.indexOf(s) < 0; }));
    var placed = [];
    entities.forEach(function (e) {
      var idx = -1;
      for (var i = 0; i < free.length; i++) { if (free[i].zone === e.zone) { idx = i; break; } }
      if (idx < 0 && e.filler && free.length) idx = 0; // roupa extra pode ir para a outra zona
      if (idx < 0) return;
      e.slot = free[idx];
      e.zone = e.slot.zone;
      free.splice(idx, 1);
      placed.push(e);
    });
    return placed;
  };

  WR.Round = function (opts) {
    this.opts = opts;               // { turma, players, colors, time, sayIt, layout }
    this.cfg = WR.TURMAS[opts.turma];
    this.textOpts = { useColours: !!this.cfg.useColours, contract: !!this.cfg.contract };
    this.level = WR.makeLevel(opts.layout || 0, opts.turma);
    this.players = [];
    for (var i = 0; i < opts.players; i++) {
      this.players.push(WR.makePlayer(i, opts.colors[i], opts.players === 1 ? 620 : 580 + i * 80));
    }
    this.hearts = this.cfg.hearts;
    this.score = 0;
    this.correct = 0;
    this.combo = 0;
    this.timeLeft = opts.time;
    this.state = 'ready';
    this.entities = [];
    this.order = null;
    this.orderAge = 0;
    this.lock = 0;
    this.feedback = null;
    this.banner = null;
    this.particles = [];
    this.floaters = [];
    this.practiced = [];
    this.shake = 0;
    this.stage = this.stageFor(0);
    this.listeners = {};
    this.names = [];
  };

  var R = WR.Round.prototype;

  R.on = function (name, fn) { this.listeners[name] = fn; };
  R.emit = function (name, data) { if (this.listeners[name]) this.listeners[name](data); };

  // Turma 1: só palavras até 8 acertos; depois mistura palavras e this/that.
  // These/those ficam para as Turmas 2 e 3.
  R.stageFor = function (correct) {
    if (!this.cfg.phases) return 'all';
    return correct < 8 ? 'vocab' : 'mixed';
  };

  R.modeFor = function (stage) {
    if (stage === 'mixed') return Math.random() < 0.5 ? 'vocab' : 'singular';
    return stage;
  };

  R.setNames = function (names) {
    this.names = names.slice();
    this.players.forEach(function (p, i) { p.name = names[i] || ''; });
  };

  R.start = function () {
    this.state = 'playing';
    this.nextOrder();
  };

  R.nextOrder = function () {
    var turma = this.opts.turma;
    var mode = this.modeFor(this.stage);
    var built = WR.buildOrder(turma, mode, this.order && this.order.target.item.id);
    this.entities = WR.placeEntities(this.level, built.entities, this.players, this.cfg.itemSize);
    // armed: só dá para pegar depois que ninguém estiver encostando (roupa que nasce em cima do jogador não conta)
    this.entities.forEach(function (e, i) { e.state = 'pop'; e.t = -i * 0.05; e.armed = false; });
    var target = built.target;
    var said = S.order(target, mode, turma, this.textOpts);
    this.order = { target: target, mode: mode, said: said, text: said.text };
    this.orderAge = 0;
    this.feedback = null;
    this.state = 'playing';
    WR.Audio.pop();
    WR.Audio.speak(said.speech, said.ptSpeech);
  };

  // Dica: depois de alguns segundos mostra o desenho e o lado certo da loja.
  R.hintOn = function () {
    return !!(this.order && this.cfg.hintAfter && this.orderAge > this.cfg.hintAfter && this.state === 'playing');
  };

  R.setFeedback = function (said, good) {
    this.feedback = { text: said.text, ptText: said.ptText, good: good, t: 0 };
  };

  R.addParticles = function (x, y, colors, n) {
    for (var i = 0; i < n; i++) {
      this.particles.push({
        x: x, y: y, vx: (Math.random() - 0.5) * 600, vy: -200 - Math.random() * 500,
        life: 1 + Math.random() * 0.5, color: choice(colors), size: 5 + Math.random() * 6, rot: Math.random() * 6
      });
    }
  };

  R.success = function (e) {
    var said = S.correct(this.order.target, this.textOpts);
    var gained = 10 + 2 * Math.min(this.combo, 5);
    this.combo++;
    this.correct++;
    this.score += gained;
    if (!this.practiced.some(function (p) { return p.en === said.speech; })) {
      this.practiced.push({ en: said.speech, pt: said.ptSpeech });
    }
    this.setFeedback(said, true);
    var pos = this.entityBox(e);
    this.floaters.push({ text: '+' + gained, x: pos.x + pos.w / 2, y: pos.y, t: 0, color: '#2e7d32' });
    this.addParticles(pos.x + pos.w / 2, pos.y + pos.h / 2, ['#ffca28', '#66bb6a', '#42a5f5', '#ef5350', '#ab47bc'], 36);
    e.state = 'fly';
    e.t = 0;
    e.from = { x: pos.x, y: pos.y };
    this.entities.forEach(function (o) { if (o !== e && o.state !== 'poof') { o.state = 'fade'; o.t = 0; } });
    WR.Audio.good();
    WR.Audio.speak(said.speech, said.ptSpeech);
    this.emit('correct');

    var newStage = this.stageFor(this.correct);
    if (newStage !== this.stage) {
      this.stage = newStage;
      this.banner = { text: 'Phase 2: this ✋ / that 👉', t: 0 };
    }
    if (this.opts.sayIt) { this.state = 'sayit'; this.sayIt = said; }
    else { this.state = 'lock'; this.lock = 1.8; }
  };

  R.mistake = function (said, x, y) {
    this.hearts--;
    this.combo = 0;
    this.shake = 0.3;
    this.setFeedback(said, false);
    this.floaters.push({ text: '-1 ♥', x: x, y: y, t: 0, color: '#c62828' });
    WR.Audio.bad();
    WR.Audio.speak(said.speech, said.ptSpeech);
    if (this.hearts <= 0) { this.state = 'ending'; this.lock = 2.2; }
  };

  R.pick = function (e, player) {
    if (e.isTarget) { this.success(e); return; }
    var pos = this.entityBox(e);
    e.state = 'poof';
    e.t = 0;
    player.hurt = 0.7;
    this.mistake(S.wrong(this.order.target, e, this.order.mode, this.textOpts), pos.x + pos.w / 2, pos.y);
  };

  R.skip = function () {
    if (this.state === 'playing' || this.state === 'lock' || this.state === 'sayit') this.nextOrder();
  };

  R.confirmSayIt = function (ok) {
    if (this.state !== 'sayit') return;
    if (!ok) { WR.Audio.speak(this.sayIt.speech, this.sayIt.ptSpeech); return; }
    this.score += 5;
    this.floaters.push({ text: '+5 🗣️', x: 640, y: 220, t: 0, color: '#6a1b9a' });
    this.state = 'lock';
    this.lock = 0.5;
  };

  R.repeat = function () {
    if (!this.order) return;
    var said = this.state === 'sayit' ? this.sayIt : this.order.said;
    WR.Audio.speak(said.speech, said.ptSpeech);
  };

  // Retângulo da roupa (grupo de 1 a 3 desenhos) na tela.
  R.entityBox = function (e) {
    var size = this.cfg.itemSize;
    var w = size + (e.count - 1) * size * 0.42;
    var pos = WR.slotPos(this.level, e.slot);
    var bob = Math.sin(this.level.time * 3 + e.slot.x) * 3;
    return { x: pos.x - w / 2, y: pos.y - size - 6 + bob, w: w, h: size };
  };

  R.update = function (dt) {
    var self = this;
    WR.updateLevel(this.level, dt);

    this.particles = this.particles.filter(function (p) {
      p.life -= dt; p.vy += 1200 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 8;
      return p.life > 0;
    });
    this.floaters = this.floaters.filter(function (f) { f.t += dt; return f.t < 1.2; });
    if (this.feedback) this.feedback.t += dt;
    if (this.banner) { this.banner.t += dt; if (this.banner.t > 2.5) this.banner = null; }
    this.shake = Math.max(0, this.shake - dt);
    this.entities.forEach(function (e) { e.t += dt; if (e.state === 'pop' && e.t > 0.3) e.state = 'idle'; });
    this.entities = this.entities.filter(function (e) {
      return !((e.state === 'poof' && e.t > 0.5) || (e.state === 'fade' && e.t > 0.4));
    });

    if (this.state === 'ready' || this.state === 'end' || this.state === 'paused') return;

    // personagens sempre se mexem (até no 'lock'), para ficar gostoso de jogar
    var single = this.players.length === 1;
    this.players.forEach(function (p) {
      WR.updatePlayer(p, WR.Input.player(p.index, single), self.level, dt);
    });

    if (this.state === 'ending') {
      this.lock -= dt;
      if (this.lock <= 0) this.finish();
      return;
    }
    if (this.state === 'lock') {
      // espera a vendedora terminar de falar (inglês + português), no máximo 4 s a mais
      this.lock -= dt;
      if (this.lock <= 0 && (this.lock < -4 || !WR.Audio.speaking())) this.nextOrder();
      return;
    }
    if (this.state !== 'playing') return;

    this.orderAge += dt;
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) { this.timeLeft = 0; this.finish(); return; }

    for (var j = 0; j < this.entities.length; j++) {
      var e = this.entities[j];
      if (e.state !== 'idle') continue;
      var box = this.entityBox(e);
      var shrink = { x: box.x + box.w * 0.12, y: box.y + box.h * 0.12, w: box.w * 0.76, h: box.h * 0.76 };
      var touching = this.players.filter(function (p) { return WR.overlaps(p, shrink); });
      if (!e.armed) { e.armed = !touching.length; continue; }
      var picker = touching.filter(function (p) { return p.hurt <= 0; })[0];
      if (picker) { this.pick(e, picker); if (this.state !== 'playing') return; }
    }
  };

  R.stars = function () { return this.correct >= 10 ? 3 : this.correct >= 6 ? 2 : this.correct >= 3 ? 1 : 0; };

  R.finish = function () {
    if (this.state === 'end') return;
    this.state = 'end';
    WR.Audio.end();
    this.emit('end', { score: this.score, correct: this.correct, stars: this.stars(), practiced: this.practiced });
  };
})();

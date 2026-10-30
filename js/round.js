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

  // Coloca cada roupa numa vaga livre da sua zona.
  WR.placeEntities = function (level, entities) {
    var free = shuffle(level.slots);
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
    this.orderCount = 0;
    this.orderAge = 0;
    this.lock = 0;
    this.feedback = null;
    this.banner = null;
    this.particles = [];
    this.floaters = [];
    this.practiced = [];
    this.shake = 0;
    this.phase = this.phaseFor(0);
    this.listeners = {};
  };

  var R = WR.Round.prototype;

  R.on = function (name, fn) { this.listeners[name] = fn; };
  R.emit = function (name, data) { if (this.listeners[name]) this.listeners[name](data); };

  R.phaseFor = function (correct) {
    if (!this.cfg.phases) return 'all';
    return correct < 4 ? 'vocab' : correct < 8 ? 'singular' : 'all';
  };

  R.start = function () {
    this.state = 'playing';
    this.nextOrder();
  };

  R.nextOrder = function () {
    var turma = this.opts.turma;
    var question = !!this.cfg.questions && this.orderCount % 2 === 1;
    var built = WR.buildOrder(turma, this.phase, this.order && this.order.target.item.id);
    this.entities = WR.placeEntities(this.level, built.entities);
    this.entities.forEach(function (e, i) { e.state = 'pop'; e.t = -i * 0.05; });
    var target = built.target;
    var said = question ? S.question() : S.order(target, this.phase, turma, this.textOpts);
    this.order = { target: target, mode: this.phase, question: question, text: said.text, speech: said.speech };
    if (question) this.setupBlocks(target);
    this.orderCount++;
    this.orderAge = 0;
    this.feedback = null;
    this.state = 'playing';
    WR.Audio.pop();
    WR.Audio.speak(question ? 'Look! Hit the right block!' : said.speech);
  };

  R.setupBlocks = function (target) {
    var labels = shuffle(S.BLOCKS);
    this.level.blocks.forEach(function (b, i) { b.label = labels[i]; b.flash = 0; b.bump = 0; });
    this.order.answer = S.answerBlock(target);
  };

  R.activeBlocks = function () {
    return this.order && this.order.question && this.state === 'playing' ? this.level.blocks : null;
  };

  R.setFeedback = function (text, good) {
    this.feedback = { text: text, good: good, t: 0 };
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
    if (this.practiced.indexOf(said.speech) < 0) this.practiced.push(said.speech);
    this.setFeedback(said.text, true);
    var pos = this.entityBox(e);
    this.floaters.push({ text: '+' + gained, x: pos.x + pos.w / 2, y: pos.y, t: 0, color: '#2e7d32' });
    this.addParticles(pos.x + pos.w / 2, pos.y + pos.h / 2, ['#ffca28', '#66bb6a', '#42a5f5', '#ef5350', '#ab47bc'], 36);
    e.state = 'fly';
    e.t = 0;
    e.from = { x: pos.x, y: pos.y };
    this.entities.forEach(function (o) { if (o !== e && o.state !== 'poof') { o.state = 'fade'; o.t = 0; } });
    WR.Audio.good();
    WR.Audio.speak(said.speech);
    this.emit('correct');

    var newPhase = this.phaseFor(this.correct);
    if (newPhase !== this.phase) {
      this.phase = newPhase;
      this.banner = { text: newPhase === 'singular' ? 'Phase 2: this / that' : 'Phase 3: this, that, these, those', t: 0 };
    }
    if (this.opts.sayIt) { this.state = 'sayit'; this.sayItText = said.text; this.sayItSpeech = said.speech; }
    else { this.state = 'lock'; this.lock = 1.8; }
  };

  R.mistake = function (feedbackText, x, y) {
    this.hearts--;
    this.combo = 0;
    this.shake = 0.3;
    this.setFeedback(feedbackText.text, false);
    this.floaters.push({ text: '-1 ♥', x: x, y: y, t: 0, color: '#c62828' });
    WR.Audio.bad();
    WR.Audio.speak(feedbackText.speech);
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

  R.hitBlock = function (b, player) {
    b.bump = 0.25;
    WR.Audio.bump();
    if (b.flash > 0) return;
    if (b.label === this.order.answer) {
      b.flash = 2; b.flashColor = '#43a047';
      this.success(this.order.target);
    } else {
      b.flash = 0.8; b.flashColor = '#e53935';
      player.hurt = 0.7;
      this.mistake(S.questionHint(this.order.target), b.x + b.w / 2, b.y + b.h);
    }
  };

  R.skip = function () {
    if (this.state === 'playing' || this.state === 'lock' || this.state === 'sayit') this.nextOrder();
  };

  R.confirmSayIt = function (ok) {
    if (this.state !== 'sayit') return;
    if (!ok) { WR.Audio.speak(this.sayItSpeech); return; }
    this.score += 5;
    this.floaters.push({ text: '+5 🗣️', x: 640, y: 220, t: 0, color: '#6a1b9a' });
    this.state = 'lock';
    this.lock = 0.5;
  };

  R.repeat = function () {
    if (!this.order) return;
    WR.Audio.speak(this.state === 'sayit' ? this.sayItSpeech : this.order.speech);
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
    this.level.blocks.forEach(function (b) { b.bump = Math.max(0, b.bump - dt); b.flash = Math.max(0, b.flash - dt); });
    this.entities.forEach(function (e) { e.t += dt; if (e.state === 'pop' && e.t > 0.3) e.state = 'idle'; });
    this.entities = this.entities.filter(function (e) {
      return !((e.state === 'poof' && e.t > 0.5) || (e.state === 'fade' && e.t > 0.4));
    });

    if (this.state === 'ready' || this.state === 'end' || this.state === 'paused') return;

    // personagens sempre se mexem (até no 'lock'), para ficar gostoso de jogar
    var single = this.players.length === 1;
    var blocks = this.activeBlocks();
    this.players.forEach(function (p) {
      var input = WR.Input.player(p.index, single);
      var hits = WR.updatePlayer(p, input, self.level, blocks, dt);
      if (self.state === 'playing' && hits.length) self.hitBlock(hits[0], p);
    });

    if (this.state === 'ending') {
      this.lock -= dt;
      if (this.lock <= 0) this.finish();
      return;
    }
    if (this.state === 'lock') {
      this.lock -= dt;
      if (this.lock <= 0) this.nextOrder();
      return;
    }
    if (this.state !== 'playing') return;

    this.orderAge += dt;
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) { this.timeLeft = 0; this.finish(); return; }

    if (this.order.question) return; // nas perguntas, só os blocos contam
    for (var i = 0; i < this.players.length; i++) {
      var p = this.players[i];
      if (p.hurt > 0) continue;
      for (var j = 0; j < this.entities.length; j++) {
        var e = this.entities[j];
        if (e.state !== 'idle') continue;
        var box = this.entityBox(e);
        var shrink = { x: box.x + box.w * 0.12, y: box.y + box.h * 0.12, w: box.w * 0.76, h: box.h * 0.76 };
        if (WR.overlaps(p, shrink)) { this.pick(e, p); if (this.state !== 'playing') return; break; }
      }
    }
  };

  R.stars = function () { return this.correct >= 12 ? 3 : this.correct >= 8 ? 2 : this.correct >= 4 ? 1 : 0; };

  R.finish = function () {
    if (this.state === 'end') return;
    this.state = 'end';
    WR.Audio.end();
    this.emit('end', { score: this.score, correct: this.correct, stars: this.stars(), practiced: this.practiced });
  };
})();

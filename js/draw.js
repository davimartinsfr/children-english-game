/*
 * Desenho de tudo no canvas: loja, vendedora, personagens, roupas e placar.
 */
window.WR = window.WR || {};

(function () {
  var FONT = '"Trebuchet MS", "Segoe UI", Arial, sans-serif';
  var HERE_COLOR = '#e65100';
  var THERE_COLOR = '#0d47a1';
  var ACCENT = '#6a1b9a';

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function font(size, bold) { return (bold === false ? '' : 'bold ') + size + 'px ' + FONT; }
  function ease(k) { return 1 - Math.pow(1 - k, 3); }
  function easeBack(k) { var c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }

  function outlinedText(ctx, text, x, y, size, fill) {
    ctx.font = font(size);
    ctx.lineWidth = Math.max(3, size / 7);
    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y);
  }

  function highlightColor(word, colourCoded) {
    if (!colourCoded) return ACCENT;
    var w = word.toLowerCase();
    if (/^(this|these|here|d?est[ea]s?$|aqui)/.test(w)) return HERE_COLOR;
    if (/^(that|those|over there|d?aquel[ea]s?$|lá)/.test(w)) return THERE_COLOR;
    return ACCENT;
  }

  // Texto com partes *destacadas*, centralizado e encolhido se não couber.
  function richText(ctx, text, cx, y, size, maxW, base, colourCoded) {
    var parts = text.split('*');
    var total;
    do {
      total = 0;
      for (var i = 0; i < parts.length; i++) { ctx.font = font(size); total += ctx.measureText(parts[i]).width; }
      if (total > maxW) size -= 2;
    } while (total > maxW && size > 14);
    var x = cx - total / 2;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = font(size);
    parts.forEach(function (part, i) {
      var w = ctx.measureText(part).width;
      if (i % 2 === 1) {
        var c = highlightColor(part, colourCoded);
        ctx.fillStyle = c;
        ctx.fillText(part, x, y);
        ctx.fillRect(x, y + size * 0.5, w, 3);
      } else {
        ctx.fillStyle = base;
        ctx.fillText(part, x, y);
      }
      x += w;
    });
  }

  function drawBackground(ctx, round) {
    var W = WR.W, H = WR.H, S = WR.SPLIT_X, F = WR.FLOOR_Y;
    var g = ctx.createLinearGradient(0, 0, 0, F);
    g.addColorStop(0, '#fff8e1');
    g.addColorStop(1, '#ffe0b2');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, F);
    // listras do papel de parede
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (var x = 0; x < W; x += 80) ctx.fillRect(x, 56, 34, F - 56);
    // tons das zonas
    ctx.fillStyle = 'rgba(255,152,0,0.10)';
    ctx.fillRect(0, 56, S, F - 56);
    ctx.fillStyle = 'rgba(33,150,243,0.12)';
    ctx.fillRect(S, 56, W - S, F - 56);
    // divisória tracejada
    ctx.save();
    ctx.setLineDash([14, 12]);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(S, 160);
    ctx.lineTo(S, F);
    ctx.stroke();
    ctx.restore();
    // chão
    ctx.fillStyle = '#ffb74d';
    ctx.fillRect(0, F, S, H - F);
    ctx.fillStyle = '#64b5f6';
    ctx.fillRect(S, F, W - S, H - F);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, F, W, 5);
  }

  // Dica: o lado certo da loja (perto / longe) pisca.
  function drawZoneHint(ctx, round, t) {
    if (!round.hintOn() || round.order.mode === 'vocab') return;
    var here = round.order.target.zone === 'here';
    var x = here ? 0 : WR.SPLIT_X, w = here ? WR.SPLIT_X : WR.W - WR.SPLIT_X;
    var pulse = 0.5 + 0.5 * Math.sin(t * 6);
    ctx.save();
    ctx.fillStyle = here ? 'rgba(255,152,0,' + (0.08 + 0.12 * pulse) + ')' : 'rgba(33,150,243,' + (0.08 + 0.12 * pulse) + ')';
    ctx.fillRect(x, 56, w, WR.FLOOR_Y - 56);
    ctx.lineWidth = 8;
    ctx.strokeStyle = here ? HERE_COLOR : THERE_COLOR;
    ctx.globalAlpha = 0.4 + 0.6 * pulse;
    ctx.strokeRect(x + 4, 60, w - 8, WR.FLOOR_Y - 64);
    ctx.restore();
  }

  // Cartinhas no chão: cada demonstrative fica no lado da loja a que pertence.
  var CARDS = [
    { word: 'THIS', zone: 'here', many: false, pt: 'este · 1 aqui' },
    { word: 'THESE', zone: 'here', many: true, pt: 'estes · vários aqui' },
    { word: 'THAT', zone: 'there', many: false, pt: 'aquele · 1 lá' },
    { word: 'THOSE', zone: 'there', many: true, pt: 'aqueles · vários lá' }
  ];

  function drawFloor(ctx, round, t) {
    var S = WR.SPLIT_X, F = WR.FLOOR_Y;
    // Turma 1 na fase só de palavras: sem cartinhas. Fase this/that: só THIS e THAT.
    var cards = round.stage === 'vocab' ? [] : round.stage === 'mixed'
      ? CARDS.filter(function (c) { return !c.many; }) : CARDS;
    var lit = null;
    if (round.order && round.order.mode !== 'vocab' && round.state === 'playing' &&
        (round.cfg.cardFromStart || round.hintOn())) {
      lit = Sentences.demonstrative(round.order.target).toUpperCase();
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var labelX = cards.length ? [140, 790] : [S / 2 + 60, S + (WR.W - S) / 2];
    outlinedText(ctx, 'HERE ✋ AQUI', labelX[0], F + 32, 28, '#fff');
    outlinedText(ctx, 'OVER THERE 👉 LÁ', labelX[1], F + 32, 28, '#fff');

    var slotX = { here: [290, 465], there: [925, 1100] };
    var used = { here: 0, there: 0 };
    cards.forEach(function (c) {
      var x = slotX[c.zone][used[c.zone]++], y = F + 6, w = 165, h = 50;
      var on = lit === c.word;
      var color = c.zone === 'here' ? HERE_COLOR : THERE_COLOR;
      ctx.save();
      if (on) {
        var k = 1 + 0.05 * Math.sin(t * 8);
        ctx.translate(x + w / 2, y + h / 2);
        ctx.scale(k, k);
        ctx.translate(-x - w / 2, -y - h / 2);
      }
      ctx.globalAlpha = lit && !on ? 0.55 : 1;
      ctx.fillStyle = on ? '#fffde7' : 'rgba(255,255,255,0.85)';
      rr(ctx, x, y, w, h, 10);
      ctx.fill();
      ctx.lineWidth = on ? 5 : 2;
      ctx.strokeStyle = on ? '#ffd600' : color;
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = font(20);
      ctx.fillText(c.word + ' ' + (c.zone === 'here' ? '✋' : '👉') + (c.many ? '👕👕' : '👕'), x + w / 2, y + 17);
      ctx.fillStyle = '#37474f';
      ctx.font = font(14);
      ctx.fillText(c.pt, x + w / 2, y + 38);
      ctx.restore();
    });
  }

  function drawPlatforms(ctx, level) {
    level.platforms.forEach(function (p) {
      ctx.fillStyle = '#8d6e63';
      rr(ctx, p.x, p.y, p.w, 18, 6);
      ctx.fill();
      ctx.fillStyle = '#a1887f';
      rr(ctx, p.x, p.y, p.w, 7, 4);
      ctx.fill();
      ctx.strokeStyle = '#4e342e';
      ctx.lineWidth = 3;
      rr(ctx, p.x, p.y, p.w, 18, 6);
      ctx.stroke();
      if (p.range) {
        ctx.fillStyle = '#4e342e';
        ctx.font = font(14);
        ctx.textAlign = 'center';
        ctx.fillText('◀ ▶', p.x + p.w / 2, p.y + 11);
      }
    });
  }

  function drawNPC(ctx, round, t) {
    var x = 70, F = WR.FLOOR_Y;
    var talk = round.order && round.orderAge < 2 && round.state === 'playing';
    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2b2b2b';
    // pernas
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x - 16, F - 34, 10, 34);
    ctx.fillRect(x + 6, F - 34, 10, 34);
    // vestido
    ctx.fillStyle = '#7e57c2';
    ctx.beginPath();
    ctx.moveTo(x - 22, F - 112);
    ctx.lineTo(x + 22, F - 112);
    ctx.lineTo(x + 38, F - 32);
    ctx.lineTo(x - 38, F - 32);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // avental com crachá
    ctx.fillStyle = '#fff';
    rr(ctx, x - 16, F - 96, 32, 50, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#6a1b9a';
    ctx.font = font(11);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SHOP', x, F - 80);
    // braço apontando
    var wave = Math.sin(t * 6) * (talk ? 6 : 1);
    ctx.strokeStyle = '#2b2b2b';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + 18, F - 104);
    ctx.lineTo(x + 54, F - 128 + wave);
    ctx.stroke();
    ctx.strokeStyle = '#ffcc80';
    ctx.lineWidth = 7;
    ctx.stroke();
    // cabeça
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2b2b2b';
    ctx.fillStyle = '#6d4c41';
    ctx.beginPath();
    ctx.arc(x, F - 162, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffcc80';
    ctx.beginPath();
    ctx.arc(x, F - 132, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#6d4c41';
    ctx.beginPath();
    ctx.arc(x, F - 140, 24, Math.PI * 1.05, Math.PI * 1.95);
    ctx.fill();
    ctx.fillStyle = '#2b2b2b';
    ctx.beginPath();
    ctx.arc(x - 8, F - 132, 3, 0, Math.PI * 2);
    ctx.arc(x + 8, F - 132, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.lineWidth = 3;
    if (talk && Math.sin(t * 18) > 0) ctx.ellipse(x, F - 120, 6, 5, 0, 0, Math.PI * 2);
    else ctx.arc(x, F - 122, 7, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    // balãozinho
    if (talk) {
      ctx.fillStyle = '#fff';
      rr(ctx, x + 22, F - 210, 52, 40, 12);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.font = font(24);
      ctx.fillStyle = '#2b2b2b';
      ctx.fillText('💬', x + 48, F - 189);
    }
    ctx.restore();
  }

  function drawKid(ctx, p, t) {
    if (p.hurt > 0 && Math.floor(t * 16) % 2 === 0) return;
    var cx = p.x + p.w / 2, y = p.y;
    var step = Math.sin(p.walk) * 6;
    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2b2b2b';
    // pernas
    ctx.fillStyle = '#37474f';
    ctx.fillRect(cx - 12 + step * 0.5, y + 44, 9, 12);
    ctx.fillRect(cx + 3 - step * 0.5, y + 44, 9, 12);
    // corpo
    ctx.fillStyle = p.color;
    rr(ctx, cx - 17, y + 26, 34, 22, 8);
    ctx.fill();
    ctx.stroke();
    // cabeça
    ctx.fillStyle = '#ffcc80';
    ctx.beginPath();
    ctx.arc(cx, y + 14, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#4e342e';
    ctx.beginPath();
    ctx.arc(cx, y + 10, 15, Math.PI * 1.0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2b2b2b';
    ctx.beginPath();
    ctx.arc(cx + p.facing * 4 - 4, y + 15, 2.6, 0, Math.PI * 2);
    ctx.arc(cx + p.facing * 4 + 5, y + 15, 2.6, 0, Math.PI * 2);
    ctx.fill();
    // nome do jogador (ou número, antes de começar)
    var label = p.name ? (p.name.length > 10 ? p.name.slice(0, 9) + '…' : p.name) : String(p.index + 1);
    ctx.font = font(15);
    var lw = Math.max(24, ctx.measureText(label).width + 14);
    ctx.fillStyle = p.color;
    rr(ctx, cx - lw / 2, y - 28, lw, 22, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, y - 16);
    ctx.restore();
  }

  function drawEntity(ctx, round, e, t) {
    var box = round.entityBox(e);
    var size = round.cfg.itemSize;
    var alpha = 1, scale = 1, cx = box.x + box.w / 2, cy = box.y + box.h / 2;
    if (e.state === 'pop') { if (e.t < 0) return; scale = Math.max(0.01, easeBack(Math.min(1, e.t / 0.3))); }
    if (e.state === 'fade') alpha = Math.max(0, 1 - e.t / 0.4);
    if (e.state === 'poof') { alpha = Math.max(0, 1 - e.t / 0.5); scale = 1 + e.t; }
    if (e.state === 'fly') {
      var k = ease(Math.min(1, e.t / 0.6));
      cx = e.from.x + box.w / 2 + (110 - e.from.x - box.w / 2) * k;
      cy = e.from.y + box.h / 2 + (WR.FLOOR_Y - 140 - e.from.y - box.h / 2) * k;
      scale = 1 - 0.5 * k;
      alpha = e.t > 0.9 ? Math.max(0, 1 - (e.t - 0.9) / 0.4) : 1;
    }
    if (alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // sombra
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, box.h / 2 + 4, box.w / 2, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    var img = window.ClothesArt.image(e.item.art, e.colour.hex);
    var step = size * 0.42;
    for (var i = e.count - 1; i >= 0; i--) {
      var dx = -box.w / 2 + i * step;
      var dy = -box.h / 2 + (i % 2 ? -4 : 0);
      if (img.complete && img.naturalWidth !== 0) ctx.drawImage(img, dx, dy, size, size);
      else { ctx.fillStyle = e.colour.hex; ctx.fillRect(dx + 8, dy + 8, size - 16, size - 16); }
    }
    if (e.state === 'poof') {
      ctx.strokeStyle = '#c62828';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(-20, -20); ctx.lineTo(20, 20);
      ctx.moveTo(20, -20); ctx.lineTo(-20, 20);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHeart(ctx, x, y, s, full) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s / 32, s / 32);
    ctx.beginPath();
    ctx.moveTo(16, 29);
    ctx.bezierCurveTo(2, 18, 0, 10, 4, 5);
    ctx.bezierCurveTo(8, 0, 14, 1, 16, 7);
    ctx.bezierCurveTo(18, 1, 24, 0, 28, 5);
    ctx.bezierCurveTo(32, 10, 30, 18, 16, 29);
    ctx.closePath();
    ctx.fillStyle = full ? '#ef5350' : 'rgba(255,255,255,0.18)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = full ? '#fff' : 'rgba(255,255,255,0.4)';
    ctx.stroke();
    ctx.restore();
  }

  var PHASE_LABEL = { vocab: 'Phase 1: words', mixed: 'Phase 2: this / that' };

  function drawHUD(ctx, round) {
    ctx.fillStyle = '#263238';
    ctx.fillRect(0, 0, WR.W, 56);
    for (var i = 0; i < round.cfg.hearts; i++) drawHeart(ctx, 12 + i * 30, 14, 28, i < round.hearts);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#b0bec5';
    ctx.font = font(18);
    var label = round.cfg.phases ? PHASE_LABEL[round.stage] : 'Turma ' + round.opts.turma + ' · ' + round.cfg.title;
    var lx = 22 + round.cfg.hearts * 30;
    var ls = 18;
    ctx.font = font(ls);
    while (ctx.measureText(label).width > 458 - lx && ls > 11) { ls--; ctx.font = font(ls); }
    ctx.fillText(label, lx, 28);

    // tempo
    var bx = 470, bw = 340, frac = round.timeLeft / round.opts.time;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    rr(ctx, bx, 16, bw, 24, 12);
    ctx.fill();
    ctx.fillStyle = frac > 0.3 ? '#66bb6a' : frac > 0.12 ? '#ffca28' : '#ef5350';
    rr(ctx, bx, 16, Math.max(24, bw * frac), 24, 12);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = font(18);
    ctx.fillText('⏱ ' + Math.ceil(round.timeLeft) + 's', bx + bw / 2, 29);

    // pontos
    ctx.textAlign = 'left';
    ctx.font = font(26);
    ctx.fillStyle = '#ffd54f';
    ctx.fillText('⭐ ' + round.score, 840, 29);
    if (round.combo >= 2) {
      ctx.font = font(18);
      ctx.fillStyle = '#80cbc4';
      ctx.fillText('combo x' + round.combo, 960, 29);
    }

    // nomes da dupla
    if (round.names.length) {
      var who = round.names.join(' & ');
      var size = 20;
      ctx.font = font(size);
      while (ctx.measureText(who).width > 210 && size > 12) { size--; ctx.font = font(size); }
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.fillText(who, WR.W - 18, 29);
    }
  }

  // Balão da vendedora: a ordem em inglês, a tradução em português embaixo
  // e, depois de pegar uma roupa, o ✔ / ✘ com a explicação (também nas duas línguas).
  function drawOrder(ctx, round) {
    if (!round.order) return;
    var fb = round.feedback;
    var x = 160, y = 64, w = WR.W - 176, h = fb ? 140 : 92;
    ctx.fillStyle = '#ffffff';
    rr(ctx, x, y, w, h, 18);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#7e57c2';
    ctx.stroke();
    var coded = !!round.cfg.colourCoded;
    var hasHint = round.hintOn();
    var textW = w - (hasHint ? 140 : 40);
    var centerX = x + 20 + textW / 2;
    richText(ctx, round.order.text, centerX, y + 30, fb ? 32 : 38, textW, '#263238', coded);
    richText(ctx, round.order.said.ptText, centerX, y + (fb ? 58 : 68), fb ? 18 : 22, textW, '#78909c', coded);
    if (fb) {
      richText(ctx, (fb.good ? '✔ ' : '✘ ') + fb.text, centerX, y + 90, 24, textW, fb.good ? '#2e7d32' : '#c62828', coded);
      richText(ctx, fb.ptText, centerX, y + 117, 18, textW, fb.good ? '#558b2f' : '#b71c1c', coded);
    }
    if (hasHint) {
      var t = round.order.target;
      var img = window.ClothesArt.image(t.item.art, t.colour.hex);
      if (img.complete && img.naturalWidth) ctx.drawImage(img, x + w - 100, y + 8, 72, 72);
      ctx.font = font(12);
      ctx.fillStyle = '#90a4ae';
      ctx.textAlign = 'center';
      ctx.fillText('hint', x + w - 64, y + 84);
    }
  }

  function drawSayIt(ctx, round) {
    if (round.state !== 'sayit') return;
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, WR.W, WR.H);
    var x = 290, y = 220, w = 700, h = 270;
    ctx.fillStyle = '#fff';
    rr(ctx, x, y, w, h, 24);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#6a1b9a';
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#6a1b9a';
    ctx.font = font(34);
    ctx.fillText('🗣️ Say it together!', x + w / 2, y + 50);
    richText(ctx, round.sayIt.text, x + w / 2, y + 115, 48, w - 60, '#263238', !!round.cfg.colourCoded);
    richText(ctx, round.sayIt.ptText, x + w / 2, y + 170, 26, w - 60, '#78909c', !!round.cfg.colourCoded);
    ctx.textAlign = 'center';
    ctx.font = font(18, false);
    ctx.fillStyle = '#546e7a';
    ctx.fillText('Professora: ENTER = falou certo ✔    ·    BACKSPACE = ouvir de novo 🔁', x + w / 2, y + 228);
  }

  function drawBanner(ctx, round) {
    if (!round.banner) return;
    var k = round.banner.t;
    var a = k < 0.3 ? k / 0.3 : k > 2.1 ? Math.max(0, (2.5 - k) / 0.4) : 1;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = '#6a1b9a';
    rr(ctx, 340, 300, 600, 90, 20);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    outlinedText(ctx, round.banner.text, 640, 345, 36, '#fff');
    ctx.restore();
  }

  WR.draw = function (ctx, round, t) {
    ctx.save();
    if (round.shake > 0) ctx.translate((Math.random() - 0.5) * 14 * round.shake / 0.3, (Math.random() - 0.5) * 10 * round.shake / 0.3);
    drawBackground(ctx, round);
    drawZoneHint(ctx, round, t);
    drawFloor(ctx, round, t);
    drawPlatforms(ctx, round.level);
    drawNPC(ctx, round, t);
    round.entities.forEach(function (e) { drawEntity(ctx, round, e, t); });
    round.players.forEach(function (p) { drawKid(ctx, p, t); });

    round.particles.forEach(function (p) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    });
    round.floaters.forEach(function (f) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - f.t / 1.2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      outlinedText(ctx, f.text, f.x, f.y - f.t * 60, 30, f.color === '#c62828' ? '#ff8a80' : '#b9f6ca');
      ctx.restore();
    });
    ctx.restore();

    drawHUD(ctx, round);
    drawOrder(ctx, round);
    drawBanner(ctx, round);
    drawSayIt(ctx, round);
  };
})();

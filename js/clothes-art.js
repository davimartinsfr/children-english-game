/*
 * Desenhos das roupas (SVG simples, 100x100), feitos para este jogo.
 * Cada desenho recebe a cor principal (c) e uma cor de detalhe (d).
 */
(function () {
  var LINE = 'stroke="#2b2b2b" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';

  function path(d, fill, extra) {
    return '<path d="' + d + '" fill="' + fill + '" ' + LINE + (extra ? ' ' + extra : '') + '/>';
  }
  function line(d, color, width) {
    return '<path d="' + d + '" fill="none" stroke="' + (color || '#2b2b2b') + '" stroke-width="' +
      (width || 3) + '" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  function circle(cx, cy, r, fill) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '" ' + LINE + '/>';
  }
  function rect(x, y, w, h, rx, fill) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + rx +
      '" fill="' + fill + '" ' + LINE + '/>';
  }
  function g(transform, body) {
    return '<g transform="' + transform + '">' + body + '</g>';
  }

  // Escurece cores claras e clareia cores escuras, para os detalhes aparecerem.
  function detail(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
    var lum = 0.299 * r + 0.587 * gg + 0.114 * b;
    var f = lum < 90 ? 1.8 : 0.72;
    function ch(v) { return Math.max(0, Math.min(255, Math.round(lum < 90 ? v * f + 30 : v * f))); }
    return '#' + ((1 << 24) + (ch(r) << 16) + (ch(gg) << 8) + ch(b)).toString(16).slice(1);
  }

  var TOP = 'M32 12 L44 8 L50 16 L56 8 L68 12 L86 26 L94 78 L80 80 L72 42 L72 90 L28 90 L28 42 L20 80 L6 78 L14 26 Z';
  var SWEATER = 'M30 12 Q50 24 70 12 L84 22 L94 76 L80 79 L72 40 L72 84 L28 84 L28 40 L20 79 L6 76 L16 22 Z';
  var COAT = 'M33 12 L44 9 L50 20 L56 9 L67 12 L84 28 L90 86 L78 88 L72 46 L76 97 L24 97 L28 46 L22 88 L10 86 L16 28 Z';
  var LEGS = 'M26 6 L74 6 L78 94 L56 94 L50 34 L44 94 L22 94 Z';
  var SHOE = 'M6 72 Q6 54 18 52 L36 52 Q42 62 56 64 L80 68 Q92 72 90 82 L6 82 Z';
  var BOOT = 'M18 8 L46 8 L46 60 L74 68 Q86 72 84 84 L18 84 Z';
  var GLOVE = 'M14 92 L14 58 L10 34 Q10 28 16 29 L20 48 L20 24 Q21 18 27 20 L28 46 L30 18 Q33 13 37 18 ' +
    'L37 47 L40 26 Q44 22 47 27 L45 62 L52 52 Q58 50 56 58 L45 78 L45 92 Z';
  var SOCK = 'M18 8 L40 8 L40 58 L54 70 Q62 82 50 88 L26 88 Q16 86 18 76 Z';

  function shoe(c, d) { return path(SHOE, c) + path('M6 82 L90 82 L90 88 L6 88 Z', d); }
  function trainer(c) {
    return path(SHOE, c) + path('M6 80 L91 80 L90 88 L6 88 Z', '#ffffff') +
      line('M30 56 L36 62 M36 54 L42 60 M24 60 L30 66', '#ffffff', 3) + line('M50 74 Q62 66 78 74', '#ffffff', 4);
  }
  function boot(c, d) { return path(BOOT, c) + path('M18 84 L84 84 L84 92 L18 92 Z', d) + path('M18 8 L46 8 L46 18 L18 18 Z', d); }
  function sandal(c, d) {
    return path('M8 78 Q8 70 18 70 L82 72 Q92 74 90 80 Q90 86 82 86 L16 86 Q8 86 8 78 Z', d) +
      line('M22 72 Q30 54 46 58 Q52 62 52 72', '#2b2b2b', 10) + line('M22 72 Q30 54 46 58 Q52 62 52 72', c, 6) +
      line('M60 73 Q66 62 76 66', '#2b2b2b', 10) + line('M60 73 Q66 62 76 66', c, 6);
  }

  var ART = {
    tshirt: function (c) {
      return path('M30 14 L42 9 Q50 18 58 9 L70 14 L92 32 L80 46 L70 39 L70 92 L30 92 L30 39 L20 46 L8 32 Z', c);
    },
    shirt: function (c, d) {
      return path('M33 12 L44 9 L50 18 L56 9 L67 12 L84 28 L92 82 L80 84 L72 44 L72 94 L28 94 L28 44 L20 84 L8 82 L16 28 Z', c) +
        line('M50 18 L50 94') + path('M44 9 L50 18 L42 25 L38 12 Z', d) + path('M56 9 L50 18 L58 25 L62 12 Z', d) +
        circle(50, 36, 2.5, '#fff') + circle(50, 52, 2.5, '#fff') + circle(50, 68, 2.5, '#fff') + circle(50, 84, 2.5, '#fff');
    },
    blouse: function (c, d) {
      return path('M34 14 L44 10 Q50 20 56 10 L66 14 L84 24 L80 44 L68 38 L72 90 Q50 98 28 90 L32 38 L20 44 L16 24 Z', c) +
        path('M50 22 L39 15 L39 29 Z', d) + path('M50 22 L61 15 L61 29 Z', d) + circle(50, 22, 3.5, d) +
        line('M32 80 Q36 86 40 80 Q44 86 48 80 Q52 86 56 80 Q60 86 64 80 Q68 86 70 80', d, 3);
    },
    sweater: function (c, d) {
      return path(SWEATER, c) + rect(27, 82, 46, 10, 2, d) + line('M30 12 Q50 24 70 12', d, 5) +
        line('M28 52 L34 46 L40 52 L46 46 L52 52 L58 46 L64 52 L72 46', d, 4);
    },
    cardigan: function (c, d) {
      return path(SWEATER, c) + rect(27, 82, 46, 10, 2, d) + line('M30 12 L50 50 L70 12', d, 4) +
        line('M50 50 L50 92') + circle(55, 60, 2.5, d) + circle(55, 72, 2.5, d) + circle(55, 84, 2.5, d);
    },
    jacket: function (c, d) {
      return path(TOP, c) + path('M44 8 L50 16 L56 8 L60 3 Q50 -1 40 3 Z', d) + line('M50 16 L50 90', d, 4) +
        path('M31 62 L44 62 L44 74 L31 74 Z', d) + path('M56 62 L69 62 L69 74 L56 74 Z', d);
    },
    bikerjacket: function (c, d) {
      return path(TOP, c) + line('M57 12 L42 50 L50 90', d, 4) + path('M44 8 L35 30 L46 26 Z', d) +
        path('M56 8 L65 30 L57 27 Z', d) + rect(28, 80, 44, 8, 1, d) + rect(46, 79, 8, 10, 1, '#cfd8dc');
    },
    coat: function (c, d) {
      return path(COAT, c) + path('M44 9 L50 20 L40 34 L36 14 Z', d) + path('M56 9 L50 20 L60 34 L64 14 Z', d) +
        rect(28, 56, 44, 7, 1, d) + circle(42, 44, 3, d) + circle(58, 44, 3, d) + circle(42, 76, 3, d) + circle(58, 76, 3, d);
    },
    raincoat: function (c, d) {
      return path('M34 20 Q32 2 50 2 Q68 2 66 20 Z', d) + path(COAT, c) + line('M50 20 L50 97', d, 3) +
        rect(44, 38, 12, 4, 2, d) + rect(44, 56, 12, 4, 2, d) + rect(44, 74, 12, 4, 2, d);
    },
    tracksuit: function (c, d) {
      return path('M30 50 L70 50 L74 97 L56 97 L50 64 L44 97 L26 97 Z', c) +
        path('M32 8 L44 5 L50 12 L56 5 L68 8 L82 18 L90 50 L78 53 L70 28 L70 52 L30 52 L30 28 L22 53 L10 50 L18 18 Z', c) +
        line('M19 21 L12 48 M81 21 L88 48 M30 56 L27 94 M70 56 L73 94', '#ffffff', 3) + line('M50 12 L50 52', d, 3);
    },
    dress: function (c, d) {
      return path('M38 6 L44 6 Q50 14 56 6 L62 6 L66 34 L60 42 L88 90 Q50 100 12 90 L40 42 L34 34 Z', c) +
        path('M34 34 L66 34 L60 42 L40 42 Z', d) + circle(40, 64, 3, '#fff') + circle(58, 60, 3, '#fff') +
        circle(30, 82, 3, '#fff') + circle(50, 80, 3, '#fff') + circle(70, 82, 3, '#fff');
    },
    skirt: function (c, d) {
      return path('M28 26 L72 26 L90 84 Q50 94 10 84 Z', c) + rect(28, 16, 44, 10, 2, d) +
        line('M40 28 L32 88 M50 28 L50 91 M60 28 L68 88', d, 3);
    },
    tanktop: function (c) {
      return path('M36 6 L43 6 Q50 26 57 6 L64 6 L66 26 Q76 32 76 44 L76 92 L24 92 L24 44 Q24 32 34 26 Z', c);
    },
    jeans: function (c, d) {
      return path(LEGS, c) + line('M26 14 L74 14 M50 14 L50 34') + line('M30 14 Q34 24 42 22 M70 14 Q66 24 58 22', d, 3) +
        line('M32 30 L28 88 M68 30 L72 88', '#f5d27a', 2);
    },
    trousers: function (c, d) {
      return path(LEGS, c) + line('M26 14 L74 14 M50 14 L50 34') + line('M37 20 L33 92 M63 20 L67 92', d, 3) +
        rect(31, 6, 4, 9, 1, d) + rect(65, 6, 4, 9, 1, d);
    },
    shorts: function (c, d) {
      return path('M22 20 L78 20 L84 72 L56 76 L50 46 L44 76 L16 72 Z', c) + line('M22 30 L78 30') +
        line('M46 30 L42 40 M54 30 L58 40', d, 3);
    },
    hat: function (c, d) {
      return '<ellipse cx="50" cy="66" rx="46" ry="14" fill="' + c + '" ' + LINE + '/>' +
        path('M28 64 Q28 24 50 24 Q72 24 72 64 Z', c) + path('M28 52 L72 52 L72 62 L28 62 Z', d) + circle(66, 57, 5, '#fff');
    },
    cap: function (c, d) {
      return path('M24 64 Q24 26 54 26 Q82 26 82 64 Z', c) + path('M30 62 Q8 60 4 72 Q30 80 56 64 Z', d) +
        circle(54, 26, 4, d) + line('M54 28 Q46 44 44 62 M54 28 Q64 44 66 63', d, 2);
    },
    beanie: function (c, d) {
      return circle(50, 20, 11, '#ffffff') + path('M20 66 Q20 26 50 26 Q80 26 80 66 Z', c) + rect(16, 64, 68, 18, 4, d) +
        line('M28 66 L28 80 M40 66 L40 80 M52 66 L52 80 M64 66 L64 80 M76 66 L76 80', c, 3);
    },
    scarf: function (c, d) {
      return path('M58 46 L80 88 L60 94 L42 52 Z', c) + path('M10 18 Q50 42 90 18 L92 42 Q50 68 8 42 Z', c) +
        line('M14 28 Q50 50 88 28', d, 4) + line('M50 62 L68 56 M57 76 L74 70', d, 5) +
        line('M62 94 L61 99 M67 93 L67 99 M72 91 L73 98 M77 90 L79 96', '#2b2b2b', 2);
    },
    gloves: function (c, d) {
      var one = path(GLOVE, c) + rect(14, 82, 31, 10, 2, d);
      return g('translate(38,4)', one) + one;
    },
    socks: function (c, d) {
      var one = path(SOCK, c) + path('M18 14 L40 14 L40 20 L18 20 Z', '#fff') + path('M18 26 L40 26 L40 32 L18 32 Z', d);
      return g('translate(34,6)', one) + one;
    },
    shoes: function (c, d) { return g('translate(8,-24)', shoe(c, d)) + shoe(c, d); },
    trainers: function (c) { return g('translate(8,-24)', trainer(c)) + trainer(c); },
    boots: function (c, d) { return g('translate(14,-4)', boot(c, d)) + g('translate(-6,6)', boot(c, d)); },
    rubberboots: function (c, d) {
      var one = boot(c, d) + line('M24 16 L24 70', '#ffffff', 4);
      return g('translate(14,-4)', one) + g('translate(-6,6)', one);
    },
    sandals: function (c, d) { return g('translate(6,-24)', sandal(c, d)) + sandal(c, d); },
    heels: function (c, d) {
      var one = path('M10 42 Q14 36 22 40 Q40 62 66 70 L86 74 Q94 76 92 84 L88 88 L60 88 Q40 80 26 64 ' +
        'L24 90 L17 90 L14 60 Z', c) + line('M14 60 L26 64', d, 3);
      return g('translate(6,-28)', one) + one;
    },
    backpack: function (c, d) {
      return line('M38 24 Q38 8 50 8 Q62 8 62 24', '#2b2b2b', 4) + rect(20, 22, 60, 72, 16, c) +
        rect(30, 56, 40, 28, 8, d) + line('M28 44 L72 44') + rect(46, 40, 8, 6, 2, '#cfd8dc');
    },
    sunglasses: function (c) {
      return line('M8 40 L2 30 M92 40 L98 30') + path('M8 38 L44 38 Q46 64 28 64 Q10 64 8 38 Z', c) +
        path('M56 38 L92 38 Q90 64 72 64 Q54 64 56 38 Z', c) + line('M44 42 Q50 34 56 42') +
        line('M16 46 L24 54 M64 46 L72 54', '#ffffff', 3);
    }
  };

  var cache = {};

  window.ClothesArt = {
    names: Object.keys(ART),
    svg: function (art, color) {
      var fn = ART[art] || ART.tshirt;
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' + fn(color, detail(color)) + '</svg>';
    },
    // Imagem pronta para desenhar no canvas (fica em cache).
    image: function (art, color) {
      var key = art + '|' + color;
      if (!cache[key]) {
        var img = new Image();
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(this.svg(art, color));
        cache[key] = img;
      }
      return cache[key];
    }
  };
})();

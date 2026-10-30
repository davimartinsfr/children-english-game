/*
 * Configuração das turmas e desenho das fases (plataformas).
 * A tela tem 1280 x 720. A metade esquerda é "HERE" (perto da vendedora),
 * a metade direita é "OVER THERE".
 */
window.WR = window.WR || {};

WR.W = 1280;
WR.H = 720;
WR.FLOOR_Y = 660;
WR.SPLIT_X = 640;

WR.TURMAS = {
  1: {
    title: 'Clothes Shop',
    hearts: 8,
    itemsPerOrder: 4,
    itemSize: 84,
    phases: true,          // fase 1 só vocabulário, fase 2 mistura vocabulário e this/that (sem these/those)
    colourCoded: true,     // this/these em laranja, that/those em azul
    hintAfter: 3,          // segundos até mostrar a dica (desenho + lado certo da loja)
    cardFromStart: true,   // a cartinha certa (THIS / THAT) já aparece acesa
    speechRate: 0.75
  },
  2: {
    title: 'Shop with Colours',
    hearts: 6,
    itemsPerOrder: 5,
    itemSize: 76,
    useColours: true,
    colourCoded: true,
    hintAfter: 4,
    speechRate: 0.8
  },
  3: {
    title: 'Big Shop',
    hearts: 5,
    itemsPerOrder: 5,
    itemSize: 72,
    moving: true,          // plataformas de baixo se mexem (devagar)
    contract: true,        // "That's a cap"
    colourCoded: true,
    hintAfter: 5,
    speechRate: 0.9
  }
};

// Duas lojas diferentes; cada dupla joga numa delas, alternando.
// Plataformas: { x, y, w } — dá para atravessar por baixo e pousar em cima.
// Vagas (slots): onde as roupas aparecem. plat = índice da plataforma ou -1 (chão).
WR.LAYOUTS = [
  {
    name: 'Clothes Shop',
    platforms: [
      { x: 180, y: 540, w: 200, moves: 50 },
      { x: 380, y: 420, w: 200 },
      { x: 180, y: 300, w: 200 },
      { x: 700, y: 540, w: 200, moves: 40 },
      { x: 960, y: 540, w: 220 },
      { x: 820, y: 420, w: 220 },
      { x: 720, y: 300, w: 180 },
      { x: 1040, y: 300, w: 200 }
    ],
    slots: [
      { plat: -1, x: 270 }, { plat: -1, x: 480 }, { plat: 0, x: 100 }, { plat: 1, x: 100 }, { plat: 2, x: 100 },
      { plat: -1, x: 820 }, { plat: -1, x: 1010 }, { plat: -1, x: 1190 }, { plat: 3, x: 100 }, { plat: 4, x: 110 },
      { plat: 5, x: 110 }, { plat: 6, x: 90 }, { plat: 7, x: 100 }
    ]
  },
  {
    name: 'Wardrobe',
    platforms: [
      { x: 160, y: 540, w: 220, moves: 40 },
      { x: 400, y: 420, w: 190 },
      { x: 200, y: 300, w: 190 },
      { x: 730, y: 540, w: 190 },
      { x: 990, y: 540, w: 230, moves: 40 },
      { x: 790, y: 420, w: 260 },
      { x: 700, y: 300, w: 190 },
      { x: 1050, y: 300, w: 190 }
    ],
    slots: [
      { plat: -1, x: 250 }, { plat: -1, x: 500 }, { plat: 0, x: 110 }, { plat: 1, x: 95 }, { plat: 2, x: 95 },
      { plat: -1, x: 830 }, { plat: -1, x: 1020 }, { plat: -1, x: 1200 }, { plat: 3, x: 95 }, { plat: 4, x: 115 },
      { plat: 5, x: 130 }, { plat: 6, x: 95 }, { plat: 7, x: 95 }
    ]
  }
];

// Cria a fase pronta para jogar (cópia, para poder mexer nas plataformas).
WR.makeLevel = function (index, turma) {
  var src = WR.LAYOUTS[index % WR.LAYOUTS.length];
  var cfg = WR.TURMAS[turma];
  var platforms = src.platforms.map(function (p, i) {
    return { x: p.x, y: p.y, w: p.w, x0: p.x, range: cfg.moving ? (p.moves || 0) / 2 : 0, phase: i, dx: 0 };
  });
  var slots = src.slots.map(function (s) {
    var absX = s.plat < 0 ? s.x : src.platforms[s.plat].x + s.x;
    return { plat: s.plat, x: s.x, zone: absX < WR.SPLIT_X ? 'here' : 'there' };
  });
  return { name: src.name, platforms: platforms, slots: slots, time: 0 };
};

WR.updateLevel = function (level, dt) {
  level.time += dt;
  level.platforms.forEach(function (p) {
    if (!p.range) return;
    var nx = p.x0 + Math.sin(level.time * 0.9 + p.phase) * p.range;
    p.dx = nx - p.x;
    p.x = nx;
  });
};

// Posição (centro x, base y) de uma vaga, acompanhando plataformas que se mexem.
WR.slotPos = function (level, slot) {
  if (slot.plat < 0) return { x: slot.x, y: WR.FLOOR_Y };
  var p = level.platforms[slot.plat];
  return { x: p.x + slot.x, y: p.y };
};

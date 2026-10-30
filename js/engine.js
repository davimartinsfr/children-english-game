/*
 * Controles (teclado e controle de videogame) e física dos personagens.
 */
window.WR = window.WR || {};

WR.Input = (function () {
  var down = {};
  var pressed = {};  // teclas apertadas neste quadro

  var MAPS = [
    { left: ['KeyA'], right: ['KeyD'], jump: ['KeyW'], down: ['KeyS'] },
    { left: ['ArrowLeft'], right: ['ArrowRight'], jump: ['ArrowUp'], down: ['ArrowDown'] }
  ];
  var BLOCK_DEFAULT = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Backspace'];

  window.addEventListener('keydown', function (e) {
    if (BLOCK_DEFAULT.indexOf(e.code) >= 0) e.preventDefault();
    if (!down[e.code]) pressed[e.code] = true;
    down[e.code] = true;
  });
  window.addEventListener('keyup', function (e) { down[e.code] = false; });
  window.addEventListener('blur', function () { down = {}; });

  function any(codes, table) { return codes.some(function (c) { return table[c]; }); }

  function pad(i) {
    var pads = navigator.getGamepads ? navigator.getGamepads() : [];
    var gp = pads && pads[i];
    if (!gp) return null;
    var b = function (n) { return gp.buttons[n] && gp.buttons[n].pressed; };
    var ax = gp.axes[0] || 0;
    return { left: ax < -0.4 || b(14), right: ax > 0.4 || b(15), jump: b(0) || b(12), down: b(13) || (gp.axes[1] || 0) > 0.6 };
  }

  var padJumpWas = [false, false];

  return {
    // Estado dos controles do jogador i (0 ou 1). Com 1 jogador, setas também valem.
    player: function (i, singlePlayer) {
      var codes = MAPS[i];
      var st = {
        left: any(codes.left, down), right: any(codes.right, down),
        jump: any(codes.jump, down), jumpPressed: any(codes.jump, pressed), down: any(codes.down, down)
      };
      if (singlePlayer) {
        var o = MAPS[1];
        st.left = st.left || any(o.left, down);
        st.right = st.right || any(o.right, down);
        st.jump = st.jump || any(o.jump, down);
        st.jumpPressed = st.jumpPressed || any(o.jump, pressed);
        st.down = st.down || any(o.down, down);
      }
      var gp = pad(i);
      if (gp) {
        st.left = st.left || gp.left;
        st.right = st.right || gp.right;
        st.down = st.down || gp.down;
        st.jumpPressed = st.jumpPressed || (gp.jump && !padJumpWas[i]);
        st.jump = st.jump || gp.jump;
        padJumpWas[i] = gp.jump;
      }
      return st;
    },
    wasPressed: function (code) { return !!pressed[code]; },
    endFrame: function () { pressed = {}; }
  };
})();

WR.PHYS = {
  speed: 330,
  gravity: 2200,
  jump: 900,
  maxFall: 1100,
  coyote: 0.1,
  buffer: 0.14
};

WR.makePlayer = function (index, color, x) {
  return {
    index: index, color: color,
    x: x, y: WR.FLOOR_Y - 56, w: 40, h: 56,
    vx: 0, vy: 0, facing: index === 0 ? 1 : -1,
    onGround: true, ground: null, coyote: 0, buffer: 0, drop: 0, walk: 0, hurt: 0
  };
};

function overlapX(a, x, w) { return a.x + a.w > x && a.x < x + w; }

// Move um personagem e devolve os blocos em que ele bateu a cabeça.
WR.updatePlayer = function (p, input, level, blocks, dt) {
  var P = WR.PHYS;
  var hits = [];

  // anda junto com a plataforma em que está
  if (p.onGround && p.ground && p.ground.dx) p.x += p.ground.dx;

  var dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  p.vx = dir * P.speed;
  if (dir) p.facing = dir;
  p.walk = dir && p.onGround ? p.walk + dt * 12 : 0;

  p.coyote = p.onGround ? P.coyote : Math.max(0, p.coyote - dt);
  p.buffer = input.jumpPressed ? P.buffer : Math.max(0, p.buffer - dt);
  p.drop = Math.max(0, p.drop - dt);
  p.hurt = Math.max(0, p.hurt - dt);

  if (input.down && p.onGround && p.ground) { p.drop = 0.25; p.onGround = false; p.y += 2; }

  if (p.buffer > 0 && p.coyote > 0) {
    p.vy = -P.jump;
    p.buffer = 0;
    p.coyote = 0;
    p.onGround = false;
    WR.Audio.jump();
  }
  if (!input.jump && p.vy < -300) p.vy = -300; // pulo mais baixo se soltar cedo

  p.vy = Math.min(P.maxFall, p.vy + P.gravity * dt);

  var prevTop = p.y, prevBottom = p.y + p.h;
  p.x = Math.max(0, Math.min(WR.W - p.w, p.x + p.vx * dt));
  p.y += p.vy * dt;
  p.onGround = false;
  p.ground = null;

  // blocos: batida de cabeça por baixo e dá para ficar em cima
  (blocks || []).forEach(function (b) {
    if (!overlapX(p, b.x, b.w)) return;
    var bottom = b.y + b.h;
    if (p.vy < 0 && prevTop >= bottom - 1 && p.y < bottom) {
      p.y = bottom;
      p.vy = 80;
      hits.push(b);
    } else if (p.vy >= 0 && prevBottom <= b.y + 1 && p.y + p.h >= b.y) {
      p.y = b.y - p.h; p.vy = 0; p.onGround = true;
    }
  });

  // plataformas: só seguram quem está caindo de cima
  if (p.drop <= 0 && p.vy >= 0) {
    level.platforms.forEach(function (pl) {
      if (p.onGround) return;
      var top = pl.y;
      if (overlapX(p, pl.x, pl.w) && prevBottom <= top + 4 + Math.abs(pl.dx) && p.y + p.h >= top) {
        p.y = top - p.h; p.vy = 0; p.onGround = true; p.ground = pl;
      }
    });
  }

  if (p.y + p.h >= WR.FLOOR_Y) {
    p.y = WR.FLOOR_Y - p.h; p.vy = 0; p.onGround = true; p.ground = null;
  }
  return hits;
};

WR.overlaps = function (a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
};

/*
 * トップの惑星（フェーズ0の仮素材）
 * - 地表テクスチャ（128×64、左右がつながる）を自動生成し、64×64の球に巻き付ける
 * - 陰影と縁取りを付け、280ミリ秒ごとに1ドットずつ回転させる
 * - 縁取りは白1ドット。影は惑星の色に深い青（#0a399b）を4割混ぜた色で、
 *   中間の明るさは影の色と地表の色の市松模様（ディザ）で表す
 * - 「視差効果を減らす」がオンなら回転しない（1コマ目で止める）
 * docs/spec.md 第5.2節・第8章
 */
(function () {
  "use strict";

  var SIZE = 64; // 惑星のキャンバス（px）
  var TEX_W = 128; // 地表テクスチャの幅（1周分）
  var TEX_H = 64;
  var RADIUS = 30; // 球の半径。外側1ドットは縁取り
  var STEP_MS = 280; // 1ドット回す間隔
  var OUTLINE = [255, 255, 255]; // 縁取り：白
  var DEEP = [10, 57, 155]; // 影に混ぜる深い青 #0a399b
  var SHADOW_MIX = 0.4;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- 色 ---------- */

  function hexToRgb(hex) {
    var n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function mix(a, b, t) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t)
    ];
  }

  // 基本色から段階ごとの色を作る（暗い→明るい）
  // 0：影 / 1：影と地表の市松模様（ディザ） / 2：地表 / 3：明るい / 4：ハイライト
  // 1は色ではなく null にしておき、描くときに位置で影か地表を選ぶ。縁取りを含めて5色
  function makePalette(hex) {
    var base = hexToRgb(hex);
    var white = [255, 255, 255];
    return [
      mix(base, DEEP, SHADOW_MIX),
      null,
      base,
      mix(base, white, 0.35),
      mix(base, white, 0.65)
    ];
  }

  // 段階と位置から色を決める（ディザの段階は市松模様）
  function toneColor(pal, tone, px, py) {
    if (tone < 0) tone = 0;
    else if (tone > 4) tone = 4;
    if (tone === 1) return (px + py) % 2 === 0 ? pal[0] : pal[2];
    return pal[tone];
  }

  /* ---------- 地表テクスチャ ---------- */

  function rng(seed) {
    // mulberry32
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // 横方向に周期的な（左右がつながる）バリューノイズ
  function makeNoise(random, cellsX, cellsY) {
    var grid = [];
    for (var i = 0; i < cellsX * (cellsY + 1); i++) grid.push(random());
    return function (x, y) {
      var gx = (x / TEX_W) * cellsX;
      var gy = (y / TEX_H) * cellsY;
      var x0 = Math.floor(gx);
      var y0 = Math.floor(gy);
      var fx = gx - x0;
      var fy = gy - y0;
      fx = fx * fx * (3 - 2 * fx);
      fy = fy * fy * (3 - 2 * fy);
      var xa = x0 % cellsX;
      var xb = (x0 + 1) % cellsX;
      var v00 = grid[y0 * cellsX + xa];
      var v10 = grid[y0 * cellsX + xb];
      var v01 = grid[(y0 + 1) * cellsX + xa];
      var v11 = grid[(y0 + 1) * cellsX + xb];
      var top = v00 + (v10 - v00) * fx;
      var bottom = v01 + (v11 - v01) * fx;
      return top + (bottom - top) * fy;
    };
  }

  // 各ドットに「色の段階（0〜4）」を入れた配列を返す
  function makeSurface(seed, kind) {
    var random = rng(seed);
    var coarse = makeNoise(random, 8, 4);
    var fine = makeNoise(random, 32, 16);
    var phase = random() * Math.PI * 2;
    var tex = new Uint8Array(TEX_W * TEX_H);
    for (var y = 0; y < TEX_H; y++) {
      for (var x = 0; x < TEX_W; x++) {
        var v;
        if (kind === "bands") {
          // 縞模様：緯度方向の波＋少しのゆらぎ
          v = 0.5 + 0.35 * Math.sin(y * 0.42 + phase + (coarse(x, y) - 0.5) * 3) + (fine(x, y) - 0.5) * 0.3;
        } else {
          // まだら：大陸状のノイズ
          v = coarse(x, y) * 0.7 + fine(x, y) * 0.3;
        }
        // 3段階（1〜3）に量子化。陰影で0と4が使われる
        tex[y * TEX_W + x] = v < 0.42 ? 1 : v < 0.62 ? 2 : 3;
      }
    }
    return tex;
  }

  /* ---------- 球への巻き付け（事前計算） ---------- */

  // 球の各ドットについて、テクスチャ上の座標と陰影（-1/0/+1）を計算しておく
  var sphere = (function () {
    var light = [-0.55, -0.6, 0.58];
    var len = Math.hypot(light[0], light[1], light[2]);
    light = light.map(function (c) { return c / len; });

    var cells = []; // {i, tx, ty, shade} or {i, outline}
    var c = SIZE / 2;
    for (var py = 0; py < SIZE; py++) {
      for (var px = 0; px < SIZE; px++) {
        var dx = px + 0.5 - c;
        var dy = py + 0.5 - c;
        var d = Math.hypot(dx, dy);
        var i = (py * SIZE + px) * 4;
        if (d <= RADIUS) {
          var nx = dx / RADIUS;
          var ny = dy / RADIUS;
          var nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
          var lon = Math.atan2(nx, nz); // -π/2〜π/2（手前の半球）
          var lat = Math.asin(ny); // -π/2〜π/2
          var tx = Math.floor((lon / Math.PI + 0.5) * (TEX_W / 2));
          var ty = Math.min(TEX_H - 1, Math.floor((lat / Math.PI + 0.5) * TEX_H));
          var dot = nx * light[0] + ny * light[1] + nz * light[2];
          var shade = dot > 0.75 ? 1 : dot > 0.2 ? 0 : dot > -0.15 ? -1 : -2;
          cells.push({ i: i, px: px, py: py, tx: tx, ty: ty, shade: shade });
        } else if (d <= RADIUS + 1.2) {
          cells.push({ i: i, outline: true });
        }
      }
    }
    return cells;
  })();

  /* ---------- 惑星 ---------- */

  function Planet(canvas) {
    this.ctx = canvas.getContext("2d");
    this.palette = makePalette(canvas.dataset.color || "#54bdb2");
    this.tex = makeSurface(parseInt(canvas.dataset.seed, 10) || 1, canvas.dataset.surface);
    this.image = this.ctx.createImageData(SIZE, SIZE);
    this.offset = 0;
    canvas.parentNode.classList.add("is-drawn");
  }

  Planet.prototype.draw = function () {
    var data = this.image.data;
    var pal = this.palette;
    for (var k = 0; k < sphere.length; k++) {
      var cell = sphere[k];
      var rgb;
      if (cell.outline) {
        rgb = OUTLINE;
      } else {
        var tone = this.tex[cell.ty * TEX_W + ((cell.tx + this.offset) % TEX_W)] + cell.shade;
        rgb = toneColor(pal, tone, cell.px, cell.py);
      }
      data[cell.i] = rgb[0];
      data[cell.i + 1] = rgb[1];
      data[cell.i + 2] = rgb[2];
      data[cell.i + 3] = 255;
    }
    this.ctx.putImageData(this.image, 0, 0);
  };

  Planet.prototype.step = function () {
    this.offset = (this.offset + 1) % TEX_W;
    this.draw();
  };

  /* ---------- 星空の背景タイル ---------- */

  // 128×128 の繰り返しタイル。背景よりわずかに濃い粒子を散らし、
  // 白・淡い色の星に、レモンイエロー（#f2e14a）の星を少し混ぜる
  function makeStarfield() {
    var TILE = 128;
    var space = document.querySelector(".home");
    if (!space) return;
    var tile = document.createElement("canvas");
    tile.width = TILE;
    tile.height = TILE;
    var ctx = tile.getContext("2d");
    var random = rng(2026);

    // 粒子：背景色を少しだけ暗くした点を約3%
    var bg = getComputedStyle(space).getPropertyValue("--space").trim() || "#e6f5f2";
    ctx.fillStyle = "rgb(" + mix(hexToRgb(bg), [11, 27, 26], 0.045).join(",") + ")";
    for (var g = 0; g < TILE * TILE * 0.03; g++) {
      ctx.fillRect(Math.floor(random() * TILE), Math.floor(random() * TILE), 1, 1);
    }

    var colors = ["#ffffff", "#ffffff", "#fdf4d6", "#c9ebe6", "#ffffff", "#f2e14a", "#ffffff", "#c9ebe6", "#ffffff", "#f2e14a"];
    for (var n = 0; n < 40; n++) {
      var x = Math.floor(random() * (TILE - 2)) + 1;
      var y = Math.floor(random() * (TILE - 2)) + 1;
      ctx.fillStyle = colors[n % colors.length];
      ctx.fillRect(x, y, 1, 1);
      if (n % 7 === 0) {
        // 十字の星
        ctx.fillRect(x - 1, y, 3, 1);
        ctx.fillRect(x, y - 1, 1, 3);
      }
    }
    space.style.setProperty("--starfield", "url(" + tile.toDataURL() + ")");
  }

  // 試作ページ（/lab/）のミニ惑星でも同じ色の作り方を使う
  window.mossPlanet = { hexToRgb: hexToRgb, mix: mix, makePalette: makePalette, toneColor: toneColor, rng: rng, OUTLINE: OUTLINE, STEP_MS: STEP_MS };

  /* ---------- 起動 ---------- */

  var planets = [];
  var timer = null;

  function start() {
    if (timer || reduceMotion.matches || document.hidden) return;
    timer = window.setInterval(function () {
      for (var i = 0; i < planets.length; i++) planets[i].step();
    }, STEP_MS);
  }

  function stop() {
    if (!timer) return;
    window.clearInterval(timer);
    timer = null;
  }

  function init() {
    var canvases = document.querySelectorAll(".planet-canvas");
    for (var i = 0; i < canvases.length; i++) {
      if (!canvases[i].getContext) continue;
      var p = new Planet(canvases[i]);
      p.draw();
      planets.push(p);
    }
    makeStarfield();
    start();

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });
    var onChange = function () {
      if (reduceMotion.matches) stop();
      else start();
    };
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", onChange);
    else if (reduceMotion.addListener) reduceMotion.addListener(onChange);
  }

  init();
})();

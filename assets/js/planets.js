/*
 * トップの惑星（フェーズ0の仮素材）
 * - 地表テクスチャ（128×64、左右がつながる）を自動生成し、64×64の球に巻き付ける
 * - 陰影と縁取りを付け、280ミリ秒ごとに1ドットずつ回転させる
 * - 縁取りは白1ドット。影は惑星の色に深い青（#0a399b）を4割混ぜた色で、
 *   中間の明るさは影の色と地表の色の市松模様（ディザ）で表す
 * - 「視差効果を減らす」がオンなら回転しない（1コマ目で止める）
 * - 日本語版では、惑星の前面の中央にドット絵フォントのタイトルを重ねる（回転しない）。
 *   タイトルの倍率は CSS の --title-scale（PC のトップは惑星より1段小さい。それ以外は惑星と同じ --scale）
 * - モスの星（PC のトップの中心）は、4〜6秒に一度、0.15秒だけ目を閉じる（まばたき）
 * docs/spec.md 第5.2節・第8章
 */
(function () {
  "use strict";

  // 惑星の大きさ（ドット）。CSS の --planet-dots で決める（通常64。スマートフォンのトップは44）
  // 地表テクスチャは 横＝大きさ×2（1周分）、縦＝大きさ。球の半径は 大きさ/2−2（外側1ドットは縁取り）
  var DEFAULT_SIZE = 64;
  var STEP_MS = 280; // 1ドット回す間隔
  var OUTLINE = [255, 255, 255]; // 縁取り：白
  var DEEP = [10, 57, 155]; // 影に混ぜる深い青 #0a399b
  var SHADOW_MIX = 0.4;

  // 端末の設定とフッターの「動きを止める」ボタンの両方を見る（assets/js/motion.js）
  var reduceMotion = window.mossReduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)");

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
  function makeNoise(random, cellsX, cellsY, TEX_W, TEX_H) {
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
  function makeSurface(seed, kind, TEX_W, TEX_H) {
    var random = rng(seed);
    var coarse = makeNoise(random, 8, 4, TEX_W, TEX_H);
    var fine = makeNoise(random, 32, 16, TEX_W, TEX_H);
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
  var spheres = {};
  function makeSphere(SIZE) {
    if (spheres[SIZE]) return spheres[SIZE];
    var TEX_W = SIZE * 2;
    var TEX_H = SIZE;
    var RADIUS = SIZE / 2 - 2;
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
    spheres[SIZE] = cells;
    return cells;
  }

  /* ---------- 惑星 ---------- */

  function sizeOf(canvas) {
    var v = parseInt(getComputedStyle(canvas).getPropertyValue("--planet-dots"), 10);
    return v > 8 ? v : DEFAULT_SIZE;
  }

  function Planet(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.palette = makePalette(canvas.dataset.color || "#54bdb2");
    this.offset = 0;
    this.setup();
    canvas.parentNode.classList.add("is-drawn");
  }

  // 大きさに合わせて球と地表を作り直す（画面幅が変わってスマートフォンの大きさになったときも）
  Planet.prototype.setup = function () {
    var size = sizeOf(this.canvas);
    if (size === this.size) return false;
    this.size = size;
    this.texW = size * 2;
    this.canvas.width = size;
    this.canvas.height = size;
    this.sphere = makeSphere(size);
    this.tex = makeSurface(parseInt(this.canvas.dataset.seed, 10) || 1, this.canvas.dataset.surface, this.texW, size);
    this.image = this.ctx.createImageData(size, size);
    this.offset = this.offset % this.texW;
    return true;
  };

  Planet.prototype.draw = function () {
    var data = this.image.data;
    var pal = this.palette;
    var sphere = this.sphere;
    var TEX_W = this.texW;
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
    this.offset = (this.offset + 1) % this.texW;
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

  /* ---------- 惑星の前面のタイトル（ドット絵フォント） ---------- */

  // フォントは static/fonts/mossplanet-title-pixel.woff（x8y12pxDenkiChip をタイトルの文字だけに絞ったもの）。
  // 12px で描き、--title-scale の整数倍で拡大する（PC のトップは惑星3倍・タイトル2倍。それ以外は惑星と同じ倍率）。
  // 文字は白、まわり8方向に1ドットの縁取り。
  // 縁の色は、惑星の影の色（惑星の色に #0a399b を4割）を、さらに #0b1b1a へ45%寄せた色
  var TITLE_FONT = '12px "mossplanet title"';
  var TITLE_FALLBACK = '700 12px "Noto Sans JP", system-ui, sans-serif';
  var TITLE_LINE = 12; // 行の間隔（ドット）
  var TEXT = [11, 27, 26]; // #0b1b1a
  var titleFont = null; // 読み込み後に TITLE_FONT か TITLE_FALLBACK

  // 確認用URLだけ：?edge=dark で縁を #0b1b1a にした版を見られる（本番では使わない）
  var space = document.querySelector(".space");
  var darkEdge = !!(space && space.hasAttribute("data-preview") && /[?&]edge=dark\b/.test(location.search));

  function edgeColor(hex) {
    if (darkEdge) return TEXT;
    return mix(mix(hexToRgb(hex), DEEP, SHADOW_MIX), TEXT, 0.45);
  }

  // 文字を1行ずつ描き、半透明のにじみを捨てて「文字のドット」だけの配列にする
  function titleMask(lines) {
    var work = document.createElement("canvas").getContext("2d");
    work.font = titleFont;
    var widths = lines.map(function (t) { return Math.ceil(work.measureText(t).width); });
    var w = Math.max.apply(null, widths) + 4;
    var h = lines.length * TITLE_LINE + 4;
    work.canvas.width = w;
    work.canvas.height = h;
    work.font = titleFont; // 大きさを変えると設定が消えるので、もう一度
    work.textBaseline = "alphabetic";
    work.fillStyle = "#000";
    for (var i = 0; i < lines.length; i++) {
      // 行ごとに中央へ（位置は整数）
      work.fillText(lines[i], 2 + Math.floor((w - 4 - widths[i]) / 2), 2 + i * TITLE_LINE + 11);
    }
    var data = work.getImageData(0, 0, w, h).data;
    var mask = new Uint8Array(w * h);
    var minX = w, minY = h, maxX = -1, maxY = -1;
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] >= 128) {
          mask[y * w + x] = 1;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    return { mask: mask, w: w, h: h, minX: minX, minY: minY, maxX: maxX, maxY: maxY };
  }

  // CSS の倍率（整数）を読む。--title-scale がなければ惑星と同じ --scale
  function scaleOf(el, name) {
    var v = parseInt(getComputedStyle(el).getPropertyValue(name), 10);
    return v > 0 ? v : 0;
  }

  function drawTitle(canvas, size) {
    if (!titleFont) return;
    var scale = scaleOf(canvas, "--scale") || 1;
    var ts = scaleOf(canvas, "--title-scale") || scale;
    canvas.dataset.scales = scale + "/" + ts;
    var full = canvas.dataset.title || "";
    var work = document.createElement("canvas").getContext("2d");
    work.font = titleFont;
    // 惑星の内側（縁から3ドット内側）に1行で収まらなければ、title_break の位置で改行する（画面上の大きさで比べる）
    var lines = [full];
    if ((Math.ceil(work.measureText(full).width) + 2) * ts > (size - 6) * scale && canvas.dataset.break) {
      lines = canvas.dataset.break.split("|");
    }
    var m = titleMask(lines);
    if (m.maxX < 0) return;
    // 縁取りの1ドットを含めた大きさ
    var W = m.maxX - m.minX + 3;
    var H = m.maxY - m.minY + 3;
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext("2d");
    var img = ctx.createImageData(W, H);
    var edge = edgeColor(canvas.dataset.color || "#54bdb2");
    function at(x, y) {
      // 切り抜いた座標 → 元の配列
      var sx = x + m.minX - 1;
      var sy = y + m.minY - 1;
      return sx >= 0 && sy >= 0 && sx < m.w && sy < m.h && m.mask[sy * m.w + sx] === 1;
    }
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var rgb = null;
        if (at(x, y)) rgb = [255, 255, 255];
        else if (at(x - 1, y - 1) || at(x, y - 1) || at(x + 1, y - 1) || at(x - 1, y) ||
                 at(x + 1, y) || at(x - 1, y + 1) || at(x, y + 1) || at(x + 1, y + 1)) rgb = edge;
        if (!rgb) continue;
        var i = (y * W + x) * 4;
        img.data[i] = rgb[0];
        img.data[i + 1] = rgb[1];
        img.data[i + 2] = rgb[2];
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    // 惑星の中央に置く。位置はタイトルの1ドット（ts ピクセル）単位の整数の座標（はみ出すときは左右にはみ出す）
    var left = Math.floor((size * scale - W * ts) / 2 / ts) * ts;
    var top = Math.floor((size * scale - H * ts) / 2 / ts) * ts;
    var st = canvas.style;
    st.width = W * ts + "px";
    st.height = H * ts + "px";
    st.left = left + "px";
    st.top = top + "px";
    canvas.hidden = false;
    var link = canvas.closest(".planet-link");
    if (link) link.classList.add("has-title");
  }

  function drawTitles() {
    var list = document.querySelectorAll(".planet-title");
    for (var i = 0; i < list.length; i++) {
      var body = list[i].parentNode.querySelector(".planet-canvas");
      drawTitle(list[i], body ? sizeOf(body) : DEFAULT_SIZE);
    }
  }

  // フォントの読み込みが終わってから描く。読み込めなかったら（3秒待っても来なければ）通常のフォントで描く
  function loadTitleFont() {
    if (!document.querySelector(".planet-title")) return;
    var done = false;
    function finish(ok) {
      if (done) return;
      done = true;
      titleFont = ok ? TITLE_FONT : TITLE_FALLBACK;
      drawTitles();
    }
    if (!document.fonts || !document.fonts.load) { finish(false); return; }
    document.fonts.load(TITLE_FONT).then(function (faces) { finish(faces && faces.length > 0); }, function () { finish(false); });
    window.setTimeout(function () { finish(false); }, 3000);
  }

  /* ---------- モスの星のまばたき ---------- */

  // 4〜6秒に一度、0.15秒だけ目を閉じた絵（moss-star-sheet.png の右のコマ）にする。
  // 「視差効果を減らす」「動きを止める」のときと、タブが非表示のときはしない
  var BLINK_MIN = 4000;
  var BLINK_MAX = 6000;
  var BLINK_SHUT = 150;
  var blinkTimer = null;
  var blinkBody = null;

  function scheduleBlink() {
    window.clearTimeout(blinkTimer);
    blinkTimer = null;
    if (!blinkBody) return;
    blinkBody.classList.remove("is-blinking");
    if (reduceMotion.matches || document.hidden) return;
    blinkTimer = window.setTimeout(function () {
      blinkBody.classList.add("is-blinking");
      blinkTimer = window.setTimeout(scheduleBlink, BLINK_SHUT);
    }, BLINK_MIN + Math.random() * (BLINK_MAX - BLINK_MIN));
  }

  function initBlink() {
    blinkBody = document.querySelector(".moss-star-body");
    if (!blinkBody) return;
    scheduleBlink();
    document.addEventListener("visibilitychange", scheduleBlink);
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", scheduleBlink);
    else if (reduceMotion.addListener) reduceMotion.addListener(scheduleBlink);
  }

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
    loadTitleFont();
    start();
    initBlink();

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
    // 画面幅が変わって惑星の大きさ（--planet-dots）が変わったら描き直す
    var queued = false;
    window.addEventListener("resize", function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        var changed = false;
        for (var i = 0; i < planets.length; i++) {
          if (planets[i].setup()) {
            planets[i].draw();
            changed = true;
          }
        }
        // 惑星の大きさや倍率が変わったら、タイトルの改行と位置も決め直す
        var title = document.querySelector(".planet-title[data-scales]");
        if (title && title.dataset.scales !== (scaleOf(title, "--scale") || 1) + "/" + (scaleOf(title, "--title-scale") || scaleOf(title, "--scale") || 1)) changed = true;
        if (changed) drawTitles();
      });
    });
  }

  init();
})();

/*
 * トップのインタラクション「惑星をつくる工房」（docs/spec.md 第5.5節。2026年11月16日に試作から採用）
 * - 空いている場所をクリック（タップ）すると、小さな惑星（半径4〜8ドット）がばねの動きで生まれ、ゆっくり漂う
 * - 最大12個。13個目からは、いちばん古いものが縮んで消える
 * - 近づくと青（#4186c4）の点線でつながり、さらに近いと間にレモンイエローの星がまたたく（大きな惑星ともつながる）
 * - マウスのときだけ、カーソルに星屑が少しついてくる。大きな惑星に乗ると小さく跳ねる（main.css の planet-hop）
 * - 1ドット＝トップの倍率（--scale）ぶんのピクセル。座標はすべて整数ドットに丸めて描く
 * - 「視差効果を減らす」がオンなら、生まれた惑星はその場に止まり、何も動かさない
 * - タブが非表示のときや画面外のときは描画を止める
 * - 関連線：作品を共有している惑星どうし（と related でつながった作品の惑星どうし）を、薄い点線で常に結ぶ（第5.1節）
 *   組み合わせは Hugo が作る（layouts/home.html の #home-relations）
 * 色の作り方は planets.js（window.mossPlanet）と同じ
 */
(function () {
  "use strict";

  var MP = window.mossPlanet;
  var main = document.getElementById("main");
  var canvas = document.querySelector(".sky");
  if (!MP || !main || !canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var hint = document.querySelector(".sky-hint");
  // 端末の設定とフッターの「動きを止める」ボタンの両方を見る（assets/js/motion.js）
  var reduceMotion = window.mossReduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)");

  var MAX = 12;
  var LINK_GAP = 26; // 縁と縁の間がこれ未満で点線
  var STAR_GAP = 9; // これ未満で星
  var LINE = "#4186c4";
  var LEMON = "#f2e14a";
  // ばね：硬さ200・減衰16（少しだけ行き過ぎて戻る）
  var SPRING_K = 200;
  var SPRING_C = 16;

  var scale = 2;
  var W = 0;
  var H = 0;
  var small = [];
  var bigs = [];
  var dust = [];
  var links = {}; // "idA|idB" → 表示の度合い 0〜1（ふわっと出し入れする）
  var relations = [];
  try {
    var relEl = document.getElementById("home-relations");
    if (relEl) relations = JSON.parse(relEl.textContent).map(function (k) { return k.split("|"); });
  } catch (e) { relations = []; }
  var nextId = 1;
  var raf = 0;
  var last = 0;
  var visible = !document.hidden;
  var inView = true;

  /* ---------- 大きさ ---------- */

  function readScale() {
    var s = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--scale"), 10);
    return s > 0 ? s : 2;
  }

  function resize() {
    scale = readScale();
    // 端数は切り捨てて、main より大きくしない（はみ出すとPCでスクロールバーが出入りして画面がぶれる）
    W = Math.floor(main.clientWidth / scale);
    H = Math.floor(main.clientHeight / scale);
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = W * scale + "px";
    canvas.style.height = H * scale + "px";
    for (var i = 0; i < small.length; i++) {
      var p = small[i];
      p.x = Math.min(Math.max(p.x, p.r + 1), Math.max(p.r + 1, W - p.r - 2));
      p.y = Math.min(Math.max(p.y, p.r + 1), Math.max(p.r + 1, H - p.r - 2));
    }
    measureBigs();
    draw();
  }

  // 大きな惑星の中心（ドット単位）
  function measureBigs() {
    var base = canvas.getBoundingClientRect();
    var els = main.querySelectorAll(".planet-body");
    bigs = [];
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      var li = els[i].closest(".planet");
      bigs.push({
        id: "B" + i,
        pid: li ? li.dataset.id : "",
        x: Math.round((r.left + r.width / 2 - base.left) / scale),
        y: Math.round((r.top + r.height / 2 - base.top) / scale),
        r: Math.round(r.width / scale / 2) - 1, // 大きな惑星の半径（縁取り込み、ドット）。スマートフォンでは小さい
        big: true
      });
    }
  }

  /* ---------- 小さな惑星の形（半径ごとに一度だけ計算） ---------- */

  var light = (function () {
    var l = [-0.55, -0.6, 0.58];
    var len = Math.hypot(l[0], l[1], l[2]);
    return [l[0] / len, l[1] / len, l[2] / len];
  })();

  var shapes = {};
  function shape(r) {
    if (shapes[r]) return shapes[r];
    var cells = [];
    var texW = 4 * r + 4;
    for (var y = -r - 1; y <= r + 1; y++) {
      for (var x = -r - 1; x <= r + 1; x++) {
        var dx = x + 0.5;
        var dy = y + 0.5;
        var d = Math.hypot(dx, dy);
        if (d <= r) {
          var nx = dx / r;
          var ny = dy / r;
          var nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
          var dot = nx * light[0] + ny * light[1] + nz * light[2];
          cells.push({
            x: x, y: y,
            tx: Math.floor((Math.atan2(nx, nz) / Math.PI + 0.5) * (texW / 2)),
            ty: Math.floor((Math.asin(ny) / Math.PI + 0.5) * (2 * r)),
            shade: dot > 0.75 ? 1 : dot > 0.2 ? 0 : dot > -0.15 ? -1 : -2
          });
        } else if (d <= r + 1.2) {
          cells.push({ x: x, y: y, outline: true });
        }
      }
    }
    shapes[r] = { cells: cells, texW: texW };
    return shapes[r];
  }

  // 地表：左右がつながる粗いノイズを3段階（1〜3）に
  function makeSurface(r, random) {
    var texW = 4 * r + 4;
    var texH = 2 * r + 1;
    var gx = 4;
    var gy = 2;
    var grid = [];
    for (var i = 0; i < gx * (gy + 1); i++) grid.push(random());
    var bands = random() < 0.4;
    var tex = new Uint8Array(texW * texH);
    for (var y = 0; y < texH; y++) {
      for (var x = 0; x < texW; x++) {
        var fx = (x / texW) * gx;
        var fy = (y / texH) * gy;
        var x0 = Math.floor(fx);
        var y0 = Math.floor(fy);
        var tx = fx - x0;
        var ty = fy - y0;
        tx = tx * tx * (3 - 2 * tx);
        ty = ty * ty * (3 - 2 * ty);
        var a = grid[y0 * gx + (x0 % gx)];
        var b = grid[y0 * gx + ((x0 + 1) % gx)];
        var c = grid[(y0 + 1) * gx + (x0 % gx)];
        var d = grid[(y0 + 1) * gx + ((x0 + 1) % gx)];
        var v = a + (b - a) * tx + (c + (d - c) * tx - a - (b - a) * tx) * ty;
        if (bands) v = 0.5 + 0.4 * Math.sin(y * 1.3 + v * 3);
        tex[y * texW + x] = v < 0.4 ? 1 : v < 0.62 ? 2 : 3;
      }
    }
    return tex;
  }

  function randomColor() {
    // 明るめで鮮やかすぎない色（HSL → 16進）
    var h = Math.random() * 360;
    var s = 0.55 + Math.random() * 0.2;
    var l = 0.58 + Math.random() * 0.1;
    var k = function (n) { return (n + h / 30) % 12; };
    var a = s * Math.min(l, 1 - l);
    var f = function (n) {
      var v = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return ("0" + Math.round(v * 255).toString(16)).slice(-2);
    };
    return "#" + f(0) + f(8) + f(4);
  }

  /* ---------- 生成と削除 ---------- */

  function spawn(x, y) {
    var r = 4 + Math.floor(Math.random() * 5); // 4〜8
    var angle = Math.random() * Math.PI * 2;
    var speed = 0.5 + Math.random() * 1.5; // ドット／秒
    var still = reduceMotion.matches;
    small.push({
      id: "S" + nextId++,
      x: Math.min(Math.max(x, r + 1), W - r - 2),
      y: Math.min(Math.max(y, r + 1), H - r - 2),
      r: r,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      s: still ? 1 : 0.3, // 大きさの倍率（ばねで1へ）
      sv: 0,
      target: 1,
      pal: MP.makePalette(randomColor()),
      tex: makeSurface(r, Math.random),
      offset: Math.floor(Math.random() * 40),
      turn: 0
    });
    // 最大数を超えたら、いちばん古い（まだ消えかけていない）ものを縮めて消す
    var alive = small.filter(function (p) { return p.target === 1; });
    if (alive.length > MAX) {
      var old = alive[0];
      if (still) small.splice(small.indexOf(old), 1);
      else old.target = 0;
    }
    if (hint) hint.classList.add("is-hidden");
    if (still) draw();
    else run();
  }

  /* ---------- 星屑（マウスのみ） ---------- */

  var lastDust = null;
  function onMove(e) {
    if (e.pointerType !== "mouse" || reduceMotion.matches) return;
    var base = canvas.getBoundingClientRect();
    var x = (e.clientX - base.left) / scale;
    var y = (e.clientY - base.top) / scale;
    if (lastDust && Math.hypot(x - lastDust.x, y - lastDust.y) < 3) return;
    lastDust = { x: x, y: y };
    if (dust.length >= 20) dust.shift();
    dust.push({
      x: x + (Math.random() - 0.5) * 3,
      y: y + (Math.random() - 0.5) * 3,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4, // ゆっくり落ちる
      life: 0,
      max: 500 + Math.random() * 300,
      color: Math.random() < 0.6 ? LEMON : "#ffffff"
    });
    run();
  }

  /* ---------- 更新 ---------- */

  function update(dt) {
    var sec = dt / 1000;
    for (var i = small.length - 1; i >= 0; i--) {
      var p = small[i];
      if (p.target === 1) {
        // ばね（半陰的オイラー法）
        var acc = -SPRING_K * (p.s - 1) - SPRING_C * p.sv;
        p.sv += acc * sec;
        p.s += p.sv * sec;
      } else {
        // 消えるときは行き過ぎずに縮む（220ミリ秒）
        p.s -= sec / 0.22;
        if (p.s <= 0.12) {
          small.splice(i, 1);
          continue;
        }
      }
      p.x += p.vx * sec;
      p.y += p.vy * sec;
      if (p.x < p.r + 1 || p.x > W - p.r - 2) {
        p.vx = -p.vx;
        p.x = Math.min(Math.max(p.x, p.r + 1), W - p.r - 2);
      }
      if (p.y < p.r + 1 || p.y > H - p.r - 2) {
        p.vy = -p.vy;
        p.y = Math.min(Math.max(p.y, p.r + 1), H - p.r - 2);
      }
      // 回転：大きな惑星と同じ間隔（280ミリ秒）で1ドット
      p.turn += dt;
      while (p.turn >= MP.STEP_MS) {
        p.turn -= MP.STEP_MS;
        p.offset++;
      }
    }
    for (var j = dust.length - 1; j >= 0; j--) {
      var d = dust[j];
      d.life += dt;
      d.x += d.vx * sec;
      d.y += d.vy * sec;
      if (d.life >= d.max) dust.splice(j, 1);
    }
  }

  // 2つの惑星の縁どうしの距離
  function pairs() {
    var nodes = small.concat(bigs);
    var out = [];
    for (var i = 0; i < small.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i];
        var b = nodes[j];
        var ra = Math.round(a.r * (a.big ? 1 : a.s));
        var rb = b.big ? b.r : Math.round(b.r * b.s);
        var dist = Math.hypot(b.x - a.x, b.y - a.y);
        out.push({ a: a, b: b, ra: ra, rb: rb, dist: dist, gap: dist - ra - rb, key: a.id + "|" + b.id });
      }
    }
    return out;
  }

  function updateLinks(list, dt) {
    var seen = {};
    var moving = false;
    for (var i = 0; i < list.length; i++) {
      var k = list[i].key;
      var want = list[i].gap < LINK_GAP ? 1 : 0;
      var cur = links[k] || 0;
      if (reduceMotion.matches) cur = want;
      else cur += (want ? 1 : -1) * dt / 200; // 200ミリ秒で出し入れ
      cur = Math.min(1, Math.max(0, cur));
      if (cur > 0) {
        links[k] = cur;
        seen[k] = true;
        if (cur < 1) moving = true;
      }
    }
    for (var key in links) if (!seen[key]) delete links[key];
    return moving;
  }

  /* ---------- 描画 ---------- */

  function px(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  }

  function rgb(c) {
    return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
  }

  // 点線（2ドット描いて2ドット空ける）。両端の惑星の中は描かない
  function dotted(p) {
    var x0 = Math.round(p.a.x);
    var y0 = Math.round(p.a.y);
    var x1 = Math.round(p.b.x);
    var y1 = Math.round(p.b.y);
    var dx = Math.abs(x1 - x0);
    var dy = -Math.abs(y1 - y0);
    var sx = x0 < x1 ? 1 : -1;
    var sy = y0 < y1 ? 1 : -1;
    var err = dx + dy;
    var n = 0;
    ctx.fillStyle = LINE;
    for (;;) {
      var outA = Math.hypot(x0 - p.a.x, y0 - p.a.y) > p.ra + 2;
      var outB = Math.hypot(x0 - p.b.x, y0 - p.b.y) > p.rb + 2;
      if (outA && outB) {
        if (n % 4 < 2) ctx.fillRect(x0, y0, 1, 1);
        n++;
      }
      if (x0 === x1 && y0 === y1) break;
      var e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  // またたく星：点 → 小さな十字 → 大きな十字 → 小さな十字（1.4秒で1周）
  function twinkle(p, now) {
    var ux = (p.b.x - p.a.x) / (p.dist || 1);
    var uy = (p.b.y - p.a.y) / (p.dist || 1);
    var along = p.ra + p.gap / 2;
    var x = Math.round(p.a.x + ux * along);
    var y = Math.round(p.a.y + uy * along);
    var hash = 0;
    for (var i = 0; i < p.key.length; i++) hash = (hash * 31 + p.key.charCodeAt(i)) % 997;
    var frame = reduceMotion.matches ? 1 : Math.floor(((now + hash * 7) % 1400) / 350); // 0〜3
    px(x, y, LEMON);
    if (frame === 1 || frame === 3) {
      ctx.fillRect(x - 1, y, 3, 1);
      ctx.fillRect(x, y - 1, 1, 3);
    } else if (frame === 2) {
      ctx.fillRect(x - 2, y, 5, 1);
      ctx.fillRect(x, y - 2, 1, 5);
      px(x, y, "#ffffff");
    }
  }

  function drawPlanet(p) {
    var r = Math.max(1, Math.round(p.r * p.s));
    var sh = shape(r);
    var src = shape(p.r);
    var cx = Math.round(p.x);
    var cy = Math.round(p.y);
    var texH = 2 * p.r + 1;
    for (var i = 0; i < sh.cells.length; i++) {
      var c = sh.cells[i];
      var color;
      if (c.outline) {
        color = MP.OUTLINE;
      } else {
        // 大きさが変わっている間も、本来の大きさの地表を縮めて使う
        var tx = Math.floor((c.tx / sh.texW) * src.texW);
        var ty = Math.min(texH - 1, Math.floor((c.ty / (2 * r)) * texH));
        var tone = p.tex[ty * src.texW + ((tx + p.offset) % src.texW)] + c.shade;
        color = MP.toneColor(p.pal, tone, cx + c.x, cy + c.y);
      }
      px(cx + c.x, cy + c.y, rgb(color));
    }
  }

  function draw(now) {
    now = now || performance.now();
    ctx.clearRect(0, 0, W, H);
    // 関連線（大きな惑星どうし。常に薄く表示）
    ctx.globalAlpha = 0.45;
    for (var r = 0; r < relations.length; r++) {
      var a = null;
      var b = null;
      for (var m = 0; m < bigs.length; m++) {
        if (bigs[m].pid === relations[r][0]) a = bigs[m];
        if (bigs[m].pid === relations[r][1]) b = bigs[m];
      }
      if (a && b) dotted({ a: a, b: b, ra: a.r, rb: b.r });
    }
    ctx.globalAlpha = 1;
    var list = pairs();
    for (var i = 0; i < list.length; i++) {
      var amount = links[list[i].key];
      if (!amount) continue;
      // 出し入れの途中は3段階の濃さで（ドット絵らしく、なめらかにしすぎない）
      ctx.globalAlpha = amount < 0.34 ? 0.35 : amount < 0.67 ? 0.7 : 1;
      dotted(list[i]);
      if (list[i].gap < STAR_GAP) twinkle(list[i], now);
    }
    ctx.globalAlpha = 1;
    for (var j = 0; j < small.length; j++) drawPlanet(small[j]);
    for (var k = 0; k < dust.length; k++) {
      var d = dust[k];
      // 終わりの4割は点滅しながら消える（光の点滅は1秒に3回以下にする。170ミリ秒ごとの切り替え＝約2.9回）
      if (d.life > d.max * 0.6 && Math.floor(d.life / 170) % 2) continue;
      px(Math.round(d.x), Math.round(d.y), d.color);
    }
  }

  /* ---------- ループ（動くものがあるときだけ） ---------- */

  function frame(now) {
    raf = 0;
    var dt = Math.min(64, now - (last || now));
    last = now;
    measureBigs();
    update(dt);
    var fading = updateLinks(pairs(), dt);
    draw(now);
    if (small.length || dust.length || fading) run();
    else last = 0;
  }

  function run() {
    if (raf || !visible || !inView || reduceMotion.matches) return;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
  }

  /* ---------- 操作 ---------- */

  main.addEventListener("click", function (e) {
    // リンクやボタンの上では何もしない（大きな惑星への移動とナビゲーションを邪魔しない）
    if (e.target.closest("a, button, input, textarea, select, label, summary, .home-intro-box")) return;
    var base = canvas.getBoundingClientRect();
    var x = Math.round((e.clientX - base.left) / scale);
    var y = Math.round((e.clientY - base.top) / scale);
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    spawn(x, y);
    if (reduceMotion.matches) {
      updateLinks(pairs(), 0);
      draw();
    }
  });

  main.addEventListener("pointermove", onMove);

  // 大きな惑星に（マウスで）乗ったら小さく跳ねる。跳ねている途中はやり直さず、最後まで跳ね終える
  Array.prototype.forEach.call(main.querySelectorAll(".planet-link"), function (link) {
    var body = link.querySelector(".planet-body");
    link.addEventListener("pointerenter", function (e) {
      if (e.pointerType !== "mouse" || reduceMotion.matches || body.classList.contains("is-hopping")) return;
      body.classList.add("is-hopping");
    });
    // キーボードで選んだときも、惑星とタイトルを一緒に跳ねさせる
    link.addEventListener("focus", function () {
      if (reduceMotion.matches || body.classList.contains("is-hopping")) return;
      if (link.matches && !link.matches(":focus-visible")) return;
      body.classList.add("is-hopping");
    });
    body.addEventListener("animationend", function () {
      body.classList.remove("is-hopping");
    });
  });

  document.addEventListener("visibilitychange", function () {
    visible = !document.hidden;
    if (visible) run();
    else stop();
  });

  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView) run();
      else stop();
    }).observe(main);
  }

  var onMotionChange = function () {
    if (reduceMotion.matches) {
      stop();
      dust = [];
      for (var i = 0; i < small.length; i++) small[i].s = 1;
      small = small.filter(function (p) { return p.target === 1; });
      updateLinks(pairs(), 0);
      draw();
    } else {
      run();
    }
  };
  if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", onMotionChange);
  else if (reduceMotion.addListener) reduceMotion.addListener(onMotionChange);

  if (window.ResizeObserver) new ResizeObserver(resize).observe(main);
  window.addEventListener("load", resize);
  resize();
})();

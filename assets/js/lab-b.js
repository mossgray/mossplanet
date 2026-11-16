/*
 * 試作B「観測ステーション」（/lab/b/。確認用URLだけ）。トップの吹き出しの候補
 * - 惑星にカーソルを乗せる（キーボードで選ぶ）と、半透明のカードが出て、手描き風の枠線が描かれていく
 * - 中身：惑星名、色見本とカラーコード、作品数（0から数え上がる）
 * - スマートフォン：短いタップは今までどおり一覧ページへ。長押し（約0.45秒）でカードを出し、その回は移動しない
 * - 「視差効果を減らす」がオンなら、枠線も数字も最初から完成した状態で出す
 */
(function () {
  "use strict";

  var main = document.getElementById("main");
  if (!main) return;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var SVG = "http://www.w3.org/2000/svg";
  var EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
  var LONG_PRESS = 450;

  /* ---------- カード ---------- */

  var card = document.createElement("div");
  card.className = "lab-card";
  card.setAttribute("aria-hidden", "true");
  card.innerHTML =
    '<svg class="lab-card-line" xmlns="' + SVG + '"><path></path><path></path></svg>' +
    '<p class="lab-card-label">OBSERVATION</p>' +
    '<p class="lab-card-name"></p>' +
    '<p class="lab-card-row"><span class="lab-card-swatch"></span><span class="lab-card-hex"></span></p>' +
    '<p class="lab-card-row">作品 <span class="lab-card-count">0</span> 点<span class="lab-card-pending"></span></p>';
  main.appendChild(card);

  var paths = card.querySelectorAll("path");
  var elName = card.querySelector(".lab-card-name");
  var elSwatch = card.querySelector(".lab-card-swatch");
  var elHex = card.querySelector(".lab-card-hex");
  var elCount = card.querySelector(".lab-card-count");
  var elPending = card.querySelector(".lab-card-pending");

  var current = null;
  var hideTimer = 0;
  var countRaf = 0;
  var lineAnims = [];

  // 手描き風の枠：角の丸い四角を、少し揺らした点でなぞる。最後は書き始めを少し越えて終わる
  function sketch(w, h, seed, inset) {
    var s = seed;
    var rand = function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280 - 0.5;
    };
    var r = 9;
    var pts = [];
    var edge = function (x0, y0, x1, y1) {
      var len = Math.hypot(x1 - x0, y1 - y0);
      var n = Math.max(2, Math.round(len / 26));
      for (var i = 0; i < n; i++) {
        var t = i / n;
        pts.push([x0 + (x1 - x0) * t + rand() * 2.2, y0 + (y1 - y0) * t + rand() * 2.2]);
      }
    };
    var a = inset;
    var bx = w - inset;
    var by = h - inset;
    edge(a + r, a, bx - r, a);
    pts.push([bx - 1, a + 1]);
    edge(bx, a + r, bx, by - r);
    pts.push([bx - 1, by - 1]);
    edge(bx - r, by, a + r, by);
    pts.push([a + 1, by - 1]);
    edge(a, by - r, a, a + r);
    pts.push([a + 1, a + 1]);
    pts.push([a + r + 14 + rand() * 4, a - 1 + rand()]);
    // 点の間を二次曲線でなめらかにつなぐ
    var d = "M" + pts[0][0].toFixed(1) + " " + pts[0][1].toFixed(1);
    for (var k = 1; k < pts.length - 1; k++) {
      var mx = (pts[k][0] + pts[k + 1][0]) / 2;
      var my = (pts[k][1] + pts[k + 1][1]) / 2;
      d += " Q" + pts[k][0].toFixed(1) + " " + pts[k][1].toFixed(1) + " " + mx.toFixed(1) + " " + my.toFixed(1);
    }
    var lastPt = pts[pts.length - 1];
    d += " L" + lastPt[0].toFixed(1) + " " + lastPt[1].toFixed(1);
    return d;
  }

  function drawLines(seed) {
    var w = card.offsetWidth;
    var h = card.offsetHeight;
    paths[0].setAttribute("d", sketch(w, h, seed, 1));
    paths[1].setAttribute("d", sketch(w, h, seed + 17, 3));
    for (var i = 0; i < lineAnims.length; i++) lineAnims[i].cancel();
    lineAnims = [];
    for (var j = 0; j < paths.length; j++) {
      var len = paths[j].getTotalLength();
      paths[j].style.strokeDasharray = len + " " + len;
      if (reduceMotion.matches || !paths[j].animate) {
        paths[j].style.strokeDashoffset = "0";
        continue;
      }
      // 1本目が描かれ始めてから、2本目が少し遅れて追いかける
      lineAnims.push(paths[j].animate(
        [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
        { duration: j ? 320 : 380, delay: j ? 90 : 0, easing: EASE_OUT, fill: "both" }
      ));
    }
  }

  function countUp(n) {
    cancelAnimationFrame(countRaf);
    if (reduceMotion.matches || n === 0) {
      elCount.textContent = n;
      return;
    }
    var start = performance.now() + 100;
    var dur = 520;
    var tick = function (now) {
      var t = Math.min(1, Math.max(0, (now - start) / dur));
      elCount.textContent = Math.round(n * (1 - Math.pow(1 - t, 3)));
      if (t < 1) countRaf = requestAnimationFrame(tick);
    };
    elCount.textContent = "0";
    countRaf = requestAnimationFrame(tick);
  }

  // カードを惑星の横に置く（右に入らなければ左、それでも入らなければ画面内に収める）
  function place(li) {
    var body = li.querySelector(".planet-body");
    var m = main.getBoundingClientRect();
    var r = body.getBoundingClientRect();
    var w = card.offsetWidth;
    var h = card.offsetHeight;
    var gap = 8;
    var left = r.right - m.left + gap;
    var origin = "left center";
    if (left + w > m.width - 8) {
      left = r.left - m.left - gap - w;
      origin = "right center";
    }
    if (left < 8) {
      left = Math.min(Math.max(8, r.left - m.left + r.width / 2 - w / 2), m.width - w - 8);
      origin = "center top";
    }
    var top = r.top - m.top + r.height / 2 - h / 2;
    if (origin === "center top") top = r.top - m.top + r.height * 0.55;
    card.style.left = Math.round(left) + "px";
    card.style.top = Math.round(top) + "px";
    card.style.transformOrigin = origin;
  }

  function show(li) {
    clearTimeout(hideTimer);
    if (current === li && card.classList.contains("is-open")) return;
    current = li;
    var color = li.dataset.color || "#000000";
    var count = parseInt(li.dataset.count, 10) || 0;
    elName.textContent = li.dataset.name || "";
    elSwatch.style.background = color;
    elHex.textContent = color.toUpperCase();
    elPending.textContent = li.hasAttribute("data-pending") ? "（準備中）" : "";
    elCount.textContent = count; // 大きさを測るため、いったん最終の値で
    place(li);
    var index = Array.prototype.indexOf.call(li.parentNode.children, li);
    drawLines(index * 41 + 7);
    countUp(count);
    card.classList.add("is-open");
  }

  function hide(delay) {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      card.classList.remove("is-open");
      current = null;
    }, delay || 0);
  }

  /* ---------- 操作 ---------- */

  var items = main.querySelectorAll(".planet");
  var pressTimer = 0;
  var pressStart = null;
  var suppressClick = false;

  Array.prototype.forEach.call(items, function (li) {
    var link = li.querySelector(".planet-link");

    // マウス：乗せたら出す。離れても少し待つ（隣の惑星へ移るときに点滅しないように）
    link.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "mouse") show(li);
    });
    link.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "mouse") hide(120);
    });

    // キーボード
    link.addEventListener("focus", function () {
      if (link.matches(":focus-visible")) show(li);
    });
    link.addEventListener("blur", function () {
      hide(0);
    });

    // タッチ：長押しでカード。短いタップは通常どおり移動
    link.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse") return;
      suppressClick = false;
      pressStart = { x: e.clientX, y: e.clientY };
      clearTimeout(pressTimer);
      pressTimer = setTimeout(function () {
        suppressClick = true;
        show(li);
      }, LONG_PRESS);
    });
    link.addEventListener("pointermove", function (e) {
      if (!pressStart) return;
      if (Math.hypot(e.clientX - pressStart.x, e.clientY - pressStart.y) > 10) {
        clearTimeout(pressTimer); // スクロールしようとしている
        pressStart = null;
      }
    });
    var endPress = function () {
      clearTimeout(pressTimer);
      pressStart = null;
    };
    link.addEventListener("pointerup", endPress);
    link.addEventListener("pointercancel", endPress);
    link.addEventListener("click", function (e) {
      if (suppressClick) {
        e.preventDefault();
        suppressClick = false;
      }
    });
    // 長押しでリンクのメニューが出ないように
    link.addEventListener("contextmenu", function (e) {
      if (suppressClick || pressStart) e.preventDefault();
    });
  });

  // タッチでカードを出したあと、ほかの場所をタップしたら閉じる
  document.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" || !current) return;
    if (!current.contains(e.target)) hide(0);
  });

  window.addEventListener("resize", function () {
    if (current) place(current);
  });
})();

/*
 * トップの惑星の吹き出し（docs/spec.md 第5.4節。2026年11月16日に試作「観測ステーション」から採用）
 * - 惑星にマウスを乗せて150ミリ秒たつと、ドット絵の枠の吹き出しが惑星の上に出る（上に入らなければ下）
 * - 枠としっぽの色は、惑星の色の明るさを35%落とした色
 * - 中身：代表作の画像の一部をランダムに切り抜いた横長の小さなバナーと、作品数（0から数え上がる）
 *   作品に thumb_bg（色か ccfolia-grid）があれば、画像の後ろにその背景を敷く（2026年11月24日）
 * - 隣の惑星へ移ったときは、待たずに・動かさずに中身だけ替える
 * - キーボードで選んだときはすぐ出し、Escキーで閉じる
 * - スマートフォン：短いタップは今までどおり一覧ページへ。長押し（約0.45秒）で吹き出しを出し、その回は移動しない
 * - 「視差効果を減らす」がオンなら、その場にただ現れ、数字も最初から最終の値
 * - 画像は、ページの表示が終わってから読み込む
 * - モスの星（data-bubble のある項目）は、バナーと作品数の代わりに data-bubble の文字（「About」）だけを出す
 */
(function () {
  "use strict";

  var main = document.getElementById("main");
  if (!main) return;
  // 端末の設定とフッターの「動きを止める」ボタンの両方を見る（assets/js/motion.js）
  var reduceMotion = window.mossReduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)");
  var INK = "#0b1b1a";
  var OPEN_DELAY = 150; // 通り過ぎただけでちらつかないように（第5.4節）
  var GRACE = 300; // 閉じてからこの時間内に別の惑星へ乗ったら、待たずに出す
  var LONG_PRESS = 450;
  var BANNER_W = 144;
  var BANNER_H = 40;

  var images = {};
  var dataEl = document.getElementById("home-bubbles");
  try {
    images = JSON.parse(dataEl.textContent) || {};
  } catch (e) {
    images = {};
  }
  // 文言は言語ごとに i18n から（data-* で受け取る）
  // 作品数の文言は「作品{n}点」「{n} works」のように {n} の前後で分ける
  var countText = ((dataEl && dataEl.dataset.count) || "作品{n}点").split("{n}");
  var TEXT = {
    before: countText[0] || "",
    after: countText[1] || "",
    pending: dataEl ? dataEl.dataset.pending : "（準備中）"
  };

  // 惑星の色の明るさを35%落とした色（枠としっぽの線）
  function frameColor(hex) {
    var n = parseInt((hex || "#0b1b1a").replace("#", ""), 16);
    var f = function (v) { return Math.round(v * 0.65); };
    return "rgb(" + f((n >> 16) & 255) + "," + f((n >> 8) & 255) + "," + f(n & 255) + ")";
  }
  var lineColor = INK;

  /* ---------- 吹き出し ---------- */

  var bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.setAttribute("aria-hidden", "true");
  bubble.innerHTML =
    '<canvas class="bubble-bg"></canvas>' +
    '<div class="bubble-banner"></div>' +
    '<p class="bubble-count"></p>' +
    '<p class="bubble-label" hidden></p>';
  main.appendChild(bubble);
  var elCountP = bubble.querySelector(".bubble-count");
  elCountP.appendChild(document.createTextNode(TEXT.before));
  elCountP.appendChild(document.createElement("strong"));
  elCountP.appendChild(document.createTextNode(TEXT.after));
  elCountP.appendChild(document.createElement("span"));
  var bg = bubble.querySelector(".bubble-bg");
  var bgCtx = bg.getContext("2d");

  // 枠としっぽを1枚のドット絵で描く（w×h ドットの吹き出し＋しっぽ3段）
  // 角は2段階で欠けて丸く見える。しっぽの1段目は枠の線に重ねて、線を白で切る
  function drawFrame(w, h, tailX, below) {
    bg.width = w;
    bg.height = h + 3;
    var c = bgCtx;
    c.clearRect(0, 0, w, h + 3);
    c.save();
    if (below) {
      // 上向き：上下を反転して描く
      c.translate(0, h + 3);
      c.scale(1, -1);
    }
    var ink = function (x, y, ww, hh) { c.fillStyle = lineColor; c.fillRect(x, y, ww, hh); };
    var white = function (x, y, ww, hh) { c.fillStyle = "#ffffff"; c.fillRect(x, y, ww, hh); };
    white(1, 1, w - 2, h - 2);
    ink(2, 0, w - 4, 1);
    ink(2, h - 1, w - 4, 1);
    ink(0, 2, 1, h - 4);
    ink(w - 1, 2, 1, h - 4);
    ink(1, 1, 1, 1);
    ink(w - 2, 1, 1, 1);
    ink(1, h - 2, 1, 1);
    ink(w - 2, h - 2, 1, 1);
    // しっぽ（下向き）
    white(tailX + 1, h - 1, 3, 1);
    ink(tailX, h - 1, 1, 1);
    ink(tailX + 4, h - 1, 1, 1);
    ink(tailX + 1, h, 1, 1);
    white(tailX + 2, h, 1, 1);
    ink(tailX + 3, h, 1, 1);
    ink(tailX + 2, h + 1, 1, 1);
    c.restore();
  }

  var elBanner = bubble.querySelector(".bubble-banner");
  var elCount = bubble.querySelector(".bubble-count strong");
  var elNote = bubble.querySelector(".bubble-count span");
  var elLabel = bubble.querySelector(".bubble-label");

  /* ---------- 画像の読み込み（表示が終わってから） ---------- */

  var loaded = {}; // src → Image（読み込み済み）
  function preload() {
    Object.keys(images).forEach(function (id) {
      images[id].forEach(function (info) {
        var img = new Image();
        img.decoding = "async";
        img.onload = function () {
          loaded[info.src] = img;
          if (current && current.dataset.id === id && !elBanner.style.backgroundImage) fillBanner(id);
        };
        img.src = info.src;
      });
    });
  }
  var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 200); };
  if (document.readyState === "complete") idle(preload);
  else window.addEventListener("load", function () { idle(preload); });

  // 代表作から1枚選び、ランダムな場所を横長に切り抜く
  function fillBanner(id) {
    var list = (images[id] || []).filter(function (info) { return loaded[info.src]; });
    resetBanner();
    if (!(images[id] || []).length) {
      elBanner.hidden = true;
      return;
    }
    elBanner.hidden = false;
    if (!list.length) return; // まだ読み込み中：灰色の枠だけ出しておく
    var info = list[Math.floor(Math.random() * list.length)];
    // 枠を覆う最小の倍率に、1.3〜2.2倍の寄りを掛ける（作品の一部分が見える）
    var cover = Math.max(BANNER_W / info.w, BANNER_H / info.h);
    var s = cover * (1.3 + Math.random() * 0.9);
    if (info.pixel) {
      // ドット絵は整数倍で、ぼかさずに
      s = Math.max(1, Math.ceil(cover));
      elBanner.classList.add("is-pixel");
    }
    var w = Math.round(info.w * s);
    var h = Math.round(info.h * s);
    // 端は余白（背景）のことが多いので、横は中央6割・縦は上寄りの範囲から選ぶ（人物の顔や上半身が入りやすい）
    var x = -Math.round((0.2 + Math.random() * 0.6) * Math.max(0, w - BANNER_W));
    var y = -Math.round((0.1 + Math.random() * 0.5) * Math.max(0, h - BANNER_H));
    var img = "url(" + info.src + ")";
    if (info.bg === "ccfolia-grid") {
      // 方眼（作品カードと同じ。色と間隔は CSS の :root の --ccfolia-grid-*）を画像の後ろに敷く
      elBanner.style.backgroundColor = "var(--ccfolia-grid-bg)";
      elBanner.style.backgroundImage = img +
        ", linear-gradient(to right, var(--ccfolia-grid-line) 1px, transparent 1px)" +
        ", linear-gradient(to bottom, var(--ccfolia-grid-line) 1px, transparent 1px)";
      elBanner.style.backgroundSize = w + "px " + h + "px, var(--ccfolia-grid-size), var(--ccfolia-grid-size)";
      elBanner.style.backgroundPosition = x + "px " + y + "px, 0 0, 0 0";
      elBanner.style.backgroundRepeat = "no-repeat, repeat, repeat";
      return;
    }
    // 色の指定があれば、透明部分にその色を敷く（無ければ CSS の灰色のまま）
    if (info.bg) elBanner.style.backgroundColor = info.bg;
    elBanner.style.backgroundImage = img;
    elBanner.style.backgroundSize = w + "px " + h + "px";
    elBanner.style.backgroundPosition = x + "px " + y + "px";
  }

  // 前の作品の背景（thumb_bg）や位置を残さない
  function resetBanner() {
    var st = elBanner.style;
    st.backgroundImage = "";
    st.backgroundColor = "";
    st.backgroundSize = "";
    st.backgroundPosition = "";
    st.backgroundRepeat = "";
    elBanner.classList.remove("is-pixel");
  }

  /* ---------- 数え上げ ---------- */

  var countRaf = 0;
  function countUp(n) {
    cancelAnimationFrame(countRaf);
    if (reduceMotion.matches || n === 0) {
      elCount.textContent = n;
      return;
    }
    var start = performance.now();
    var dur = 400;
    var tick = function (now) {
      var t = Math.min(1, (now - start) / dur);
      elCount.textContent = Math.round(n * (1 - Math.pow(1 - t, 3)));
      if (t < 1) countRaf = requestAnimationFrame(tick);
    };
    elCount.textContent = "0";
    countRaf = requestAnimationFrame(tick);
  }

  /* ---------- 置き場所 ---------- */

  function scale() {
    // 倍率はトップ（.home）で決まる（PC は3倍か2倍。第5.3節）ので、main から読む
    var s = parseInt(getComputedStyle(main).getPropertyValue("--scale"), 10);
    return s > 0 ? s : 2;
  }

  // 惑星の上（しっぽの先が惑星の縁に届く位置）。画面の上端に近いときは下。左右は画面内に収め、しっぽは惑星の中心を指す
  // 位置・幅・高さはすべてドットの倍数に揃える
  function place(li) {
    var dot = scale();
    var body = li.querySelector(".planet-body");
    bubble.style.width = "";
    bubble.style.height = "";
    var wd = Math.ceil(bubble.offsetWidth / dot);
    var hd = Math.ceil(bubble.offsetHeight / dot);
    var w = wd * dot;
    var h = hd * dot;
    bubble.style.width = w + "px";
    bubble.style.height = h + "px";
    var m = main.getBoundingClientRect();
    var r = body.getBoundingClientRect();
    var tailH = 2 * dot; // しっぽのうち吹き出しの外に出る高さ
    var cx = r.left + r.width / 2 - m.left;
    var top = r.top - m.top + 2 * dot - tailH - h;
    var below = r.top + 2 * dot - tailH - h < 8;
    if (below) top = r.bottom - m.top - 2 * dot + tailH;
    var left = Math.min(Math.max(8, cx - w / 2), m.width - w - 8);
    left = Math.round(left / dot) * dot;
    top = Math.round(top / dot) * dot;
    var tailX = Math.round((cx - left) / dot - 2.5);
    tailX = Math.min(Math.max(3, tailX), wd - 8);
    drawFrame(wd, hd, tailX, below);
    bg.style.width = wd * dot + "px";
    bg.style.height = (hd + 3) * dot + "px";
    bubble.classList.toggle("is-below", below);
    bubble.style.left = left + "px";
    bubble.style.top = top + "px";
  }

  /* ---------- 開く・閉じる ---------- */

  var current = null;
  var openTimer = 0;
  var closeTimer = 0;
  var closedAt = 0;

  function render(li) {
    var id = li.dataset.id;
    lineColor = frameColor(li.dataset.color);
    var label = li.dataset.bubble || "";
    bubble.classList.toggle("is-label", !!label);
    elLabel.hidden = !label;
    elCountP.hidden = !!label;
    if (label) {
      // モスの星：文字だけ
      cancelAnimationFrame(countRaf);
      elLabel.textContent = label;
      elBanner.hidden = true;
      place(li);
      return;
    }
    fillBanner(id);
    elNote.textContent = li.hasAttribute("data-pending") ? TEXT.pending : "";
    elCount.textContent = li.dataset.count || "0"; // 大きさを測るため、いったん最終の値で
    place(li);
    countUp(parseInt(li.dataset.count, 10) || 0);
  }

  function open(li, instant) {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    if (current === li && bubble.classList.contains("is-open")) return;
    var wasOpen = bubble.classList.contains("is-open");
    current = li;
    if (instant || wasOpen || reduceMotion.matches) {
      bubble.classList.add("is-instant");
      bubble.classList.remove("is-entering");
      render(li);
      bubble.classList.add("is-open");
      void bubble.offsetWidth;
      bubble.classList.remove("is-instant");
      return;
    }
    render(li);
    // 1ドットずれた位置から始めて、次のフレームで正しい位置へ（ポンと上がる）
    bubble.classList.add("is-instant", "is-entering");
    void bubble.offsetWidth;
    bubble.classList.remove("is-instant");
    bubble.classList.add("is-open");
    requestAnimationFrame(function () {
      bubble.classList.remove("is-entering");
    });
  }

  function close(delay) {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    closeTimer = setTimeout(function () {
      if (bubble.classList.contains("is-open")) closedAt = performance.now();
      bubble.classList.remove("is-open", "is-entering");
      cancelAnimationFrame(countRaf);
      current = null;
    }, delay || 0);
  }

  function hoverOpen(li) {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    // 開いている間・閉じた直後は待たずに。最初の1回だけ150ミリ秒待つ
    if (bubble.classList.contains("is-open") || performance.now() - closedAt < GRACE) {
      open(li, true);
    } else {
      openTimer = setTimeout(function () { open(li); }, OPEN_DELAY);
    }
  }

  /* ---------- 操作 ---------- */

  var pressTimer = 0;
  var pressStart = null;
  var suppressClick = false;

  Array.prototype.forEach.call(main.querySelectorAll(".planet"), function (li) {
    var link = li.querySelector(".planet-link");

    link.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "mouse") hoverOpen(li);
    });
    link.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "mouse") close(80);
    });

    // キーボード：すぐ出す（キー操作には動きを付けない）
    link.addEventListener("focus", function () {
      if (link.matches(":focus-visible")) open(li, true);
    });
    link.addEventListener("blur", function () {
      close(0);
    });

    // タッチ：長押しで吹き出し。短いタップは通常どおり移動
    link.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse") return;
      suppressClick = false;
      pressStart = { x: e.clientX, y: e.clientY };
      clearTimeout(pressTimer);
      pressTimer = setTimeout(function () {
        suppressClick = true;
        open(li);
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
    link.addEventListener("contextmenu", function (e) {
      if (suppressClick || pressStart) e.preventDefault();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && current) close(0);
  });

  // タッチで出したあと、ほかの場所をタップしたら閉じる
  document.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" || !current) return;
    if (!current.contains(e.target)) close(0);
  });

  window.addEventListener("resize", function () {
    if (current) place(current);
  });
})();

/*
 * ドット絵の表示位置を整数ピクセルに揃える
 * - data-pixel-snap を付けた要素の位置を測り、端数ぶんだけ translate でずらす
 * - 画面の物理ピクセル（devicePixelRatio）単位で揃えるので、Retina などでもドットが揃う
 * - 中央寄せや行の高さ（例：16px × 1.8 = 28.8px）でできる端数を打ち消すため
 * - data-pixel-fit を付けたドット絵の作品画像を、枠の幅と画面の高さ（85%）に収まる整数倍の大きさにする
 *   （CSS の max-width: 100% だけだと、狭い画面で 2.3倍 のような半端な倍率に縮んでしまうため）
 * docs/spec.md 第5.3節（ドット絵は必ず整数倍）
 */
(function () {
  "use strict";

  var queued = false;

  function fit() {
    var imgs = document.querySelectorAll("img[data-pixel-fit]");
    var maxH = window.innerHeight * 0.85;
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      var w = parseInt(img.dataset.w, 10);
      var h = parseInt(img.dataset.h, 10);
      if (!w || !h) continue;
      // 画像を包む枠（拡大用のリンクやギャラリーの図は中身の幅に縮むので、その外側の li・figure などで測る）
      var box = img.closest("li, figure, .prose") || img.parentElement;
      var cs = window.getComputedStyle(box);
      var avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      var k = Math.max(1, Math.floor(Math.min(avail / w, maxH / h)));
      img.style.width = w * k + "px";
      img.style.height = h * k + "px";
    }
  }

  function snap() {
    queued = false;
    fit();
    var dpr = window.devicePixelRatio || 1;
    var targets = document.querySelectorAll("[data-pixel-snap]");
    for (var i = 0; i < targets.length; i++) {
      var el = targets[i];
      // いまのずらし量を除いた、本来の位置を求める
      var curX = parseFloat(el.dataset.snapX || "0");
      var curY = parseFloat(el.dataset.snapY || "0");
      var rect = el.getBoundingClientRect();
      var left = rect.left - curX;
      var top = rect.top - curY + window.scrollY;
      var dx = Math.round(left * dpr) / dpr - left;
      var dy = Math.round(top * dpr) / dpr - top;
      if (Math.abs(dx - curX) < 0.001 && Math.abs(dy - curY) < 0.001) continue;
      el.dataset.snapX = dx;
      el.dataset.snapY = dy;
      el.style.setProperty("--snap-x", dx + "px");
      el.style.setProperty("--snap-y", dy + "px");
    }
  }

  function queue() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(snap);
  }

  snap();
  window.addEventListener("resize", queue);
  window.addEventListener("load", queue);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queue);
  if (window.ResizeObserver) new ResizeObserver(queue).observe(document.body);
})();

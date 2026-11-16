/*
 * 作品画像の拡大表示（docs/spec.md 第6.2節「クリックすると画面いっぱいに拡大」）
 * - JavaScript がなければ、リンク先の大きな画像がそのまま開く
 * - 閉じるボタン・Esc キー・背景のクリックで閉じる（前後に移れないときは、画像のクリックでも閉じる）
 * - data-zoom-group が同じ画像どうしは、拡大表示の中で前後へ移れる
 *   （「前へ」「次へ」ボタン、←→キー、スマートフォンでは左右のスワイプ。指で拡大しているときはスワイプしない）
 */
(function () {
  "use strict";

  var dialog = document.querySelector(".zoom-dialog");
  if (!dialog || typeof dialog.showModal !== "function") return;
  var img = dialog.querySelector("img");
  var close = dialog.querySelector(".zoom-close");
  var nav = dialog.querySelector(".zoom-nav");
  var prev = dialog.querySelector(".zoom-prev");
  var next = dialog.querySelector(".zoom-next");
  var count = dialog.querySelector(".zoom-count");
  var opener = null;
  var group = [];
  var index = 0;

  function show(link) {
    var thumb = link.querySelector("img");
    var motion = window.mossReduceMotion;
    var still = thumb && thumb.getAttribute("data-still");
    img.src = still && motion && motion.matches ? still : link.getAttribute("href");
    img.alt = thumb ? thumb.alt : "";
    var pixel = !!(thumb && thumb.classList.contains("is-pixel"));
    img.classList.toggle("is-pixel", pixel);
    img.style.width = "";
    if (pixel) {
      // ドット絵は、画面に収まる最大の整数倍で表示する
      img.onload = function () {
        var k = Math.max(1, Math.floor(Math.min(
          (window.innerWidth - 32) / img.naturalWidth,
          (window.innerHeight - 96) / img.naturalHeight
        )));
        img.style.width = img.naturalWidth * k + "px";
      };
    } else {
      img.onload = null;
    }
    if (nav && group.length > 1) {
      count.textContent = index + 1 + " / " + group.length;
      prev.disabled = index === 0;
      next.disabled = index === group.length - 1;
    }
  }

  function go(step) {
    if (group.length < 2) return;
    var i = index + step;
    if (i < 0 || i >= group.length) return;
    index = i;
    opener = group[i];
    show(group[i]);
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest("a[data-zoom]");
    if (!link) return;
    e.preventDefault();
    opener = link;
    var name = link.getAttribute("data-zoom-group");
    group = name ? Array.prototype.slice.call(document.querySelectorAll('a[data-zoom][data-zoom-group="' + name + '"]')) : [link];
    index = Math.max(0, group.indexOf(link));
    dialog.classList.toggle("has-nav", group.length > 1);
    if (nav) nav.hidden = group.length < 2;
    show(link);
    dialog.showModal();
  });

  function hide() {
    dialog.close();
  }

  close.addEventListener("click", hide);
  // 前後に移れるときは、移るつもりで画像を押して閉じてしまわないよう、画像のクリックでは閉じない
  img.addEventListener("click", function () {
    if (group.length < 2) hide();
  });
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) hide();
  });
  if (prev) prev.addEventListener("click", function () { go(-1); });
  if (next) next.addEventListener("click", function () { go(1); });
  dialog.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { go(-1); e.preventDefault(); }
    if (e.key === "ArrowRight") { go(1); e.preventDefault(); }
  });

  // スワイプ（指1本で、横に50px以上。指で拡大しているときは、拡大した画像を動かす操作を優先する）
  var sx = 0;
  var sy = 0;
  var tracking = false;
  dialog.addEventListener("touchstart", function (e) {
    var zoomed = window.visualViewport && window.visualViewport.scale > 1.01;
    tracking = e.touches.length === 1 && !zoomed && group.length > 1;
    if (tracking) {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    }
  }, { passive: true });
  dialog.addEventListener("touchend", function (e) {
    if (!tracking) return;
    tracking = false;
    var t = e.changedTouches[0];
    var dx = t.clientX - sx;
    var dy = t.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  }, { passive: true });

  dialog.addEventListener("close", function () {
    img.removeAttribute("src");
    if (opener) opener.focus();
  });
})();

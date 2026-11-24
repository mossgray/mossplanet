/*
 * 差分の切り替え（docs/spec.md 第6.2.3節。layouts/_partials/work/variants.html）
 * - [data-variants] の中の .variant（data-values="姿|ジャケット"）を、ボタンの組み合わせで1枚だけ見せる
 * - ボタンは aria-pressed で押されている状態を示す。button 要素なので Tab と Enter／Space で操作できる
 * - 表示中以外の絵は遅延読み込み。ボタンのまわりにマウスやフォーカスが来たら、残りの絵を先に読み込む
 * - 切り替えのフェードは CSS（.variants.is-js .is-current）。動きを止める設定のときは付けない
 * - JavaScript が動かないときは、全部の差分が並んで見える（このスクリプトが is-js を付けない）
 */
(function () {
  "use strict";
  var roots = document.querySelectorAll("[data-variants]");
  Array.prototype.forEach.call(roots, function (root) {
    var items = Array.prototype.slice.call(root.querySelectorAll(".variant"));
    var controls = root.querySelector(".variant-controls");
    var buttons = Array.prototype.slice.call(root.querySelectorAll(".variant-button"));
    if (!items.length || !controls || !buttons.length) return;

    var current = items.filter(function (li) { return li.classList.contains("is-current"); })[0] || items[0];
    var state = current.getAttribute("data-values").split("|");

    function show() {
      var key = state.join("|");
      var next = items.filter(function (li) { return li.getAttribute("data-values") === key; })[0];
      buttons.forEach(function (b) {
        var on = state[+b.getAttribute("data-axis")] === b.getAttribute("data-value");
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (!next || next === current) return;
      current.classList.remove("is-current");
      next.classList.add("is-current");
      current = next;
    }

    var preloaded = false;
    function preload() {
      if (preloaded) return;
      preloaded = true;
      items.forEach(function (li) {
        var img = li.querySelector("img");
        if (img && img.loading === "lazy") img.loading = "eager";
      });
    }

    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        state[+b.getAttribute("data-axis")] = b.getAttribute("data-value");
        preload();
        show();
      });
    });
    controls.addEventListener("pointerenter", preload);
    controls.addEventListener("focusin", preload);
    controls.addEventListener("touchstart", preload, { passive: true });

    controls.hidden = false;
    root.classList.add("is-js");
    show();
  });
})();

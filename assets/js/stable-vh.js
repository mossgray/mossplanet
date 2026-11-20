/*
 * 変わらない画面の高さ（docs/spec.md 第5.6節）
 * - ページを開いたときの画面の高さ（window.innerHeight）を測り、CSS 変数 --stable-vh（1% あたりの px）に入れる
 * - 画面の幅が変わったとき（スマートフォンの縦横の切り替えなど）だけ測り直す。
 *   幅が同じで高さだけが変わったとき（アドレスバーの出入り）は測り直さない。
 *   iPhone の Edge や Chrome では svh が「変わらない高さ」として働かないため、CSS の単位に頼らずに決める
 * - 測った高さは window.mossStableHeight でもほかのスクリプトに渡す（pixel-snap.js）
 * - スクリプトが動かないときは、CSS の :root に書いた初期値（1svh、なければ 1vh）が使われる
 * 描画の前に値を入れるため、<head> に直接書き込む（layouts/_partials/head.html）
 */
(function () {
  "use strict";
  var root = document.documentElement;
  var lastW = 0;
  function measure() {
    var w = window.innerWidth;
    if (w === lastW) return;
    lastW = w;
    var h = window.innerHeight;
    window.mossStableHeight = h;
    root.style.setProperty("--stable-vh", h / 100 + "px");
  }
  measure();
  window.addEventListener("resize", measure);
  window.addEventListener("orientationchange", function () {
    // 向きの切り替えでは、幅が変わったあとに resize が来ないブラウザがあるので、少し待って測り直す
    lastW = 0;
    window.setTimeout(measure, 300);
  });
})();

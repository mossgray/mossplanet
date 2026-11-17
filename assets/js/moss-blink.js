/*
 * モスの星のまばたき（docs/spec.md 第5.1節・第4章）
 * - .moss-blink の要素（トップの中心のモスの星、スマートフォンのタブバーの About アイコン）が対象
 * - 4〜6秒に一度、0.15秒だけ .is-blinking を付け、目を閉じた絵（2コマの絵の右のコマ）にする。要素ごとに間隔はばらばら
 * - 「視差効果を減らす」「動きを止める」のときと、タブが非表示のときはしない（assets/js/motion.js の window.mossReduceMotion）
 * - 光の点滅ではないが、まばたきは1秒に3回以下（4秒以上あける）
 */
(function () {
  "use strict";

  var els = document.querySelectorAll(".moss-blink");
  if (!els.length) return;
  var reduceMotion = window.mossReduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)");
  var MIN = 4000;
  var MAX = 6000;
  var SHUT = 150;

  var timers = [];

  function schedule(i) {
    var el = els[i];
    window.clearTimeout(timers[i]);
    el.classList.remove("is-blinking");
    if (reduceMotion.matches || document.hidden) return;
    timers[i] = window.setTimeout(function () {
      el.classList.add("is-blinking");
      timers[i] = window.setTimeout(function () { schedule(i); }, SHUT);
    }, MIN + Math.random() * (MAX - MIN));
  }

  function all() {
    for (var i = 0; i < els.length; i++) schedule(i);
  }

  all();
  document.addEventListener("visibilitychange", all);
  if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", all);
  else if (reduceMotion.addListener) reduceMotion.addListener(all);
})();

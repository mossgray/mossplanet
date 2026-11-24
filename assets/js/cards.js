/*
 * ゲームブックのカード：タップ（クリック）で表と裏を入れ替える（docs/spec.md 第7.4節）
 * 回転の動きは CSS（main.css の .flip-card）。「視差効果を減らす」では回転せず、入れ替わるだけ
 */
(function () {
  "use strict";

  document.addEventListener("click", function (e) {
    var card = e.target.closest && e.target.closest(".flip-card");
    if (!card) return;
    var flipped = card.getAttribute("aria-pressed") !== "true";
    card.setAttribute("aria-pressed", flipped ? "true" : "false");
  });
})();

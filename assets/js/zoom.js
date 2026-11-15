/*
 * 作品画像の拡大表示（docs/spec.md 第6.2節「クリックすると画面いっぱいに拡大」）
 * - JavaScript がなければ、リンク先の大きな画像がそのまま開く
 * - 画像のクリック・閉じるボタン・Esc キーで閉じる
 */
(function () {
  "use strict";

  var dialog = document.querySelector(".zoom-dialog");
  if (!dialog || typeof dialog.showModal !== "function") return;
  var img = dialog.querySelector("img");
  var close = dialog.querySelector(".zoom-close");
  var opener = null;

  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest("a[data-zoom]");
    if (!link) return;
    e.preventDefault();
    opener = link;
    var thumb = link.querySelector("img");
    img.src = link.getAttribute("href");
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
    dialog.showModal();
  });

  function hide() {
    dialog.close();
  }

  close.addEventListener("click", hide);
  img.addEventListener("click", hide);
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) hide();
  });
  dialog.addEventListener("close", function () {
    img.removeAttribute("src");
    if (opener) opener.focus();
  });
})();

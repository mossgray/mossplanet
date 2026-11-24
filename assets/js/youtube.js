/*
 * YouTube 動画を、再生ボタンを押したときに初めて読み込む（layouts/_shortcodes/youtube.html）
 * - ページを開いただけでは YouTube に接続しない（Cookie を使う外部スクリプトを読み込まないため）
 * - 読み込むのはプライバシー強化モード（youtube-nocookie.com）のプレーヤー
 */
(function () {
  "use strict";

  document.addEventListener("click", function (e) {
    var link = e.target.closest(".yt-link");
    if (!link) return;
    var box = link.parentNode;
    var id = box.getAttribute("data-yt");
    if (!/^[\w-]{6,20}$/.test(id || "")) return;
    e.preventDefault();
    var frame = document.createElement("iframe");
    frame.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
    frame.title = box.getAttribute("data-yt-title") || "YouTube";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    box.replaceChild(frame, link);
    box.classList.add("is-playing");
    frame.focus();
  });
})();

/*
 * ナビゲーションの開閉
 * - ヘッダーの「Works」：惑星の一覧メニューを開く（JavaScript がなければ /works/ へのリンク）
 * - スマートフォンのタブバーの「Works」：惑星の一覧を下から開く
 * - Esc キー、外側のクリックで閉じる
 * docs/spec.md 第4章
 */
(function () {
  "use strict";

  function setup(toggle, panel, opts) {
    if (!toggle || !panel) return;
    var open = false;

    function show() {
      open = true;
      panel.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      if (opts.onOpen) opts.onOpen();
      // 開いたメニューの中のドット絵アイコンも整数ピクセルに揃える（pixel-snap.js）
      window.dispatchEvent(new Event("resize"));
    }

    function hide(returnFocus) {
      if (!open) return;
      open = false;
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      if (opts.onClose) opts.onClose();
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      if (open) hide(false);
      else show();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && open) hide(true);
    });

    document.addEventListener("click", function (e) {
      if (!open) return;
      if (opts.outside(e.target)) hide(false);
    });

    return { hide: hide };
  }

  // ヘッダーの Works メニュー
  var menuToggle = document.querySelector(".nav-works-toggle");
  var menu = document.getElementById("works-menu");
  setup(menuToggle, menu, {
    outside: function (target) {
      return !menu.contains(target) && !menuToggle.contains(target);
    }
  });

  // スマートフォンの Works シート
  var sheetToggle = document.querySelector(".tab-works");
  var sheet = document.getElementById("works-sheet");
  if (sheet) {
    var panel = sheet.querySelector(".works-sheet-panel");
    var sheetCtl = setup(sheetToggle, sheet, {
      outside: function (target) {
        return !panel.contains(target) && !sheetToggle.contains(target);
      },
      onOpen: function () {
        document.documentElement.classList.add("sheet-open");
        var first = panel.querySelector("a, button");
        if (first) first.focus();
      },
      onClose: function () {
        document.documentElement.classList.remove("sheet-open");
      }
    });
    var close = sheet.querySelector(".works-sheet-close");
    if (close && sheetCtl) {
      close.addEventListener("click", function () {
        sheetCtl.hide(true);
      });
    }
  }
})();

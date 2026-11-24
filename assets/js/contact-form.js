/*
 * 問い合わせフォームの送信（docs/spec.md 第6.4節）
 * - 日本語版・英語版とも Netlify のフォーム名は「contact」1つ。ふつうの送信では、移動先が片方の完了ページにそろってしまうため、
 *   JavaScript で送信し、終わったらそのページの言語の完了ページ（form の action）へ移る
 * - 送り方は Netlify の説明のとおり：中身を application/x-www-form-urlencoded にして、サイトのページ（/）へ POST する
 *   （form-name・lang・ハニーポットの bot-field も一緒に送る）
 * - 送信中はボタンを押せなくして二重送信を防ぐ。失敗したらフォームの下に文を出し、入力した内容は残す
 * - JavaScript が動かないときは、ふつうの送信になる（届くが、完了ページは日本語になることがある）
 */
(function () {
  var form = document.querySelector("form.contact-form");
  if (!form || !window.fetch || !window.URLSearchParams || !window.FormData) return;
  var button = form.querySelector("button[type=submit]");
  var error = form.querySelector(".form-error");
  var endpoint = form.getAttribute("data-endpoint") || "/";
  var sending = false;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return;
    sending = true;
    if (button) button.disabled = true;
    if (error) error.hidden = true;
    form.setAttribute("aria-busy", "true");

    var body = new URLSearchParams(new FormData(form)).toString();
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      window.location.href = form.getAttribute("action");
    }).catch(function () {
      sending = false;
      if (button) button.disabled = false;
      form.removeAttribute("aria-busy");
      if (error) {
        error.hidden = false;
        error.focus();
      }
    });
  });
})();

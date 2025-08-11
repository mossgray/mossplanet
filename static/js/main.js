/* ============================================================
   mossplanet - main.js (all-in-one)
   - smooth scroll
   - modal open/close
   - tabs with reCAPTCHA slot move
   - works filter
   - image protect (context menu / key)
   - shrink header on scroll
   - hamburger toggle
   - Netlify Forms: AJAX + Thanks modal
   ============================================================ */

/* ---------- Global image guard (outside DOMContentLoaded) ---------- */
document.addEventListener('contextmenu', (e) => {
  if (e.target.closest('.protect-img')) e.preventDefault();
});
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && ['s','p','u'].includes(e.key.toLowerCase())) {
    if (document.activeElement.closest('.protect-img')) e.preventDefault();
  }
});

/* ---------- After DOM Ready ---------- */
document.addEventListener('DOMContentLoaded', () => {

  /* ========== Smooth scroll buttons ========== */
  document.querySelectorAll('[data-scroll-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-scroll-target');
      const el = document.querySelector(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const scrollBtn = document.querySelector('.scroll-down');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
      const targetSelector = scrollBtn.getAttribute('data-scroll-target');
      const targetEl = document.querySelector(targetSelector);
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ========== Modal open/close (data-open / data-close) ========== */
  function openModal(id) {
    const m = document.querySelector(id);
    if (!m) return;
    m.setAttribute('aria-hidden', 'false');
    const closeBtn = m.querySelector('[data-close]');
    const esc = (e) => { if (e.key === 'Escape') close(); };
    const overlay = (e) => { if (e.target === m) close(); };
    function close(){
      m.setAttribute('aria-hidden', 'true');
      document.removeEventListener('keydown', esc);
      closeBtn && closeBtn.removeEventListener('click', close);
      m.removeEventListener('click', overlay);
    }
    closeBtn && closeBtn.addEventListener('click', close);
    m.addEventListener('click', overlay);
    document.addEventListener('keydown', esc);
  }
  document.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.getAttribute('data-open')));
  });

  /* ========== Tabs + reCAPTCHA slot move ========== */
  (function(){
    const tabBtns = document.querySelectorAll('.tabs [role="tab"]');
    const panels = {
      commission: document.getElementById('tab-commission'),
      inquiry:    document.getElementById('tab-inquiry')
    };
    const slot = document.getElementById('captcha-slot'); // ← Commission側だけに置いたやつ
    if (!tabBtns.length || !panels.commission || !panels.inquiry || !slot) return;

    const showPanel = (key) => {
      // 切替（hiddenフラグでアクセシブル表示）
      panels.commission.hidden = key !== 'commission';
      panels.inquiry.hidden    = key !== 'inquiry';

      // アクティブ側フォームを取得
      const activePanel = key === 'commission' ? panels.commission : panels.inquiry;
      const form = activePanel.querySelector('form[data-netlify="true"]');
      if (!form) return;

      // 送信ボタンの手前に reCAPTCHA スロットを移動
      const submitBtn = form.querySelector('button[type="submit"]');
      const beforeEl  = submitBtn ? submitBtn.parentElement : null; // <p> 包みの直前に挿入
      if (beforeEl && beforeEl.parentElement === form) {
        form.insertBefore(slot, beforeEl);
      } else {
        form.appendChild(slot);
      }
      slot.style.minHeight = '78px'; // 見た目の保険

      // 既に描画済みiframeをそのまま移動できるので通常は reset 不要
      // 必要に応じてチェック状態を毎回クリアしたい場合のみ有効化：
      // if (window.grecaptcha && slot.querySelector('iframe')) { window.grecaptcha.reset(); }
    };

    // 初期は Commission を表示（HTML側の初期と合わせる）
    showPanel('commission');

    // ボタンイベント
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.setAttribute('aria-selected','false'));
        btn.setAttribute('aria-selected','true');

        const targetId = btn.getAttribute('aria-controls'); // "tab-commission" or "tab-inquiry"
        const key = targetId && targetId.includes('inquiry') ? 'inquiry' : 'commission';
        showPanel(key);
      });
    });
  })();

  /* ========== Works filter (data-filter-group → .cards .card[data-tags]) ========== */
  (function(){
    const filterGroup = document.querySelector('[data-filter-group]');
    if(!filterGroup) return;
    const cards = Array.from(document.querySelectorAll('.cards .card'));
    filterGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if(!btn) return;
      filterGroup.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.getAttribute('data-filter');
      cards.forEach(card => {
        if (key === '*') { card.style.display = ''; return; }
        const tags = (card.getAttribute('data-tags') || '').split(' ');
        card.style.display = tags.includes(key) ? '' : 'none';
      });
    });
  })();

  /* ========== Shrink header on scroll ========== */
  (function(){
    const threshold = 10;
    const onScroll = () => {
      if (window.scrollY > threshold) document.body.classList.add('is-scrolled');
      else document.body.classList.remove('is-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  /* ========== Hamburger toggle (SP) ========== */
  (function(){
    const btn = document.querySelector('.nav-toggle');
    const nav = document.getElementById('primary-nav');
    if (!btn || !nav) return;

    const close = () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    };

    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('nav-open', open);
    });

    nav.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  })();

  /* ========== Netlify Forms: AJAX + Thanks modal ========== */
  (function(){
    const forms = document.querySelectorAll('form[data-netlify="true"]');
    if(!forms.length) return;

    const encode = (fd) => new URLSearchParams(fd).toString();

    forms.forEach(form => {
      form.addEventListener('submit', async (e) => {
        if (!form.checkValidity()) return; // まずネイティブ検証
        e.preventDefault();

        const btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

        const thanksSel = form.getAttribute('data-thanks') || '#thanks-modal';
        const thanksEl  = document.querySelector(thanksSel);

        // Netlify必要項目
        const formData = new FormData(form);
        if(!formData.get('form-name')) {
          formData.set('form-name', form.getAttribute('name') || 'contact');
        }

        try {
          await fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: encode(formData)
          });

          // 成功処理
          form.reset();

          if (thanksEl){
            thanksEl.setAttribute('aria-hidden','false');
            const closeBtn = thanksEl.querySelector('[data-close]');
            const esc = (ev)=>{ if(ev.key === 'Escape'){ close(); } };
            const overlay = (ev)=>{ if(ev.target === thanksEl){ close(); } };
            function close(){
              thanksEl.setAttribute('aria-hidden','true');
              document.removeEventListener('keydown', esc);
              closeBtn && closeBtn.removeEventListener('click', close);
              thanksEl.removeEventListener('click', overlay);
            }
            closeBtn && closeBtn.addEventListener('click', close);
            thanksEl.addEventListener('click', overlay);
            document.addEventListener('keydown', esc);
          }
        } catch (err) {
          alert('送信に失敗しました。通信環境を確認のうえ、もう一度お試しください。');
          console.error(err);
        } finally {
          if (btn) { btn.disabled = false; btn.textContent = '送信 / Send'; }
        }
      }, { passive: false });
    });
  })();

});

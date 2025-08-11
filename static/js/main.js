
(function(){
  document.querySelectorAll('[data-scroll-target]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const id = btn.getAttribute('data-scroll-target');
      const el = document.querySelector(id);
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  function openModal(id){
    const m = document.querySelector(id);
    if(!m) return;
    m.setAttribute('aria-hidden','false');
    const closeBtn = m.querySelector('[data-close]');
    function esc(e){ if(e.key==='Escape'){ close(); } }
    function close(){
      m.setAttribute('aria-hidden','true');
      document.removeEventListener('keydown', esc);
      closeBtn && closeBtn.removeEventListener('click', close);
      m.removeEventListener('click', overlay);
    }
    function overlay(e){ if(e.target === m){ close(); } }
    closeBtn && closeBtn.addEventListener('click', close);
    m.addEventListener('click', overlay);
    document.addEventListener('keydown', esc);
  }
  document.querySelectorAll('[data-open]').forEach(btn=>{
    btn.addEventListener('click', ()=> openModal(btn.getAttribute('data-open')));
  });

  const tabBtns = document.querySelectorAll('.tabs [role="tab"]');
  tabBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      tabBtns.forEach(b=>b.setAttribute('aria-selected','false'));
      btn.setAttribute('aria-selected','true');
      const panels = [document.getElementById('tab-commission'), document.getElementById('tab-inquiry')];
      panels.forEach(p=>p.hidden = true);
      const target = btn.getAttribute('aria-controls');
      document.getElementById(target.replace('-btn','')).hidden = false;
    });
  });

  const filterGroup = document.querySelector('[data-filter-group]');
  if(filterGroup){
    const cards = Array.from(document.querySelectorAll('.cards .card'));
    filterGroup.addEventListener('click', (e)=>{
      const btn = e.target.closest('button');
      if(!btn) return;
      filterGroup.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.getAttribute('data-filter');
      cards.forEach(card=>{
        if(key === '*'){ card.style.display = ''; return; }
        const tags = (card.getAttribute('data-tags')||'').split(' ');
        card.style.display = tags.includes(key) ? '' : 'none';
      });
    });
  }
})();
// 画像ガード（右クリック/長押し/ショートカット抑止）
document.addEventListener('contextmenu', (e) => {
  if (e.target.closest('.protect-img')) e.preventDefault();
});
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && ['s','p','u'].includes(e.key.toLowerCase())) {
    if (document.activeElement.closest('.protect-img')) e.preventDefault();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const scrollBtn = document.querySelector(".scroll-down");
  if (scrollBtn) {
    scrollBtn.addEventListener("click", () => {
      const targetSelector = scrollBtn.getAttribute("data-scroll-target");
      const targetEl = document.querySelector(targetSelector);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
});

// shrink header on scroll
(function(){
  const threshold = 10; // 10px以上スクロールで発火
  const onScroll = () => {
    if (window.scrollY > threshold) {
      document.body.classList.add('is-scrolled');
    } else {
      document.body.classList.remove('is-scrolled');
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// hamburger toggle
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

  // メニュー内リンクを押したら閉じる
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) close();
  });

  // Escキーで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
})();

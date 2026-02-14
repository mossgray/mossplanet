(() => {
  document.documentElement.classList.add('js-motion');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = Array.from(document.querySelectorAll('[data-reveal]'));
  const fadeImages = Array.from(document.querySelectorAll('img[data-fade]'));

  const markVisible = (el) => {
    el.classList.add('is-visible');
  };

  if (!prefersReduced) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            markVisible(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    revealTargets.forEach((target) => observer.observe(target));
  } else {
    revealTargets.forEach(markVisible);
  }

  const handleImageLoad = (img) => {
    img.classList.add('is-loaded');
  };

  fadeImages.forEach((img) => {
    if (img.complete) {
      handleImageLoad(img);
    } else {
      img.addEventListener('load', () => handleImageLoad(img), { once: true });
    }
  });

  if (!prefersReduced && document.startViewTransition) {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.hash && url.pathname === window.location.pathname) return;

      event.preventDefault();
      document.startViewTransition(() => {
        window.location.href = url.toString();
      });
    });
  }

  const parallaxTarget = document.querySelector('[data-parallax]');
  if (!prefersReduced && parallaxTarget) {
    const strength = 6;
    window.addEventListener('mousemove', (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * strength;
      const y = (event.clientY / window.innerHeight - 0.5) * strength;
      parallaxTarget.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }
})();

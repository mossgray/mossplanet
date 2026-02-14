(() => {
  const filterRoot = document.querySelector('[data-works-filter]');
  const grid = document.querySelector('[data-works-grid]');
  const emptyMessage = document.querySelector('[data-works-empty]');
  const modal = document.querySelector('[data-works-modal]');

  if (!grid) return;

  const tiles = Array.from(grid.querySelectorAll('.work-tile'));
  const checkboxes = filterRoot ? Array.from(filterRoot.querySelectorAll('input[type="checkbox"]')) : [];
  const optionsContainer = filterRoot ? filterRoot.querySelector('[data-works-options]') : null;
  const toggleButton = filterRoot ? filterRoot.querySelector('[data-works-toggle]') : null;

  const normalizeTags = (value) =>
    value
      .split(' ')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

  const matchesTags = (tileTags, activeTags) =>
    activeTags.every((tag) => tileTags.includes(tag));

  const updateFilters = () => {
    const activeTags = checkboxes
      .filter((box) => box.checked)
      .map((box) => box.value.toLowerCase());
    let visibleCount = 0;

    tiles.forEach((tile) => {
      const tags = normalizeTags(tile.dataset.tags || '');
      const visible = activeTags.length === 0 || matchesTags(tags, activeTags);
      tile.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    if (emptyMessage) {
      emptyMessage.hidden = visibleCount !== 0;
    }
  };

  if (checkboxes.length) {
    checkboxes.forEach((box) => {
      box.addEventListener('change', updateFilters);
    });
  }

  if (optionsContainer && toggleButton) {
    const limit = Number(toggleButton.dataset.limit) || 8;
    const optionLabels = Array.from(optionsContainer.querySelectorAll('.works-filter-option'));

    if (optionLabels.length > limit) {
      optionLabels.slice(limit).forEach((label) => label.classList.add('is-hidden'));
      toggleButton.hidden = false;
      toggleButton.addEventListener('click', () => {
        const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
        toggleButton.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        toggleButton.textContent = isExpanded ? 'もっと見る' : '折りたたむ';
        optionLabels.slice(limit).forEach((label) => label.classList.toggle('is-hidden', isExpanded));
      });
    } else {
      toggleButton.hidden = true;
    }
  }

  let lastFocused = null;

  const closeModal = () => {
    if (!modal) return;
    const image = modal.querySelector('img');
    modal.setAttribute('aria-hidden', 'true');
    modal.hidden = true;
    document.body.classList.remove('is-modal-open');
    if (image) {
      image.removeAttribute('src');
      image.alt = '';
    }
    if (lastFocused) {
      lastFocused.focus();
    }
  };

  const openModal = (tile) => {
    if (!modal) return;
    const image = modal.querySelector('img');
    const caption = modal.querySelector('[data-works-caption]');

    if (image) {
      image.src = tile.dataset.image || '';
      image.alt = tile.dataset.alt || tile.dataset.title || '';
    }
    if (caption) {
      caption.textContent = tile.dataset.title || '';
    }

    lastFocused = tile;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-modal-open');

    const closeButton = modal.querySelector('[data-works-close]');
    if (closeButton) {
      closeButton.focus();
    }
  };

  if (modal) {
    const closeButton = modal.querySelector('[data-works-close]');
    if (closeButton) {
      closeButton.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    });
  }

  tiles.forEach((tile) => {
    tile.addEventListener('click', () => {
      openModal(tile);
    });
  });

  updateFilters();
})();

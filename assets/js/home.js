const projectLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = [...document.querySelectorAll('main section[id]')];
const filterChips = [...document.querySelectorAll('.filter-chip')];
const projectCards = [...document.querySelectorAll('.project-card[data-tags]')];
const projectSearch = document.getElementById('project-search');
const projectEmpty = document.querySelector('.project-empty');
const copyDiscordButton = document.getElementById('copy-discord');
const counterElements = [...document.querySelectorAll('[data-count]')];

if (projectLinks.length && sections.length) {
  const setActive = () => {
    const scrollBottom = window.scrollY + window.innerHeight;
    const pageBottom = document.documentElement.scrollHeight - 24;
    let current = sections[0];

    if (scrollBottom >= pageBottom) {
      current = sections[sections.length - 1];
    } else {
      const viewportTarget = window.scrollY + (window.innerHeight * 0.35);
      current = sections.findLast((section) => viewportTarget >= section.offsetTop) || sections[0];
    }

    projectLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${current.id}`;
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  window.addEventListener('scroll', setActive, { passive: true });
  window.addEventListener('resize', setActive);
  setActive();
}

if (counterElements.length) {
  const animateCounter = (element) => {
    const target = Number(element.dataset.count || 0);
    const duration = 900;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(target * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      animateCounter(entry.target);
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.45 });

  counterElements.forEach((element) => observer.observe(element));
}

if (filterChips.length && projectCards.length) {
  let activeFilter = 'all';

  const applyProjectFilters = () => {
    const searchTerm = (projectSearch?.value || '').trim().toLowerCase();
    let visibleCount = 0;

    projectCards.forEach((card) => {
      const tags = (card.dataset.tags || '').toLowerCase();
      const name = (card.dataset.name || '').toLowerCase();
      const text = card.textContent.toLowerCase();
      const filterMatch = activeFilter === 'all' || tags.includes(activeFilter);
      const searchMatch = !searchTerm || name.includes(searchTerm) || text.includes(searchTerm);
      const isVisible = filterMatch && searchMatch;

      card.classList.toggle('is-hidden', !isVisible);

      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (projectEmpty) {
      projectEmpty.hidden = visibleCount !== 0;
    }
  };

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      activeFilter = chip.dataset.filter || 'all';

      filterChips.forEach((button) => {
        button.classList.toggle('is-active', button === chip);
      });

      applyProjectFilters();
    });
  });

  if (projectSearch) {
    projectSearch.addEventListener('input', applyProjectFilters);
  }

  applyProjectFilters();
}

if (copyDiscordButton) {
  const defaultLabel = copyDiscordButton.textContent;

  copyDiscordButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('https://discord.gg/ZMje3neEmK');
      copyDiscordButton.textContent = 'Copied';
    } catch {
      copyDiscordButton.textContent = 'Copy failed';
    }

    window.setTimeout(() => {
      copyDiscordButton.textContent = defaultLabel;
    }, 1400);
  });
}

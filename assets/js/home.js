/* =========================================================
   PluggLAB — home.js
   Homepage-only behavior: scrollspy, counters, project
   filter + search.
   ========================================================= */
(() => {
  "use strict";

  const projectLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = [...document.querySelectorAll("main section[id]")];
  const filterChips = [...document.querySelectorAll(".filter-chip")];
  const projectCards = [...document.querySelectorAll(".project-card[data-tags]")];
  const projectSearch = document.getElementById("project-search");
  const projectEmpty = document.querySelector(".project-empty");
  const projectResults = document.getElementById("project-results");
  const counterElements = [...document.querySelectorAll("[data-count]")];

  /* ---------------- SCROLLSPY ---------------- */
  if (projectLinks.length && sections.length) {
    const setActive = () => {
      const scrollBottom = window.scrollY + window.innerHeight;
      const pageBottom = document.documentElement.scrollHeight - 24;
      let current = sections[0];

      if (scrollBottom >= pageBottom) {
        current = sections[sections.length - 1];
      } else {
        const viewportTarget = window.scrollY + window.innerHeight * 0.35;
        for (let i = sections.length - 1; i >= 0; i -= 1) {
          if (viewportTarget >= sections[i].offsetTop) { current = sections[i]; break; }
        }
      }

      projectLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${current.id}`) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    };
    window.addEventListener("scroll", setActive, { passive: true });
    window.addEventListener("resize", setActive);
    setActive();
  }

  /* ---------------- ANIMATED COUNTERS ---------------- */
  if (counterElements.length) {
    const animateCounter = (element) => {
      const target = Number(element.dataset.count || 0);
      const duration = 900;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = String(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.45 });
      counterElements.forEach((el) => observer.observe(el));
    } else {
      counterElements.forEach(animateCounter);
    }
  }

  /* ---------------- PROJECT FILTER + SEARCH ---------------- */
  if (filterChips.length && projectCards.length) {
    let activeFilter = "all";

    const applyProjectFilters = () => {
      const searchTerm = (projectSearch?.value || "").trim().toLowerCase();
      let visibleCount = 0;

      projectCards.forEach((card) => {
        const tags = (card.dataset.tags || "").toLowerCase();
        const name = (card.dataset.name || "").toLowerCase();
        const text = card.textContent.toLowerCase();
        const filterMatch = activeFilter === "all" || tags.includes(activeFilter);
        const searchMatch = !searchTerm || name.includes(searchTerm) || text.includes(searchTerm);
        const isVisible = filterMatch && searchMatch;
        card.classList.toggle("is-hidden", !isVisible);
        if (isVisible) visibleCount += 1;
      });

      if (projectEmpty) projectEmpty.hidden = visibleCount !== 0;

      if (projectResults) {
        const filterLabel = activeFilter === "all" ? "projects" : `${activeFilter} projects`;
        projectResults.textContent = searchTerm
          ? `Showing ${visibleCount} result${visibleCount === 1 ? "" : "s"} for "${searchTerm}" in ${filterLabel}`
          : `Showing ${visibleCount} ${filterLabel}`;
      }
    };

    filterChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        activeFilter = chip.dataset.filter || "all";
        filterChips.forEach((button) => button.classList.toggle("is-active", button === chip));
        applyProjectFilters();
      });
    });

    if (projectSearch) projectSearch.addEventListener("input", applyProjectFilters);
    applyProjectFilters();
  }

  /* ---------------- LIVE VERSION LOOKUP (Modrinth) ---------------- */
  async function loadModrinthVersions() {
    const cards = document.querySelectorAll(".project-card[data-modrinth]");
    cards.forEach(async (card) => {
      const projectId = card.dataset.modrinth;
      if (!projectId) return;
      try {
        const res = await fetch(`https://api.modrinth.com/v2/project/${projectId}/version`);
        if (!res.ok) return;
        const versions = await res.json();
        if (!versions.length) return;
        const versionEl = document.createElement("div");
        versionEl.className = "project-version";
        versionEl.textContent = `Version ${versions[0].version_number}`;
        card.querySelector("h3")?.after(versionEl);
      } catch (err) {
        console.warn(`[modrinth] lookup failed for ${projectId}`, err);
      }
    });
  }
  loadModrinthVersions();
})();

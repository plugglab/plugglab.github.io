/* =========================================================
   PluggLAB — main.js
   Shared behaviors for every page: nav, ambient canvas,
   toasts, command palette, back-to-top, scroll reveal.
   ========================================================= */
(() => {
  "use strict";

  /* ---------------- NAV ---------------- */
  const navbar = document.querySelector(".navbar");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  let lastScroll = window.pageYOffset;

  if (navbar && navToggle && navLinks) {
    const setMenu = (open) => {
      navLinks.classList.toggle("nav-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    };
    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      setMenu(!navLinks.classList.contains("nav-open"));
    });
    navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("click", (e) => {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) setMenu(false);
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
    window.addEventListener("scroll", () => {
      const current = window.pageYOffset;
      if (current > lastScroll && current > 80) navbar.classList.add("nav-hidden");
      else navbar.classList.remove("nav-hidden");
      lastScroll = current;
    }, { passive: true });
    window.addEventListener("resize", () => { if (window.innerWidth > 820) setMenu(false); });
  }

  /* ---------------- ACTIVE NAV LINK (by path) ---------------- */
  (() => {
    const path = window.location.pathname.replace(/index\.html$/, "");
    document.querySelectorAll(".nav-links a, .footer-col a").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto")) return;
      try {
        const resolved = new URL(href, window.location.href).pathname.replace(/index\.html$/, "");
        if (resolved === path && resolved !== "/") link.setAttribute("aria-current", "page");
      } catch (_) { /* noop */ }
    });
  })();

  /* ---------------- SMOOTH ANCHOR SCROLL ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", targetId);
    });
  });

  /* ---------------- SCROLL REVEAL ---------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------- TOASTS ---------------- */
  const ensureStack = () => {
    let stack = document.getElementById("toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.id = "toast-stack";
      stack.setAttribute("aria-live", "polite");
      document.body.appendChild(stack);
    }
    return stack;
  };

  window.plugglabToast = (message, type = "success") => {
    const stack = ensureStack();
    const toast = document.createElement("div");
    toast.className = "toast" + (type === "error" ? " toast-error" : "");
    const icon = type === "error"
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>';
    toast.innerHTML = icon + "<span></span>";
    toast.querySelector("span").textContent = message;
    stack.appendChild(toast);
    window.setTimeout(() => {
      toast.classList.add("toast-leaving");
      toast.addEventListener("animationend", () => toast.remove());
    }, 3200);
  };

  /* ---------------- COPY DISCORD ---------------- */
  const copyDiscordButton = document.getElementById("copy-discord");
  if (copyDiscordButton) {
    copyDiscordButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText("https://discord.gg/ZMje3neEmK");
        window.plugglabToast("Discord invite copied to clipboard.");
      } catch {
        window.plugglabToast("Could not copy — copy it manually instead.", "error");
      }
    });
  }

  /* ---------------- BACK TO TOP ---------------- */
  const backToTop = document.createElement("button");
  backToTop.id = "back-to-top";
  backToTop.type = "button";
  backToTop.setAttribute("aria-label", "Back to top");
  backToTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(backToTop);
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => {
    backToTop.classList.toggle("is-visible", window.scrollY > 640);
  }, { passive: true });

  /* ---------------- COMMAND PALETTE ---------------- */
  const ROOT = (() => {
    // Compute relative prefix to site root from current path depth.
    const parts = window.location.pathname.split("/").filter(Boolean);
    const depth = parts.length && parts[parts.length - 1].includes(".") ? parts.length - 1 : parts.length;
    return depth > 0 ? "../".repeat(depth) : "./";
  })();

  const COMMANDS = [
    { label: "Home", desc: "Back to the lab overview", href: ROOT, icon: "home" },
    { label: "Projects", desc: "Browse every plugin & pack", href: ROOT + "#projects", icon: "grid" },
    { label: "MemoryChain", desc: "Shared plugin architecture", href: ROOT + "memorychain/", icon: "link" },
    { label: "PulseEvents", desc: "Dynamic event system", href: ROOT + "pulseevents/", icon: "zap" },
    { label: "PulseEvents Docs", desc: "Custom events reference", href: ROOT + "pulseevents/docs/", icon: "book" },
    { label: "Casino Core", desc: "Modular casino engine", href: ROOT + "casinocore/", icon: "coin" },
    { label: "Casino Core Docs", desc: "PlaceholderAPI reference", href: ROOT + "casinocore/docs/", icon: "book" },
    { label: "SafeTrade", desc: "Anti-scam trading utility", href: ROOT + "safetrade/", icon: "shield" },
    { label: "NovaPixel", desc: "Competitive PvP texture pack", href: ROOT + "novapixel/", icon: "pack" },
    { label: "PvPFlow", desc: "1.8 PvP visual pack", href: ROOT + "pvpflow/", icon: "pack" },
    { label: "Release Queue", desc: "Track approval status", href: ROOT + "download-pending.html", icon: "clock" },
    { label: "Changelog", desc: "Live plugin status & versions", href: ROOT + "changelog/", icon: "activity" },
    { label: "Contact", desc: "Email, Discord, or form", href: ROOT + "contact/", icon: "mail" },
    { label: "Discord", desc: "Join the community server", href: "https://discord.gg/ZMje3neEmK", icon: "discord" },
  ];

  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    link: '<path d="M9 17H7a5 5 0 010-10h2"/><path d="M15 7h2a5 5 0 010 10h-2"/><path d="M8 12h8"/>',
    zap: '<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 016.5 2H20v17H6.5A2.5 2.5 0 004 16.5v-12z"/><path d="M4 16.5A2.5 2.5 0 016.5 19H20"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M9 12h6M12 9v6"/>',
    shield: '<path d="M12 2 4 5v6c0 5 3.4 8.7 8 9 4.6-.3 8-4 8-9V5l-8-3z"/>',
    pack: '<path d="M3 7 12 3l9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    discord: '<path d="M8 9c.5 3 3.5 3 4 3s3.5 0 4-3M6 17c-3 0-4-3-4-6 0-4 2-8 4-8 1 0 1.5 1 2 2M18 17c3 0 4-3 4-6 0-4-2-8-4-8-1 0-1.5 1-2 2M8.5 17.5c0 1-1 1.8-1 1.8M15.5 17.5c0 1 1 1.8 1 1.8"/>'
  };

  const overlay = document.createElement("div");
  overlay.id = "command-overlay";
  overlay.innerHTML = `
    <div class="command-palette" role="dialog" aria-modal="true" aria-label="Quick navigation">
      <div class="command-input-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input id="command-input" type="text" placeholder="Jump to a project or page…" autocomplete="off" spellcheck="false">
        <span class="kbd-esc">ESC</span>
      </div>
      <div class="command-results" id="command-results"></div>
    </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector("#command-input");
  const resultsEl = overlay.querySelector("#command-results");
  let activeIndex = 0;
  let currentMatches = [];

  const renderResults = (query) => {
    const q = query.trim().toLowerCase();
    currentMatches = COMMANDS.filter((c) =>
      !q || c.label.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
    );
    activeIndex = 0;

    if (!currentMatches.length) {
      resultsEl.innerHTML = '<p class="command-empty">No matches. Try “docs”, “discord”, or a project name.</p>';
      return;
    }

    resultsEl.innerHTML = currentMatches.map((c, i) => `
      <a class="command-item${i === 0 ? " is-active" : ""}" href="${c.href}" data-index="${i}" ${c.href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ICONS[c.icon] || ICONS.link}</svg>
        <span><strong>${c.label}</strong><small>${c.desc}</small></span>
      </a>`).join("");
  };

  const openPalette = () => {
    overlay.classList.add("is-open");
    renderResults("");
    input.value = "";
    window.setTimeout(() => input.focus(), 30);
    document.body.style.overflow = "hidden";
  };
  const closePalette = () => {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  document.querySelectorAll("[data-open-command]").forEach((btn) => btn.addEventListener("click", openPalette));
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closePalette(); });
  input.addEventListener("input", () => renderResults(input.value));
  document.addEventListener("keydown", (e) => {
    const isTypingField = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName) && document.activeElement !== input;
    if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      overlay.classList.contains("is-open") ? closePalette() : openPalette();
      return;
    }
    if (e.key === "/" && !isTypingField && document.activeElement !== input) {
      e.preventDefault();
      openPalette();
      return;
    }
    if (!overlay.classList.contains("is-open")) return;
    if (e.key === "Escape") { closePalette(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, currentMatches.length - 1);
      resultsEl.querySelectorAll(".command-item").forEach((el, i) => el.classList.toggle("is-active", i === activeIndex));
      resultsEl.querySelectorAll(".command-item")[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      resultsEl.querySelectorAll(".command-item").forEach((el, i) => el.classList.toggle("is-active", i === activeIndex));
      resultsEl.querySelectorAll(".command-item")[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
    if (e.key === "Enter" && currentMatches[activeIndex]) {
      window.location.href = currentMatches[activeIndex].href;
    }
  });

  /* ---------------- SOUL DRIFT — ambient particle canvas ---------------- */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReducedMotion) {
    const canvas = document.createElement("canvas");
    canvas.id = "soul-drift";
    canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);
    const ctx = canvas.getContext("2d");
    let w, h, particles;
    const COLORS = ["139,43,226", "77,201,255", "246,193,67", "192,25,47"];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const spawn = () => {
      const count = Math.min(46, Math.floor((w * h) / 42000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.5,
        speedY: -(Math.random() * 0.22 + 0.05),
        speedX: (Math.random() - 0.5) * 0.15,
        drift: Math.random() * Math.PI * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.35 + 0.08,
      }));
    };

    resize();
    spawn();
    window.addEventListener("resize", () => { resize(); spawn(); });

    let raf;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.drift += 0.006;
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.drift) * 0.08;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    };
    tick();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else tick();
    });
  }
})();

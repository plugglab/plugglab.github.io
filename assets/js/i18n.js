/* =========================================================
   PluggLAB — i18n.js
   JSON-driven translation engine.
   Usage:
     <span data-i18n="nav.home">Home</span>
     <input data-i18n-attr="placeholder:contact.form.namePlaceholder">
     <meta data-i18n-attr="content:meta.description">
   Falls back to English automatically for any missing key,
   and to the original DOM text if a translation file fails
   to load (e.g. opened from disk without a server).
   ========================================================= */
(() => {
  "use strict";

  const STORAGE_KEY = "plugglab-language";
  const SUPPORTED = ["en", "pl"];
  const LABELS = { en: "EN", pl: "PL" };

  const rootPrefix = (() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const depth = parts.length && parts[parts.length - 1].includes(".") ? parts.length - 1 : parts.length;
    return depth > 0 ? "../".repeat(depth) : "./";
  })();

  const cache = {};

  const getPath = (obj, path) => path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

  const detectLanguage = () => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.includes(saved)) return saved;
    } catch (_) { /* localStorage may be unavailable */ }
    const browserLang = (navigator.language || "en").toLowerCase();
    return browserLang.startsWith("pl") ? "pl" : "en";
  };

  const loadLanguage = async (lang) => {
    if (cache[lang]) return cache[lang];
    try {
      const res = await fetch(`${rootPrefix}assets/i18n/${lang}.json`, { cache: "no-store" });
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      cache[lang] = data;
      return data;
    } catch (err) {
      console.warn(`[i18n] Could not load "${lang}" translations, using inline defaults.`, err);
      return null;
    }
  };

  const applyTranslations = (data) => {
    if (!data) return;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = getPath(data, el.getAttribute("data-i18n"));
      if (typeof value === "string") el.textContent = value;
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const value = getPath(data, el.getAttribute("data-i18n-html"));
      if (typeof value === "string") el.innerHTML = value;
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.getAttribute("data-i18n-attr").split(";").forEach((rule) => {
        const [attr, key] = rule.split(":").map((s) => s && s.trim());
        if (!attr || !key) return;
        const value = getPath(data, key);
        if (typeof value === "string") el.setAttribute(attr, value);
      });
    });

    document.querySelectorAll("[data-i18n-list]").forEach((el) => {
      const value = getPath(data, el.getAttribute("data-i18n-list"));
      if (Array.isArray(value)) {
        const children = Array.from(el.children);
        value.forEach((text, i) => { if (children[i]) children[i].textContent = text; });
      }
    });
  };

  const updateSwitcherButtons = (lang) => {
    document.querySelectorAll(".lang-button").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
    });
  };

  const insertSwitcher = (lang) => {
    const navMenuRow = document.querySelector(".nav-menu-row");
    if (!navMenuRow || navMenuRow.querySelector(".lang-switcher")) return;

    const switcher = document.createElement("div");
    switcher.className = "lang-switcher";
    switcher.setAttribute("role", "group");
    switcher.setAttribute("aria-label", "Language");

    SUPPORTED.forEach((code) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lang-button";
      button.dataset.lang = code;
      button.textContent = LABELS[code];
      button.setAttribute("aria-pressed", String(code === lang));
      button.addEventListener("click", () => {
        try { window.localStorage.setItem(STORAGE_KEY, code); } catch (_) { /* noop */ }
        setLanguage(code);
      });
      switcher.appendChild(button);
    });

    const navToggle = navMenuRow.querySelector(".nav-toggle");
    navMenuRow.insertBefore(switcher, navToggle || null);
  };

  async function setLanguage(lang) {
    const resolved = SUPPORTED.includes(lang) ? lang : "en";
    document.documentElement.lang = resolved;
    updateSwitcherButtons(resolved);

    let data = await loadLanguage(resolved);
    if (!data && resolved !== "en") data = await loadLanguage("en");
    applyTranslations(data);
    document.dispatchEvent(new CustomEvent("plugglab:language-changed", { detail: { lang: resolved, data } }));
  }

  window.plugglabI18n = { setLanguage, getLanguage: detectLanguage };

  const initial = detectLanguage();
  insertSwitcher(initial);
  setLanguage(initial);
})();

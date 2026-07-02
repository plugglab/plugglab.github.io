/* =========================================================
   PluggLAB — status.js
   Renders the live plugin status board on /changelog/ from
   the same status.json feed the Android app consumes.
   ========================================================= */
(() => {
  "use strict";

  const tableBody = document.getElementById("status-table-body");
  const loadingEl = document.getElementById("status-loading");
  const errorEl = document.getElementById("status-error");
  if (!tableBody) return;

  const DISPLAY_NAMES = {
    CoreCasino: "Casino Core",
    CasinoCoreDemo: "Casino Core (Demo)",
  };

  const STATUS_LABELS = {
    operational: "Operational",
    testing: "Testing",
    down: "Down",
    maintenance: "Maintenance",
    degraded: "Degraded",
    unknown: "Unknown",
  };

  const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));

  const renderRow = (plugin) => {
    const status = (plugin.status || "unknown").toLowerCase();
    const name = DISPLAY_NAMES[plugin.name] || plugin.name;
    const hasDownload = plugin.download && plugin.download !== "None" && plugin.download !== "Null";
    const version = plugin.version && plugin.version !== "0.0.0" ? plugin.version : "—";
    const updated = plugin.lastUpdate && plugin.lastUpdate !== "0000-00-00" ? plugin.lastUpdate : "—";

    return `
      <tr>
        <td class="st-name">${escapeHtml(name)}</td>
        <td class="st-status"><span class="status-dot st-${escapeHtml(status)}"></span>${escapeHtml(STATUS_LABELS[status] || status)}</td>
        <td class="st-version">${escapeHtml(version)}</td>
        <td class="st-updated">${escapeHtml(updated)}</td>
        <td class="st-download">${hasDownload ? `<a href="${escapeHtml(plugin.download)}" target="_blank" rel="noopener">Modrinth ↗</a>` : "—"}</td>
      </tr>`;
  };

  (async () => {
    try {
      const res = await fetch("../status.json", { cache: "no-store" });
      if (!res.ok) throw new Error("status.json request failed");
      const data = await res.json();
      const plugins = Array.isArray(data.plugins) ? data.plugins : [];

      if (!plugins.length) throw new Error("empty status feed");

      tableBody.innerHTML = plugins.map(renderRow).join("");
      loadingEl?.setAttribute("hidden", "");
    } catch (err) {
      console.warn("[status] could not load status.json", err);
      loadingEl?.setAttribute("hidden", "");
      errorEl?.removeAttribute("hidden");
    }
  })();

  // Latest stable Casino Core build, shown as a small callout if present.
  (async () => {
    const stableEl = document.getElementById("stable-callout");
    if (!stableEl) return;
    try {
      const res = await fetch("../stable.json", { cache: "no-store" });
      if (!res.ok) throw new Error("stable.json request failed");
      const data = await res.json();
      if (data.latestVersion) {
        stableEl.hidden = false;
        stableEl.querySelector(".stable-version").textContent = `v${data.latestVersion}`;
        const link = stableEl.querySelector(".stable-link");
        if (link && data.downloadUrl) link.href = data.downloadUrl;
      }
    } catch (err) {
      console.warn("[status] could not load stable.json", err);
    }
  })();
})();

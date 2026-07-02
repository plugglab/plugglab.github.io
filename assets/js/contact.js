/* =========================================================
   PluggLAB — contact.js
   Builds a pre-filled mailto: link from the quick message
   form. Nothing is transmitted or stored by this page.
   ========================================================= */
(() => {
  "use strict";

  const form = document.getElementById("quick-message-form");
  if (!form) return;

  const statusEl = document.getElementById("quick-message-status");
  const honeypot = form.querySelector('input[name="company"]');

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Honeypot — silently succeed for bots without sending anything.
    if (honeypot && honeypot.value.trim() !== "") return;

    const name = form.querySelector("#qm-name")?.value.trim() || "";
    const email = form.querySelector("#qm-email")?.value.trim() || "";
    const topic = form.querySelector("#qm-topic")?.value || "";
    const message = form.querySelector("#qm-message")?.value.trim() || "";

    if (!name || !email || !message) {
      statusEl.textContent = "Please fill in your name, email, and a short message.";
      statusEl.className = "form-status is-error";
      return;
    }

    const subject = encodeURIComponent(`[PluggLAB] ${topic || "Message"} — from ${name}`);
    const body = encodeURIComponent(`${message}\n\n—\n${name}\n${email}`);
    const mailto = `mailto:voidspire.contact@gmail.com?subject=${subject}&body=${body}`;

    window.location.href = mailto;
    statusEl.textContent = "Opening your email app…";
    statusEl.className = "form-status is-success";
    window.plugglabToast?.("Opening your email app.");
  });
})();

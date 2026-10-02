(() => {
  "use strict";

  const STORAGE_ENTRIES = "ember.v1.entries";
  const STORAGE_SETTINGS = "ember.v1.settings";

  const THEMES = {
    blue:     { accent: "#1687ff", accent2: "#49b0ff", soft: "rgba(22,135,255,.13)", shadow: "rgba(22,135,255,.24)" },
    teal:     { accent: "#18b9b2", accent2: "#51d6cf", soft: "rgba(24,185,178,.13)", shadow: "rgba(24,185,178,.23)" },
    green:    { accent: "#32b46f", accent2: "#60d18e", soft: "rgba(50,180,111,.13)", shadow: "rgba(50,180,111,.22)" },
    violet:   { accent: "#7557f5", accent2: "#a18cff", soft: "rgba(117,87,245,.13)", shadow: "rgba(117,87,245,.22)" },
    orange:   { accent: "#e47d3c", accent2: "#f0a25f", soft: "rgba(228,125,60,.13)", shadow: "rgba(228,125,60,.22)" },
    graphite: { accent: "#566170", accent2: "#7b8797", soft: "rgba(86,97,112,.13)", shadow: "rgba(86,97,112,.20)" }
  };

  const els = {
    dateLabel: document.getElementById("dateLabel"),
    todayCount: document.getElementById("todayCount"),
    limitCount: document.getElementById("limitCount"),
    remainingText: document.getElementById("remainingText"),
    progressCircle: document.getElementById("progressCircle"),
    addButton: document.getElementById("addButton"),
    lastTime: document.getElementById("lastTime"),
    lastRelative: document.getElementById("lastRelative"),
    entryCountLabel: document.getElementById("entryCountLabel"),
    entryList: document.getElementById("entryList"),
    emptyState: document.getElementById("emptyState"),
    settingsButton: document.getElementById("settingsButton"),
    settingsSheet: document.getElementById("settingsSheet"),
    closeSettingsButton: document.getElementById("closeSettingsButton"),
    sheetBackdrop: document.getElementById("sheetBackdrop"),
    settingsLimitValue: document.getElementById("settingsLimitValue"),
    limitMinus: document.getElementById("limitMinus"),
    limitPlus: document.getElementById("limitPlus"),
    themeGrid: document.getElementById("themeGrid"),
    editSheet: document.getElementById("editSheet"),
    cancelEditButton: document.getElementById("cancelEditButton"),
    saveEditButton: document.getElementById("saveEditButton"),
    deleteEntryButton: document.getElementById("deleteEntryButton"),
    editTime: document.getElementById("editTime"),
    toast: document.getElementById("toast"),
    toastText: document.getElementById("toastText"),
    undoButton: document.getElementById("undoButton")
  };

  let entries = loadEntries();
  let settings = loadSettings();
  let lastAddedId = null;
  let toastTimer = null;
  let editingId = null;

  function loadEntries() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_ENTRIES) || "[]");
      if (!Array.isArray(raw)) return [];
      return raw
        .filter(item => item && typeof item.id === "string" && typeof item.time === "string" && !Number.isNaN(Date.parse(item.time)))
        .sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
    } catch {
      return [];
    }
  }

  function loadSettings() {
    const fallback = { limit: 20, theme: "blue" };
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_SETTINGS) || "{}");
      const limit = Number(raw.limit);
      const theme = THEMES[raw.theme] ? raw.theme : fallback.theme;
      return {
        limit: Number.isFinite(limit) ? clamp(Math.round(limit), 1, 99) : fallback.limit,
        theme
      };
    } catch {
      return fallback;
    }
  }

  function saveEntries() {
    localStorage.setItem(STORAGE_ENTRIES, JSON.stringify(entries));
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function startOfDay(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }

  function todaysEntries() {
    const start = startOfDay();
    const end = start + 86400000;
    return entries.filter(item => {
      const t = Date.parse(item.time);
      return t >= start && t < end;
    });
  }

  function formatTime(date) {
    return new Intl.DateTimeFormat("de-AT", { hour: "2-digit", minute: "2-digit" }).format(date);
  }

  function formatDate(date = new Date()) {
    const text = new Intl.DateTimeFormat("de-AT", {
      weekday: "long",
      day: "numeric",
      month: "long"
    }).format(date);
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function relativeTime(date) {
    const diffMs = Date.now() - date.getTime();
    const mins = Math.max(0, Math.floor(diffMs / 60000));
    if (mins < 1) return "gerade eben";
    if (mins === 1) return "vor 1 Min.";
    if (mins < 60) return `vor ${mins} Min.`;
    const hours = Math.floor(mins / 60);
    if (hours === 1) return "vor 1 Std.";
    return `vor ${hours} Std.`;
  }

  function entryLabel(count) {
    return count === 1 ? "1 Eintrag" : `${count} Eintraege`;
  }

  function applyTheme() {
    const theme = THEMES[settings.theme] || THEMES.blue;
    const root = document.documentElement;
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-2", theme.accent2);
    root.style.setProperty("--accent-soft", theme.soft);
    root.style.setProperty("--accent-shadow", theme.shadow);

    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#f2f7ff");
    els.themeGrid.querySelectorAll(".theme-swatch").forEach(button => {
      button.setAttribute("aria-checked", String(button.dataset.theme === settings.theme));
      button.setAttribute("role", "radio");
    });
  }

  function render() {
    const today = todaysEntries();
    const count = today.length;
    const limit = settings.limit;
    const progress = clamp(count / limit, 0, 1);

    els.dateLabel.textContent = formatDate();
    els.todayCount.textContent = String(count);
    els.limitCount.textContent = String(limit);
    els.remainingText.textContent = count < limit ? `${limit - count} verbleibend` : count === limit ? "Limit erreicht" : `${count - limit} ueber Limit`;
    els.progressCircle.style.strokeDashoffset = String(100 - progress * 100);
    els.settingsLimitValue.textContent = String(limit);
    els.entryCountLabel.textContent = entryLabel(count);

    const newest = today[today.length - 1];
    if (newest) {
      const date = new Date(newest.time);
      els.lastTime.textContent = formatTime(date);
      els.lastRelative.textContent = relativeTime(date);
    } else {
      els.lastTime.textContent = "–";
      els.lastRelative.textContent = "Noch kein Eintrag";
    }

    els.entryList.innerHTML = "";
    const newestFirst = [...today].reverse();
    newestFirst.forEach((entry, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "entry-row";
      button.dataset.id = entry.id;
      button.innerHTML = `
        <span class="entry-dot" aria-hidden="true"></span>
        <span class="entry-time">${escapeHtml(formatTime(new Date(entry.time)))}</span>
        <span class="entry-number">${count - index}.</span>
      `;
      button.setAttribute("aria-label", `Eintrag ${count - index} um ${formatTime(new Date(entry.time))} bearbeiten`);
      button.addEventListener("click", () => openEdit(entry.id));
      els.entryList.appendChild(button);
    });
    els.emptyState.hidden = count > 0;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));
  }

  function addEntry() {
    const entry = { id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`, time: new Date().toISOString() };
    entries.push(entry);
    entries.sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
    saveEntries();
    lastAddedId = entry.id;
    render();
    showToast(`Zigarette um ${formatTime(new Date(entry.time))} gespeichert`, true);
  }

  function undoLastAdd() {
    if (!lastAddedId) return;
    const before = entries.length;
    entries = entries.filter(item => item.id !== lastAddedId);
    if (entries.length !== before) {
      saveEntries();
      render();
      showToast("Eintrag entfernt", false);
    }
    lastAddedId = null;
  }

  function showToast(text, withUndo) {
    clearTimeout(toastTimer);
    els.toastText.textContent = text;
    els.undoButton.hidden = !withUndo;
    els.toast.setAttribute("aria-hidden", "false");
    els.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(hideToast, 4200);
  }

  function hideToast() {
    els.toast.classList.remove("is-visible");
    els.toast.setAttribute("aria-hidden", "true");
  }

  function openSheet(sheet) {
    els.sheetBackdrop.hidden = false;
    requestAnimationFrame(() => sheet.classList.add("is-open"));
    sheet.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeSheets() {
    els.settingsSheet.classList.remove("is-open");
    els.editSheet.classList.remove("is-open");
    els.settingsSheet.setAttribute("aria-hidden", "true");
    els.editSheet.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      if (!els.settingsSheet.classList.contains("is-open") && !els.editSheet.classList.contains("is-open")) {
        els.sheetBackdrop.hidden = true;
        document.body.style.overflow = "";
      }
    }, 280);
  }

  function openEdit(id) {
    const entry = entries.find(item => item.id === id);
    if (!entry) return;
    editingId = id;
    const date = new Date(entry.time);
    els.editTime.value = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    openSheet(els.editSheet);
  }

  function saveEditedEntry() {
    const entry = entries.find(item => item.id === editingId);
    if (!entry || !els.editTime.value) return;
    const [hours, minutes] = els.editTime.value.split(":").map(Number);
    const date = new Date(entry.time);
    date.setHours(hours, minutes, 0, 0);
    entry.time = date.toISOString();
    entries.sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
    saveEntries();
    closeSheets();
    render();
    showToast("Eintrag aktualisiert", false);
  }

  function deleteEditedEntry() {
    if (!editingId) return;
    entries = entries.filter(item => item.id !== editingId);
    saveEntries();
    editingId = null;
    closeSheets();
    render();
    showToast("Eintrag geloescht", false);
  }

  els.addButton.addEventListener("click", addEntry);
  els.undoButton.addEventListener("click", undoLastAdd);
  els.settingsButton.addEventListener("click", () => openSheet(els.settingsSheet));
  els.closeSettingsButton.addEventListener("click", closeSheets);
  els.sheetBackdrop.addEventListener("click", closeSheets);
  els.cancelEditButton.addEventListener("click", closeSheets);
  els.saveEditButton.addEventListener("click", saveEditedEntry);
  els.deleteEntryButton.addEventListener("click", deleteEditedEntry);

  els.limitMinus.addEventListener("click", () => {
    settings.limit = clamp(settings.limit - 1, 1, 99);
    saveSettings();
    render();
  });
  els.limitPlus.addEventListener("click", () => {
    settings.limit = clamp(settings.limit + 1, 1, 99);
    saveSettings();
    render();
  });
  els.themeGrid.addEventListener("click", event => {
    const button = event.target.closest(".theme-swatch");
    if (!button || !THEMES[button.dataset.theme]) return;
    settings.theme = button.dataset.theme;
    saveSettings();
    applyTheme();
    render();
  });

  window.setInterval(() => {
    const today = todaysEntries();
    const newest = today[today.length - 1];
    if (newest) els.lastRelative.textContent = relativeTime(new Date(newest.time));
  }, 30000);

  window.addEventListener("focus", render);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });

  applyTheme();
  render();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
  }
})();

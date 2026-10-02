(() => {
  "use strict";

  const STORAGE_ENTRIES = "ember.v1.entries";
  const STORAGE_SETTINGS = "ember.v1.settings";
  const THEMES = {
    blue: { themeColor: "#f4f7fb" },
    terracotta: { themeColor: "#faf4ed" },
    green: { themeColor: "#f4f6f0" },
    violet: { themeColor: "#111426" }
  };
  const THEME_MIGRATION = { orange: "terracotta", teal: "blue", graphite: "violet" };

  const $ = id => document.getElementById(id);
  const els = {
    dateLabel: $("dateLabel"), todayCount: $("todayCount"), limitCount: $("limitCount"), remainingText: $("remainingText"), progressCircle: $("progressCircle"),
    addButton: $("addButton"), lastCard: $("lastCard"), lastTime: $("lastTime"), lastRelative: $("lastRelative"), entryCountLabel: $("entryCountLabel"), entryList: $("entryList"), emptyState: $("emptyState"),
    settingsButton: $("settingsButton"), analysisButton: $("analysisButton"), sheetBackdrop: $("sheetBackdrop"), settingsSheet: $("settingsSheet"), analysisSheet: $("analysisSheet"), editSheet: $("editSheet"),
    closeSettingsButton: $("closeSettingsButton"), closeAnalysisButton: $("closeAnalysisButton"), cancelEditButton: $("cancelEditButton"), saveEditButton: $("saveEditButton"), deleteEntryButton: $("deleteEntryButton"), editTime: $("editTime"),
    limitMinus: $("limitMinus"), limitPlus: $("limitPlus"), settingsLimitValue: $("settingsLimitValue"), themeGrid: $("themeGrid"),
    analysisToday: $("analysisToday"), analysisRemaining: $("analysisRemaining"), analysisGap: $("analysisGap"), analysisLast: $("analysisLast"), weekChart: $("weekChart"),
    toast: $("toast"), toastText: $("toastText"), undoButton: $("undoButton")
  };

  let entries = loadEntries();
  let settings = loadSettings();
  let lastAddedId = null;
  let editingId = null;
  let toastTimer = null;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const dayStart = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const formatTime = date => new Intl.DateTimeFormat("de-AT", { hour: "2-digit", minute: "2-digit" }).format(date);
  function formatDate(date = new Date()) {
    const text = new Intl.DateTimeFormat("de-AT", { weekday: "long", day: "numeric", month: "long" }).format(date);
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  function relativeTime(date) {
    const mins = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
    if (mins < 1) return "gerade eben";
    if (mins === 1) return "vor 1 Min.";
    if (mins < 60) return `vor ${mins} Min.`;
    const hours = Math.floor(mins / 60);
    if (hours === 1) return "vor 1 Std.";
    if (hours < 24) return `vor ${hours} Std.`;
    return "früher";
  }
  const entryLabel = count => count === 1 ? "1 Eintrag" : `${count} Einträge`;
  const escapeHtml = value => String(value).replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));

  function loadEntries() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_ENTRIES) || "[]");
      if (!Array.isArray(raw)) return [];
      return raw.filter(item => item && typeof item.id === "string" && typeof item.time === "string" && !Number.isNaN(Date.parse(item.time))).sort((a,b) => Date.parse(a.time)-Date.parse(b.time));
    } catch { return []; }
  }
  function loadSettings() {
    const fallback = { limit: 20, theme: "blue" };
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_SETTINGS) || "{}");
      const migrated = THEME_MIGRATION[raw.theme] || raw.theme;
      return {
        limit: Number.isFinite(Number(raw.limit)) ? clamp(Math.round(Number(raw.limit)),1,99) : fallback.limit,
        theme: THEMES[migrated] ? migrated : fallback.theme
      };
    } catch { return fallback; }
  }
  const saveEntries = () => localStorage.setItem(STORAGE_ENTRIES, JSON.stringify(entries));
  const saveSettings = () => localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));

  function entriesForDay(startMs) {
    const end = startMs + 86400000;
    return entries.filter(item => { const t = Date.parse(item.time); return t >= startMs && t < end; });
  }
  const todaysEntries = () => entriesForDay(dayStart());

  function applyTheme() {
    document.documentElement.dataset.theme = settings.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEMES[settings.theme].themeColor);
    els.themeGrid.querySelectorAll(".theme-option").forEach(button => {
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(button.dataset.theme === settings.theme));
    });
  }

  function render() {
    const today = todaysEntries();
    const count = today.length;
    const limit = settings.limit;
    const newest = today[today.length - 1];
    const progress = clamp(count / limit, 0, 1);

    els.dateLabel.textContent = formatDate();
    els.todayCount.textContent = String(count);
    els.limitCount.textContent = String(limit);
    els.remainingText.textContent = count < limit ? `${limit-count} verbleibend` : count === limit ? "Limit erreicht" : `${count-limit} über Limit`;
    els.progressCircle.style.strokeDashoffset = String(100 - progress * 100);
    els.settingsLimitValue.textContent = String(limit);
    els.entryCountLabel.textContent = entryLabel(count);

    if (newest) {
      const date = new Date(newest.time);
      els.lastTime.textContent = formatTime(date);
      els.lastRelative.textContent = relativeTime(date);
      els.lastCard.disabled = false;
    } else {
      els.lastTime.textContent = "–";
      els.lastRelative.textContent = "Noch kein Eintrag";
      els.lastCard.disabled = true;
    }

    els.entryList.innerHTML = "";
    [...today].reverse().forEach((entry,index) => {
      const number = count-index;
      const time = formatTime(new Date(entry.time));
      const button = document.createElement("button");
      button.type = "button";
      button.className = "entry-row";
      button.setAttribute("aria-label", `Eintrag ${number} um ${time} bearbeiten`);
      button.innerHTML = `<span class="entry-dot" aria-hidden="true"></span><span class="entry-time">${escapeHtml(time)}</span><span class="entry-number">${number}.</span><span class="entry-chevron" aria-hidden="true">›</span>`;
      button.addEventListener("click", () => openEdit(entry.id));
      els.entryList.appendChild(button);
    });
    els.emptyState.hidden = count > 0;
    renderAnalysis();
  }

  function renderAnalysis() {
    const today = todaysEntries();
    const count = today.length;
    const newest = today[today.length-1];
    els.analysisToday.textContent = String(count);
    els.analysisRemaining.textContent = String(Math.max(settings.limit-count,0));
    els.analysisLast.textContent = newest ? formatTime(new Date(newest.time)) : "–";

    if (today.length >= 2) {
      let sum = 0;
      for (let i=1; i<today.length; i++) sum += Date.parse(today[i].time)-Date.parse(today[i-1].time);
      const avgMins = Math.round(sum/(today.length-1)/60000);
      els.analysisGap.textContent = avgMins >= 60 ? `${Math.floor(avgMins/60)}h ${avgMins%60}m` : `${avgMins} Min.`;
    } else {
      els.analysisGap.textContent = "–";
    }

    const days = [];
    const base = dayStart();
    for (let i=6; i>=0; i--) {
      const start = base-i*86400000;
      const date = new Date(start);
      days.push({start,date,count:entriesForDay(start).length});
    }
    const max = Math.max(settings.limit,...days.map(day => day.count),1);
    els.weekChart.innerHTML = "";
    days.forEach(day => {
      const col = document.createElement("div");
      col.className = "day-bar";
      const pct = Math.max(3,Math.round(day.count/max*100));
      const label = new Intl.DateTimeFormat("de-AT",{weekday:"short"}).format(day.date).replace(".","");
      col.innerHTML = `<span class="bar-count">${day.count}</span><span class="bar-track"><span class="bar-fill" style="height:${pct}%"></span></span><span class="bar-label">${escapeHtml(label)}</span>`;
      els.weekChart.appendChild(col);
    });
  }

  function addEntry() {
    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const entry = {id,time:new Date().toISOString()};
    entries.push(entry); entries.sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)); saveEntries();
    lastAddedId = id; render(); showToast(`Zigarette um ${formatTime(new Date(entry.time))} gespeichert`,true);
  }
  function undoLastAdd() {
    if (!lastAddedId) return;
    entries = entries.filter(item => item.id !== lastAddedId); saveEntries(); lastAddedId = null; render(); showToast("Eintrag entfernt",false);
  }
  function showToast(text,undo) {
    window.clearTimeout(toastTimer); els.toastText.textContent = text; els.undoButton.hidden = !undo; els.toast.classList.add("is-visible"); els.toast.setAttribute("aria-hidden","false");
    toastTimer = window.setTimeout(hideToast,4200);
  }
  function hideToast() { els.toast.classList.remove("is-visible"); els.toast.setAttribute("aria-hidden","true"); }

  function openSheet(sheet) {
    closeSheets(false); els.sheetBackdrop.hidden = false;
    requestAnimationFrame(() => { els.sheetBackdrop.classList.add("is-visible"); sheet.classList.add("is-open"); });
    sheet.setAttribute("aria-hidden","false"); document.body.style.overflow = "hidden";
  }
  function closeSheets(hideBackdrop=true) {
    [els.settingsSheet,els.analysisSheet,els.editSheet].forEach(sheet => { sheet.classList.remove("is-open"); sheet.setAttribute("aria-hidden","true"); });
    if (hideBackdrop) {
      els.sheetBackdrop.classList.remove("is-visible");
      window.setTimeout(() => { els.sheetBackdrop.hidden = true; document.body.style.overflow = ""; },220);
    }
  }

  function openEdit(id) {
    const entry = entries.find(item => item.id === id); if (!entry) return;
    editingId = id; const date = new Date(entry.time);
    els.editTime.value = `${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`;
    openSheet(els.editSheet);
  }
  function saveEditedEntry() {
    const entry = entries.find(item => item.id === editingId); if (!entry || !els.editTime.value) return;
    const [hour,minute] = els.editTime.value.split(":").map(Number); const date = new Date(entry.time); date.setHours(hour,minute,0,0); entry.time = date.toISOString();
    entries.sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)); saveEntries(); closeSheets(); render(); showToast("Eintrag aktualisiert",false);
  }
  function deleteEditedEntry() {
    if (!editingId) return; entries = entries.filter(item => item.id !== editingId); saveEntries(); editingId = null; closeSheets(); render(); showToast("Eintrag gelöscht",false);
  }

  els.addButton.addEventListener("click",addEntry);
  els.undoButton.addEventListener("click",undoLastAdd);
  els.analysisButton.addEventListener("click",() => { renderAnalysis(); openSheet(els.analysisSheet); });
  els.settingsButton.addEventListener("click",() => openSheet(els.settingsSheet));
  els.closeSettingsButton.addEventListener("click",() => closeSheets());
  els.closeAnalysisButton.addEventListener("click",() => closeSheets());
  els.sheetBackdrop.addEventListener("click",() => closeSheets());
  els.cancelEditButton.addEventListener("click",() => closeSheets());
  els.saveEditButton.addEventListener("click",saveEditedEntry);
  els.deleteEntryButton.addEventListener("click",deleteEditedEntry);
  els.lastCard.addEventListener("click",() => { const today = todaysEntries(); const newest = today[today.length-1]; if (newest) openEdit(newest.id); });
  els.limitMinus.addEventListener("click",() => { settings.limit = clamp(settings.limit-1,1,99); saveSettings(); render(); });
  els.limitPlus.addEventListener("click",() => { settings.limit = clamp(settings.limit+1,1,99); saveSettings(); render(); });
  els.themeGrid.addEventListener("click",event => {
    const button = event.target.closest(".theme-option"); if (!button || !THEMES[button.dataset.theme]) return;
    settings.theme = button.dataset.theme; saveSettings(); applyTheme(); render();
  });

  window.setInterval(() => { const today = todaysEntries(); const newest = today[today.length-1]; if (newest) els.lastRelative.textContent = relativeTime(new Date(newest.time)); },30000);
  window.addEventListener("focus",render);
  document.addEventListener("visibilitychange",() => { if (!document.hidden) render(); });

  applyTheme(); render();
  if ("serviceWorker" in navigator) window.addEventListener("load",() => navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
})();

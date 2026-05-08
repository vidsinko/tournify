/* ============================================================
   TOURNIFY — Phase 3
   - Live match controller (modal)
   - Smart conflict detection
   - Referee management (real CRUD + assignment)
   - Drag-and-drop schedule reordering
   - Autosave indicator with subtle animations
   ============================================================ */
(function () {
  "use strict";
  const T = window._Tournify;
  const {
    State, save, setState, getTournament, navigate,
    icon, teamLogoHTML, escapeHtml, ago, toast, modal,
    $, $$, uid, clamp,
    t, formatDate, formatTime,
  } = T;

  /* ============================================================
     1. AUTOSAVE INDICATOR
     Wrap the existing save() so every persistence op briefly
     pulses a tiny "Saved" indicator at the top of the page.
     ============================================================ */
  const originalSave = T.save;
  let autosaveEl = null;
  let autosaveTimer = null;
  function ensureAutosaveEl() {
    if (autosaveEl && document.body.contains(autosaveEl)) return autosaveEl;
    autosaveEl = document.createElement("div");
    autosaveEl.id = "autosave-indicator";
    autosaveEl.className = "autosave";
    document.body.appendChild(autosaveEl);
    return autosaveEl;
  }
  function showAutosave() {
    const el = ensureAutosaveEl();
    el.innerHTML = `${icon("check", 12)}<span>${escapeHtml(t("autosave.saved"))}</span>`;
    el.classList.add("is-visible");
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => el.classList.remove("is-visible"), 1400);
  }
  T.save = function () {
    if (originalSave) originalSave.apply(this, arguments);
    showAutosave();
  };

  /* ============================================================
     2. SMART CONFLICT DETECTION
     ============================================================ */
  function detectConflicts(tour) {
    const issues = [];
    const matches = (tour.matches || []).slice().sort((a, b) =>
      new Date(a.time || 0) - new Date(b.time || 0)
    );
    const slot = (tour.matchLength || 25) + (tour.breakLength || 5);
    // Recommended rest = at least one full slot between same team's matches.
    // We only flag if rest is BELOW the standard break time (which is normal).
    // Critical: less than half the break. Warn: less than break.
    const breakLen = tour.breakLength || 5;
    const minRestWarn = breakLen;
    const minRestCritical = Math.max(0, Math.floor(breakLen / 2));

    // Rest-time check per team
    const lastMatchByTeam = {};
    matches.forEach((m) => {
      if (!m.time) return;
      const start = new Date(m.time).getTime();
      [m.home, m.away].forEach((teamId) => {
        if (!teamId) return;
        const prev = lastMatchByTeam[teamId];
        if (prev) {
          const prevEnd = new Date(prev.time).getTime() + (tour.matchLength || 25) * 60000;
          const restMin = Math.round((start - prevEnd) / 60000);
          // Only flag if BELOW the warn threshold and not negative
          if (restMin >= 0 && restMin < minRestWarn) {
            const team = tour.teams.find((te) => te.id === teamId);
            issues.push({
              kind: "rest",
              severity: restMin < minRestCritical ? "high" : "warn",
              text: t("conflict.restTime", { team: team ? team.name : "?", min: restMin }),
              matchId: m.id,
            });
          }
        }
        lastMatchByTeam[teamId] = m;
      });
    });

    // Referee overlap check
    const refSlots = {};
    matches.forEach((m) => {
      if (!m.refereeId || !m.time) return;
      const slotKey = m.refereeId + "@" + new Date(m.time).toISOString();
      if (refSlots[slotKey]) {
        const ref = (tour.referees || []).find((r) => r.id === m.refereeId);
        issues.push({
          kind: "ref",
          severity: "high",
          text: t("conflict.refOverlap", { ref: ref ? ref.name : "?" }),
          matchId: m.id,
        });
      }
      refSlots[slotKey] = m;
    });

    // Field overload — too many consecutive matches without break on a single field
    const byField = {};
    matches.forEach((m) => {
      if (!m.field || !m.time) return;
      (byField[m.field] = byField[m.field] || []).push(m);
    });
    Object.keys(byField).forEach((f) => {
      const list = byField[f];
      let streak = 0;
      let prev = null;
      list.forEach((m) => {
        if (prev) {
          const gap = (new Date(m.time) - new Date(prev.time)) / 60000 - (tour.matchLength || 25);
          if (gap < 5) streak++;
          else streak = 0;
        }
        prev = m;
        if (streak >= 5) {
          issues.push({
            kind: "field",
            severity: "warn",
            text: t("conflict.fieldOverload", { field: f, n: streak + 1 }),
            matchId: m.id,
          });
        }
      });
    });

    // Unfinished count (only if tournament is past start)
    const unfinished = matches.filter((m) => m.status !== "finished" && m.time && new Date(m.time) < Date.now());
    if (unfinished.length > 0) {
      issues.push({
        kind: "unfinished",
        severity: "info",
        text: t("conflict.unfinished", { n: unfinished.length }),
      });
    }

    // Dedup similar issues
    const seen = new Set();
    return issues.filter((iss) => {
      const k = iss.kind + "|" + iss.text;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });
  }
  T.detectConflicts = detectConflicts;

  /* ============================================================
     3. LIVE MATCH CONTROLLER
     A focused modal: timer, score buttons, event log
     ============================================================ */
  let liveTimerInterval = null;
  function openLiveController(matchId) {
    const tour = getTournament();
    if (!tour) return;
    const m = (tour.matches || []).find((x) => x.id === matchId);
    if (!m) { T.openScoreModal(matchId); return; }
    const home = tour.teams.find((te) => te.id === m.home);
    const away = tour.teams.find((te) => te.id === m.away);

    function renderBody() {
      const isLive = m.status === "live";
      const isFinished = m.status === "finished";
      const events = (m.events || []).slice().reverse();

      return `
        <div class="live-ctrl">
          <div class="live-ctrl__head">
            <div class="live-ctrl__status">
              ${isLive ? `<span class="pill pill--live">${escapeHtml(t("common.live"))}</span>` :
                isFinished ? `<span class="pill pill--success">${escapeHtml(t("common.finished"))}</span>` :
                `<span class="pill">${escapeHtml(t("common.scheduled"))}</span>`}
              ${m.field ? `<span class="pill">${escapeHtml(t("label.field"))} ${m.field}</span>` : ""}
            </div>
            <div class="live-ctrl__timer">
              <span class="live-ctrl__timer-num" data-timer>${(m.liveMinute || 0).toString().padStart(2, "0")}'</span>
              <span class="live-ctrl__timer-lbl">${escapeHtml(t("live.timer"))}</span>
            </div>
          </div>

          <div class="live-ctrl__teams">
            <div class="live-ctrl__team">
              ${home ? teamLogoHTML(home, "lg") : `<span class="tlogo tlogo--lg">?</span>`}
              <div class="live-ctrl__team-name">${escapeHtml(home ? home.name : "—")}</div>
              <div class="live-ctrl__score" data-score="h">${m.hScore ?? 0}</div>
              <div class="live-ctrl__score-btns">
                <button class="btn btn--sm" data-score-btn="h-minus">−</button>
                <button class="btn btn--primary btn--sm" data-score-btn="h-plus">+ ${escapeHtml(t("live.event.goal"))}</button>
              </div>
              <div class="live-ctrl__event-btns">
                <button class="btn btn--sm" data-event="h-yellow" title="${escapeHtml(t("live.event.yellow"))}">
                  <svg width="12" height="16" viewBox="0 0 12 16"><rect width="12" height="16" rx="2" fill="#FFB547"/></svg>
                </button>
                <button class="btn btn--sm" data-event="h-red" title="${escapeHtml(t("live.event.red"))}">
                  <svg width="12" height="16" viewBox="0 0 12 16"><rect width="12" height="16" rx="2" fill="#FF4D5E"/></svg>
                </button>
              </div>
            </div>

            <div class="live-ctrl__sep">:</div>

            <div class="live-ctrl__team">
              ${away ? teamLogoHTML(away, "lg") : `<span class="tlogo tlogo--lg">?</span>`}
              <div class="live-ctrl__team-name">${escapeHtml(away ? away.name : "—")}</div>
              <div class="live-ctrl__score" data-score="a">${m.aScore ?? 0}</div>
              <div class="live-ctrl__score-btns">
                <button class="btn btn--sm" data-score-btn="a-minus">−</button>
                <button class="btn btn--primary btn--sm" data-score-btn="a-plus">+ ${escapeHtml(t("live.event.goal"))}</button>
              </div>
              <div class="live-ctrl__event-btns">
                <button class="btn btn--sm" data-event="a-yellow" title="${escapeHtml(t("live.event.yellow"))}">
                  <svg width="12" height="16" viewBox="0 0 12 16"><rect width="12" height="16" rx="2" fill="#FFB547"/></svg>
                </button>
                <button class="btn btn--sm" data-event="a-red" title="${escapeHtml(t("live.event.red"))}">
                  <svg width="12" height="16" viewBox="0 0 12 16"><rect width="12" height="16" rx="2" fill="#FF4D5E"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="live-ctrl__actions">
            ${m.status === "scheduled" ? `<button class="btn btn--primary btn--lg btn--block" data-act="start">${icon("play", 14)} ${escapeHtml(t("live.startMatch"))}</button>` : ""}
            ${m.status === "live" ? `<button class="btn btn--lg btn--block" data-act="pause">${icon("clock", 14)} ${escapeHtml(t("live.pauseMatch"))}</button><button class="btn btn--success btn--lg btn--block" data-act="end">${icon("check", 14)} ${escapeHtml(t("live.endMatch"))}</button>` : ""}
            ${m.status === "finished" ? `<button class="btn btn--lg btn--block" data-act="reopen">${icon("refresh", 14)} ${escapeHtml(t("live.resumeMatch"))}</button>` : ""}
          </div>

          ${events.length ? `
            <div class="live-ctrl__events">
              <div class="eyebrow mb-2">${escapeHtml(t("match.events"))}</div>
              <div class="live-ctrl__event-list">
                ${events.map((e, idx) => {
                  const team = e.team === "home" ? home : away;
                  const evIcon = e.kind === "goal" ? "soccer" : "list";
                  const cardSquare = (e.kind === "yellow" || e.kind === "red")
                    ? `<svg width="10" height="13" viewBox="0 0 10 13"><rect width="10" height="13" rx="1.5" fill="${e.kind === "yellow" ? "#FFB547" : "#FF4D5E"}"/></svg>`
                    : icon(evIcon, 14);
                  const labelKey = e.kind === "goal" ? "live.event.goal" : e.kind === "yellow" ? "live.event.yellow" : e.kind === "red" ? "live.event.red" : "live.event.sub";
                  return `
                    <div class="live-ctrl__event">
                      <span class="live-ctrl__event-min">${e.minute}'</span>
                      <span class="live-ctrl__event-icn">${cardSquare}</span>
                      <span class="live-ctrl__event-text"><b>${escapeHtml(t(labelKey))}</b> · ${escapeHtml(team ? team.name : "?")}${e.player ? " · " + escapeHtml(e.player) : ""}</span>
                      <button class="btn btn--ghost btn--icon btn--sm" data-remove-event="${m.events.length - 1 - idx}">${icon("trash", 12)}</button>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          ` : ""}
        </div>
      `;
    }

    const mod = modal({
      title: escapeHtml(t("live.controller")),
      body: renderBody(),
      size: "lg",
      onClose: () => {
        if (liveTimerInterval) { clearInterval(liveTimerInterval); liveTimerInterval = null; }
      },
    });
    function rerender() {
      const bodyEl = $(".modal__body", mod.root);
      if (!bodyEl) return;
      bodyEl.innerHTML = renderBody();
      bind();
    }
    function bind() {
      // Score buttons
      $$("[data-score-btn]", mod.root).forEach((b) => {
        b.addEventListener("click", () => {
          const v = b.dataset.scoreBtn;
          const isHome = v.startsWith("h");
          const isPlus = v.endsWith("plus");
          const key = isHome ? "hScore" : "aScore";
          m[key] = Math.max(0, (m[key] ?? 0) + (isPlus ? 1 : -1));
          if (isPlus) {
            // Add a goal event
            m.events = m.events || [];
            m.events.push({
              minute: m.liveMinute || 0,
              kind: "goal",
              team: isHome ? "home" : "away",
              player: ""
            });
          }
          T.save();
          // Animate the score
          rerender();
          const scoreEl = $(`[data-score="${isHome ? "h" : "a"}"]`, mod.root);
          if (scoreEl) {
            scoreEl.classList.remove("score-bump");
            void scoreEl.offsetWidth;
            scoreEl.classList.add("score-bump");
          }
        });
      });
      // Event buttons (yellow / red)
      $$("[data-event]", mod.root).forEach((b) => {
        b.addEventListener("click", () => {
          const v = b.dataset.event;
          const isHome = v.startsWith("h");
          const kind = v.split("-")[1];
          m.events = m.events || [];
          m.events.push({
            minute: m.liveMinute || 0,
            kind,
            team: isHome ? "home" : "away",
            player: ""
          });
          T.save();
          toast(t("live.eventAdded"), "success");
          rerender();
        });
      });
      // Remove event
      $$("[data-remove-event]", mod.root).forEach((b) => {
        b.addEventListener("click", () => {
          const idx = parseInt(b.dataset.removeEvent, 10);
          if (m.events && m.events[idx]) {
            // If removing a goal, decrement that team's score
            const ev = m.events[idx];
            if (ev.kind === "goal") {
              if (ev.team === "home") m.hScore = Math.max(0, (m.hScore || 0) - 1);
              else m.aScore = Math.max(0, (m.aScore || 0) - 1);
            }
            m.events.splice(idx, 1);
            T.save();
            rerender();
          }
        });
      });
      // Lifecycle actions
      $$("[data-act]", mod.root).forEach((btn) => {
        btn.addEventListener("click", () => {
          const action = btn.dataset.act;
          if (action === "start") {
            m.status = "live";
            m.liveMinute = m.liveMinute || 1;
            m.startedAt = Date.now();
            startTimerTick();
            toast(t("live.matchStarted"), "success");
          }
          if (action === "pause") {
            stopTimerTick();
            m.pausedAt = Date.now();
          }
          if (action === "end") {
            if (!confirm(t("live.confirmEnd"))) return;
            m.status = "finished";
            m.liveMinute = null;
            stopTimerTick();
            // Activity log
            const ho = tour.teams.find((te) => te.id === m.home);
            const aw = tour.teams.find((te) => te.id === m.away);
            if (ho && aw) tour.activity = tour.activity || [];
            tour.activity.unshift({
              at: Date.now(),
              kind: "score",
              text: `${ho ? ho.name : "?"} ${m.hScore || 0} - ${m.aScore || 0} ${aw ? aw.name : "?"}`,
            });
            // Auto-update bracket if all group matches done
            if (m.stage === "group" && tour.bracket) {
              const allFinished = (tour.matches || []).filter((x) => x.stage === "group").every((x) => x.status === "finished");
              if (allFinished) tour.bracket = T.generateBracket(tour);
            }
            T.save();
            toast(t("live.matchEnded"), "success");
            mod.close();
            T.render();
            return;
          }
          if (action === "reopen") {
            m.status = "live";
            m.liveMinute = m.liveMinute || 90;
          }
          T.save();
          rerender();
        });
      });
    }
    function startTimerTick() {
      stopTimerTick();
      liveTimerInterval = setInterval(() => {
        if (m.status !== "live") return;
        m.liveMinute = (m.liveMinute || 0) + 1;
        if (m.liveMinute > 90) m.liveMinute = 90;
        const tEl = $("[data-timer]", mod.root);
        if (tEl) tEl.textContent = m.liveMinute.toString().padStart(2, "0") + "'";
        // Save once per minute (don't over-spam)
      }, 60000);
    }
    function stopTimerTick() {
      if (liveTimerInterval) { clearInterval(liveTimerInterval); liveTimerInterval = null; }
    }
    bind();
    if (m.status === "live") startTimerTick();
  }
  T.openLiveController = openLiveController;

  /* ============================================================
     4. REFEREE MANAGEMENT — full CRUD + assignment
     ============================================================ */
  function ensureRefArray(tour) {
    if (!tour.referees) tour.referees = [];
  }
  function tabRefereesNew(tour) {
    ensureRefArray(tour);
    const refs = tour.referees;
    const matches = tour.matches || [];

    return `
      <div class="page__head">
        <div class="page__title"><h1>${escapeHtml(t("tabs.referees"))}</h1>
          <p class="muted mt-1" style="font-size:13.5px">${refs.length} ${escapeHtml(t("nav.referees").toLowerCase())}</p>
        </div>
        <button class="btn btn--primary" data-action="add-referee-real">${icon("plus", 14)} ${escapeHtml(t("ref.add"))}</button>
      </div>

      ${refs.length === 0 ? `
        <div class="card empty">
          <div class="empty__icon">${icon("whistle", 22)}</div>
          <div class="empty__title">${escapeHtml(t("ref.empty"))}</div>
          <div class="empty__cta"><button class="btn btn--primary" data-action="add-referee-real">${icon("plus", 14)} ${escapeHtml(t("ref.add"))}</button></div>
        </div>
      ` : `
        <div class="dash-grid">
          ${refs.map((r) => {
            const assigned = matches.filter((m) => m.refereeId === r.id);
            return `
              <div class="card group-card">
                <div class="group-card__head">
                  <div class="row" style="gap:10px">
                    <span class="avatar">${escapeHtml(r.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase())}</span>
                    <div>
                      <div class="group-card__name">${escapeHtml(r.name)}</div>
                      <div class="t3" style="font-size:11.5px">${assigned.length} ${escapeHtml(t("ref.assigned").toLowerCase())}</div>
                    </div>
                  </div>
                  <div class="row" style="gap:4px">
                    <button class="btn btn--ghost btn--icon btn--sm" data-action="edit-referee" data-id="${r.id}">${icon("edit", 14)}</button>
                    <button class="btn btn--ghost btn--icon btn--sm" data-action="delete-referee" data-id="${r.id}">${icon("trash", 14)}</button>
                  </div>
                </div>
                ${assigned.length === 0 ? `<div class="t3" style="padding:14px;text-align:center;font-size:12.5px">—</div>` :
                  `<div style="padding:6px">
                    ${assigned.slice(0, 4).map((m) => T.matchRow(tour, m)).join("")}
                  </div>`}
              </div>
            `;
          }).join("")}
        </div>
      `}

      ${matches.filter((m) => !m.refereeId).length > 0 && refs.length > 0 ? `
        <div class="card mt-3">
          <div class="section-head">
            <h3>${escapeHtml(t("ref.unassigned"))}</h3>
            <span class="pill">${matches.filter((m) => !m.refereeId).length}</span>
          </div>
          <div>
            ${matches.filter((m) => !m.refereeId).slice(0, 8).map((m) => `
              <div class="match-row">
                <div class="match-row__time">
                  <span>${m.time ? escapeHtml(formatTime(new Date(m.time))) : "—"}</span>
                  <span class="field">${escapeHtml(t("label.field"))} ${m.field || "?"}</span>
                </div>
                <div class="match-row__teams">
                  <div class="match-row__team">${teamLogoHTML(tour.teams.find((te) => te.id === m.home))}<span class="match-row__team-name">${escapeHtml((tour.teams.find((te) => te.id === m.home) || {}).name || "?")}</span></div>
                  <div class="match-row__score"><span class="match-row__vs">vs</span></div>
                  <div class="match-row__team match-row__team--right">${teamLogoHTML(tour.teams.find((te) => te.id === m.away))}<span class="match-row__team-name">${escapeHtml((tour.teams.find((te) => te.id === m.away) || {}).name || "?")}</span></div>
                </div>
                <div class="match-row__status">
                  <select class="select select--sm" data-assign-ref="${m.id}" style="height:32px;padding:0 8px;font-size:12px">
                    <option value="">—</option>
                    ${refs.map((r) => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join("")}
                  </select>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      ` : ""}
    `;
  }

  // Override the original tabReferees
  T.tabReferees = tabRefereesNew;

  function addRefereePrompt() {
    const body = `
      <div class="field">
        <label class="field__label">${escapeHtml(t("ref.name"))}</label>
        <input class="input" id="new-ref-name" placeholder="${escapeHtml(t("ref.name"))}" autofocus />
      </div>
    `;
    const footer = `<button class="btn" data-close>${escapeHtml(t("common.cancel"))}</button>
                    <button class="btn btn--primary" data-add>${escapeHtml(t("common.create"))}</button>`;
    const mod = modal({ title: escapeHtml(t("ref.add")), body, footer });
    function add() {
      const name = $("#new-ref-name", mod.root).value.trim();
      if (!name) return;
      const tour = getTournament();
      ensureRefArray(tour);
      tour.referees.push({ id: uid("ref"), name });
      T.save();
      mod.close();
      T.render();
    }
    $("[data-add]", mod.root).addEventListener("click", add);
    $("#new-ref-name", mod.root).addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); add(); }
    });
  }
  function editRefereePrompt(id) {
    const tour = getTournament();
    ensureRefArray(tour);
    const ref = tour.referees.find((r) => r.id === id);
    if (!ref) return;
    const body = `
      <div class="field">
        <label class="field__label">${escapeHtml(t("ref.name"))}</label>
        <input class="input" id="edit-ref-name" value="${escapeHtml(ref.name)}" autofocus />
      </div>
    `;
    const footer = `<button class="btn" data-close>${escapeHtml(t("common.cancel"))}</button>
                    <button class="btn btn--primary" data-save>${escapeHtml(t("common.save"))}</button>`;
    const mod = modal({ title: escapeHtml(t("common.edit")), body, footer });
    $("[data-save]", mod.root).addEventListener("click", () => {
      const name = $("#edit-ref-name", mod.root).value.trim();
      if (!name) return;
      ref.name = name;
      T.save();
      mod.close();
      T.render();
    });
  }
  function deleteReferee(id) {
    if (!confirm(t("sys.confirmDelete"))) return;
    const tour = getTournament();
    ensureRefArray(tour);
    tour.referees = tour.referees.filter((r) => r.id !== id);
    (tour.matches || []).forEach((m) => { if (m.refereeId === id) m.refereeId = null; });
    T.save();
    T.render();
  }

  /* ============================================================
     5. CONFLICTS PANEL on the dashboard overview
     ============================================================ */
  const origTabOverview = T.tabOverview;
  T.tabOverview = function (tour) {
    let html = origTabOverview.apply(this, arguments);
    const issues = detectConflicts(tour);
    const sevColor = (s) => s === "high" ? "live" : s === "warn" ? "warning" : "info";
    const conflictsCard = `
      <div class="card mt-3 conflict-card ${issues.length === 0 ? "conflict-card--clean" : ""}">
        <div class="section-head">
          <h3>${escapeHtml(issues.length === 0 ? t("conflict.allClear") : t("conflict.title"))}</h3>
          ${issues.length === 0 ? `<span class="pill pill--success">${icon("check", 12)} OK</span>` :
            `<span class="pill pill--${sevColor(issues[0].severity)}">${issues.length}</span>`}
        </div>
        ${issues.length === 0 ? `
          <div class="conflict-clean">
            <div class="conflict-clean__icon">${icon("check", 28)}</div>
            <div class="conflict-clean__msg">${escapeHtml(t("conflict.empty"))}</div>
          </div>
        ` : `
          <div class="conflicts">
            ${issues.slice(0, 5).map((iss) => `
              <div class="conflict conflict--${iss.severity}" ${iss.matchId ? `data-action="open-live" data-id="${iss.matchId}"` : ""}>
                <span class="conflict__icon">${icon(iss.severity === "high" ? "info" : iss.severity === "warn" ? "info" : "info", 14)}</span>
                <span class="conflict__text">${escapeHtml(iss.text)}</span>
                ${iss.matchId ? `<span class="conflict__action">${icon("chev_right", 14)}</span>` : ""}
              </div>
            `).join("")}
          </div>
        `}
      </div>
    `;
    return html + conflictsCard;
  };

  /* ============================================================
     6. DRAG & DROP SCHEDULE REORDERING
     ============================================================ */
  function makeMatchRowsDraggable() {
    const rows = $$(".match-row[data-action='open-score']");
    let dragSrcId = null;
    rows.forEach((row) => {
      row.setAttribute("draggable", "true");
      row.classList.add("match-row--draggable");
      row.addEventListener("dragstart", (e) => {
        dragSrcId = row.dataset.id;
        row.classList.add("is-dragging");
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
          try { e.dataTransfer.setData("text/plain", dragSrcId); } catch {}
        }
      });
      row.addEventListener("dragend", () => {
        row.classList.remove("is-dragging");
        $$(".match-row").forEach((r) => r.classList.remove("is-drop-target"));
      });
      row.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        $$(".match-row").forEach((r) => r.classList.remove("is-drop-target"));
        row.classList.add("is-drop-target");
      });
      row.addEventListener("dragleave", () => {
        row.classList.remove("is-drop-target");
      });
      row.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const targetId = row.dataset.id;
        const sourceId = dragSrcId || (e.dataTransfer && e.dataTransfer.getData("text/plain"));
        if (!sourceId || !targetId || sourceId === targetId) return;
        swapMatchSlots(sourceId, targetId);
      });
    });
  }
  function swapMatchSlots(idA, idB) {
    const tour = getTournament();
    if (!tour) return;
    const a = tour.matches.find((m) => m.id === idA);
    const b = tour.matches.find((m) => m.id === idB);
    if (!a || !b) return;
    const tmpTime = a.time; a.time = b.time; b.time = tmpTime;
    const tmpField = a.field; a.field = b.field; b.field = tmpField;
    T.save();
    toast(t("dnd.swapped"), "success");
    T.render();
  }

  /* ============================================================
     7. EXTEND ACTION DISPATCHER
     ============================================================ */
  const originalOnAction = T.onAction;
  T.onAction = function (e) {
    const el = e.currentTarget;
    const a = el.dataset.action;
    const data = el.dataset;
    switch (a) {
      case "open-live":
        e.stopPropagation();
        openLiveController(data.id);
        return;
      case "add-referee-real":
        e.stopPropagation();
        addRefereePrompt();
        return;
      case "edit-referee":
        e.stopPropagation();
        editRefereePrompt(data.id);
        return;
      case "delete-referee":
        e.stopPropagation();
        deleteReferee(data.id);
        return;
      default:
        if (originalOnAction) return originalOnAction.call(this, e);
    }
  };

  /* ============================================================
     8. UPGRADE openScoreModal CALLERS TO USE LIVE CONTROLLER
        Specifically: clicking a match row should open the live
        controller for live/scheduled matches, score modal otherwise.
     ============================================================ */
  const origOpenScoreModal = T.openScoreModal;
  T.openScoreModal = function (matchId) {
    const tour = getTournament();
    if (!tour) return;
    const m = (tour.matches || []).find((x) => x.id === matchId);
    if (m && m.stage === "group") {
      // Use the rich live controller for group-stage matches
      return openLiveController(matchId);
    }
    // Knockout matches use the simpler score modal
    return origOpenScoreModal.apply(this, arguments);
  };

  /* ============================================================
     9. PATCH afterRender to enable drag-drop + assign listeners
     ============================================================ */
  // We wrap T.render to also bind drag-drop after rendering tabs
  const origRender = T.render;
  T.render = function () {
    origRender.apply(this, arguments);
    // After every render, if we're on the matches/overview/fields tab, enable drag-drop
    if (State.view === "dashboard" || State.view === "tournament") {
      const tab = State.currentTab;
      if (tab === "matches" || tab === "fields" || tab === "overview") {
        // Defer to after any layout settles
        setTimeout(makeMatchRowsDraggable, 0);
      }
    }
    // Bind referee-assignment selects
    $$("[data-assign-ref]").forEach((sel) => {
      sel.addEventListener("change", (e) => {
        const matchId = sel.dataset.assignRef;
        const refId = sel.value;
        const tour = getTournament();
        if (!tour) return;
        const m = (tour.matches || []).find((x) => x.id === matchId);
        if (!m) return;
        m.refereeId = refId || null;
        T.save();
        T.render();
      });
    });
  };
})();

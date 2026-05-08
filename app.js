/* ============================================================
   TOURNIFY — App
   Single-file SPA. Vanilla JS, localStorage persistence.
   ============================================================ */

(function () {
  "use strict";
  const { t, setLanguage, getLanguage, getLanguages, formatDate, formatTime } = window.I18n;

  /* ============================================================
     1. UTILITIES & ICONS
     ============================================================ */
  const $  = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const uid = (p) => (p || "id") + "_" + Math.random().toString(36).slice(2, 10);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const escapeHtml = (s) =>
    (s == null ? "" : String(s))
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  // SVG icons
  const ICONS = {
    home: '<path d="M3 12 12 3l9 9"/><path d="M5 10v10h14V10"/>',
    trophy: '<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 4h3v3a4 4 0 0 1-4 4"/><path d="M7 4H4v3a4 4 0 0 0 4 4"/>',
    play: '<polygon points="6 4 20 12 6 20 6 4"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M3 11h18"/>',
    pitch: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M12 6v12"/><circle cx="12" cy="12" r="2"/><path d="M3 9h3v6H3"/><path d="M21 9h-3v6h3"/>',
    whistle: '<path d="M3 13a8 8 0 0 0 8 8 8 8 0 0 0 8-8h-2a6 6 0 1 1-12 0z"/><path d="M11 13V7l9-3v6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chev_left: '<polyline points="15 18 9 12 15 6"/>',
    chev_right: '<polyline points="9 18 15 12 9 6"/>',
    chev_down: '<polyline points="6 9 12 15 18 9"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    search: '<circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.7" y2="16.7"/>',
    share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3z"/><path d="M20 14v3"/><path d="M14 20h3v1"/>',
    location: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    info: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="17"/><circle cx="12" cy="8" r="0.7" fill="currentColor"/>',
    bracket: '<path d="M5 4h2v16H5"/><path d="M19 4h-2v16h2"/><path d="M7 12h4"/><path d="M17 12h-4"/>',
    edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>',
    refresh: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    soccer: '<circle cx="12" cy="12" r="9"/><path d="M12 7l5 3.6-1.9 5.9h-6.2L7 10.6 12 7z"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
    menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    open: '<path d="M14 3h7v7"/><path d="M10 14L21 3"/><path d="M21 14v7H3V3h7"/>',
    star: '<polygon points="12 2 15 9 22 9.5 16.5 14.5 18.5 22 12 18 5.5 22 7.5 14.5 2 9.5 9 9 12 2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
    arrow_right: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
  };
  function icon(name, size = 18, extraClass = "") {
    const path = ICONS[name] || "";
    return `<svg class="icn ${extraClass}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  }

  // Color palette for team logos
  const TEAM_PALETTES = [
    ["#7B5CFF", "#5B3FE0"], ["#4DA8FF", "#2A6CD8"], ["#2BD07C", "#0FA362"],
    ["#FFB547", "#E07A1A"], ["#FF6B9C", "#D63F70"], ["#7AE8FF", "#3CADE0"],
    ["#C58BFF", "#7C4FCC"], ["#FF8A65", "#D9543A"], ["#A1E055", "#5FA021"],
    ["#FF4D5E", "#C42434"], ["#65B9FF", "#3886C9"], ["#FFD66B", "#D49A1F"],
  ];
  function paletteFor(seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return TEAM_PALETTES[h % TEAM_PALETTES.length];
  }
  function teamLogoHTML(team, size = "") {
    if (!team) return '<span class="tlogo">?</span>';
    const [c1, c2] = team.colors || paletteFor(team.id || team.name || "x");
    const initials = team.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase().slice(0, 3);
    return `<span class="tlogo ${size ? "tlogo--" + size : ""}" style="--c1:${c1};--c2:${c2}">${escapeHtml(initials)}</span>`;
  }

  function ago(timestamp, short) {
    const diff = Date.now() - timestamp;
    const m = Math.floor(diff / 60000);
    if (m < 1) return short ? "now" : "just now";
    if (m < 60) return m + (short ? "m" : "m ago");
    const h = Math.floor(m / 60);
    if (h < 24) return h + (short ? "h" : "h ago");
    const d = Math.floor(h / 24);
    return d + (short ? "d" : "d ago");
  }

  // Toast
  function toast(message, kind = "info") {
    const root = $("#toasts");
    if (!root) return;
    const el = document.createElement("div");
    el.className = "toast toast--" + kind;
    const iconName = kind === "success" ? "check" : kind === "error" ? "close" : "info";
    el.innerHTML = `${icon(iconName, 16)}<span>${escapeHtml(message)}</span>`;
    root.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateY(8px)"; }, 2400);
    setTimeout(() => el.remove(), 2700);
  }

  // Modal
  function modal({ title, body, footer, onClose, size }) {
    const root = $("#modal-root");
    root.innerHTML = "";
    const mask = document.createElement("div");
    mask.className = "modal-mask";
    mask.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" ${size === "lg" ? 'style="max-width:680px"' : ""}>
        <div class="modal__head">
          <div class="modal__title">${escapeHtml(title || "")}</div>
          <button class="btn btn--ghost btn--icon btn--sm" data-close>${icon("close", 16)}</button>
        </div>
        <div class="modal__body">${body || ""}</div>
        ${footer ? `<div class="modal__foot">${footer}</div>` : ""}
      </div>`;
    root.appendChild(mask);
    function close() {
      mask.remove();
      if (onClose) onClose();
    }
    mask.addEventListener("click", (e) => { if (e.target === mask) close(); });
    $$("[data-close]", mask).forEach((b) => b.addEventListener("click", close));
    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc); }
    });
    return { close, root: mask };
  }

  /* ============================================================
     2. STATE + PERSISTENCE
     ============================================================ */
  const STORAGE_KEY = "tournify.state.v2";
  let State = {
    view: "welcome",
    sidebarOpen: false,
    currentTournamentId: null,
    currentTab: "overview",
    publicTab: "info",
    wizard: null,
    user: { id: "u_self", name: "John Organizer", role: "organizer" },
    tournaments: [],
    matchId: null,
    teamTab: "upcoming",
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      Object.assign(State, parsed);
    } catch (e) { console.warn("load failed", e); }
  }
  function save() {
    const persisted = {
      currentTournamentId: State.currentTournamentId,
      currentTab: State.currentTab,
      publicTab: State.publicTab,
      teamTab: State.teamTab,
      user: State.user,
      tournaments: State.tournaments,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted)); } catch (e) {}
  }
  function getTournament(id) {
    return State.tournaments.find((x) => x.id === (id || State.currentTournamentId));
  }
  function setState(patch) {
    Object.assign(State, patch);
    save();
    if (window._Tournify && window._Tournify.render) window._Tournify.render();
  }

  /* ============================================================
     3. ENGINE — schedule, standings, bracket
     ============================================================ */
  function buildGroups(teams, groupCount) {
    if (!teams.length || groupCount < 1) return [];
    const groups = [];
    for (let i = 0; i < groupCount; i++) {
      groups.push({ id: uid("grp"), name: String.fromCharCode(65 + i), teamIds: [] });
    }
    let idx = 0, dir = 1;
    teams.forEach((team) => {
      groups[idx].teamIds.push(team.id);
      idx += dir;
      if (idx === groups.length) { idx = groups.length - 1; dir = -1; }
      else if (idx < 0) { idx = 0; dir = 1; }
    });
    return groups;
  }

  function roundRobin(teamIds) {
    const ids = teamIds.slice();
    if (ids.length < 2) return [];
    const hasBye = ids.length % 2 === 1;
    if (hasBye) ids.push(null);
    const n = ids.length;
    const rounds = [];
    const fixed = ids[0];
    let rotating = ids.slice(1);
    for (let r = 0; r < n - 1; r++) {
      const round = [];
      const arr = [fixed].concat(rotating);
      for (let i = 0; i < n / 2; i++) {
        const a = arr[i], b = arr[n - 1 - i];
        if (a !== null && b !== null) round.push([a, b]);
      }
      rounds.push(round);
      rotating.unshift(rotating.pop());
    }
    return rounds;
  }

  function parseTime(hhmm) {
    const [h, m] = (hhmm || "09:00").split(":").map(Number);
    return h + (m || 0) / 60;
  }

  function generateSchedule(tournament) {
    const groups = tournament.groups || [];
    if (!groups.length) return [];
    const groupRounds = groups.map((g) =>
      roundRobin(g.teamIds).map((round) => ({ groupId: g.id, pairs: round }))
    );
    const maxRounds = Math.max(0, ...groupRounds.map((gr) => gr.length));
    const queue = [];
    for (let r = 0; r < maxRounds; r++) {
      for (let gi = 0; gi < groupRounds.length; gi++) {
        const round = groupRounds[gi][r];
        if (!round) continue;
        round.pairs.forEach(([a, b]) => {
          queue.push({
            id: uid("m"),
            groupId: round.groupId,
            round: r + 1,
            home: a, away: b,
            hScore: null, aScore: null,
            status: "scheduled",
            field: null, time: null,
            stage: "group",
            events: [],
          });
        });
      }
    }

    const slot = (tournament.matchLength || 25) + (tournament.breakLength || 5);
    const start = parseTime(tournament.dailyStart || "09:00");
    const end = parseTime(tournament.dailyEnd || "20:00");
    const fields = Math.max(1, parseInt(tournament.fields, 10) || 2);
    const tournamentStart = new Date(tournament.startDate + "T00:00:00");
    const tournamentEnd = new Date((tournament.endDate || tournament.startDate) + "T23:59:59");
    const dayMs = 24 * 60 * 60 * 1000;

    const lastPlayedSlot = {};
    let day = new Date(tournamentStart);
    let qIdx = 0;
    let slotIdx = 0;

    while (qIdx < queue.length && day <= tournamentEnd) {
      const minutesPerDay = (end - start) * 60;
      const slotsToday = Math.max(1, Math.floor(minutesPerDay / slot));

      for (let s = 0; s < slotsToday && qIdx < queue.length; s++) {
        // For this slot, pick `fields` matches whose teams haven't played in the previous slot
        const usedThisSlot = new Set();
        for (let f = 0; f < fields && qIdx < queue.length; f++) {
          // Find best candidate from queue[qIdx..]: prefer teams not just-played and not already in this slot
          let pickIdx = -1;
          for (let look = qIdx; look < queue.length; look++) {
            const m = queue[look];
            if (usedThisSlot.has(m.home) || usedThisSlot.has(m.away)) continue;
            const lp1 = lastPlayedSlot[m.home];
            const lp2 = lastPlayedSlot[m.away];
            // Best: at least 1 slot of rest since previous match
            if ((lp1 === undefined || slotIdx - lp1 >= 2) && (lp2 === undefined || slotIdx - lp2 >= 2)) {
              pickIdx = look; break;
            }
          }
          // Fallback 1: any match where teams haven't already been used in THIS slot
          if (pickIdx === -1) {
            for (let look = qIdx; look < queue.length; look++) {
              const m = queue[look];
              if (!usedThisSlot.has(m.home) && !usedThisSlot.has(m.away)) {
                pickIdx = look; break;
              }
            }
          }
          // Fallback 2: take next regardless (shouldn't really happen)
          if (pickIdx === -1) pickIdx = qIdx;

          // Move chosen to qIdx position
          if (pickIdx !== qIdx) {
            const tmp = queue[qIdx]; queue[qIdx] = queue[pickIdx]; queue[pickIdx] = tmp;
          }
          const match = queue[qIdx];
          const minutesFromDayStart = s * slot;
          const time = new Date(day);
          time.setHours(Math.floor(start), Math.round((start % 1) * 60), 0, 0);
          time.setMinutes(time.getMinutes() + minutesFromDayStart);
          match.time = time.toISOString();
          match.field = f + 1;
          usedThisSlot.add(match.home);
          usedThisSlot.add(match.away);
          lastPlayedSlot[match.home] = slotIdx;
          lastPlayedSlot[match.away] = slotIdx;
          qIdx++;
        }
        slotIdx++;
      }
      day = new Date(day.getTime() + dayMs);
    }
    return queue;
  }

  function computeStandings(tournament, groupId) {
    const group = (tournament.groups || []).find((g) => g.id === groupId);
    if (!group) return [];
    const teams = group.teamIds.map((tid) => tournament.teams.find((t) => t.id === tid)).filter(Boolean);
    const matches = (tournament.matches || []).filter(
      (m) => m.groupId === groupId && m.status === "finished" && m.hScore != null && m.aScore != null
    );
    const rows = teams.map((team) => ({
      teamId: team.id, name: team.name, played: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0,
    }));
    const map = Object.fromEntries(rows.map((r) => [r.teamId, r]));
    matches.forEach((m) => {
      const h = map[m.home], a = map[m.away];
      if (!h || !a) return;
      h.played++; a.played++;
      h.gf += m.hScore; h.ga += m.aScore; a.gf += m.aScore; a.ga += m.hScore;
      if (m.hScore > m.aScore)      { h.w++; h.pts += 3; a.l++; }
      else if (m.hScore < m.aScore) { a.w++; a.pts += 3; h.l++; }
      else                          { h.d++; a.d++; h.pts++; a.pts++; }
    });
    rows.forEach((r) => (r.gd = r.gf - r.ga));
    rows.sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.name.localeCompare(y.name));
    return rows;
  }

  function generateBracket(tournament) {
    const adv = Math.max(1, parseInt(tournament.advancePerGroup, 10) || 2);
    const allQualifiers = [];
    (tournament.groups || []).forEach((g) => {
      // A group's positions are only "real" if all matches in that group are finished
      const groupMatches = (tournament.matches || []).filter((m) => m.groupId === g.id);
      const allDone = groupMatches.length > 0 && groupMatches.every((m) => m.status === "finished");
      const standings = computeStandings(tournament, g.id);
      for (let i = 0; i < adv; i++) {
        const row = standings[i];
        allQualifiers.push({
          teamId: allDone && row ? row.teamId : null,
          label: g.name + (i + 1),
        });
      }
    });
    let size = 1;
    while (size < allQualifiers.length) size *= 2;
    while (allQualifiers.length < size) allQualifiers.push({ teamId: null, label: t("bracket.bye") });

    const seeds = allQualifiers.slice();
    const matches = [];
    for (let i = 0; i < size / 2; i++) {
      const a = seeds[i];
      const b = seeds[size - 1 - i];
      matches.push({
        id: uid("k"),
        home: a.teamId, away: b.teamId,
        homeLabel: a.label, awayLabel: b.label,
        hScore: null, aScore: null,
        status: "scheduled",
        stage: "knockout",
        round: 1,
      });
    }
    const rounds = [{ name: roundName(size), matches }];

    let curSize = size / 2;
    let roundN = 2;
    while (curSize > 1) {
      curSize /= 2;
      const next = [];
      for (let i = 0; i < curSize; i++) {
        next.push({
          id: uid("k"),
          home: null, away: null,
          homeLabel: t("bracket.tbd"), awayLabel: t("bracket.tbd"),
          hScore: null, aScore: null,
          status: "scheduled",
          stage: "knockout",
          round: roundN,
        });
      }
      rounds.push({ name: roundName(curSize * 2), matches: next });
      roundN++;
    }
    return { rounds };
  }

  function roundName(matchCount) {
    if (matchCount === 2) return t("bracket.f");
    if (matchCount === 4) return t("bracket.sf");
    if (matchCount === 8) return t("bracket.qf");
    if (matchCount === 16) return t("bracket.r16");
    if (matchCount === 32) return t("bracket.r32");
    return t("label.round") + " " + matchCount;
  }

  /* ============================================================
     4. DEMO SEED
     ============================================================ */
  function buildDemoTournament() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);

    const teamNames = [
      "NK Olimpija", "NK Maribor", "ND Gorica", "FC Koper",
      "FC Galaxy", "Blue Tigers", "Young Stars", "NK Bravo",
      "FC Victoria", "Inter Ljubljana", "Crveni Zmaj", "Bayern Jr",
    ];
    const teams = teamNames.map((n) => {
      const id = uid("t");
      return { id, name: n, colors: paletteFor(id) };
    });

    const tour = {
      id: uid("tr"),
      name: "U12 Champions Cup 2026",
      sport: "football",
      location: "Ljubljana, Slovenia",
      startDate: today.toISOString().slice(0, 10),
      endDate: tomorrow.toISOString().slice(0, 10),
      fields: 4,
      format: "gs",
      groupsCount: 3,
      advancePerGroup: 2,
      matchLength: 20,
      breakLength: 5,
      dailyStart: "09:00",
      dailyEnd: "18:00",
      teams,
      isLive: true,
      activity: [],
    };
    tour.groups = buildGroups(teams, tour.groupsCount);
    tour.matches = generateSchedule(tour);

    if (tour.matches.length >= 6) {
      tour.matches[0].status = "finished"; tour.matches[0].hScore = 1; tour.matches[0].aScore = 0;
      tour.matches[1].status = "finished"; tour.matches[1].hScore = 0; tour.matches[1].aScore = 3;
      tour.matches[2].status = "live";     tour.matches[2].hScore = 2; tour.matches[2].aScore = 1;
      tour.matches[2].liveMinute = 75;
      tour.matches[2].events = [
        { minute: 30, kind: "goal", team: "away", player: "Tim R." },
        { minute: 45, kind: "goal", team: "home", player: "Andrej S." },
        { minute: 60, kind: "yellow", team: "home", player: "Marko P." },
        { minute: 75, kind: "goal", team: "home", player: "Luka K." },
      ];
      tour.matches[3].status = "live";     tour.matches[3].hScore = 0; tour.matches[3].aScore = 0;
      tour.matches[3].liveMinute = 45;
    }

    tour.bracket = generateBracket(tour);

    tour.activity = [
      { at: Date.now() - 2 * 60 * 1000,  kind: "score", text: tour.teams[0].name + " 2 - 1 " + tour.teams[1].name },
      { at: Date.now() - 60 * 60 * 1000, kind: "team",  text: "FC Victoria registered" },
      { at: Date.now() - 3 * 60 * 60 * 1000, kind: "field", text: "Field 2 maintenance — 18:00–20:00" },
    ];
    return tour;
  }

  function ensureDemoIfEmpty() {
    if (!State.tournaments.length) {
      const tr = buildDemoTournament();
      State.tournaments.push(tr);
      State.currentTournamentId = tr.id;
      save();
    } else if (!State.currentTournamentId) {
      State.currentTournamentId = State.tournaments[0].id;
      save();
    }
  }

  /* ============================================================
     5. ROUTER
     ============================================================ */
  function navigate(view, opts) {
    State.view = view;
    if (opts) Object.assign(State, opts);
    save();
    if (window._Tournify && window._Tournify.render) window._Tournify.render();
    if (typeof window.scrollTo === "function") window.scrollTo({ top: 0, behavior: "instant" });
  }

  // Expose helpers to subsequent script chunks
  window._Tournify = {
    State, save, load, setState, getTournament, navigate,
    buildGroups, roundRobin, generateSchedule, computeStandings, generateBracket,
    buildDemoTournament, ensureDemoIfEmpty,
    icon, teamLogoHTML, paletteFor, escapeHtml, ago, toast, modal,
    $, $$, uid, clamp,
    t, setLanguage, getLanguage, getLanguages, formatDate, formatTime,
  };
})();

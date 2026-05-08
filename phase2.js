/* ============================================================
   TOURNIFY — Phase 2
   - Real QR code encoder
   - Theme toggle (light/dark)
   - Global search (Cmd-K)
   - Tournaments list view
   - Print / PDF export
   - Live energy polish (event feed, connected indicator)
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
     1. REAL QR CODE ENCODER
     Compact, model-3 capable, byte-mode, EC level L.
     Adapted/modeled after public-domain QR algorithm references.
     ============================================================ */
  const QR = (function () {
    // Galois field tables for Reed-Solomon
    const GF_EXP = new Array(512);
    const GF_LOG = new Array(256);
    (function () {
      let x = 1;
      for (let i = 0; i < 255; i++) {
        GF_EXP[i] = x;
        GF_LOG[x] = i;
        x <<= 1;
        if (x & 0x100) x ^= 0x11d;
      }
      for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
    })();
    function gfMul(a, b) {
      if (a === 0 || b === 0) return 0;
      return GF_EXP[GF_LOG[a] + GF_LOG[b]];
    }
    function rsGeneratorPoly(degree) {
      let poly = [1];
      for (let i = 0; i < degree; i++) {
        const next = new Array(poly.length + 1).fill(0);
        for (let j = 0; j < poly.length; j++) {
          next[j] ^= poly[j];
          next[j + 1] ^= gfMul(poly[j], GF_EXP[i]);
        }
        poly = next;
      }
      return poly;
    }
    function rsRemainder(data, generator) {
      const remainder = data.slice();
      for (let i = 0; i < generator.length - 1; i++) remainder.push(0);
      for (let i = 0; i < data.length; i++) {
        const factor = remainder[i];
        if (factor !== 0) {
          for (let j = 0; j < generator.length; j++) {
            remainder[i + j] ^= gfMul(generator[j], factor);
          }
        }
      }
      return remainder.slice(data.length);
    }

    // QR version table — version, data codewords (EC L), EC codewords per block, blocks
    // We'll auto-pick smallest version that fits.
    // Source: ISO/IEC 18004 Table 9 / Annex
    // Format: [version, totalDataCodewordsL, ecPerBlockL, blocksL]
    const VERSIONS_L = [
      [1, 19,  7, 1],
      [2, 34, 10, 1],
      [3, 55, 15, 1],
      [4, 80, 20, 1],
      [5, 108, 26, 1],
      [6, 136, 18, 2],
      [7, 156, 20, 2],
      [8, 194, 24, 2],
      [9, 232, 30, 2],
      [10, 274, 18, 4],
    ];

    // Capacity for byte mode at EC L (rough, derived from data codewords)
    function bytesCapacity(ver) {
      const v = VERSIONS_L[ver - 1];
      // Each version has 4 bits mode + length(8 or 16) bits, rest is data
      // For ver 1-9 length is 8 bits, ver 10-26 length is 16 bits
      const totalBits = v[1] * 8;
      const lengthBits = ver < 10 ? 8 : 16;
      const headerBits = 4 + lengthBits;
      return Math.floor((totalBits - headerBits) / 8);
    }

    function pickVersion(byteLen) {
      for (let v = 1; v <= VERSIONS_L.length; v++) {
        if (bytesCapacity(v) >= byteLen) return v;
      }
      return VERSIONS_L.length; // fallback (will be truncated by caller)
    }

    function buildBitstream(text, version) {
      const bytes = new TextEncoder().encode(text);
      const bits = [];
      function pushBits(val, count) {
        for (let i = count - 1; i >= 0; i--) bits.push((val >> i) & 1);
      }
      pushBits(0b0100, 4); // byte mode
      pushBits(bytes.length, version < 10 ? 8 : 16);
      for (const b of bytes) pushBits(b, 8);

      // Total data codewords (bytes)
      const totalDataBytes = VERSIONS_L[version - 1][1];
      const totalBits = totalDataBytes * 8;
      // Terminator (up to 4 zeros)
      for (let i = 0; i < 4 && bits.length < totalBits; i++) bits.push(0);
      // Pad to byte
      while (bits.length % 8 !== 0) bits.push(0);
      // Pad bytes alternating 0xEC, 0x11
      const padBytes = [0xec, 0x11];
      let pi = 0;
      while (bits.length < totalBits) {
        const pad = padBytes[pi % 2]; pi++;
        for (let i = 7; i >= 0; i--) bits.push((pad >> i) & 1);
      }
      // Convert to bytes
      const data = new Array(totalDataBytes);
      for (let i = 0; i < totalDataBytes; i++) {
        let v = 0;
        for (let b = 0; b < 8; b++) v = (v << 1) | bits[i * 8 + b];
        data[i] = v;
      }
      return data;
    }

    function buildECC(data, version) {
      const [, totalData, ecPerBlock, blocks] = VERSIONS_L[version - 1];
      const dataPerBlock = Math.floor(totalData / blocks);
      const remainder = totalData - dataPerBlock * blocks;
      const blockData = [];
      const blockEcc = [];
      let p = 0;
      const generator = rsGeneratorPoly(ecPerBlock);
      for (let i = 0; i < blocks; i++) {
        const size = dataPerBlock + (i >= blocks - remainder ? 1 : 0);
        const block = data.slice(p, p + size);
        p += size;
        blockData.push(block);
        blockEcc.push(rsRemainder(block, generator));
      }
      // Interleave
      const maxData = Math.max(...blockData.map((b) => b.length));
      const result = [];
      for (let i = 0; i < maxData; i++) {
        for (let b = 0; b < blocks; b++) {
          if (i < blockData[b].length) result.push(blockData[b][i]);
        }
      }
      for (let i = 0; i < ecPerBlock; i++) {
        for (let b = 0; b < blocks; b++) {
          result.push(blockEcc[b][i]);
        }
      }
      return result;
    }

    function moduleCount(version) { return version * 4 + 17; }

    function setupFunctionPatterns(matrix, version) {
      const N = moduleCount(version);
      const reserved = Array.from({ length: N }, () => new Array(N).fill(false));
      function placeFinder(r, c) {
        for (let dr = -1; dr <= 7; dr++) {
          for (let dc = -1; dc <= 7; dc++) {
            const rr = r + dr, cc = c + dc;
            if (rr < 0 || rr >= N || cc < 0 || cc >= N) continue;
            const inner = (dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6);
            const ring  = (dr === 0 || dr === 6 || dc === 0 || dc === 6);
            const center= (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
            matrix[rr][cc] = inner ? (ring || center ? 1 : 0) : 0;
            reserved[rr][cc] = true;
          }
        }
      }
      placeFinder(0, 0);
      placeFinder(0, N - 7);
      placeFinder(N - 7, 0);
      // Timing patterns
      for (let i = 8; i < N - 8; i++) {
        matrix[6][i] = i % 2 === 0 ? 1 : 0;
        matrix[i][6] = i % 2 === 0 ? 1 : 0;
        reserved[6][i] = true;
        reserved[i][6] = true;
      }
      // Dark module
      matrix[N - 8][8] = 1;
      reserved[N - 8][8] = true;
      // Reserve format info area
      for (let i = 0; i < 9; i++) { reserved[8][i] = true; reserved[i][8] = true; }
      for (let i = 0; i < 8; i++) { reserved[8][N - 1 - i] = true; reserved[N - 1 - i][8] = true; }
      // Alignment patterns (for ver >= 2)
      if (version >= 2) {
        const positions = alignmentPositions(version);
        for (const r of positions) {
          for (const c of positions) {
            if ((r < 8 && c < 8) || (r < 8 && c > N - 9) || (r > N - 9 && c < 8)) continue;
            for (let dr = -2; dr <= 2; dr++) {
              for (let dc = -2; dc <= 2; dc++) {
                const rr = r + dr, cc = c + dc;
                if (rr < 0 || rr >= N || cc < 0 || cc >= N) continue;
                const ring = Math.max(Math.abs(dr), Math.abs(dc));
                matrix[rr][cc] = (ring === 0 || ring === 2) ? 1 : 0;
                reserved[rr][cc] = true;
              }
            }
          }
        }
      }
      return reserved;
    }

    function alignmentPositions(version) {
      // Per ISO Annex E, simplified for versions 1-10
      const table = {
        1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
        6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
      };
      return table[version] || [];
    }

    function placeData(matrix, reserved, codewords) {
      const N = matrix.length;
      let bitIndex = 0;
      let upward = true;
      let col = N - 1;
      while (col > 0) {
        if (col === 6) col--; // skip vertical timing
        for (let i = 0; i < N; i++) {
          const row = upward ? N - 1 - i : i;
          for (let dx = 0; dx < 2; dx++) {
            const c = col - dx;
            if (!reserved[row][c]) {
              const byteIdx = Math.floor(bitIndex / 8);
              const bitOff = 7 - (bitIndex % 8);
              const bit = byteIdx < codewords.length ? ((codewords[byteIdx] >> bitOff) & 1) : 0;
              matrix[row][c] = bit;
              bitIndex++;
            }
          }
        }
        col -= 2;
        upward = !upward;
      }
    }

    function applyMask(matrix, reserved, mask) {
      const N = matrix.length;
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (reserved[r][c]) continue;
          let invert = false;
          switch (mask) {
            case 0: invert = (r + c) % 2 === 0; break;
            case 1: invert = r % 2 === 0; break;
            case 2: invert = c % 3 === 0; break;
            case 3: invert = (r + c) % 3 === 0; break;
            case 4: invert = (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; break;
            case 5: invert = (r * c) % 2 + (r * c) % 3 === 0; break;
            case 6: invert = ((r * c) % 2 + (r * c) % 3) % 2 === 0; break;
            case 7: invert = ((r + c) % 2 + (r * c) % 3) % 2 === 0; break;
          }
          if (invert) matrix[r][c] ^= 1;
        }
      }
    }

    function placeFormatInfo(matrix, mask) {
      // EC level L = 01
      const data = (0b01 << 3) | mask;
      // BCH (15,5)
      let rem = data << 10;
      const g = 0b10100110111;
      for (let i = 14; i >= 10; i--) {
        if ((rem >> i) & 1) rem ^= g << (i - 10);
      }
      const bits = ((data << 10) | rem) ^ 0b101010000010010;
      const N = matrix.length;
      for (let i = 0; i < 15; i++) {
        const v = (bits >> i) & 1;
        // Top-left
        if (i < 6) matrix[8][i] = v;
        else if (i < 8) matrix[8][i + 1] = v;
        else if (i === 8) matrix[7][8] = v;
        else matrix[14 - i][8] = v;
        // Around bottom-left & top-right
        if (i < 8) matrix[N - 1 - i][8] = v;
        else matrix[8][N - 15 + i] = v;
      }
      matrix[N - 8][8] = 1; // dark module always
    }

    function maskScore(matrix) {
      const N = matrix.length;
      let score = 0;
      // Rule 1: runs of 5+ same color in row/col
      for (let r = 0; r < N; r++) {
        let last = -1, run = 0;
        for (let c = 0; c < N; c++) {
          if (matrix[r][c] === last) { run++; if (run === 5) score += 3; else if (run > 5) score++; }
          else { last = matrix[r][c]; run = 1; }
        }
      }
      for (let c = 0; c < N; c++) {
        let last = -1, run = 0;
        for (let r = 0; r < N; r++) {
          if (matrix[r][c] === last) { run++; if (run === 5) score += 3; else if (run > 5) score++; }
          else { last = matrix[r][c]; run = 1; }
        }
      }
      // Rule 2: 2x2 same color
      for (let r = 0; r < N - 1; r++) {
        for (let c = 0; c < N - 1; c++) {
          const v = matrix[r][c];
          if (matrix[r][c+1] === v && matrix[r+1][c] === v && matrix[r+1][c+1] === v) score += 3;
        }
      }
      return score;
    }

    function generate(text) {
      const bytes = new TextEncoder().encode(text);
      let version = pickVersion(bytes.length);
      // Try smallest fitting version up to 10
      version = clamp(version, 1, VERSIONS_L.length);
      const data = buildBitstream(text, version);
      const codewords = buildECC(data, version);
      const N = moduleCount(version);

      // Try all 8 masks, pick lowest penalty
      let best = null, bestScore = Infinity;
      for (let mask = 0; mask < 8; mask++) {
        const matrix = Array.from({ length: N }, () => new Array(N).fill(0));
        const reserved = setupFunctionPatterns(matrix, version);
        placeData(matrix, reserved, codewords);
        applyMask(matrix, reserved, mask);
        placeFormatInfo(matrix, mask);
        const s = maskScore(matrix);
        if (s < bestScore) { best = matrix; bestScore = s; }
      }
      return best;
    }

    function svg(text, size = 200, fg = "#0A0B14", bg = "#FFFFFF") {
      const matrix = generate(text);
      const N = matrix.length;
      const margin = 4;
      const total = N + margin * 2;
      const cell = size / total;
      let body = `<rect width="100%" height="100%" fill="${bg}"/>`;
      // Build path string for all dark cells (much smaller SVG)
      let d = "";
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (matrix[r][c]) {
            const x = (c + margin) * cell;
            const y = (r + margin) * cell;
            d += `M${x.toFixed(2)} ${y.toFixed(2)}h${cell.toFixed(2)}v${cell.toFixed(2)}h-${cell.toFixed(2)}z`;
          }
        }
      }
      body += `<path d="${d}" fill="${fg}" shape-rendering="crispEdges"/>`;
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
    }

    return { svg, generate };
  })();

  // Replace the placeholder QR with the real one
  T.simpleQR = function (text, size) { return QR.svg(text, size); };
  T.QR = QR;

  /* ============================================================
     2. THEME TOGGLE
     ============================================================ */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem("tournify.theme", theme); } catch {}
    // Update meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#0A0B14" : "#F7F8FB";
  }
  function getTheme() {
    try { return localStorage.getItem("tournify.theme") || "dark"; } catch { return "dark"; }
  }
  function toggleTheme() {
    const cur = getTheme();
    const next = cur === "dark" ? "light" : "dark";
    applyTheme(next);
    T.render();
    if (T.updateThemeIcon) T.updateThemeIcon();
    toast(t("theme.toggle") + ": " + (next === "dark" ? t("theme.dark") : t("theme.light")), "info");
  }
  applyTheme(getTheme());
  T.toggleTheme = toggleTheme;
  T.getTheme = getTheme;

  /* ============================================================
     3. GLOBAL SEARCH (⌘K)
     ============================================================ */
  function openSearch() {
    const body = `
      <div class="search-modal">
        <div class="search-modal__input">
          ${icon("search", 18)}
          <input id="search-input" type="text" placeholder="${escapeHtml(t("search.placeholder"))}" autocomplete="off" autofocus />
          <kbd class="kbd">ESC</kbd>
        </div>
        <div id="search-results" class="search-modal__results"></div>
      </div>
    `;
    const root = $("#modal-root");
    root.innerHTML = "";
    const mask = document.createElement("div");
    mask.className = "modal-mask search-mask";
    mask.innerHTML = `<div class="modal search-modal-shell" role="dialog" aria-modal="true">${body}</div>`;
    root.appendChild(mask);
    function close() {
      mask.remove();
      document.removeEventListener("keydown", onKey);
    }
    mask.addEventListener("click", (e) => { if (e.target === mask) close(); });
    function onKey(e) {
      if (e.key === "Escape") { close(); }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const items = $$(".search-result", mask);
        const cur = items.findIndex((x) => x.classList.contains("is-active"));
        const next = e.key === "ArrowDown" ? Math.min(cur + 1, items.length - 1) : Math.max(0, cur - 1);
        items.forEach((x) => x.classList.remove("is-active"));
        if (items[next]) {
          items[next].classList.add("is-active");
          items[next].scrollIntoView({ block: "nearest" });
        }
      }
      if (e.key === "Enter") {
        const item = $(".search-result.is-active", mask) || $(".search-result", mask);
        if (item) { item.click(); }
      }
    }
    document.addEventListener("keydown", onKey);

    const input = $("#search-input", mask);
    const results = $("#search-results", mask);
    function refresh() {
      const q = (input.value || "").toLowerCase().trim();
      const tournaments = State.tournaments;
      const allTeams = [];
      const allMatches = [];
      tournaments.forEach((tr) => {
        (tr.teams || []).forEach((te) => allTeams.push({ team: te, tournament: tr }));
        (tr.matches || []).forEach((m) => allMatches.push({ match: m, tournament: tr }));
      });

      function score(s) { return s.toLowerCase().includes(q) ? 1 : 0; }
      const trMatches = q ? tournaments.filter((tr) => score(tr.name)).slice(0, 5) : tournaments.slice(0, 4);
      const teamMatches = q ? allTeams.filter(({ team }) => score(team.name)).slice(0, 6) : [];
      const matchMatches = q ? allMatches.filter(({ match, tournament }) => {
        const home = tournament.teams.find(t => t.id === match.home);
        const away = tournament.teams.find(t => t.id === match.away);
        return (home && score(home.name)) || (away && score(away.name));
      }).slice(0, 6) : [];

      let html = "";
      if (trMatches.length) {
        html += `<div class="search-group"><div class="search-group__title">${escapeHtml(t("search.tournaments"))}</div>`;
        trMatches.forEach((tr, i) => {
          html += `<button class="search-result ${!q && i === 0 ? "is-active" : ""}" data-kind="tour" data-id="${tr.id}">
            <span class="search-result__icon">${icon("trophy", 16)}</span>
            <div class="search-result__main">
              <div class="search-result__title">${escapeHtml(tr.name)}</div>
              <div class="search-result__sub">${(tr.teams || []).length} ${escapeHtml(t("dash.stat.teams").toLowerCase())} · ${(tr.matches || []).length} ${escapeHtml(t("dash.stat.matches").toLowerCase())}</div>
            </div>
            ${tr.isLive ? `<span class="pill pill--live">${escapeHtml(t("common.live"))}</span>` : ""}
          </button>`;
        });
        html += `</div>`;
      }
      if (teamMatches.length) {
        html += `<div class="search-group"><div class="search-group__title">${escapeHtml(t("search.teams"))}</div>`;
        teamMatches.forEach(({ team, tournament }) => {
          html += `<button class="search-result" data-kind="team" data-tour-id="${tournament.id}">
            <span class="search-result__icon">${teamLogoHTML(team)}</span>
            <div class="search-result__main">
              <div class="search-result__title">${escapeHtml(team.name)}</div>
              <div class="search-result__sub">${escapeHtml(tournament.name)}</div>
            </div>
          </button>`;
        });
        html += `</div>`;
      }
      if (matchMatches.length) {
        html += `<div class="search-group"><div class="search-group__title">${escapeHtml(t("search.matches"))}</div>`;
        matchMatches.forEach(({ match, tournament }) => {
          const home = tournament.teams.find(t => t.id === match.home);
          const away = tournament.teams.find(t => t.id === match.away);
          html += `<button class="search-result" data-kind="match" data-tour-id="${tournament.id}" data-id="${match.id}">
            <span class="search-result__icon">${icon("calendar", 16)}</span>
            <div class="search-result__main">
              <div class="search-result__title">${escapeHtml(home ? home.name : "?")} vs ${escapeHtml(away ? away.name : "?")}</div>
              <div class="search-result__sub">${escapeHtml(tournament.name)} · ${match.time ? escapeHtml(formatTime(new Date(match.time))) : "—"}</div>
            </div>
          </button>`;
        });
        html += `</div>`;
      }
      if (!html) {
        html = `<div class="search-empty"><div>${icon("search", 28)}</div><div class="mt-2 muted">${escapeHtml(t("search.empty"))}</div></div>`;
      }
      results.innerHTML = html;

      $$(".search-result", results).forEach((btn) => {
        btn.addEventListener("click", () => {
          const kind = btn.dataset.kind;
          if (kind === "tour") {
            State.currentTournamentId = btn.dataset.id;
            save(); close(); navigate("dashboard", { currentTab: "overview" });
          } else if (kind === "team") {
            State.currentTournamentId = btn.dataset.tourId;
            save(); close(); navigate("dashboard", { currentTab: "teams" });
          } else if (kind === "match") {
            State.currentTournamentId = btn.dataset.tourId;
            save(); close();
            T.openScoreModal(btn.dataset.id);
          }
        });
        btn.addEventListener("mouseenter", () => {
          $$(".search-result", results).forEach((x) => x.classList.remove("is-active"));
          btn.classList.add("is-active");
        });
      });
    }
    input.addEventListener("input", refresh);
    refresh();
    setTimeout(() => input.focus(), 50);
  }

  // Global keyboard shortcut
  document.addEventListener("keydown", (e) => {
    const isCmdK = (e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K");
    if (isCmdK) {
      e.preventDefault();
      openSearch();
    }
  });
  T.openSearch = openSearch;

  /* ============================================================
     4. TOURNAMENTS LIST VIEW
     ============================================================ */
  function viewTournamentsList() {
    const filter = State.tournamentFilter || "all";
    const all = State.tournaments || [];
    const today = new Date(); today.setHours(0,0,0,0);
    function status(tr) {
      const start = new Date(tr.startDate);
      const end = new Date(tr.endDate || tr.startDate);
      end.setHours(23,59,59,999);
      const now = Date.now();
      if (tr.isLive || (now >= start.getTime() && now <= end.getTime())) return "live";
      if (now < start.getTime()) return "upcoming";
      return "finished";
    }
    const filtered = all.filter((tr) => filter === "all" ? true : status(tr) === filter);

    const navItems = sidebarNavItems("tournaments");
    return `
      <div class="shell">
        ${renderSidebar(navItems)}
        ${State.sidebarOpen ? `<div class="sidebar-mask" data-action="close-sidebar"></div>` : ""}
        <main class="shell__main">
          <header class="topbar">
            <button class="btn btn--ghost btn--icon btn--sm menu-toggle" data-action="toggle-sidebar" aria-label="${escapeHtml(t("nav.more"))}">${icon("menu", 18)}</button>
            <div class="topbar__title">
              <h2>${escapeHtml(t("tlist.title"))}</h2>
              ${T.connectedIndicator()}
            </div>
            <div class="topbar__actions">
              <button class="btn btn--ghost btn--icon btn--sm topbar__action--secondary" data-action="open-search" aria-label="${escapeHtml(t("common.search"))}" title="⌘K">${icon("search", 16)}</button>
              <button class="btn btn--ghost btn--icon btn--sm topbar__action--secondary" data-action="toggle-theme" aria-label="${escapeHtml(t("theme.toggle"))}" title="${escapeHtml(t("theme.toggle"))}">${icon("sun", 16)}</button>
              <button class="btn btn--primary btn--sm" data-action="go-wizard">${icon("plus", 14)} <span class="hide-on-mobile">${escapeHtml(t("welcome.create"))}</span></button>
            </div>
          </header>

          <div class="tab-strip">
            ${["all", "live", "upcoming", "finished"].map((f) => `
              <button class="tab-strip__tab ${filter === f ? "is-active" : ""}" data-action="set-tlist-filter" data-f="${f}">${escapeHtml(t("tlist.filter." + f))}</button>
            `).join("")}
          </div>

          <div class="page">
            <p class="muted mb-3">${escapeHtml(t("tlist.sub"))}</p>
            ${filtered.length === 0 ? `
              <div class="card empty">
                <div class="empty__icon">${icon("trophy", 24)}</div>
                <div class="empty__title">${escapeHtml(t("tlist.empty"))}</div>
                <div class="empty__cta"><button class="btn btn--primary" data-action="go-wizard">${icon("plus",14)} ${escapeHtml(t("welcome.create"))}</button></div>
              </div>
            ` : `
              <div class="tour-grid">
                ${filtered.map((tr) => tournamentCard(tr, status(tr))).join("")}
              </div>
            `}
          </div>
        </main>
      </div>
    `;
  }

  function tournamentCard(tr, st) {
    const matches = tr.matches || [];
    const total = matches.length;
    const done = matches.filter((m) => m.status === "finished").length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const isActive = State.currentTournamentId === tr.id;
    const start = formatDate(new Date(tr.startDate), { day: "2-digit", month: "short" });
    const end = formatDate(new Date(tr.endDate || tr.startDate), { day: "2-digit", month: "short", year: "numeric" });
    return `
      <div class="tour-card ${isActive ? "is-active" : ""}" data-action="open-tournament" data-id="${tr.id}">
        <div class="tour-card__hero">
          <div class="tour-card__crest">${icon("trophy", 28)}</div>
          ${st === "live" ? `<span class="pill pill--live tour-card__badge">${escapeHtml(t("common.live"))}</span>` :
           st === "upcoming" ? `<span class="pill pill--info tour-card__badge">${escapeHtml(t("common.upcoming"))}</span>` :
           `<span class="pill pill--success tour-card__badge">${escapeHtml(t("common.finished"))}</span>`}
        </div>
        <div class="tour-card__body">
          <div class="tour-card__title">${escapeHtml(tr.name)}</div>
          <div class="tour-card__sub">
            <span>${icon("calendar", 12)} ${escapeHtml(start)} – ${escapeHtml(end)}</span>
            ${tr.location ? `<span>${icon("location", 12)} ${escapeHtml(tr.location)}</span>` : ""}
          </div>
          <div class="tour-card__stats">
            <div><b>${(tr.teams || []).length}</b><span>${escapeHtml(t("dash.stat.teams"))}</span></div>
            <div><b>${total}</b><span>${escapeHtml(t("dash.stat.matches"))}</span></div>
            <div><b>${tr.fields}</b><span>${escapeHtml(t("dash.stat.fields"))}</span></div>
          </div>
          <div class="tour-card__progress">
            <div class="tour-card__progress-bar"><div style="width:${pct}%"></div></div>
            <div class="tour-card__progress-lbl">${escapeHtml(t("tlist.matchProgress", { done, total }))}</div>
          </div>
        </div>
      </div>
    `;
  }

  function sidebarNavItems(active) {
    return [
      { id: "dashboard", icon: "home", label: t("nav.dashboard"), active: active === "dashboard" },
      { id: "tournaments", icon: "trophy", label: t("nav.tournaments"), active: active === "tournaments" },
      { id: "teams", icon: "users", label: t("nav.teams"), active: active === "teams" },
      { id: "matches", icon: "calendar", label: t("nav.matches"), active: active === "matches" },
      { id: "fields", icon: "pitch", label: t("nav.fields"), active: active === "fields" },
      { id: "referees", icon: "whistle", label: t("nav.referees"), active: active === "referees" },
      { id: "registrations", icon: "list", label: t("nav.registrations"), active: active === "registrations" },
      { id: "payments", icon: "qr", label: t("nav.payments"), active: active === "payments" },
      { id: "settings", icon: "settings", label: t("nav.settings"), active: active === "settings" },
    ];
  }
  T.sidebarNavItems = sidebarNavItems;

  function renderSidebar(navItems) {
    return `
      <aside class="sidebar ${State.sidebarOpen ? "is-open" : ""}">
        <div class="sidebar__brand">
          <span class="sidebar__brand-mark">${icon("trophy", 16)}</span>
          <span class="sidebar__brand-name">Tournify</span>
        </div>
        <div class="sidebar__cta">
          <button class="btn btn--primary btn--block" data-action="go-wizard">
            ${icon("plus", 16)} <span class="sidebar__cta-text">${escapeHtml(t("welcome.create"))}</span>
          </button>
        </div>
        <nav class="sidebar__nav">
          ${navItems.map((it) => `
            <a class="nav-item ${it.active ? "is-active" : ""}" data-action="${it.id === "dashboard" ? "go-dashboard" : it.id === "tournaments" ? "go-tournaments-list" : "nav-stub"}" data-key="${it.id}">
              ${icon(it.icon, 18)}<span>${escapeHtml(it.label)}</span>
            </a>
          `).join("")}
        </nav>
        <div class="sidebar__profile">
          <span class="avatar">JO</span>
          <div style="min-width:0">
            <div style="font-weight:600;font-size:13px">${escapeHtml(State.user.name)}</div>
            <div class="t3" style="font-size:11.5px">${escapeHtml(t("role.organizer"))}</div>
          </div>
        </div>
      </aside>
    `;
  }
  T.renderSidebar = renderSidebar;

  /* ============================================================
     5. PRINT / PDF EXPORT
     Uses browser's print dialog with a print-specific stylesheet.
     User can choose "Save as PDF" — gives perfect output.
     ============================================================ */
  function openExportMenu() {
    const tour = getTournament();
    if (!tour) return;
    const body = `
      <p class="muted mb-3" style="font-size:13px">${escapeHtml(t("export.opening"))}</p>
      <div class="row" style="flex-direction:column;gap:8px">
        <button class="btn btn--block btn--lg" data-export="full">${icon("download",16)} ${escapeHtml(t("export.full"))}</button>
        <button class="btn btn--block" data-export="schedule">${icon("calendar",16)} ${escapeHtml(t("export.schedule"))}</button>
        <button class="btn btn--block" data-export="standings">${icon("grid",16)} ${escapeHtml(t("export.standings"))}</button>
        ${tour.bracket ? `<button class="btn btn--block" data-export="bracket">${icon("bracket",16)} ${escapeHtml(t("export.bracket"))}</button>` : ""}
      </div>
    `;
    const mod = modal({ title: escapeHtml(t("export.pdf")), body });
    $$("[data-export]", mod.root).forEach((btn) => {
      btn.addEventListener("click", () => {
        const kind = btn.dataset.export;
        mod.close();
        runPrint(tour, kind);
      });
    });
  }

  function runPrint(tour, kind) {
    // Build a hidden print-only container with the requested content
    let frag = document.getElementById("print-root");
    if (!frag) {
      frag = document.createElement("div");
      frag.id = "print-root";
      document.body.appendChild(frag);
    }
    frag.innerHTML = buildPrintHTML(tour, kind);
    document.body.classList.add("printing");
    setTimeout(() => {
      window.print();
      // remove the printing class after a small delay
      setTimeout(() => document.body.classList.remove("printing"), 300);
    }, 100);
  }

  function buildPrintHTML(tour, kind) {
    const teamMap = Object.fromEntries(tour.teams.map((te) => [te.id, te]));
    const tDate = formatDate(new Date(), { day: "2-digit", month: "short", year: "numeric" });
    const tTime = formatTime(new Date());
    const url = location.origin + location.pathname + "#t=" + tour.id;
    const qrSvg = T.QR.svg(url, 96, "#0A0B14", "#FFFFFF");

    const header = `
      <header class="p-head">
        <div class="p-head__left">
          <div class="p-head__brand">${icon("trophy",18)} Tournify</div>
          <h1 class="p-head__title">${escapeHtml(tour.name)}</h1>
          <div class="p-head__meta">
            ${escapeHtml(formatDate(new Date(tour.startDate), { day: "2-digit", month: "short" }))} – ${escapeHtml(formatDate(new Date(tour.endDate || tour.startDate), { day: "2-digit", month: "short", year: "numeric" }))}
            ${tour.location ? " · " + escapeHtml(tour.location) : ""}
            · ${(tour.teams || []).length} ${escapeHtml(t("dash.stat.teams"))}
            · ${tour.fields} ${escapeHtml(t("dash.stat.fields"))}
          </div>
        </div>
        <div class="p-head__qr">${qrSvg}<div>${escapeHtml(url)}</div></div>
      </header>
    `;

    function scheduleSection() {
      const matches = tour.matches || [];
      if (!matches.length) return `<section class="p-sec"><h2>${escapeHtml(t("matches.all"))}</h2><p>${escapeHtml(t("matches.empty"))}</p></section>`;
      const byDate = {};
      matches.forEach((m) => {
        const d = m.time ? new Date(m.time).toISOString().slice(0,10) : "tba";
        (byDate[d] = byDate[d] || []).push(m);
      });
      const days = Object.keys(byDate).sort();
      return `
        <section class="p-sec">
          <h2>${escapeHtml(t("matches.all"))}</h2>
          ${days.map((d) => {
            const dt = d === "tba" ? null : new Date(d + "T00:00:00");
            const label = dt ? formatDate(dt, { weekday: "long", day: "2-digit", month: "long" }) : "TBA";
            return `
              <h3 class="p-day">${escapeHtml(label)}</h3>
              <table class="p-table">
                <thead>
                  <tr>
                    <th>${escapeHtml(t("common.start"))}</th>
                    <th>${escapeHtml(t("label.field"))}</th>
                    <th>${escapeHtml(t("groups.group"))}</th>
                    <th>${escapeHtml(t("dash.stat.teams"))}</th>
                    <th class="p-num">${escapeHtml(t("label.score"))}</th>
                  </tr>
                </thead>
                <tbody>
                  ${byDate[d].map((m) => {
                    const home = teamMap[m.home];
                    const away = teamMap[m.away];
                    const groupName = m.groupId ? ((tour.groups.find(g => g.id === m.groupId) || {}).name || "") : "";
                    return `<tr>
                      <td>${m.time ? escapeHtml(formatTime(new Date(m.time))) : "—"}</td>
                      <td>F${m.field || "?"}</td>
                      <td>${escapeHtml(groupName)}</td>
                      <td>${escapeHtml(home ? home.name : "?")} – ${escapeHtml(away ? away.name : "?")}</td>
                      <td class="p-num">${m.status === "finished" || m.status === "live" ? `${m.hScore ?? "-"} : ${m.aScore ?? "-"}` : "—"}</td>
                    </tr>`;
                  }).join("")}
                </tbody>
              </table>
            `;
          }).join("")}
        </section>
      `;
    }

    function standingsSection() {
      if (!tour.groups || !tour.groups.length) return "";
      return `
        <section class="p-sec">
          <h2>${escapeHtml(t("tabs.groups"))}</h2>
          <div class="p-grid">
            ${tour.groups.map((g) => {
              const standings = T.computeStandings(tour, g.id);
              const adv = parseInt(tour.advancePerGroup, 10) || 2;
              return `
                <div class="p-group">
                  <h3>${escapeHtml(t("groups.group"))} ${escapeHtml(g.name)}</h3>
                  <table class="p-table">
                    <thead>
                      <tr>
                        <th>#</th><th>${escapeHtml(t("dash.stat.teams"))}</th>
                        <th class="p-num">${escapeHtml(t("groups.played"))}</th>
                        <th class="p-num">${escapeHtml(t("groups.wins"))}</th>
                        <th class="p-num">${escapeHtml(t("groups.draws"))}</th>
                        <th class="p-num">${escapeHtml(t("groups.losses"))}</th>
                        <th class="p-num">${escapeHtml(t("groups.gd"))}</th>
                        <th class="p-num">${escapeHtml(t("groups.points"))}</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${(standings.length ? standings : g.teamIds.map((tid) => ({ teamId: tid, name: (teamMap[tid] || {}).name || "?", played: 0, w:0, d:0, l:0, gd:0, pts:0 }))).map((row, i) => `
                        <tr class="${i < adv ? "p-qual" : ""}">
                          <td>${i + 1}</td>
                          <td>${escapeHtml(row.name)}</td>
                          <td class="p-num">${row.played}</td>
                          <td class="p-num">${row.w}</td>
                          <td class="p-num">${row.d}</td>
                          <td class="p-num">${row.l}</td>
                          <td class="p-num">${row.gd > 0 ? "+" : ""}${row.gd}</td>
                          <td class="p-num"><b>${row.pts}</b></td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                </div>
              `;
            }).join("")}
          </div>
        </section>
      `;
    }

    function bracketSection() {
      if (!tour.bracket || !tour.bracket.rounds.length) return "";
      return `
        <section class="p-sec">
          <h2>${escapeHtml(t("bracket.title"))}</h2>
          <div class="p-bracket">
            ${tour.bracket.rounds.map((r) => `
              <div class="p-bracket__round">
                <div class="p-bracket__round-name">${escapeHtml(r.name)}</div>
                ${r.matches.map((m) => {
                  const home = teamMap[m.home];
                  const away = teamMap[m.away];
                  return `
                    <div class="p-bracket__match">
                      <div class="p-bracket__row">
                        <span>${escapeHtml(home ? home.name : (m.homeLabel || "—"))}</span>
                        <b>${m.hScore ?? "-"}</b>
                      </div>
                      <div class="p-bracket__row">
                        <span>${escapeHtml(away ? away.name : (m.awayLabel || "—"))}</span>
                        <b>${m.aScore ?? "-"}</b>
                      </div>
                    </div>
                  `;
                }).join("")}
              </div>
            `).join("")}
          </div>
        </section>
      `;
    }

    let sections = "";
    if (kind === "full") sections = scheduleSection() + standingsSection() + bracketSection();
    else if (kind === "schedule") sections = scheduleSection();
    else if (kind === "standings") sections = standingsSection();
    else if (kind === "bracket") sections = bracketSection();

    return `
      <div class="p-doc">
        ${header}
        ${sections}
        <footer class="p-foot">
          Tournify · ${escapeHtml(tDate)} ${escapeHtml(tTime)}
        </footer>
      </div>
    `;
  }
  T.openExportMenu = openExportMenu;
  T.runPrint = runPrint;

  /* ============================================================
     6. LIVE ENERGY: connected indicator + event feed component
     ============================================================ */
  function connectedIndicator() {
    return `<span class="conn"><span class="conn__dot"></span>${escapeHtml(t("conn.connected"))}</span>`;
  }
  T.connectedIndicator = connectedIndicator;

  // Event feed: synthesizes a feed from match data
  function buildLiveFeed(tour) {
    const feed = [];
    (tour.matches || []).forEach((m) => {
      const home = tour.teams.find((te) => te.id === m.home);
      const away = tour.teams.find((te) => te.id === m.away);
      if (!home || !away) return;
      if (m.status === "live") {
        feed.push({
          when: Date.now() - (m.liveMinute || 0) * 60000,
          kind: "kickoff",
          text: t("feed.kickoff", { home: home.name, away: away.name }),
          icon: "play",
        });
        (m.events || []).forEach((e) => {
          if (e.kind === "goal") {
            // approximate scores at this point
            const evs = m.events.slice(0, m.events.indexOf(e) + 1);
            const hs = evs.filter((x) => x.kind === "goal" && x.team === "home").length;
            const as = evs.filter((x) => x.kind === "goal" && x.team === "away").length;
            const team = e.team === "home" ? home.name : away.name;
            feed.push({
              when: Date.now() - ((m.liveMinute || 0) - e.minute) * 60000,
              kind: "goal",
              text: t("feed.goal", { team, hs, as }),
              icon: "soccer",
            });
          }
        });
      }
      if (m.status === "finished" && m.hScore != null) {
        feed.push({
          when: Date.now() - 5 * 60000,
          kind: "fulltime",
          text: t("feed.fulltime", { home: home.name, away: away.name, hs: m.hScore, as: m.aScore }),
          icon: "check",
        });
      }
    });
    feed.sort((a, b) => b.when - a.when);
    return feed.slice(0, 6);
  }
  T.buildLiveFeed = buildLiveFeed;

  /* ============================================================
     7. New action handlers (extend existing dispatcher)
     ============================================================ */
  // Override views3.js render to also handle the new "tournaments-list" view
  const originalRender = T.render;
  T.render = function () {
    if (State.view === "tournaments-list") {
      const root = $("#app");
      root.dataset.view = State.view;
      document.documentElement.lang = T.getLanguage();
      root.innerHTML = viewTournamentsList();
      // Bind action listeners using the patched T.onAction
      $$("[data-action]").forEach((el) => el.addEventListener("click", T.onAction));
      return;
    }
    originalRender.apply(this, arguments);
  };

  // Patch the action handler to add the new actions
  const originalOnAction = T.onAction;
  T.onAction = function (e) {
    const el = e.currentTarget;
    const a = el.dataset.action;
    const data = el.dataset;

    switch (a) {
      case "open-search":          e.stopPropagation(); openSearch(); return;
      case "toggle-theme":         e.stopPropagation(); toggleTheme(); return;
      case "go-tournaments-list":  e.stopPropagation(); navigate("tournaments-list", { sidebarOpen: false }); return;
      case "set-tlist-filter":     e.stopPropagation(); setState({ tournamentFilter: data.f }); return;
      case "open-tournament":      e.stopPropagation(); State.currentTournamentId = data.id; save(); navigate("dashboard", { currentTab: "overview" }); return;
      case "export-pdf":           e.stopPropagation(); openExportMenu(); return;
      default:
        if (originalOnAction) return originalOnAction.call(this, e);
    }
  };

  // Update theme icon dynamically (sun in dark mode, moon in light mode).
  // The dashboard view always inserts a "sun" icon — we swap it after render.
  function updateThemeIcon() {
    const isDark = getTheme() === "dark";
    const wantedName = isDark ? "sun" : "moon";
    const btns = $$('button[data-action="toggle-theme"]');
    btns.forEach((btn) => {
      // Replace inner content with the new icon SVG. Browser parses it with the
      // correct SVG namespace when it's set via innerHTML.
      btn.innerHTML = icon(wantedName, 16);
    });
  }
  T.updateThemeIcon = updateThemeIcon;

  // Add live feed widget into the overview tab — patch tabOverview
  const origTabOverview = T.tabOverview;
  T.tabOverview = function (tour) {
    let html = origTabOverview.apply(this, arguments);
    const feed = buildLiveFeed(tour);
    if (feed.length === 0) return html;
    const feedHTML = `
      <div class="card mt-3">
        <div class="section-head">
          <h3>${escapeHtml(t("feed.title"))}</h3>
          <span class="conn"><span class="conn__dot"></span>${escapeHtml(t("conn.connected"))}</span>
        </div>
        <div class="feed">
          ${feed.map((ev, i) => `
            <div class="feed__item" style="animation-delay:${i * 60}ms">
              <span class="feed__icon">${icon(ev.icon, 14)}</span>
              <span class="feed__text">${escapeHtml(ev.text)}</span>
              <span class="feed__time mono">${ago(ev.when, true)}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
    return html + feedHTML;
  };
})();

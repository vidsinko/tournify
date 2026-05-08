/* ============================================================
   TOURNIFY — Views (part 2)
   Matches, Groups, Teams, Brackets, Fields, Referees, Settings
   Score entry modal
   ============================================================ */
(function () {
  "use strict";
  const T = window._Tournify;
  const {
    State, save, setState, getTournament, navigate,
    buildGroups, generateSchedule, computeStandings, generateBracket,
    icon, teamLogoHTML, escapeHtml, ago, toast, modal,
    $, $$, uid, clamp,
    t, formatDate, formatTime, matchRow, emptyMatchesInline,
  } = T;

  /* ----- Matches tab ----- */
  function tabMatches(tour) {
    const matches = tour.matches || [];
    if (!matches.length) {
      return `<div class="card">${emptyMatchesInline()}</div>`;
    }
    // Group by date
    const byDate = {};
    matches.forEach((m) => {
      const d = m.time ? new Date(m.time).toISOString().slice(0, 10) : "tba";
      (byDate[d] = byDate[d] || []).push(m);
    });
    const days = Object.keys(byDate).sort();

    return `
      <div class="page__head">
        <div class="page__title"><h1>${escapeHtml(t("matches.all"))}</h1>
          <p class="muted mt-1" style="font-size:13.5px">${matches.length} ${escapeHtml(t("dash.stat.matches").toLowerCase())} · ${tour.fields} ${escapeHtml(t("label.fields").toLowerCase())}</p>
        </div>
        <div class="row">
          <button class="btn" data-action="regenerate-schedule">${icon("refresh", 14)} ${escapeHtml(t("matches.regenerate"))}</button>
        </div>
      </div>

      ${days.map((d) => {
        const dt = d === "tba" ? null : new Date(d + "T00:00:00");
        const label = dt ? formatDate(dt, { weekday: "short", day: "2-digit", month: "short" }) : "TBA";
        return `
          <div class="card mt-3">
            <div class="section-head">
              <h3>${escapeHtml(label)}</h3>
              <span class="t3" style="font-size:12px">${byDate[d].length} ${escapeHtml(t("dash.stat.matches").toLowerCase())}</span>
            </div>
            ${byDate[d].map((m) => matchRow(tour, m)).join("")}
          </div>
        `;
      }).join("")}
    `;
  }

  /* ----- Groups tab ----- */
  function tabGroups(tour) {
    const groups = tour.groups || [];
    if (!groups.length) {
      return `<div class="card empty">
        <div class="empty__icon">${icon("grid", 22)}</div>
        <div class="empty__title">${escapeHtml(t("groups.empty"))}</div>
        <div class="empty__cta"><button class="btn btn--primary" data-action="regenerate-groups">${escapeHtml(t("groups.generate"))}</button></div>
      </div>`;
    }
    const adv = parseInt(tour.advancePerGroup, 10) || 2;

    return `
      <div class="page__head">
        <div class="page__title"><h1>${escapeHtml(t("tabs.groups"))}</h1>
          <p class="muted mt-1" style="font-size:13.5px">${groups.length} ${escapeHtml(t("groups.group").toLowerCase())} · ${escapeHtml(t("groups.qualified"))}: ${escapeHtml(t("wizard.format.firstN", { n: adv }))}</p>
        </div>
        <button class="btn" data-action="regenerate-groups">${icon("refresh", 14)} ${escapeHtml(t("groups.regenerate"))}</button>
      </div>

      <div class="dash-grid">
        ${groups.map((g) => {
          const standings = computeStandings(tour, g.id);
          const teamMap = Object.fromEntries(tour.teams.map((te) => [te.id, te]));
          return `
            <div class="card group-card">
              <div class="group-card__head">
                <div class="group-card__name">${escapeHtml(t("groups.group"))} ${escapeHtml(g.name)}</div>
                <span class="pill pill--primary">${g.teamIds.length} ${escapeHtml(t("dash.stat.teams").toLowerCase())}</span>
              </div>
              <div class="table-wrap">
                <table class="standings">
                  <thead>
                    <tr>
                      <th class="rank">#</th>
                      <th>${escapeHtml(t("dash.stat.teams"))}</th>
                      <th class="num">${escapeHtml(t("groups.played"))}</th>
                      <th class="num col-w">${escapeHtml(t("groups.wins"))}</th>
                      <th class="num col-d">${escapeHtml(t("groups.draws"))}</th>
                      <th class="num col-l">${escapeHtml(t("groups.losses"))}</th>
                      <th class="num">${escapeHtml(t("groups.gd"))}</th>
                      <th class="num">${escapeHtml(t("groups.points"))}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${standings.length === 0
                      ? g.teamIds.map((tid, i) => {
                          const team = teamMap[tid];
                          return `<tr>
                            <td class="rank">${i + 1}</td>
                            <td><div class="row">${teamLogoHTML(team)}<span style="font-weight:600">${escapeHtml(team ? team.name : "?")}</span></div></td>
                            <td class="num">0</td><td class="num col-w">0</td><td class="num col-d">0</td><td class="num col-l">0</td><td class="num">0</td><td class="num num--strong">0</td>
                          </tr>`;
                        }).join("")
                      : standings.map((row, i) => {
                          const team = teamMap[row.teamId];
                          return `<tr class="${i < adv ? "qual" : ""}">
                            <td class="rank">${i + 1}</td>
                            <td><div class="row">${teamLogoHTML(team)}<span style="font-weight:600">${escapeHtml(row.name)}</span></div></td>
                            <td class="num">${row.played}</td>
                            <td class="num col-w">${row.w}</td>
                            <td class="num col-d">${row.d}</td>
                            <td class="num col-l">${row.l}</td>
                            <td class="num">${row.gd > 0 ? "+" : ""}${row.gd}</td>
                            <td class="num num--strong">${row.pts}</td>
                          </tr>`;
                        }).join("")
                    }
                  </tbody>
                </table>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  /* ----- Teams tab ----- */
  function tabTeams(tour) {
    const teams = tour.teams || [];
    return `
      <div class="page__head">
        <div class="page__title"><h1>${escapeHtml(t("tabs.teams"))}</h1>
          <p class="muted mt-1" style="font-size:13.5px">${teams.length} ${escapeHtml(t("dash.stat.teams").toLowerCase())}</p>
        </div>
        <button class="btn btn--primary" data-action="add-team">${icon("plus", 14)} ${escapeHtml(t("wizard.teams.add"))}</button>
      </div>
      <div class="card">
        ${teams.length === 0
          ? `<div class="empty"><div class="empty__icon">${icon("users",22)}</div><div class="empty__title">${escapeHtml(t("wizard.teams.empty"))}</div></div>`
          : `<div style="padding:6px">
              ${teams.map((te) => {
                const groupName = (() => {
                  const g = (tour.groups || []).find((gg) => gg.teamIds.includes(te.id));
                  return g ? g.name : "—";
                })();
                const matchesPlayed = (tour.matches || []).filter((m) => (m.home === te.id || m.away === te.id) && m.status === "finished").length;
                const totalMatches = (tour.matches || []).filter((m) => m.home === te.id || m.away === te.id).length;
                return `
                  <div class="activity__item" style="grid-template-columns:auto 1fr auto auto auto;gap:14px">
                    ${teamLogoHTML(te, "md")}
                    <div>
                      <div class="activity__title" style="font-size:14.5px">${escapeHtml(te.name)}</div>
                      <div class="activity__sub">${escapeHtml(t("groups.group"))} ${escapeHtml(groupName)}</div>
                    </div>
                    <div class="t3 mono" style="font-size:12.5px">${matchesPlayed}/${totalMatches}</div>
                    <button class="btn btn--ghost btn--sm" data-action="edit-team" data-id="${te.id}">${icon("edit",14)}</button>
                    <button class="btn btn--ghost btn--sm" data-action="delete-team" data-id="${te.id}">${icon("trash",14)}</button>
                  </div>
                `;
              }).join("")}
            </div>`
        }
      </div>
    `;
  }

  /* ----- Brackets tab ----- */
  function tabBrackets(tour) {
    if (!tour.bracket || !tour.bracket.rounds || !tour.bracket.rounds.length) {
      return `<div class="card empty">
        <div class="empty__icon">${icon("bracket", 22)}</div>
        <div class="empty__title">${escapeHtml(t("bracket.empty"))}</div>
        <div class="empty__cta"><button class="btn btn--primary" data-action="regenerate-bracket">${escapeHtml(t("bracket.generate"))}</button></div>
      </div>`;
    }
    const teamMap = Object.fromEntries(tour.teams.map((te) => [te.id, te]));

    return `
      <div class="page__head">
        <div class="page__title"><h1>${escapeHtml(t("bracket.title"))}</h1>
          <p class="muted mt-1" style="font-size:13.5px">${tour.bracket.rounds.length} ${escapeHtml(t("label.round").toLowerCase())}</p>
        </div>
        <button class="btn" data-action="regenerate-bracket">${icon("refresh", 14)} ${escapeHtml(t("matches.regenerate"))}</button>
      </div>

      <div class="card">
        <div class="bracket">
          ${tour.bracket.rounds.map((r) => `
            <div class="bracket__round">
              <div class="bracket__round-label">${escapeHtml(r.name)}</div>
              ${r.matches.map((m) => {
                const home = teamMap[m.home];
                const away = teamMap[m.away];
                const isLive = m.status === "live";
                const homeWin = m.hScore != null && m.aScore != null && m.hScore > m.aScore;
                const awayWin = m.hScore != null && m.aScore != null && m.aScore > m.hScore;
                return `
                  <div class="bracket__match ${isLive ? "is-live" : ""}">
                    <div class="bracket__row ${homeWin ? "winner" : ""}">
                      <div class="name">${home ? teamLogoHTML(home) : `<span class="tlogo" style="background:var(--surface-2);color:var(--text-3)">?</span>`}<span>${escapeHtml(home ? home.name : (m.homeLabel || t("bracket.tbd")))}</span></div>
                      <div class="score">${m.hScore ?? "-"}</div>
                    </div>
                    <div class="bracket__row ${awayWin ? "winner" : ""}">
                      <div class="name">${away ? teamLogoHTML(away) : `<span class="tlogo" style="background:var(--surface-2);color:var(--text-3)">?</span>`}<span>${escapeHtml(away ? away.name : (m.awayLabel || t("bracket.tbd")))}</span></div>
                      <div class="score">${m.aScore ?? "-"}</div>
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  /* ----- Fields tab ----- */
  function tabFields(tour) {
    const fields = Array.from({ length: tour.fields }, (_, i) => i + 1);
    return `
      <div class="page__head">
        <div class="page__title"><h1>${escapeHtml(t("tabs.fields"))}</h1>
          <p class="muted mt-1" style="font-size:13.5px">${tour.fields} ${escapeHtml(t("label.fields").toLowerCase())}</p>
        </div>
      </div>
      <div class="dash-grid">
        ${fields.map((f) => {
          const onField = (tour.matches || []).filter((m) => m.field === f);
          return `
            <div class="card group-card">
              <div class="group-card__head">
                <div class="group-card__name">${icon("pitch", 16)} ${escapeHtml(t("label.field"))} ${f}</div>
                <span class="pill">${onField.length} ${escapeHtml(t("dash.stat.matches").toLowerCase())}</span>
              </div>
              ${onField.length === 0 ? `<div class="t3" style="padding:14px;text-align:center;font-size:13px">—</div>` :
                onField.slice(0, 6).map((m) => matchRow(tour, m)).join("")}
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  /* ----- Referees tab ----- */
  function tabReferees(tour) {
    return `
      <div class="page__head">
        <div class="page__title"><h1>${escapeHtml(t("tabs.referees"))}</h1></div>
        <button class="btn btn--primary" data-action="add-referee">${icon("plus", 14)} ${escapeHtml(t("common.add"))}</button>
      </div>
      <div class="card empty">
        <div class="empty__icon">${icon("whistle", 22)}</div>
        <div class="empty__title">${escapeHtml(t("nav.referees"))}</div>
        <p class="empty__sub">${escapeHtml(t("common.add"))} ${escapeHtml(t("nav.referees").toLowerCase())}.</p>
      </div>
    `;
  }

  /* ----- Settings tab ----- */
  function tabSettings(tour) {
    return `
      <div class="page__head">
        <div class="page__title"><h1>${escapeHtml(t("tabs.settings"))}</h1></div>
      </div>
      <div class="card card--pad">
        <div class="eyebrow mb-2">${escapeHtml(t("wizard.step.basics"))}</div>
        <div class="wizard__row">
          <div class="field" style="grid-column: 1 / -1">
            <label class="field__label">${escapeHtml(t("wizard.field.name"))}</label>
            <input class="input" id="set-name" value="${escapeHtml(tour.name)}" />
          </div>
          <div class="field">
            <label class="field__label">${escapeHtml(t("wizard.field.location"))}</label>
            <input class="input" id="set-location" value="${escapeHtml(tour.location || "")}" />
          </div>
          <div class="field">
            <label class="field__label">${escapeHtml(t("wizard.field.fields"))}</label>
            <input class="input" type="number" min="1" max="20" id="set-fields" value="${tour.fields}" />
          </div>
          <div class="field">
            <label class="field__label">${escapeHtml(t("wizard.field.matchLength"))}</label>
            <input class="input" type="number" min="5" max="120" step="5" id="set-matchLength" value="${tour.matchLength}" />
          </div>
          <div class="field">
            <label class="field__label">${escapeHtml(t("wizard.field.breakLength"))}</label>
            <input class="input" type="number" min="0" max="60" step="1" id="set-breakLength" value="${tour.breakLength}" />
          </div>
        </div>
        <div class="row mt-4">
          <button class="btn btn--primary" data-action="save-settings">${icon("check",14)} ${escapeHtml(t("common.save"))}</button>
          <button class="btn btn--danger right" data-action="delete-tournament">${icon("trash",14)} ${escapeHtml(t("common.delete"))}</button>
        </div>
      </div>
    `;
  }

  /* ----- Score entry modal ----- */
  function openScoreModal(matchId) {
    const tour = getTournament();
    if (!tour) return;
    const m = (tour.matches || []).find((x) => x.id === matchId)
      || (tour.bracket ? tour.bracket.rounds.flatMap(r => r.matches).find(x => x.id === matchId) : null);
    if (!m) return;
    const home = tour.teams.find((t) => t.id === m.home);
    const away = tour.teams.find((t) => t.id === m.away);
    const hScore = m.hScore ?? 0;
    const aScore = m.aScore ?? 0;

    const body = `
      <div class="row" style="gap:8px;margin-bottom:14px;flex-wrap:wrap">
        ${m.status === "live" ? `<span class="pill pill--live">${m.liveMinute || 0}'</span>` :
         m.status === "finished" ? `<span class="pill pill--success">${escapeHtml(t("common.finished"))}</span>` :
         `<span class="pill">${escapeHtml(t("common.scheduled"))}</span>`}
        ${m.field ? `<span class="pill">${escapeHtml(t("label.field"))} ${m.field}</span>` : ""}
        ${m.time ? `<span class="pill">${escapeHtml(formatTime(new Date(m.time)))}</span>` : ""}
        ${m.groupId ? `<span class="pill pill--primary">${escapeHtml(t("groups.group"))} ${escapeHtml((tour.groups.find(g => g.id === m.groupId) || {}).name || "")}</span>` : ""}
      </div>
      <div class="score-input">
        <div class="score-input__team">
          ${home ? teamLogoHTML(home, "lg") : `<span class="tlogo tlogo--lg">?</span>`}
          <div class="score-input__team-name">${escapeHtml(home ? home.name : (m.homeLabel || "—"))}</div>
          <input class="score-input__num" type="number" min="0" id="score-h" value="${hScore}" />
        </div>
        <div class="score-input__sep">:</div>
        <div class="score-input__team">
          ${away ? teamLogoHTML(away, "lg") : `<span class="tlogo tlogo--lg">?</span>`}
          <div class="score-input__team-name">${escapeHtml(away ? away.name : (m.awayLabel || "—"))}</div>
          <input class="score-input__num" type="number" min="0" id="score-a" value="${aScore}" />
        </div>
      </div>
    `;
    const footer = `
      ${m.status === "scheduled" ? `<button class="btn" data-act="start">${icon("play",14)} ${escapeHtml(t("matches.startMatch"))}</button>` : ""}
      ${m.status === "live" ? `<button class="btn btn--success" data-act="end">${icon("check",14)} ${escapeHtml(t("matches.confirmEnd"))}</button>` : ""}
      <button class="btn btn--primary" data-act="save">${icon("check",14)} ${escapeHtml(t("common.save"))}</button>
    `;
    const mod = modal({ title: escapeHtml(t("matches.enterScore")), body, footer, size: "lg" });

    function readScores() {
      const h = parseInt($("#score-h", mod.root).value, 10);
      const a = parseInt($("#score-a", mod.root).value, 10);
      return { h: isNaN(h) ? 0 : h, a: isNaN(a) ? 0 : a };
    }

    $$("[data-act]", mod.root).forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.act;
        const { h, a } = readScores();
        m.hScore = h; m.aScore = a;
        if (action === "start") {
          m.status = "live"; m.liveMinute = 1;
        }
        if (action === "end") {
          m.status = "finished"; m.liveMinute = null;
          // Add activity entry
          const ho = tour.teams.find((te) => te.id === m.home);
          const aw = tour.teams.find((te) => te.id === m.away);
          if (ho && aw) tour.activity.unshift({ at: Date.now(), kind: "score", text: `${ho.name} ${h} - ${a} ${aw.name}` });
          // Auto-update bracket if all group matches done
          if (m.stage === "group" && tour.bracket) {
            const allFinished = (tour.matches || []).every((x) => x.status === "finished");
            if (allFinished) tour.bracket = generateBracket(tour);
          }
        }
        if (action === "save") {
          if (m.status === "scheduled" && (h > 0 || a > 0)) {
            m.status = "finished";
          }
        }
        save();
        toast(t("matches.scoreSaved"), "success");
        mod.close();
        T.render();
      });
    });
  }

  /* ----- Settings save ----- */
  function saveSettings() {
    const tour = getTournament();
    if (!tour) return;
    tour.name = $("#set-name").value.trim() || tour.name;
    tour.location = $("#set-location").value;
    tour.fields = parseInt($("#set-fields").value, 10) || tour.fields;
    tour.matchLength = parseInt($("#set-matchLength").value, 10) || tour.matchLength;
    tour.breakLength = parseInt($("#set-breakLength").value, 10) || tour.breakLength;
    save();
    toast(t("sys.saved"), "success");
    T.render();
  }

  function deleteTournament() {
    if (!confirm(t("sys.confirmDelete"))) return;
    const tour = getTournament();
    if (!tour) return;
    State.tournaments = State.tournaments.filter((x) => x.id !== tour.id);
    State.currentTournamentId = State.tournaments.length ? State.tournaments[0].id : null;
    save();
    if (State.tournaments.length) navigate("dashboard"); else navigate("welcome");
  }

  /* ----- Regeneration helpers ----- */
  function regenerateSchedule() {
    const tour = getTournament();
    if (!tour) return;
    tour.matches = generateSchedule(tour);
    save();
    toast(t("sys.scheduleGenerated"), "success");
    T.render();
  }
  function regenerateGroups() {
    const tour = getTournament();
    if (!tour) return;
    tour.groups = buildGroups(tour.teams, tour.groupsCount || 2);
    tour.matches = generateSchedule(tour);
    save();
    toast(t("sys.scheduleGenerated"), "success");
    T.render();
  }
  function regenerateBracket() {
    const tour = getTournament();
    if (!tour) return;
    tour.bracket = generateBracket(tour);
    save();
    toast(t("sys.bracketGenerated"), "success");
    T.render();
  }

  /* ----- Share modal ----- */
  function openShareModal() {
    const tour = getTournament();
    if (!tour) return;
    const url = location.origin + location.pathname + "#t=" + tour.id;
    // Prefer the real QR encoder from phase2 (T.simpleQR), fall back to local placeholder
    const qrSvg = (T.simpleQR ? T.simpleQR(url, 200) : simpleQR(url, 200));
    const body = `
      <div style="text-align:center;padding:8px 0">
        <div style="display:inline-block;background:white;padding:14px;border-radius:14px">${qrSvg}</div>
        <div class="mt-3 t3" style="font-size:12.5px">${escapeHtml(t("public.info"))}</div>
        <div class="input-group mt-2" style="text-align:left">
          <input value="${escapeHtml(url)}" readonly id="share-link" />
          <button class="btn btn--sm btn--primary" data-copy>${icon("share",14)} ${escapeHtml(t("common.copy"))}</button>
        </div>
      </div>
    `;
    const mod = modal({ title: escapeHtml(t("dash.shareTournament")), body });
    $("[data-copy]", mod.root).addEventListener("click", () => {
      const inp = $("#share-link", mod.root);
      inp.select();
      try { navigator.clipboard.writeText(inp.value); toast(t("sys.linkCopied"), "success"); }
      catch { document.execCommand("copy"); toast(t("sys.linkCopied"), "success"); }
    });
  }

  // Tiny QR placeholder — we render a styled grid pattern (real QR not strictly needed for demo).
  // For a believable visual, render a deterministic 21x21 dot grid with corner finders.
  function simpleQR(text, size) {
    const N = 25;
    const cell = Math.floor(size / N);
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
    function rnd() { h = (h * 1664525 + 1013904223) >>> 0; return h / 0xffffffff; }
    let svg = `<svg width="${N * cell}" height="${N * cell}" viewBox="0 0 ${N * cell} ${N * cell}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">`;
    svg += `<rect width="100%" height="100%" fill="white"/>`;
    function isFinder(x, y) {
      const inCorner = (cx, cy) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
      return inCorner(0,0) || inCorner(N-7,0) || inCorner(0,N-7);
    }
    function finderDot(x,y){
      const inCorner = (cx,cy) =>
        (x===cx||x===cx+6) && y>=cy && y<=cy+6 ||
        (y===cy||y===cy+6) && x>=cx && x<=cx+6 ||
        (x>=cx+2 && x<=cx+4 && y>=cy+2 && y<=cy+4);
      return inCorner(0,0) || inCorner(N-7,0) || inCorner(0,N-7);
    }
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        let on = false;
        if (isFinder(x, y)) {
          on = finderDot(x, y);
        } else {
          on = rnd() > 0.55;
        }
        if (on) svg += `<rect x="${x*cell}" y="${y*cell}" width="${cell}" height="${cell}" fill="#0A0B14"/>`;
      }
    }
    svg += "</svg>";
    return svg;
  }

  // Expose
  T.tabMatches = tabMatches;
  T.tabGroups = tabGroups;
  T.tabTeams = tabTeams;
  T.tabBrackets = tabBrackets;
  T.tabFields = tabFields;
  T.tabReferees = tabReferees;
  T.tabSettings = tabSettings;
  T.openScoreModal = openScoreModal;
  T.openShareModal = openShareModal;
  T.saveSettings = saveSettings;
  T.deleteTournament = deleteTournament;
  T.regenerateSchedule = regenerateSchedule;
  T.regenerateGroups = regenerateGroups;
  T.regenerateBracket = regenerateBracket;
  T.simpleQR = simpleQR;
})();

/* ============================================================
   TOURNIFY — Views (part 3) + Boot
   Public tournament page, Mobile live-match, My-team, Notifications
   Render orchestrator + action handler
   ============================================================ */
(function () {
  "use strict";
  const T = window._Tournify;
  const {
    State, save, setState, getTournament, navigate, ensureDemoIfEmpty, load,
    icon, teamLogoHTML, escapeHtml, ago, toast, modal,
    $, $$, uid, clamp,
    t, setLanguage, getLanguage, getLanguages, formatDate, formatTime,
  } = T;

  /* ----- Public tournament page (mobile-styled) ----- */
  function viewPublic() {
    ensureDemoIfEmpty();
    const tour = getTournament();
    if (!tour) {
      return `<div class="page"><div class="empty"><div class="empty__title">—</div></div></div>`;
    }
    const liveMatches = (tour.matches || []).filter((m) => m.status === "live");
    const teamMap = Object.fromEntries(tour.teams.map((te) => [te.id, te]));

    return `
      <div class="public mview">
        <div class="mview__head">
          <button class="mview__back" data-action="back-from-public">${icon("chev_left", 18)} ${escapeHtml(t("common.back"))}</button>
          <button class="btn btn--ghost btn--icon btn--sm" data-action="share-tournament">${icon("share", 16)}</button>
        </div>

        <div class="public__hero">
          <div class="public__crest">
            <div class="public__crest-icon">${icon("trophy", 32)}</div>
            <div class="public__crest-name">CHAMPIONS CUP</div>
          </div>
        </div>

        <div class="public__meta">
          <h1 class="public__title">${escapeHtml(tour.name)}</h1>
          <div class="public__info">
            <span>${icon("calendar", 14)} ${escapeHtml(formatDate(new Date(tour.startDate), { day: "2-digit", month: "short" }))} – ${escapeHtml(formatDate(new Date(tour.endDate || tour.startDate), { day: "2-digit", month: "short", year: "numeric" }))}</span>
            ${tour.location ? `<span>${icon("location", 14)} ${escapeHtml(tour.location)}</span>` : ""}
            <span>${icon("users", 14)} ${tour.teams.length} ${escapeHtml(t("dash.stat.teams"))} · ${tour.fields} ${escapeHtml(t("dash.stat.fields"))}</span>
          </div>
        </div>

        <div class="public__actions">
          <button class="public__action" data-action="go-tab" data-tab="overview">${icon("info", 22)}<span class="public__action__label">${escapeHtml(t("public.info"))}</span></button>
          <button class="public__action" data-action="go-public-tab" data-tab="teams">${icon("users", 22)}<span class="public__action__label">${escapeHtml(t("dash.stat.teams"))}</span></button>
          <button class="public__action" data-action="go-public-tab" data-tab="groups">${icon("grid", 22)}<span class="public__action__label">${escapeHtml(t("tabs.groups"))}</span></button>
          <button class="public__action" data-action="go-public-tab" data-tab="bracket">${icon("bracket", 22)}<span class="public__action__label">${escapeHtml(t("tabs.brackets"))}</span></button>
        </div>

        ${liveMatches.length > 0 ? `
          <div class="card" style="margin: 0 20px 20px">
            <div class="section-head">
              <h3>${escapeHtml(t("public.liveMatches"))}</h3>
              <button class="btn btn--ghost btn--sm" data-action="go-public-tab" data-tab="matches">${escapeHtml(t("common.viewAll"))}</button>
            </div>
            <div>
              ${liveMatches.slice(0, 4).map((m) => {
                const home = teamMap[m.home];
                const away = teamMap[m.away];
                const groupName = m.groupId ? ((tour.groups.find(g => g.id === m.groupId) || {}).name || "") : "";
                return `
                  <div class="match-row is-live" data-action="go-mobile-match" data-id="${m.id}">
                    <div class="match-row__time">
                      <span style="font-weight:700;color:white">R${m.round || 1}</span>
                      <span class="field">${escapeHtml(t("groups.group"))} ${escapeHtml(groupName)}</span>
                    </div>
                    <div class="match-row__teams">
                      <div class="match-row__team">${teamLogoHTML(home)}<span class="match-row__team-name">${escapeHtml(home ? home.name : "?")}</span></div>
                      <div class="match-row__score">${m.hScore ?? 0} - ${m.aScore ?? 0}</div>
                      <div class="match-row__team match-row__team--right">${teamLogoHTML(away)}<span class="match-row__team-name">${escapeHtml(away ? away.name : "?")}</span></div>
                    </div>
                    <div class="match-row__status"><span class="pill pill--live">${m.liveMinute || 0}'</span></div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        ` : ""}

        <div class="card" style="margin: 0 20px 20px">
          <div class="section-head">
            <h3>${escapeHtml(t("public.allMatches"))}</h3>
            <button class="btn btn--ghost btn--sm" data-action="go-tab" data-tab="matches">${escapeHtml(t("common.viewAll"))}</button>
          </div>
          <div>
            ${(tour.matches || []).slice(0, 5).map((m) => T.matchRow(tour, m)).join("")}
          </div>
        </div>

        <nav class="mbottomnav">
          <button class="mbottomnav__item is-active" data-action="back-from-public">${icon("home", 20)}<span>${escapeHtml(t("nav.home"))}</span></button>
          <button class="mbottomnav__item" data-action="go-tab" data-tab="matches">${icon("calendar", 20)}<span>${escapeHtml(t("nav.matches"))}</span></button>
          <button class="mbottomnav__item" data-action="go-mobile-team">${icon("users", 20)}<span>${escapeHtml(t("dash.stat.teams"))}</span></button>
          <button class="mbottomnav__item" data-action="go-mobile-notif">${icon("bell", 20)}<span>${escapeHtml(t("nav.notifications"))}</span></button>
        </nav>
      </div>
    `;
  }

  /* ----- Mobile live match ----- */
  function viewMobileLiveMatch() {
    ensureDemoIfEmpty();
    const tour = getTournament();
    if (!tour) return "";
    const m = (tour.matches || []).find((x) => x.id === State.matchId)
      || (tour.matches || []).find((x) => x.status === "live")
      || tour.matches[0];
    if (!m) return `<div class="page"><div class="empty"><div class="empty__title">—</div></div></div>`;

    const home = tour.teams.find((te) => te.id === m.home);
    const away = tour.teams.find((te) => te.id === m.away);
    const groupName = m.groupId ? ((tour.groups.find(g => g.id === m.groupId) || {}).name || "") : "";

    return `
      <div class="mview">
        <div class="mview__head">
          <button class="mview__back" data-action="go-public">${icon("chev_left", 18)} ${escapeHtml(t("common.back"))}</button>
          <div class="mview__title">${escapeHtml(t("dash.live"))}</div>
          ${m.status === "live" ? `<span class="pill pill--live">${escapeHtml(t("common.live"))}</span>` :
            m.status === "finished" ? `<span class="pill pill--success">${escapeHtml(t("common.finished"))}</span>` :
            `<span class="pill">${escapeHtml(t("common.scheduled"))}</span>`}
        </div>

        <div class="live-hero">
          <div class="live-hero__group">${escapeHtml(tour.name)} · ${escapeHtml(t("groups.group"))} ${escapeHtml(groupName)} · R${m.round || 1}</div>
          <div class="live-hero__teams">
            <div class="live-hero__team">
              ${teamLogoHTML(home, "lg")}
              <div class="live-hero__team-name">${escapeHtml(home ? home.name : "?")}</div>
            </div>
            <div>
              <div class="live-hero__score">${m.hScore ?? 0} - ${m.aScore ?? 0}</div>
              <div class="live-hero__time">${m.status === "live" ? (m.liveMinute || 0) + ":00" : (m.time ? formatTime(new Date(m.time)) : "—")}</div>
            </div>
            <div class="live-hero__team">
              ${teamLogoHTML(away, "lg")}
              <div class="live-hero__team-name">${escapeHtml(away ? away.name : "?")}</div>
            </div>
          </div>
        </div>

        <div class="tabs">
          <button class="tabs__tab is-active">${escapeHtml(t("match.live"))}</button>
          <button class="tabs__tab">${escapeHtml(t("match.lineup"))}</button>
          <button class="tabs__tab">${escapeHtml(t("match.stats"))}</button>
          <button class="tabs__tab">${escapeHtml(t("match.table"))}</button>
        </div>

        <div style="padding: 0 18px 8px">
          <div class="eyebrow mb-2">${escapeHtml(t("match.events"))}</div>
        </div>
        <div class="events-list">
          ${(m.events && m.events.length ? m.events.slice().reverse() : []).map((e) => {
            const team = e.team === "home" ? home : away;
            const score = (() => {
              // Calculate score after this event
              const cumulative = m.events.slice(0, m.events.indexOf(e) + 1).reduce(
                (acc, ev) => {
                  if (ev.kind === "goal") {
                    if (ev.team === "home") acc.h++; else acc.a++;
                  }
                  return acc;
                }, { h: 0, a: 0 }
              );
              return `${cumulative.h} - ${cumulative.a}`;
            })();
            const iconName = e.kind === "goal" ? "soccer" :
                             e.kind === "yellow" ? "warning_card" :
                             e.kind === "red" ? "warning_card" : "list";
            const bgColor = e.kind === "yellow" ? "#FFB547" : e.kind === "red" ? "#FF4D5E" : "";
            const cardSquare = (e.kind === "yellow" || e.kind === "red")
              ? `<svg class="icn" width="14" height="18" viewBox="0 0 14 18"><rect width="14" height="18" rx="2" fill="${bgColor}"/></svg>`
              : null;
            const titleKey = e.kind === "goal" ? "match.event.goal" :
                             e.kind === "yellow" ? "match.event.yellow" :
                             e.kind === "red" ? "match.event.red" : "match.event.sub";
            return `
              <div class="event-row">
                <div class="event-row__minute">${e.minute}'</div>
                <div class="event-row__icon">${cardSquare || icon("soccer", 18)}</div>
                <div>
                  <div class="event-row__title">${escapeHtml(t(titleKey))}</div>
                  <div class="event-row__sub">${escapeHtml(e.player || "")}${team ? " · " + escapeHtml(team.name) : ""}</div>
                </div>
                ${e.kind === "goal" ? `<div class="event-row__score">${score}</div>` : `<div></div>`}
              </div>
            `;
          }).join("") || `<div class="t3" style="padding:24px;text-align:center;font-size:13px">—</div>`}
        </div>

        <nav class="mbottomnav">
          <button class="mbottomnav__item" data-action="back-from-public">${icon("home", 20)}<span>${escapeHtml(t("nav.home"))}</span></button>
          <button class="mbottomnav__item" data-action="go-public">${icon("trophy", 20)}<span>${escapeHtml(t("nav.tournaments"))}</span></button>
          <button class="mbottomnav__item is-active">${icon("calendar", 20)}<span>${escapeHtml(t("nav.matches"))}</span></button>
          <button class="mbottomnav__item" data-action="go-mobile-notif">${icon("bell", 20)}<span>${escapeHtml(t("nav.notifications"))}</span></button>
          <button class="mbottomnav__item">${icon("more", 20)}<span>${escapeHtml(t("nav.more"))}</span></button>
        </nav>
      </div>
    `;
  }

  /* ----- Mobile My Team ----- */
  function viewMobileTeam() {
    ensureDemoIfEmpty();
    const tour = getTournament();
    if (!tour || tour.teams.length === 0) return `<div class="page"><div class="empty"><div class="empty__title">—</div></div></div>`;

    // Pretend "my team" is the 6th team or first
    // Use the followed team if any, otherwise fallback
    const myTeam = (T.getActiveSpectatorTeam && T.getActiveSpectatorTeam(tour))
      || tour.teams.find(t => t.name === "Blue Tigers") || tour.teams[5] || tour.teams[0];
    const tab = State.teamTab || "upcoming";

    const myMatches = (tour.matches || []).filter((m) => m.home === myTeam.id || m.away === myTeam.id);
    const upcoming = myMatches.filter((m) => m.status !== "finished");
    const results = myMatches.filter((m) => m.status === "finished");
    const nextMatch = upcoming[0];

    // Countdown for next match
    let countdown = null;
    if (nextMatch && nextMatch.time) {
      const target = new Date(nextMatch.time).getTime();
      const diff = target - Date.now();
      if (diff > 0) {
        const hrs = Math.floor(diff / 3600000);
        const min = Math.floor((diff % 3600000) / 60000);
        const sec = Math.floor((diff % 60000) / 1000);
        countdown = { h: String(hrs).padStart(2, "0"), m: String(min).padStart(2, "0"), s: String(sec).padStart(2, "0"), targetISO: nextMatch.time };
      }
    }

    return `
      <div class="mview">
        <div class="mview__head">
          <div class="mview__title">${escapeHtml(t("public.info"))}</div>
        </div>

        <div style="padding: 0 18px 4px">
          <h1 style="font-size:24px;letter-spacing:-0.03em">${escapeHtml(t("public.info"))}</h1>
          <div class="card mt-2" style="padding:8px 12px;display:flex;align-items:center;gap:10px">
            ${teamLogoHTML(myTeam, "md")}
            <div style="flex:1;min-width:0">
              <div style="font-weight:700">${escapeHtml(myTeam.name)}</div>
              <div class="t3" style="font-size:12px">${escapeHtml(tour.name)}</div>
            </div>
            ${icon("chev_down", 16)}
          </div>
        </div>

        <div class="tabs">
          <button class="tabs__tab ${tab === "upcoming" ? "is-active" : ""}" data-action="set-team-tab" data-tab="upcoming">${escapeHtml(t("team.upcoming"))}</button>
          <button class="tabs__tab ${tab === "results" ? "is-active" : ""}" data-action="set-team-tab" data-tab="results">${escapeHtml(t("team.results"))}</button>
          <button class="tabs__tab ${tab === "table" ? "is-active" : ""}" data-action="set-team-tab" data-tab="table">${escapeHtml(t("team.table"))}</button>
        </div>

        ${tab === "upcoming" ? `
          ${nextMatch ? `
            <div style="padding: 0 18px 14px">
              <div class="eyebrow mb-2">${escapeHtml(t("team.nextMatch"))}</div>
              <div class="countdown" style="margin:0">
                <div class="countdown__teams">
                  <div class="countdown__team">
                    ${teamLogoHTML(tour.teams.find(t => t.id === nextMatch.home))}
                    <div>
                      <div style="font-weight:600;font-size:13.5px">${escapeHtml((tour.teams.find(t => t.id === nextMatch.home) || {}).name || "?")}</div>
                      <div class="t3" style="font-size:11px">${nextMatch.time ? escapeHtml(formatDate(new Date(nextMatch.time), { day: "2-digit", month: "short" })) + " · " + escapeHtml(formatTime(new Date(nextMatch.time))) : "—"}</div>
                      <div class="t3" style="font-size:11px">${escapeHtml(t("label.field"))} ${nextMatch.field || "?"}</div>
                    </div>
                  </div>
                  <div class="countdown__team countdown__team--right">
                    ${teamLogoHTML(tour.teams.find(t => t.id === nextMatch.away))}
                    <div style="text-align:right">
                      <div style="font-weight:600;font-size:13.5px">${escapeHtml((tour.teams.find(t => t.id === nextMatch.away) || {}).name || "?")}</div>
                    </div>
                  </div>
                </div>
                <div class="countdown__digits" data-countdown="${countdown ? countdown.targetISO : ""}">
                  <div class="countdown__digit"><b data-cd="h">${countdown ? countdown.h : "00"}</b><span>HRS</span></div>
                  <div class="countdown__digit"><b data-cd="m">${countdown ? countdown.m : "00"}</b><span>MIN</span></div>
                  <div class="countdown__digit"><b data-cd="s">${countdown ? countdown.s : "00"}</b><span>SEC</span></div>
                </div>
              </div>

              <div class="card mt-3" style="padding:12px 14px;display:flex;align-items:center;justify-content:space-between">
                <div class="row">${icon("location", 16)} <span style="font-size:13.5px">${escapeHtml(t("team.tournamentLocation"))}</span></div>
                <span class="t3" style="font-size:12.5px">${escapeHtml(t("public.openInMaps"))} ${icon("chev_right", 14)}</span>
              </div>
            </div>
          ` : ""}

          <div style="padding: 0 18px 8px">
            <div class="eyebrow mb-2">${escapeHtml(t("team.allMatches"))}</div>
          </div>
          <div class="card" style="margin: 0 18px 18px">
            ${myMatches.slice(0, 8).map((m) => T.matchRow(tour, m)).join("") || `<div class="t3" style="padding:18px;text-align:center;font-size:13px">—</div>`}
          </div>
        ` : ""}

        ${tab === "results" ? `
          <div class="card" style="margin: 0 18px 18px">
            ${results.length === 0 ? `<div class="t3" style="padding:24px;text-align:center;font-size:13px">—</div>` :
              results.map((m) => T.matchRow(tour, m)).join("")}
          </div>
        ` : ""}

        ${tab === "table" ? (() => {
          const myGroup = (tour.groups || []).find((g) => g.teamIds.includes(myTeam.id));
          if (!myGroup) return `<div class="card" style="margin: 0 18px 18px"><div class="t3" style="padding:24px;text-align:center;font-size:13px">—</div></div>`;
          const standings = T.computeStandings(tour, myGroup.id);
          const teamMap = Object.fromEntries(tour.teams.map((te) => [te.id, te]));
          const adv = parseInt(tour.advancePerGroup, 10) || 2;
          return `
            <div class="card" style="margin: 0 18px 18px">
              <div class="section-head"><h3>${escapeHtml(t("groups.group"))} ${escapeHtml(myGroup.name)}</h3></div>
              <div class="table-wrap">
                <table class="standings">
                  <thead>
                    <tr><th class="rank">#</th><th>${escapeHtml(t("dash.stat.teams"))}</th><th class="num">${escapeHtml(t("groups.played"))}</th><th class="num">${escapeHtml(t("groups.gd"))}</th><th class="num">${escapeHtml(t("groups.points"))}</th></tr>
                  </thead>
                  <tbody>
                    ${standings.length === 0 ? myGroup.teamIds.map((tid, i) => {
                      const tt = teamMap[tid];
                      return `<tr ${tt && tt.id === myTeam.id ? 'style="background:var(--primary-soft)"' : ""}>
                        <td class="rank">${i + 1}</td>
                        <td><div class="row">${teamLogoHTML(tt)}<span style="font-weight:600">${escapeHtml(tt ? tt.name : "?")}</span></div></td>
                        <td class="num">0</td><td class="num">0</td><td class="num num--strong">0</td>
                      </tr>`;
                    }).join("") : standings.map((row, i) => {
                      const tt = teamMap[row.teamId];
                      const isMine = tt && tt.id === myTeam.id;
                      return `<tr class="${i < adv ? "qual" : ""}" ${isMine ? 'style="background:var(--primary-soft);color:white"' : ""}>
                        <td class="rank">${i + 1}</td>
                        <td><div class="row">${teamLogoHTML(tt)}<span style="font-weight:600">${escapeHtml(row.name)}</span></div></td>
                        <td class="num">${row.played}</td>
                        <td class="num">${row.gd > 0 ? "+" : ""}${row.gd}</td>
                        <td class="num num--strong">${row.pts}</td>
                      </tr>`;
                    }).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          `;
        })() : ""}

        <nav class="mbottomnav">
          <button class="mbottomnav__item" data-action="back-from-public">${icon("home", 20)}<span>${escapeHtml(t("nav.home"))}</span></button>
          <button class="mbottomnav__item" data-action="go-public">${icon("trophy", 20)}<span>${escapeHtml(t("nav.tournaments"))}</span></button>
          <button class="mbottomnav__item">${icon("calendar", 20)}<span>${escapeHtml(t("nav.matches"))}</span></button>
          <button class="mbottomnav__item is-active">${icon("users", 20)}<span>${escapeHtml(t("dash.stat.teams"))}</span></button>
          <button class="mbottomnav__item" data-action="go-mobile-notif">${icon("bell", 20)}<span>${escapeHtml(t("nav.notifications"))}</span></button>
        </nav>
      </div>
    `;
  }

  /* ----- Mobile notifications ----- */
  function viewMobileNotif() {
    ensureDemoIfEmpty();
    const tour = getTournament();

    const notifs = [
      { kind: "match", icon: "calendar", title: t("notif.tournament") + ": " + (t("team.nextMatch") || "Next match"), sub: "Vs FC Galaxy starts in 15 minutes.", time: "14:15", today: true },
      { kind: "delay", icon: "clock", title: "Match delayed", sub: "The match vs Young Stars is delayed by 15 minutes.", time: "11:20", today: true },
      { kind: "result", icon: "soccer", title: "New result", sub: "Blue Tigers 3 - 0 Young Stars", time: "10:45", today: true },
      { kind: "field", icon: "pitch", title: "Field change", sub: "Your match tomorrow is moved to Field 3.", time: "18:30", today: false },
    ];

    return `
      <div class="mview">
        <div class="mview__head">
          <div class="mview__title">${escapeHtml(t("nav.notifications"))}</div>
          <button class="btn btn--ghost btn--icon btn--sm">${icon("settings", 16)}</button>
        </div>

        <div class="tabs">
          <button class="tabs__tab is-active">${escapeHtml(t("notif.all"))}</button>
          <button class="tabs__tab">${escapeHtml(t("notif.team"))}</button>
          <button class="tabs__tab">${escapeHtml(t("notif.tournament"))}</button>
        </div>

        <div style="padding: 0 18px 6px">
          <div class="eyebrow mb-1">${escapeHtml(t("common.today"))}</div>
        </div>
        <div>
          ${notifs.filter(n => n.today).map((n) => `
            <div class="notif-row">
              <div class="notif-row__icon" style="color:var(--primary-2)">${icon(n.icon, 18)}</div>
              <div>
                <div class="notif-row__title">${escapeHtml(n.title)}</div>
                <div class="notif-row__sub">${escapeHtml(n.sub)}</div>
              </div>
              <div class="notif-row__time">${escapeHtml(n.time)}</div>
            </div>
          `).join("")}
        </div>

        <div style="padding: 12px 18px 6px">
          <div class="eyebrow mb-1">${escapeHtml(t("common.yesterday"))}</div>
        </div>
        <div>
          ${notifs.filter(n => !n.today).map((n) => `
            <div class="notif-row">
              <div class="notif-row__icon">${icon(n.icon, 18)}</div>
              <div>
                <div class="notif-row__title">${escapeHtml(n.title)}</div>
                <div class="notif-row__sub">${escapeHtml(n.sub)}</div>
              </div>
              <div class="notif-row__time">${escapeHtml(n.time)}</div>
            </div>
          `).join("")}
        </div>

        <div style="padding: 16px 18px">
          <button class="btn btn--block" data-action="mark-all-read">${escapeHtml(t("notif.markAllRead"))}</button>
        </div>

        <nav class="mbottomnav">
          <button class="mbottomnav__item" data-action="back-from-public">${icon("home", 20)}<span>${escapeHtml(t("nav.home"))}</span></button>
          <button class="mbottomnav__item" data-action="go-public">${icon("trophy", 20)}<span>${escapeHtml(t("nav.tournaments"))}</span></button>
          <button class="mbottomnav__item">${icon("calendar", 20)}<span>${escapeHtml(t("nav.matches"))}</span></button>
          <button class="mbottomnav__item is-active">${icon("bell", 20)}<span>${escapeHtml(t("nav.notifications"))}</span></button>
          <button class="mbottomnav__item">${icon("more", 20)}<span>${escapeHtml(t("nav.more"))}</span></button>
        </nav>
      </div>
    `;
  }

  /* ============================================================
     RENDER + ACTION DISPATCH
     ============================================================ */
  function render() {
    const root = $("#app");
    root.dataset.view = State.view;
    document.documentElement.lang = getLanguage();
    let html = "";
    switch (State.view) {
      case "welcome":      html = T.viewWelcome(); break;
      case "wizard":       html = T.viewWizard(); break;
      case "dashboard":
      case "tournament":   html = T.viewDashboard(); break;
      case "public":       html = viewPublic(); break;
      case "mobile-match": html = viewMobileLiveMatch(); break;
      case "mobile-team":  html = viewMobileTeam(); break;
      case "mobile-notif": html = viewMobileNotif(); break;
      default:             html = T.viewWelcome();
    }
    root.innerHTML = html;
    afterRender();
  }
  T.render = render;

  function afterRender() {
    $$("[data-action]").forEach((el) => el.addEventListener("click", T.onAction || onAction));
    $$("[data-input]").forEach((el) => {
      el.addEventListener("input", onInput);
      el.addEventListener("change", onInput);
    });
    startCountdownTicks();
    if (T.updateThemeIcon) T.updateThemeIcon();
    // Scroll active tab into view (mobile)
    const activeTab = $(".tab-strip__tab.is-active");
    if (activeTab && activeTab.scrollIntoView) {
      try { activeTab.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }); } catch {}
    }
  }

  function onInput(e) {
    const key = e.currentTarget.dataset.input;
    if (!key) return;
    const path = key.split(".");
    let node = State;
    while (path.length > 1) node = node[path.shift()];
    const isNum = e.currentTarget.type === "number";
    node[path[0]] = isNum ? Number(e.currentTarget.value) : e.currentTarget.value;
    save();
  }

  function onAction(e) {
    const el = e.currentTarget;
    const a = el.dataset.action;
    const data = el.dataset;
    e.stopPropagation();

    switch (a) {
      case "set-lang":         setLanguage(data.lang); break;
      case "go-welcome":       navigate("welcome"); break;
      case "go-wizard":        T.startWizard(); break;
      case "go-dashboard":
        ensureDemoIfEmpty();
        navigate("dashboard", { currentTab: "overview", sidebarOpen: false });
        break;
      case "go-tab":           setState({ currentTab: data.tab, sidebarOpen: false }); break;
      case "go-public":
        navigate("public", { currentTournamentId: data.id || State.currentTournamentId });
        break;
      case "go-public-tab":
        // Public sub-tabs map to dashboard tabs for now
        navigate("dashboard", { currentTab: data.tab === "bracket" ? "brackets" : data.tab });
        break;
      case "go-mobile-match":  navigate("mobile-match", { matchId: data.id }); break;
      case "go-mobile-team":   navigate("mobile-team"); break;
      case "go-mobile-notif":  navigate("mobile-notif"); break;
      case "back-from-public": navigate("dashboard"); break;
      case "set-team-tab":     setState({ teamTab: data.tab }); break;
      case "wizard-next":      T.wizardNext(); break;
      case "wizard-prev":      T.wizardPrev(); break;
      case "wizard-create":    T.wizardCreate(); break;
      case "wizard-add-team":  T.wizardAddTeam(); break;
      case "wizard-import-samples": T.wizardImportSamples(); break;
      case "wizard-remove-team":    T.wizardRemoveTeam(data.id); break;
      case "wizard-set-format":     T.wizardSetFormat(data.format); break;
      case "wizard-set-groups":     T.wizardSetGroups(parseInt(data.n, 10)); break;
      case "wizard-set-advance":    T.wizardSetAdvance(parseInt(data.n, 10)); break;
      case "regenerate-schedule":   T.regenerateSchedule(); break;
      case "regenerate-groups":     T.regenerateGroups(); break;
      case "regenerate-bracket":    T.regenerateBracket(); break;
      case "open-score":            T.openScoreModal(data.id); break;
      case "share-tournament":      T.openShareModal(); break;
      case "toggle-sidebar":        setState({ sidebarOpen: !State.sidebarOpen }); break;
      case "close-sidebar":         setState({ sidebarOpen: false }); break;
      case "delete-tournament":     T.deleteTournament(); break;
      case "save-settings":         T.saveSettings(); break;
      case "view-stats":            toast(t("dash.viewFullStats"), "info"); break;
      case "mark-all-read":         toast(t("notif.markAllRead"), "success"); break;
      case "add-team":              addTeamPrompt(); break;
      case "delete-team":           deleteTeam(data.id); break;
      case "edit-team":             editTeamPrompt(data.id); break;
      case "add-referee":            toast(t("nav.referees") + " — " + t("common.add"), "info"); break;
      case "nav-stub":              toast(el.querySelector("span") ? el.querySelector("span").textContent : "Coming soon", "info"); break;
      default:
        if (a) toast(a, "info");
        break;
    }
  }
  T.onAction = onAction;

  function addTeamPrompt() {
    const body = `
      <div class="field">
        <label class="field__label">${escapeHtml(t("wizard.teams.placeholder"))}</label>
        <input class="input" id="new-team-name" placeholder="${escapeHtml(t("wizard.teams.placeholder"))}" autofocus />
      </div>
    `;
    const footer = `<button class="btn" data-close>${escapeHtml(t("common.cancel"))}</button>
                    <button class="btn btn--primary" data-add>${escapeHtml(t("common.create"))}</button>`;
    const mod = modal({ title: escapeHtml(t("wizard.teams.add")), body, footer });
    $("[data-add]", mod.root).addEventListener("click", () => {
      const name = $("#new-team-name", mod.root).value.trim();
      if (!name) return;
      const tour = getTournament();
      const team = { id: uid("t"), name, colors: T.paletteFor(name + Math.random()) };
      tour.teams.push(team);
      // Add to first under-filled group if groups exist
      if (tour.groups && tour.groups.length) {
        const counts = tour.groups.map(g => g.teamIds.length);
        const minIdx = counts.indexOf(Math.min(...counts));
        tour.groups[minIdx].teamIds.push(team.id);
      }
      save();
      toast(t("sys.saved"), "success");
      mod.close();
      T.render();
    });
    $("#new-team-name", mod.root).addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); $("[data-add]", mod.root).click(); }
    });
  }

  function deleteTeam(id) {
    if (!confirm(t("sys.confirmDelete"))) return;
    const tour = getTournament();
    if (!tour) return;
    tour.teams = tour.teams.filter((te) => te.id !== id);
    if (tour.groups) tour.groups.forEach((g) => g.teamIds = g.teamIds.filter((tid) => tid !== id));
    if (tour.matches) tour.matches = tour.matches.filter((m) => m.home !== id && m.away !== id);
    save();
    T.render();
  }

  function editTeamPrompt(id) {
    const tour = getTournament();
    const team = tour.teams.find((te) => te.id === id);
    if (!team) return;
    const body = `
      <div class="field">
        <label class="field__label">${escapeHtml(t("wizard.teams.placeholder"))}</label>
        <input class="input" id="edit-team-name" value="${escapeHtml(team.name)}" autofocus />
      </div>
    `;
    const footer = `<button class="btn" data-close>${escapeHtml(t("common.cancel"))}</button>
                    <button class="btn btn--primary" data-save>${escapeHtml(t("common.save"))}</button>`;
    const mod = modal({ title: escapeHtml(t("common.edit")), body, footer });
    $("[data-save]", mod.root).addEventListener("click", () => {
      const name = $("#edit-team-name", mod.root).value.trim();
      if (!name) return;
      team.name = name;
      save(); toast(t("sys.saved"), "success");
      mod.close(); T.render();
    });
  }

  /* ----- Countdown ticks for live + my-team ----- */
  let countdownTimer = null;
  function startCountdownTicks() {
    if (countdownTimer) clearInterval(countdownTimer);
    const cdEls = $$("[data-countdown]");
    if (!cdEls.length) return;
    countdownTimer = setInterval(() => {
      cdEls.forEach((wrap) => {
        const targetISO = wrap.dataset.countdown;
        if (!targetISO) return;
        const diff = new Date(targetISO).getTime() - Date.now();
        if (diff <= 0) {
          $$("[data-cd]", wrap).forEach((b) => b.textContent = "00");
          return;
        }
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const set = (key, val) => {
          const el = $(`[data-cd="${key}"]`, wrap);
          if (el) el.textContent = String(val).padStart(2, "0");
        };
        set("h", h); set("m", m); set("s", s);
      });
    }, 1000);
  }

  /* ----- Live demo "ticker" — slowly advance live match minutes for atmosphere ----- */
  setInterval(() => {
    const tour = getTournament();
    if (!tour || !tour.isLive) return;
    let changed = false;
    (tour.matches || []).forEach((m) => {
      if (m.status === "live") {
        m.liveMinute = (m.liveMinute || 0) + 1;
        if (m.liveMinute > 90) m.liveMinute = 90;
        changed = true;
      }
    });
    if (changed) {
      // Only re-render relevant views to avoid losing focus
      if (["dashboard", "tournament", "public", "mobile-match", "mobile-team"].includes(State.view)) {
        // Update live minute pills cheaply
        $$(".pill--live").forEach((p) => {
          const txt = p.textContent.trim();
          if (/^\d+'$/.test(txt)) {
            const n = parseInt(txt, 10) + 1;
            if (n <= 90) p.textContent = n + "'";
          }
        });
      }
    }
  }, 30000); // every 30s

  /* ============================================================
     BOOT
     ============================================================ */
  function boot() {
    load();
    // hash-based deep link to public page (e.g., #t=tr_xxx)
    const hash = location.hash.slice(1);
    if (hash.startsWith("t=")) {
      const id = hash.slice(2);
      ensureDemoIfEmpty();
      State.currentTournamentId = id || State.currentTournamentId;
      State.view = "public";
    }
    T.render();
    // Hide splash sooner if everything is ready
    setTimeout(() => {
      const splash = $("#splash");
      if (splash) splash.style.display = "none";
    }, 900);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

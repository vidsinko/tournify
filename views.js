/* ============================================================
   TOURNIFY — Views (part 1)
   Welcome, Wizard, Dashboard shell, Overview tab
   ============================================================ */
(function () {
  "use strict";
  const T = window._Tournify;
  const {
    State, save, setState, getTournament, navigate, ensureDemoIfEmpty,
    buildGroups, generateSchedule, computeStandings, generateBracket,
    icon, teamLogoHTML, paletteFor, escapeHtml, ago, toast, modal,
    $, $$, uid, clamp,
    t, setLanguage, getLanguage, getLanguages, formatDate, formatTime,
  } = T;

  /* ----- Welcome screen ----- */
  function viewWelcome() {
    const langs = getLanguages();
    return `
    <div class="welcome">
      <div class="welcome__bg"></div>
      <div class="welcome__noise"></div>
      <div class="welcome__inner">
        <div class="welcome__top">
          <div class="welcome__brand">
            <span class="sidebar__brand-mark">${icon("trophy", 16)}</span>
            <span>Tournify</span>
          </div>
          <div class="welcome__lang">
            ${langs.map((l) => `
              <button data-action="set-lang" data-lang="${l.code}" class="${getLanguage() === l.code ? "is-active" : ""}">${l.label}</button>
            `).join("")}
          </div>
        </div>

        <div class="welcome__hero">
          <div class="eyebrow" style="margin-bottom:10px">${escapeHtml(t("brand.subtitle"))}</div>
          <h1 class="welcome__title">${escapeHtml(t("welcome.headline")).replace(/\n/g, "<br/>")}</h1>
          <p class="welcome__sub">${escapeHtml(t("welcome.sub"))}</p>
          <div class="welcome__features">
            <div class="welcome__feat">
              <div class="welcome__feat-num">3 min</div>
              <div class="welcome__feat-lbl">${escapeHtml(t("welcome.feat.fast.lbl"))}</div>
            </div>
            <div class="welcome__feat">
              <div class="welcome__feat-num">⚡</div>
              <div class="welcome__feat-lbl">${escapeHtml(t("welcome.feat.live.lbl"))}</div>
            </div>
            <div class="welcome__feat">
              <div class="welcome__feat-num">QR</div>
              <div class="welcome__feat-lbl">${escapeHtml(t("welcome.feat.share.lbl"))}</div>
            </div>
          </div>
        </div>

        <div class="welcome__actions">
          <button class="btn btn--primary btn--lg btn--block" data-action="go-wizard">
            ${icon("plus", 18)} ${escapeHtml(t("welcome.create"))}
          </button>
          <button class="btn btn--lg btn--block" data-action="go-dashboard">
            ${icon("trophy", 18)} ${escapeHtml(t("welcome.demo"))}
          </button>
        </div>
      </div>
    </div>`;
  }

  /* ----- Wizard ----- */
  function startWizard() {
    State.wizard = {
      step: 0,
      draft: {
        name: "",
        sport: "football",
        location: "",
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        fields: 2,
        format: "gs",
        groupsCount: 2,
        advancePerGroup: 2,
        matchLength: 20,
        breakLength: 5,
        dailyStart: "09:00",
        dailyEnd: "18:00",
        teams: [],
      },
    };
    navigate("wizard");
  }

  function wizardNext() {
    const w = State.wizard;
    if (!w) return;
    if (w.step === 0 && !w.draft.name.trim()) {
      toast(t("wizard.field.name"), "error"); return;
    }
    if (w.step === 2 && w.draft.teams.length < 2) {
      toast(t("wizard.teams.heading"), "error"); return;
    }
    w.step = clamp(w.step + 1, 0, 3);
    save(); T.render();
  }
  function wizardPrev() {
    const w = State.wizard;
    if (!w) return;
    if (w.step === 0) { navigate("welcome"); return; }
    w.step = clamp(w.step - 1, 0, 3);
    save(); T.render();
  }
  function wizardAddTeam() {
    const inp = $("#wiz-team-input");
    if (!inp) return;
    const name = inp.value.trim();
    if (!name) return;
    State.wizard.draft.teams.push({ id: uid("t"), name, colors: paletteFor(name + Math.random()) });
    inp.value = "";
    save(); T.render();
    setTimeout(() => { const i = $("#wiz-team-input"); if (i) i.focus(); }, 0);
  }
  function wizardRemoveTeam(id) {
    State.wizard.draft.teams = State.wizard.draft.teams.filter((te) => te.id !== id);
    save(); T.render();
  }
  function wizardImportSamples() {
    const samples = ["NK Olimpija", "NK Maribor", "ND Gorica", "FC Koper", "FC Galaxy", "Blue Tigers", "Young Stars", "NK Bravo"];
    samples.forEach((n) => {
      if (State.wizard.draft.teams.find((te) => te.name === n)) return;
      State.wizard.draft.teams.push({ id: uid("t"), name: n, colors: paletteFor(n) });
    });
    save(); T.render();
  }
  function wizardSetFormat(format) { State.wizard.draft.format = format; save(); T.render(); }
  function wizardSetGroups(n) { State.wizard.draft.groupsCount = clamp(n, 1, 16); save(); T.render(); }
  function wizardSetAdvance(n) { State.wizard.draft.advancePerGroup = clamp(n, 1, 4); save(); T.render(); }

  function wizardCreate() {
    const d = State.wizard.draft;
    if (!d.name.trim()) { toast(t("wizard.field.name"), "error"); return; }
    if (d.teams.length < 2) { toast(t("wizard.teams.empty"), "error"); return; }

    const tour = Object.assign({ id: uid("tr"), isLive: false, activity: [] }, JSON.parse(JSON.stringify(d)));
    if (tour.format === "gs" || tour.format === "rr") {
      tour.groups = buildGroups(tour.teams, tour.format === "rr" ? 1 : tour.groupsCount);
      tour.matches = generateSchedule(tour);
    } else {
      tour.groups = []; tour.matches = [];
    }
    if (tour.format === "gs" || tour.format === "ko") {
      tour.bracket = generateBracket(tour);
    }
    State.tournaments.unshift(tour);
    State.currentTournamentId = tour.id;
    State.wizard = null;
    save();
    toast(t("sys.created"), "success");
    navigate("dashboard", { currentTab: "overview" });
  }

  function viewWizard() {
    const w = State.wizard || { step: 0, draft: {} };
    const d = w.draft;
    const step = w.step || 0;
    const stepEls = [0, 1, 2, 3].map((i) =>
      `<div class="wizard__step ${step > i ? "done" : step === i ? "is-active" : ""}"></div>`
    ).join("");

    let body = "";
    if (step === 0) body = wizardStepBasics(d);
    else if (step === 1) body = wizardStepFormat(d);
    else if (step === 2) body = wizardStepTeams(d);
    else if (step === 3) body = wizardStepReview(d);

    return `
      <div class="page page--narrow">
        <div class="wizard">
          <button class="btn btn--ghost btn--sm wizard__back" data-action="wizard-prev">
            ${icon("chev_left", 16)} ${escapeHtml(t("common.back"))}
          </button>
          <div class="wizard__steps">${stepEls}</div>
          <h1 class="wizard__title">${escapeHtml(t("wizard.title"))}</h1>
          <p class="wizard__sub muted">${escapeHtml(t("wizard.sub"))}</p>
          ${body}
        </div>
      </div>
    `;
  }

  function wizardStepBasics(d) {
    return `
      <div class="card wizard__card">
        <div class="eyebrow">${escapeHtml(t("wizard.step.basics"))}</div>
        <div class="wizard__row mt-3">
          <div class="field" style="grid-column: 1 / -1">
            <label class="field__label">${escapeHtml(t("wizard.field.name"))}</label>
            <input class="input" data-input="wizard.draft.name" value="${escapeHtml(d.name || "")}" placeholder="${escapeHtml(t("wizard.field.name.ph"))}" autofocus />
          </div>
          <div class="field">
            <label class="field__label">${escapeHtml(t("wizard.field.sport"))}</label>
            <select class="select" data-input="wizard.draft.sport">
              <option value="football"${d.sport === "football" ? " selected" : ""}>${escapeHtml(t("sport.football"))}</option>
              <option value="basketball"${d.sport === "basketball" ? " selected" : ""}>${escapeHtml(t("sport.basketball"))}</option>
              <option value="handball"${d.sport === "handball" ? " selected" : ""}>${escapeHtml(t("sport.handball"))}</option>
              <option value="volleyball"${d.sport === "volleyball" ? " selected" : ""}>${escapeHtml(t("sport.volleyball"))}</option>
              <option value="hockey"${d.sport === "hockey" ? " selected" : ""}>${escapeHtml(t("sport.hockey"))}</option>
              <option value="other"${d.sport === "other" ? " selected" : ""}>${escapeHtml(t("sport.other"))}</option>
            </select>
          </div>
          <div class="field">
            <label class="field__label">${escapeHtml(t("wizard.field.location"))}</label>
            <input class="input" data-input="wizard.draft.location" value="${escapeHtml(d.location || "")}" placeholder="${escapeHtml(t("wizard.field.location.ph"))}" />
          </div>
          <div class="field">
            <label class="field__label">${escapeHtml(t("wizard.field.start"))}</label>
            <input class="input" type="date" data-input="wizard.draft.startDate" value="${escapeHtml(d.startDate)}" />
          </div>
          <div class="field">
            <label class="field__label">${escapeHtml(t("wizard.field.end"))}</label>
            <input class="input" type="date" data-input="wizard.draft.endDate" value="${escapeHtml(d.endDate)}" />
          </div>
          <div class="field">
            <label class="field__label">${escapeHtml(t("wizard.field.fields"))}</label>
            <input class="input" type="number" min="1" max="20" data-input="wizard.draft.fields" value="${d.fields}" />
          </div>
          <div class="field">
            <label class="field__label">${escapeHtml(t("wizard.field.matchLength"))}</label>
            <input class="input" type="number" min="5" max="120" step="5" data-input="wizard.draft.matchLength" value="${d.matchLength}" />
          </div>
          <div class="field">
            <label class="field__label">${escapeHtml(t("wizard.field.breakLength"))}</label>
            <input class="input" type="number" min="0" max="60" step="1" data-input="wizard.draft.breakLength" value="${d.breakLength}" />
          </div>
          <div class="field">
            <label class="field__label">${escapeHtml(t("wizard.field.dailyStart"))}</label>
            <input class="input" type="time" data-input="wizard.draft.dailyStart" value="${escapeHtml(d.dailyStart)}" />
          </div>
          <div class="field">
            <label class="field__label">${escapeHtml(t("wizard.field.dailyEnd"))}</label>
            <input class="input" type="time" data-input="wizard.draft.dailyEnd" value="${escapeHtml(d.dailyEnd)}" />
          </div>
        </div>
      </div>
      <div class="wizard__nav">
        <button class="btn" data-action="wizard-prev">${icon("chev_left", 16)} ${escapeHtml(t("common.back"))}</button>
        <button class="btn btn--primary" data-action="wizard-next">${escapeHtml(t("common.next"))} ${icon("chev_right", 16)}</button>
      </div>
    `;
  }

  function wizardStepFormat(d) {
    const formats = [
      { id: "gs", title: t("wizard.format.gs"), sub: t("wizard.format.gs.sub"), icn: "grid" },
      { id: "rr", title: t("wizard.format.rr"), sub: t("wizard.format.rr.sub"), icn: "list" },
      { id: "ko", title: t("wizard.format.ko"), sub: t("wizard.format.ko.sub"), icn: "bracket" },
    ];
    return `
      <div class="card wizard__card">
        <div class="eyebrow">${escapeHtml(t("wizard.step.format"))}</div>
        <h3 class="mt-2">${escapeHtml(t("wizard.format.heading"))}</h3>
        <p class="muted mt-1">${escapeHtml(t("wizard.format.sub"))}</p>
        <div class="tiles mt-3">
          ${formats.map((f) => `
            <button class="tile ${d.format === f.id ? "is-selected" : ""}" data-action="wizard-set-format" data-format="${f.id}">
              <div class="tile__icon">${icon(f.icn, 18)}</div>
              <div class="tile__title">${escapeHtml(f.title)}</div>
              <div class="tile__sub">${escapeHtml(f.sub)}</div>
            </button>
          `).join("")}
        </div>

        ${d.format === "gs" ? `
          <div class="divider mt-4 mb-3"></div>
          <div class="wizard__row">
            <div class="field">
              <label class="field__label">${escapeHtml(t("wizard.format.groups"))}</label>
              <div class="row" style="flex-wrap:wrap">
                ${[1,2,3,4,5,6,8].map((n) => `
                  <button class="btn btn--sm ${d.groupsCount === n ? "btn--primary" : ""}" data-action="wizard-set-groups" data-n="${n}">${n}</button>
                `).join("")}
              </div>
            </div>
            <div class="field">
              <label class="field__label">${escapeHtml(t("wizard.format.advance"))}</label>
              <div class="row" style="flex-wrap:wrap">
                ${[1,2,3,4].map((n) => `
                  <button class="btn btn--sm ${d.advancePerGroup === n ? "btn--primary" : ""}" data-action="wizard-set-advance" data-n="${n}">${escapeHtml(t("wizard.format.firstN", { n }))}</button>
                `).join("")}
              </div>
            </div>
          </div>
        ` : ""}
      </div>
      <div class="wizard__nav">
        <button class="btn" data-action="wizard-prev">${icon("chev_left", 16)} ${escapeHtml(t("common.back"))}</button>
        <button class="btn btn--primary" data-action="wizard-next">${escapeHtml(t("common.next"))} ${icon("chev_right", 16)}</button>
      </div>
    `;
  }

  function wizardStepTeams(d) {
    return `
      <div class="card wizard__card">
        <div class="eyebrow">${escapeHtml(t("wizard.step.teams"))}</div>
        <h3 class="mt-2">${escapeHtml(t("wizard.teams.heading"))}</h3>
        <p class="muted mt-1">${escapeHtml(t("wizard.teams.sub"))}</p>

        <div class="row mt-3" style="gap:8px;flex-wrap:wrap">
          <div class="input-group" style="flex:1;min-width:200px">
            ${icon("plus", 16)}
            <input id="wiz-team-input" placeholder="${escapeHtml(t("wizard.teams.placeholder"))}"
              onkeydown="if(event.key==='Enter'){event.preventDefault();document.querySelector('[data-action=wizard-add-team]').click();}" />
          </div>
          <button class="btn btn--primary" data-action="wizard-add-team">${escapeHtml(t("wizard.teams.add"))}</button>
          <button class="btn" data-action="wizard-import-samples">${escapeHtml(t("wizard.teams.import"))}</button>
        </div>

        <div class="mt-3 t3" style="font-size:12.5px">${escapeHtml(t("wizard.teams.count", { n: d.teams.length }))}</div>
        ${d.teams.length === 0
          ? `<div class="empty"><div class="empty__icon">${icon("users", 22)}</div><div class="empty__title">${escapeHtml(t("wizard.teams.empty"))}</div></div>`
          : `<div class="team-chips">
              ${d.teams.map((te) => `
                <span class="team-chip">${teamLogoHTML(te)} ${escapeHtml(te.name)}
                  <button data-action="wizard-remove-team" data-id="${te.id}" aria-label="remove">×</button>
                </span>
              `).join("")}
             </div>`}
      </div>
      <div class="wizard__nav">
        <button class="btn" data-action="wizard-prev">${icon("chev_left", 16)} ${escapeHtml(t("common.back"))}</button>
        <button class="btn btn--primary" data-action="wizard-next">${escapeHtml(t("common.next"))} ${icon("chev_right", 16)}</button>
      </div>
    `;
  }

  function wizardStepReview(d) {
    const days = (() => {
      const a = new Date(d.startDate), b = new Date(d.endDate);
      return Math.max(1, Math.round((b - a) / 86400000) + 1);
    })();
    return `
      <div class="card wizard__card">
        <div class="eyebrow">${escapeHtml(t("wizard.step.review"))}</div>
        <h3 class="mt-2">${escapeHtml(t("wizard.review.heading"))}</h3>
        <p class="muted mt-1">${escapeHtml(t("wizard.review.sub"))}</p>

        <div class="card card--pad mt-3" style="background:var(--bg-elev-1)">
          <div class="between">
            <div style="min-width:0">
              <h3 style="font-size:18px">${escapeHtml(d.name || t("wizard.field.name"))}</h3>
              <div class="muted mt-1" style="font-size:13px">${escapeHtml(t("sport." + d.sport))} · ${escapeHtml(d.location || "—")}</div>
            </div>
            <span class="pill pill--primary">${escapeHtml(d.format === "gs" ? t("wizard.format.gs") : d.format === "rr" ? t("wizard.format.rr") : t("wizard.format.ko"))}</span>
          </div>
          <div class="divider mt-3 mb-3"></div>
          <div class="stat-grid">
            <div class="stat"><div class="stat__num">${d.teams.length}</div><div class="stat__label">${escapeHtml(t("dash.stat.teams"))}</div></div>
            <div class="stat"><div class="stat__num">${d.fields}</div><div class="stat__label">${escapeHtml(t("dash.stat.fields"))}</div></div>
            <div class="stat"><div class="stat__num">${days}</div><div class="stat__label">${escapeHtml(t("common.scheduled"))}</div></div>
            <div class="stat"><div class="stat__num">${d.matchLength}'</div><div class="stat__label">${escapeHtml(t("wizard.field.matchLength"))}</div></div>
          </div>
        </div>
      </div>
      <div class="wizard__nav">
        <button class="btn" data-action="wizard-prev">${icon("chev_left", 16)} ${escapeHtml(t("common.back"))}</button>
        <button class="btn btn--primary btn--lg" data-action="wizard-create">${icon("check", 16)} ${escapeHtml(t("wizard.create"))}</button>
      </div>
    `;
  }

  /* ----- Dashboard shell ----- */
  function viewDashboard() {
    ensureDemoIfEmpty();
    const tour = getTournament();
    const tab = State.currentTab || "overview";

    const navItems = [
      { id: "dashboard", icon: "home", label: t("nav.dashboard"), active: true },
      { id: "tournaments", icon: "trophy", label: t("nav.tournaments") },
      { id: "teams", icon: "users", label: t("nav.teams") },
      { id: "matches", icon: "calendar", label: t("nav.matches") },
      { id: "fields", icon: "pitch", label: t("nav.fields") },
      { id: "referees", icon: "whistle", label: t("nav.referees") },
      { id: "registrations", icon: "list", label: t("nav.registrations") },
      { id: "payments", icon: "qr", label: t("nav.payments") },
      { id: "settings", icon: "settings", label: t("nav.settings") },
    ];

    const tabs = ["overview","matches","groups","teams","brackets","fields","referees","settings"];

    let content = "";
    if (!tour) {
      content = emptyTournaments();
    } else {
      switch (tab) {
        case "overview": content = T.tabOverview(tour); break;
        case "matches":  content = T.tabMatches(tour); break;
        case "groups":   content = T.tabGroups(tour); break;
        case "teams":    content = T.tabTeams(tour); break;
        case "brackets": content = T.tabBrackets(tour); break;
        case "fields":   content = T.tabFields(tour); break;
        case "referees": content = T.tabReferees(tour); break;
        case "settings": content = T.tabSettings(tour); break;
        default:         content = T.tabOverview(tour);
      }
    }

    return `
      <div class="shell">
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
        ${State.sidebarOpen ? `<div class="sidebar-mask" data-action="close-sidebar"></div>` : ""}

        <main class="shell__main">
          <header class="topbar">
            <button class="btn btn--ghost btn--icon btn--sm menu-toggle" data-action="toggle-sidebar" aria-label="${escapeHtml(t("nav.more"))}">${icon("menu", 18)}</button>
            <div class="topbar__title">
              <h2>${escapeHtml(tour ? tour.name : t("dash.title"))}</h2>
              ${tour && tour.isLive ? `<span class="pill pill--live">${escapeHtml(t("common.live"))}</span>` : ""}
            </div>
            <div class="topbar__actions">
              <button class="btn btn--ghost btn--icon btn--sm topbar__action--secondary" data-action="open-search" aria-label="${escapeHtml(t("common.search"))}" title="⌘K">${icon("search", 16)}</button>
              <button class="btn btn--ghost btn--icon btn--sm topbar__action--secondary" data-action="toggle-theme" aria-label="${escapeHtml(t("theme.toggle"))}" title="${escapeHtml(t("theme.toggle"))}">${icon("sun", 16)}</button>
              ${tour ? `
                <button class="btn btn--ghost btn--icon btn--sm topbar__action--secondary" data-action="export-pdf" aria-label="${escapeHtml(t("export.button"))}" title="${escapeHtml(t("export.button"))}">${icon("download", 16)}</button>
                <button class="btn btn--sm topbar__action--secondary" data-action="go-public" data-id="${tour.id}">
                  ${icon("open", 14)} <span class="hide-on-narrow">${escapeHtml(t("dash.viewPublicPage"))}</span>
                </button>
                <button class="btn btn--primary btn--sm" data-action="share-tournament">
                  ${icon("share", 14)} <span class="hide-on-narrow">${escapeHtml(t("dash.shareTournament"))}</span>
                </button>
              ` : ""}
            </div>
          </header>

          ${tour ? `
          <div class="tab-strip">
            ${tabs.map((tb) => `
              <button class="tab-strip__tab ${tab === tb ? "is-active" : ""}" data-action="go-tab" data-tab="${tb}">${escapeHtml(t("tabs." + tb))}</button>
            `).join("")}
          </div>
          ` : ""}

          <div class="page">${content}</div>
        </main>
      </div>
    `;
  }

  function emptyTournaments() {
    return `
      <div class="empty">
        <div class="empty__icon">${icon("trophy", 28)}</div>
        <div class="empty__title">${escapeHtml(t("empty.tournaments.title"))}</div>
        <p class="empty__sub">${escapeHtml(t("empty.tournaments.sub"))}</p>
        <div class="empty__cta">
          <button class="btn btn--primary btn--lg" data-action="go-wizard">${icon("plus", 16)} ${escapeHtml(t("welcome.create"))}</button>
        </div>
      </div>
    `;
  }

  /* ----- Overview tab ----- */
  function tabOverview(tour) {
    const totalPlayers = tour.teams.length * 13;
    const finished = tour.matches.filter((m) => m.status === "finished").length;
    const total = tour.matches.length;
    const todays = (tour.matches || []).slice(0, 6);
    const scorers = computeTopScorers(tour).slice(0, 4);

    const steps = [
      { id: "setup", done: true },
      { id: "registration", done: true },
      { id: "groups", done: !!tour.groups && tour.groups.length > 0 },
      { id: "matches", done: total > 0 && finished === total, active: total > 0 && finished < total },
      { id: "knockout", done: false, active: total > 0 && finished === total },
      { id: "finished", done: false },
    ];
    return `
      <div class="dash-grid--3 dash-grid">
        <div class="card">
          <div class="section-head">
            <h3>${escapeHtml(t("dash.tournamentOverview"))}</h3>
            <span class="pill pill--success">${icon("check",12)} ${escapeHtml(t("common.allChangesSaved"))}</span>
          </div>
          <div style="padding:18px">
            <div class="stat-grid">
              <div class="stat"><div class="stat__num">${tour.teams.length}</div><div class="stat__label">${escapeHtml(t("dash.stat.teams"))}</div></div>
              <div class="stat"><div class="stat__num">${tour.matches.length}</div><div class="stat__label">${escapeHtml(t("dash.stat.matches"))}</div></div>
              <div class="stat"><div class="stat__num">${tour.fields}</div><div class="stat__label">${escapeHtml(t("dash.stat.fields"))}</div></div>
              <div class="stat"><div class="stat__num">${totalPlayers}</div><div class="stat__label">${escapeHtml(t("dash.stat.players"))}</div></div>
            </div>
          </div>
          <div class="section-head" style="border-top:1px solid var(--border-soft)">
            <h3>${escapeHtml(t("dash.recentActivity"))}</h3>
          </div>
          <div class="activity">
            ${(tour.activity || []).map((a) => `
              <div class="activity__item">
                <div class="activity__icon">${icon(a.kind === "score" ? "soccer" : a.kind === "team" ? "users" : "pitch", 16)}</div>
                <div>
                  <div class="activity__title">${escapeHtml(a.text)}</div>
                  <div class="activity__sub">${ago(a.at)}</div>
                </div>
                <div class="activity__time">${ago(a.at, true)}</div>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="card">
          <div class="section-head">
            <h3>${escapeHtml(t("dash.todayMatches"))}</h3>
            <button class="btn btn--ghost btn--sm" data-action="go-tab" data-tab="matches">${escapeHtml(t("common.viewAll"))} ${icon("chev_right", 14)}</button>
          </div>
          <div>
            ${todays.length === 0 ? emptyMatchesInline() : todays.map((m) => T.matchRow(tour, m)).join("")}
          </div>
        </div>

        <div class="card">
          <div class="section-head"><h3>${escapeHtml(t("dash.tournamentProgress"))}</h3></div>
          <div class="steps">
            ${steps.map((s, i) => `
              <div class="steps__item ${s.done ? "done" : ""} ${s.active ? "is-active" : ""}">
                <div class="steps__num">${s.done ? "✓" : (i + 1)}</div>
                <div>
                  <div class="steps__title">${escapeHtml(t("dash.steps." + s.id))}</div>
                  <div class="steps__status">${escapeHtml(s.done ? t("dash.steps.completed") : s.active ? t("dash.steps.inprogress") : t("dash.steps.pending"))}</div>
                </div>
              </div>
            `).join("")}
          </div>
          <div class="section-head" style="border-top:1px solid var(--border-soft)">
            <h3>${escapeHtml(t("dash.topScorers"))}</h3>
          </div>
          <div style="padding: 6px 12px 14px">
            ${scorers.length === 0 ? `<div class="t3" style="padding:14px;text-align:center;font-size:13px">—</div>` : scorers.map((s, i) => `
              <div class="activity__item">
                <div class="activity__icon" style="font-weight:700;color:var(--text)">${i + 1}</div>
                <div>
                  <div class="activity__title">${escapeHtml(s.player)}</div>
                  <div class="activity__sub">${escapeHtml(s.team)}</div>
                </div>
                <div class="activity__time mono" style="font-weight:700;color:var(--text);font-size:14px">${s.goals}</div>
              </div>
            `).join("")}
            <div class="mt-2"><button class="btn btn--block" data-action="view-stats">${escapeHtml(t("dash.viewFullStats"))}</button></div>
          </div>
        </div>
      </div>
    `;
  }

  function computeTopScorers(tour) {
    const map = {};
    (tour.matches || []).forEach((m) => {
      if (!m.events) return;
      m.events.forEach((e) => {
        if (e.kind !== "goal") return;
        const teamId = e.team === "home" ? m.home : m.away;
        const team = tour.teams.find((t) => t.id === teamId);
        const k = (team ? team.name : "?") + "|" + e.player;
        map[k] = (map[k] || 0) + 1;
      });
    });
    // Demo scorers if none from match events
    const result = Object.entries(map).map(([k, v]) => {
      const [team, player] = k.split("|");
      return { team, player, goals: v };
    }).sort((a, b) => b.goals - a.goals);
    if (result.length < 4 && tour.teams.length >= 4) {
      const seedScorers = [
        { player: "Luka K.", team: tour.teams[0].name, goals: 7 },
        { player: "Marko P.", team: tour.teams[5] ? tour.teams[5].name : tour.teams[1].name, goals: 6 },
        { player: "Tim R.", team: tour.teams[4] ? tour.teams[4].name : tour.teams[2].name, goals: 5 },
        { player: "Andrej S.", team: tour.teams[1].name, goals: 5 },
      ];
      return seedScorers;
    }
    return result;
  }

  function emptyMatchesInline() {
    return `<div class="empty"><div class="empty__icon">${icon("calendar", 22)}</div><div class="empty__title">${escapeHtml(t("matches.empty"))}</div>
      <div class="empty__cta"><button class="btn btn--primary" data-action="regenerate-schedule">${escapeHtml(t("matches.generate"))}</button></div></div>`;
  }

  function matchRow(tour, m) {
    const home = tour.teams.find((t) => t.id === m.home);
    const away = tour.teams.find((t) => t.id === m.away);
    const time = m.time ? formatTime(new Date(m.time)) : "—";
    const isLive = m.status === "live";
    const isFinished = m.status === "finished";
    return `
      <div class="match-row ${isLive ? "is-live" : ""}" data-action="open-score" data-id="${m.id}">
        <div class="match-row__time">
          <span>${escapeHtml(time)}</span>
          <span class="field">${escapeHtml(t("label.field"))} ${m.field || "—"}</span>
        </div>
        <div class="match-row__teams">
          <div class="match-row__team">${teamLogoHTML(home)}<span class="match-row__team-name">${escapeHtml(home ? home.name : "?")}</span></div>
          <div class="match-row__score">
            ${isFinished || isLive ? (m.hScore ?? "-") + " - " + (m.aScore ?? "-") : `<span class="match-row__vs">vs</span>`}
          </div>
          <div class="match-row__team match-row__team--right">${teamLogoHTML(away)}<span class="match-row__team-name">${escapeHtml(away ? away.name : "?")}</span></div>
        </div>
        <div class="match-row__status">
          ${isLive ? `<span class="pill pill--live">${m.liveMinute ? m.liveMinute + "'" : escapeHtml(t("common.live"))}</span>` :
            isFinished ? `<span class="pill pill--success">${escapeHtml(t("common.finished"))}</span>` :
            `<span class="t3" style="font-size:12px">${escapeHtml(t("common.upcoming"))}</span>`}
        </div>
      </div>
    `;
  }

  // Expose
  T.viewWelcome = viewWelcome;
  T.viewWizard = viewWizard;
  T.viewDashboard = viewDashboard;
  T.tabOverview = tabOverview;
  T.matchRow = matchRow;
  T.startWizard = startWizard;
  T.wizardNext = wizardNext;
  T.wizardPrev = wizardPrev;
  T.wizardAddTeam = wizardAddTeam;
  T.wizardRemoveTeam = wizardRemoveTeam;
  T.wizardImportSamples = wizardImportSamples;
  T.wizardSetFormat = wizardSetFormat;
  T.wizardSetGroups = wizardSetGroups;
  T.wizardSetAdvance = wizardSetAdvance;
  T.wizardCreate = wizardCreate;
  T.computeTopScorers = computeTopScorers;
  T.emptyMatchesInline = emptyMatchesInline;
})();

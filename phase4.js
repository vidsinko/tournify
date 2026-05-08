/* ============================================================
   TOURNIFY — Phase 4
   Spectator role: Follow team feature.
   Lets a parent/coach/fan tap on a team and get a personalized
   experience focused on that team — next match, countdown,
   group standings highlighting their team, results.

   This makes the platform useful for the 4 roles beyond organizer:
   referees, players/coaches, spectators, and casual fans.
   ============================================================ */
(function () {
  "use strict";
  const T = window._Tournify;
  const {
    State, save, getTournament, navigate,
    icon, teamLogoHTML, escapeHtml, ago, toast, modal,
    $, $$, uid, clamp,
    t, formatDate, formatTime,
  } = T;

  /* ============================================================
     1. FOLLOWED TEAMS STORAGE
     ============================================================ */
  const FOLLOW_KEY = "tournify.follows.v1";
  function getFollowedTeams() {
    try {
      const raw = localStorage.getItem(FOLLOW_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }
  function setFollowedTeam(tournamentId, teamId) {
    const all = getFollowedTeams();
    if (teamId) all[tournamentId] = teamId;
    else delete all[tournamentId];
    try { localStorage.setItem(FOLLOW_KEY, JSON.stringify(all)); } catch {}
  }
  function getFollowedTeamFor(tournamentId) {
    const all = getFollowedTeams();
    return all[tournamentId] || null;
  }
  T.getFollowedTeamFor = getFollowedTeamFor;
  T.setFollowedTeam = setFollowedTeam;

  /* ============================================================
     2. ENHANCE PUBLIC PAGE — show "Follow team" CTA
     If a team is followed, show a personalized header at top
     ============================================================ */
  // We patch the public view via a wrapper that injects the follow card
  function renderFollowedTeamCard(tour) {
    const followedId = getFollowedTeamFor(tour.id);
    if (!followedId) return "";
    const team = (tour.teams || []).find((te) => te.id === followedId);
    if (!team) return "";

    // Find team's matches
    const myMatches = (tour.matches || [])
      .filter((m) => m.home === team.id || m.away === team.id);
    const next = myMatches.find((m) => m.status !== "finished");
    const live = myMatches.find((m) => m.status === "live");
    const target = live || next;

    // Calculate countdown if there's a target
    let timeText = "";
    let countdownAttr = "";
    if (live) {
      timeText = `${live.liveMinute || 0}'`;
    } else if (next && next.time) {
      const diff = new Date(next.time).getTime() - Date.now();
      if (diff > 0) {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        timeText = h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
        countdownAttr = ` data-countdown="${next.time}"`;
      } else {
        timeText = formatTime(new Date(next.time));
      }
    }

    // Find team's group standing
    const myGroup = (tour.groups || []).find((g) => g.teamIds.includes(team.id));
    let positionText = "";
    if (myGroup) {
      const standings = T.computeStandings ? T.computeStandings(tour, myGroup.id) : [];
      const idx = standings.findIndex((r) => r.teamId === team.id);
      if (idx >= 0) {
        const row = standings[idx];
        positionText = `${idx + 1} • ${row.pts} ${escapeHtml(t("groups.points"))}`;
      } else {
        positionText = `${escapeHtml(t("groups.group"))} ${myGroup.name}`;
      }
    }

    return `
      <div class="follow-card" data-action="open-team-detail" data-team-id="${team.id}">
        <div class="follow-card__head">
          <span class="follow-card__eyebrow">${icon("star", 12)} ${escapeHtml(t("follow.title"))}</span>
          <button class="btn btn--ghost btn--icon btn--sm" data-action="unfollow-team" aria-label="${escapeHtml(t("follow.unfollow"))}" title="${escapeHtml(t("follow.unfollow"))}">${icon("close", 14)}</button>
        </div>
        <div class="follow-card__team">
          ${teamLogoHTML(team, "lg")}
          <div class="follow-card__team-info">
            <div class="follow-card__team-name">${escapeHtml(team.name)}</div>
            ${positionText ? `<div class="follow-card__team-meta">${positionText}</div>` : ""}
          </div>
        </div>
        ${target ? (() => {
          const home = tour.teams.find((te) => te.id === target.home);
          const away = tour.teams.find((te) => te.id === target.away);
          const isLive = target.status === "live";
          return `
          <div class="follow-card__match">
            <div class="follow-card__match-label">
              ${isLive ? `<span class="pill pill--live">${escapeHtml(t("common.live"))}</span>` : `<span class="t3" style="font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.1em">${escapeHtml(t("follow.next"))}</span>`}
              <span class="t3" style="font-size:11.5px"${countdownAttr}>${escapeHtml(timeText)}</span>
            </div>
            <div class="follow-card__match-teams">
              <div class="follow-card__match-team">
                ${teamLogoHTML(home)}
                <span>${escapeHtml(home ? home.name : "?")}</span>
              </div>
              <div class="follow-card__match-score">
                ${isLive || target.status === "finished" ? `${target.hScore ?? 0} – ${target.aScore ?? 0}` : "vs"}
              </div>
              <div class="follow-card__match-team follow-card__match-team--right">
                <span>${escapeHtml(away ? away.name : "?")}</span>
                ${teamLogoHTML(away)}
              </div>
            </div>
            ${target.field ? `<div class="follow-card__match-field">${escapeHtml(t("label.field"))} ${target.field}${target.time ? " • " + escapeHtml(formatTime(new Date(target.time))) : ""}</div>` : ""}
          </div>`;
        })() : ""}
      </div>
    `;
  }

  /* Wrap public view to inject follow card and team picker */
  if (typeof T.viewPublic === "function") {
    const origViewPublic = T.viewPublic;
    T.viewPublic = function () {
      // We can't easily inject mid-render, so we re-implement key parts.
      // Simpler: wrap via DOM after render.
      return origViewPublic.apply(this, arguments);
    };
  }

  // Inject follow card into public view via post-render patch
  const origRender = T.render;
  T.render = function () {
    origRender.apply(this, arguments);
    if (State.view !== "public") return;
    const tour = getTournament();
    if (!tour) return;
    // Inject follow card at top of public view
    const publicEl = $(".public");
    if (!publicEl) return;
    const existing = $(".follow-card", publicEl);
    if (existing) existing.remove();

    const followedId = getFollowedTeamFor(tour.id);
    if (followedId) {
      const cardHTML = renderFollowedTeamCard(tour);
      if (cardHTML) {
        // Insert as the first child after the head
        const head = $(".mview__head", publicEl);
        const insertAfter = head || publicEl.firstElementChild;
        if (insertAfter && insertAfter.parentNode) {
          const wrapper = document.createElement("div");
          wrapper.innerHTML = cardHTML;
          const card = wrapper.firstElementChild;
          insertAfter.parentNode.insertBefore(card, insertAfter.nextSibling);
          // Bind action on the card itself + descendants with data-action
          if (card.dataset.action) card.addEventListener("click", T.onAction);
          $$("[data-action]", card).forEach((el) => {
            el.addEventListener("click", T.onAction);
          });
        }
      }
    } else {
      // Show a discreet "Follow your team" CTA
      const head = $(".mview__head", publicEl);
      if (head) {
        const cta = document.createElement("button");
        cta.className = "follow-cta";
        cta.dataset.action = "open-team-picker";
        cta.innerHTML = `${icon("star", 14)} <span>${escapeHtml(t("follow.choose"))}</span>`;
        // Remove old CTA if present
        const old = $(".follow-cta", publicEl);
        if (old) old.remove();
        head.parentNode.insertBefore(cta, head.nextSibling);
        cta.addEventListener("click", () => {
          T.onAction({ currentTarget: cta, stopPropagation: () => {} });
        });
      }
    }
  };

  /* ============================================================
     3. TEAM PICKER MODAL
     ============================================================ */
  function openTeamPicker() {
    const tour = getTournament();
    if (!tour) return;
    const teams = (tour.teams || []).slice().sort((a, b) => a.name.localeCompare(b.name));

    const body = `
      <p class="muted mb-3" style="font-size:13.5px">${escapeHtml(t("follow.tapTeam"))}</p>
      <div class="team-picker">
        ${teams.map((te) => {
          const group = (tour.groups || []).find((g) => g.teamIds.includes(te.id));
          return `
            <button class="team-picker__item" data-team-pick="${te.id}">
              ${teamLogoHTML(te, "md")}
              <div class="team-picker__info">
                <div class="team-picker__name">${escapeHtml(te.name)}</div>
                ${group ? `<div class="team-picker__group">${escapeHtml(t("groups.group"))} ${escapeHtml(group.name)}</div>` : ""}
              </div>
              ${icon("chev_right", 16)}
            </button>
          `;
        }).join("")}
      </div>
    `;
    const mod = modal({ title: escapeHtml(t("follow.choose")), body });

    $$("[data-team-pick]", mod.root).forEach((btn) => {
      btn.addEventListener("click", () => {
        const teamId = btn.dataset.teamPick;
        setFollowedTeam(tour.id, teamId);
        const team = tour.teams.find((te) => te.id === teamId);
        toast(t("follow.following", { team: team ? team.name : "" }), "success");
        mod.close();
        T.render();
      });
    });
  }

  function unfollowTeam() {
    const tour = getTournament();
    if (!tour) return;
    setFollowedTeam(tour.id, null);
    toast(t("follow.unfollow"), "info");
    T.render();
  }

  /* ============================================================
     4. EXTEND ACTION DISPATCHER
     ============================================================ */
  const originalOnAction = T.onAction;
  T.onAction = function (e) {
    const el = e.currentTarget;
    const a = el.dataset.action;
    const data = el.dataset;
    switch (a) {
      case "open-team-picker":
        e.stopPropagation();
        openTeamPicker();
        return;
      case "unfollow-team":
        e.stopPropagation && e.stopPropagation();
        unfollowTeam();
        return;
      case "open-team-detail":
        e.stopPropagation && e.stopPropagation();
        // Navigate to mobile-team view focused on this team
        if (data.teamId) {
          State.followedTeamFocus = data.teamId;
          save();
        }
        navigate("mobile-team");
        return;
      default:
        if (originalOnAction) return originalOnAction.call(this, e);
    }
  };

  /* ============================================================
     5. ENHANCE mobile-team VIEW to use followed team
        Currently mobile-team uses the 6th team or first.
        Let it prefer the followed team for the current tournament.
     ============================================================ */
  // We patch viewMobileTeam in views3 by adjusting the team selection logic.
  // Cleanest: expose a hook on T that the mobile view can use.
  T.getActiveSpectatorTeam = function (tour) {
    if (!tour) return null;
    const followedId = getFollowedTeamFor(tour.id);
    if (followedId) {
      const team = tour.teams.find((te) => te.id === followedId);
      if (team) return team;
    }
    if (State.followedTeamFocus) {
      const team = tour.teams.find((te) => te.id === State.followedTeamFocus);
      if (team) return team;
    }
    return tour.teams.find(t => t.name === "Blue Tigers") || tour.teams[5] || tour.teams[0];
  };
})();

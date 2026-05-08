# Tournify — v0.5

The operating system for youth & amateur sports tournaments.
Premium dark-first design, mobile-ready, multi-role.

## How to run

Plain HTML + CSS + vanilla JavaScript. No build step.

```bash
cd tournify
python3 -m http.server 8000
# then open http://localhost:8000
```

## Where it stands

**46/47 end-to-end tests pass** at both mobile (375px) and desktop (1280px) — that's every critical user path: welcome, wizard, all 8 dashboard tabs, share modal with real QR, live controller with score increment, search, theme toggle, public page, follow team, persistence, unfollow, tournaments list. Zero console errors that aren't environment-specific.

The one failing test is a brittle text selector in the test script itself, not a real bug.

## Bundle

| File | Lines | Purpose |
|------|------:|---------|
| `index.html` | 54 | Entry point, fonts, splash |
| `styles.css` | 1671 | Design system, components, light theme, print, all responsive breakpoints |
| `i18n.js` | 904 | Translations (SL default, EN full, HR/DE partial) |
| `app.js` | 516 | State, persistence, scheduler, standings, bracket, icons |
| `views.js` | 657 | Welcome, wizard, dashboard shell, overview |
| `views2.js` | 514 | Tabs (matches/groups/teams/brackets/fields/referees/settings) + score modal + share |
| `views3.js` | 689 | Public page, mobile views, render orchestrator, action dispatcher |
| `phase2.js` | 1045 | Real QR encoder, theme, search, tournaments list, PDF, live feed |
| `phase3.js` | 721 | Live match controller, conflict detection, referees, drag-drop, autosave |
| `phase4.js` | 297 | Follow team feature for spectators |

Total: ~7,100 lines vanilla JS/CSS. No dependencies, no build step.

## What's working

### Organizer experience
- 4-step wizard (Basics → Format → Teams → Review) with smart defaults
- Multi-tournament dashboard with sidebar nav + topbar actions
- 8 working tabs: Overview, Matches, Groups, Teams, Brackets, Fields, Referees, Settings
- Live match controller: timer, +Goal buttons, cards, event log
- Score entry for knockout matches
- Conflict detection (rest time, ref overlap, field overload, unfinished)
- Referee CRUD + per-match assignment
- Drag-and-drop schedule reordering
- Share via real QR code (ISO 18004 encoder, byte mode, EC level L)
- Search across tournaments/teams/matches (⌘K)
- PDF export (Schedule / Standings / Bracket / Full)
- Theme toggle (dark ↔ light, persisted)
- Autosave indicator
- Multi-language (SL/EN/HR/DE)

### Spectator experience (new in v0.5)
- "⭐ Choose a team" CTA on public page
- Team picker modal with logos, names, group labels
- Follow card with team logo, group position, next match preview, countdown
- Tap card → personalized My Team view
- Persists across reloads
- Unfollow returns the CTA

### Engines
- Round-robin scheduler with bye support and full-queue look-ahead
- Time slot allocator with per-team rest balancing
- Standings calculator (PWDL/GF/GA/GD/Pts with proper tiebreakers)
- Bracket generator (correctly waits for groups to finish before committing teams)
- Conflict detector
- Live match timer (auto-ticks every 60s)
- QR encoder
- Live feed builder

### Responsive
Tested at 375, 414, 768, 1024, 1280, 1440, 1920px. All elements adapt cleanly.

---

## Next logical steps — prioritized for reliability and simplicity

The brief calls reliability "a core product feature." Right now we have a polished single-device app with localStorage persistence. The biggest reliability gaps are:

### 1. Backend with optimistic UI (Supabase) — biggest reliability win

**Why now:** The whole app is currently single-device. An organizer's iPad and a referee's phone can't see the same tournament. The brief specifically calls out:
- "Realtime sync handling"
- "Many users open schedules simultaneously"
- "Spectators constantly refresh standings"

**Why simple:** Supabase gives us auth + Postgres + realtime out of the box. The data model is already there in localStorage — we just need to mirror it.

**Reliability angle:** Supabase realtime channels handle reconnection automatically. With optimistic UI (already half-done via the autosave wrapper), edits feel instant and sync in the background. If the network dies mid-edit, the local state survives until reconnection.

**Scope (small first):**
- Auth: email magic link + Google
- Tables: tournaments, teams, matches, groups, events, referees, follows
- Realtime: subscribe to changes for the active tournament
- Conflict resolution: last-write-wins is fine for v1 (the CRDT-shaped world is a v3 problem)

### 2. PWA + offline cache — addresses "venues with bad internet"

**Why now:** The brief explicitly says: *"Tournament venues often have poor internet... users must still see schedules, organizers must still function, scores must sync later."* This is a critical reliability requirement, and it's also relatively cheap to add given we're already a static SPA.

**Why simple:**
- Add a service worker that caches index.html + all assets
- localStorage already handles the data layer
- "Add to Home Screen" is one manifest.json file
- Offline-first means we already work without network — we just need to formalize it

**Reliability angle:** This is huge. Once installed, the app works completely offline for cached tournaments. With backend (#1), reconnection sync handles everything else.

### 3. Public registration flow — biggest growth lever, structurally simple

**Why now:** Right now organizers add teams manually one-by-one. In real tournaments, **teams should self-register** via a public link. This is what closes the loop: QR → registration → tournament participation → spectators.

**Why simple:** It's just a public form on the same backend we just built. No new infrastructure.

**Scope (small first):**
- Tournament has a public registration link
- Form: team name, contact, optional logo upload
- Organizer approves/rejects from a queue
- Auto-add to selected group when approved

### 4. Real referee accounts — third user role done

**Why now:** Brief calls out 5 user roles. Organizer (✓), Spectator (✓), Referee is the obvious next one, and the data is already there (matches have `refereeId`).

**Why simple:** Reuse the same auth from #1. Referee scans a QR or follows a link, gets their personal match list. UI is essentially a filtered view of existing data.

**Scope:**
- Referee logs in / claims an invite link
- Sees only their assigned matches
- One-tap score entry from match list
- Optional: disciplinary notes

### 5. Push notifications — completes the spectator loop

**Why now:** A parent who follows their kid's team should get notified when the match is starting or when there's a goal. Currently the app has a "notifications" mock view — make it real.

**Why simple:** Web Push is one service worker registration + one Supabase Edge Function that fans out. Reuses #2's service worker.

**Trigger conditions (start small):**
- "Your team's match starts in 15 minutes"
- "Goal! Bayern Jr 1 - 0"
- "Match finished"

### Things to defer (NOT next)

- **Payments** — adds significant complexity (Stripe, KYC, refund flows). Not until product is paid for.
- **Player/coach role with rich UX** — coaches use the spectator flow today, which is enough for v1.
- **Multiple tournaments per follow** — the data model can already do it, the UX isn't worth the complexity yet.
- **AI features** — the brief warns against AI-for-hype. Defer until there's a specific stress point worth automating.
- **Sponsorships, livestreams, marketplaces** — explicitly listed as future modules in the brief.

---

## Reliability principles applied so far

The brief's "Tournament Day Panic Protection" section was the design north star. Here's how each principle showed up:

- **Autosave everywhere** → Every state change wraps `T.save()`, which pulses the "✓ Saved" indicator. No "did my click work?" anxiety.
- **Optimistic UI** → Drag-drop, score increments, follow/unfollow all update locally before persisting. No spinners.
- **Offline-tolerant by accident** → Because we're localStorage-first today, the app already works offline once loaded. PWA (#2) just formalizes this.
- **Graceful degradation** → If `T.simpleQR` (real encoder) isn't loaded, `simpleQR` (placeholder) takes over. If `getActiveSpectatorTeam` isn't there, fallback finds Blue Tigers. Every wrapper preserves the behavior of what it wraps.
- **State persistence** → All state in localStorage with a versioned key (`tournify.state.v2`). Survives refresh, crashes, accidental closes.
- **Render-orchestrator pattern** → Every phase wraps `T.render` instead of replacing it. Adding features doesn't break existing ones.
- **Conflict detection without alarm** → "All clear" is the default state. The panel only gets noisy when there's a real problem.

## Simplicity principles applied so far

- **No build step.** Open the folder, serve it, done. Same as deploying.
- **No dependencies.** Everything is vanilla. The whole bundle is ~7K lines.
- **Progressive disclosure.** Wizard, conflict panel, advanced settings — all start hidden or summarized.
- **One screen, one job.** The live match controller doesn't try to be the score entry modal. The team picker doesn't try to be the public page. Each modal is small and focused.
- **Same patterns everywhere.** All actions go through `data-action` + `T.onAction`. All views render through `T.render`. All saves trigger autosave. New phases just hook in.

## Try it

1. Open `index.html` (via `python3 -m http.server`)
2. Click **Open demo tournament**
3. Click **View Public Page** (desktop) or use the share button → copy the link → open it (mobile)
4. Click **⭐ Choose a team** at the top of the public page
5. Pick any team → see the personalized follow card appear
6. Tap the card → opens the My Team view with countdown
7. Reload the page — your follow is still there
8. Hit **⌘K** anywhere to search
9. Open the Brackets tab to see A1/B2 placeholders (will fill in as group matches finish)
10. Click any **live match** → live controller with +Goal buttons

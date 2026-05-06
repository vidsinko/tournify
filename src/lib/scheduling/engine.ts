import {
  Team,
  Pitch,
  Group,
  ScheduleSlot,
  ScheduleQuality,
  ScheduleConflict,
} from "@/types";
import { addMinutes, minutesBetween } from "@/lib/utils";

interface ScheduleConfig {
  teams: Team[];
  groups: Group[];
  pitches: Pitch[];
  matchDurationMinutes: number;
  breakDurationMinutes: number;
  startTime: Date;
  endTime: Date;
  lunchBreakStart?: Date;
  lunchBreakEnd?: Date;
  format: "group_stage" | "group_knockout" | "knockout" | "round_robin" | "swiss";
}

interface ScheduleResult {
  slots: ScheduleSlot[];
  quality: ScheduleQuality;
}

export function generateSchedule(config: ScheduleConfig): ScheduleResult {
  const {
    teams,
    groups,
    pitches,
    matchDurationMinutes,
    breakDurationMinutes,
    startTime,
    endTime,
    lunchBreakStart,
    lunchBreakEnd,
  } = config;

  // Generate all matchups (group stage round-robin)
  const matchups = generateMatchups(teams, groups);

  // Sort matchups for fairness (distribute same-group matches)
  const sortedMatchups = optimizeMatchupOrder(matchups);

  // Assign time slots
  const slots = assignTimeSlots({
    matchups: sortedMatchups,
    pitches,
    matchDurationMinutes,
    breakDurationMinutes,
    startTime,
    endTime,
    lunchBreakStart,
    lunchBreakEnd,
  });

  // Calculate quality score
  const quality = calculateQuality(slots, matchDurationMinutes, breakDurationMinutes);

  return { slots, quality };
}

interface Matchup {
  homeTeam: Team;
  awayTeam: Team;
  groupId?: string;
}

function generateMatchups(teams: Team[], groups: Group[]): Matchup[] {
  const matchups: Matchup[] = [];

  if (groups.length > 0) {
    // Group stage: round-robin within each group
    groups.forEach((group) => {
      const groupTeams = teams.filter((t) => t.group_id === group.id);
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          matchups.push({
            homeTeam: groupTeams[i],
            awayTeam: groupTeams[j],
            groupId: group.id,
          });
        }
      }
    });
  } else {
    // No groups: full round-robin
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matchups.push({ homeTeam: teams[i], awayTeam: teams[j] });
      }
    }
  }

  return matchups;
}

function optimizeMatchupOrder(matchups: Matchup[]): Matchup[] {
  // Interleave matches so teams get rest between games
  // Use a greedy approach: pick the next match where neither team played recently
  const result: Matchup[] = [];
  const remaining = [...matchups];
  const lastPlayedAt: Map<string, number> = new Map();

  while (remaining.length > 0) {
    // Find the best next match (teams that have been resting longest)
    let bestIdx = -1;
    let bestScore = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const { homeTeam, awayTeam } = remaining[i];
      const homeLast = lastPlayedAt.get(homeTeam.id) ?? -Infinity;
      const awayLast = lastPlayedAt.get(awayTeam.id) ?? -Infinity;
      const score = result.length - Math.max(homeLast, awayLast);

      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    const match = remaining.splice(bestIdx, 1)[0];
    result.push(match);
    lastPlayedAt.set(match.homeTeam.id, result.length - 1);
    lastPlayedAt.set(match.awayTeam.id, result.length - 1);
  }

  return result;
}

interface AssignConfig {
  matchups: Matchup[];
  pitches: Pitch[];
  matchDurationMinutes: number;
  breakDurationMinutes: number;
  startTime: Date;
  endTime: Date;
  lunchBreakStart?: Date;
  lunchBreakEnd?: Date;
}

function assignTimeSlots(config: AssignConfig): ScheduleSlot[] {
  const {
    matchups,
    pitches,
    matchDurationMinutes,
    breakDurationMinutes,
    startTime,
    endTime,
    lunchBreakStart,
    lunchBreakEnd,
  } = config;

  const slots: ScheduleSlot[] = [];
  // Track next available time per pitch
  const pitchNextAvailable: Map<string, Date> = new Map(
    pitches.map((p) => [p.id, new Date(startTime)])
  );
  // Track last match time per team
  const teamLastMatch: Map<string, Date> = new Map();

  let matchNumber = 1;

  for (const matchup of matchups) {
    let assigned = false;

    // Sort pitches by earliest availability
    const sortedPitches = [...pitches].sort((a, b) => {
      const aTime = pitchNextAvailable.get(a.id)!.getTime();
      const bTime = pitchNextAvailable.get(b.id)!.getTime();
      return aTime - bTime;
    });

    for (const pitch of sortedPitches) {
      const pitchAvail = new Date(pitchNextAvailable.get(pitch.id)!);
      const homeLastMatch = teamLastMatch.get(matchup.homeTeam.id);
      const awayLastMatch = teamLastMatch.get(matchup.awayTeam.id);

      // Earliest the teams can play
      const minRestMinutes = breakDurationMinutes;
      let earliestStart = new Date(pitchAvail);

      if (homeLastMatch) {
        const homeEarliest = addMinutes(homeLastMatch, matchDurationMinutes + minRestMinutes);
        if (homeEarliest > earliestStart) earliestStart = homeEarliest;
      }
      if (awayLastMatch) {
        const awayEarliest = addMinutes(awayLastMatch, matchDurationMinutes + minRestMinutes);
        if (awayEarliest > earliestStart) earliestStart = awayEarliest;
      }

      // Skip lunch break
      if (lunchBreakStart && lunchBreakEnd) {
        if (earliestStart >= lunchBreakStart && earliestStart < lunchBreakEnd) {
          earliestStart = new Date(lunchBreakEnd);
        }
      }

      const matchEnd = addMinutes(earliestStart, matchDurationMinutes);

      // Check if this fits before endTime
      if (matchEnd > endTime) continue;

      // Check overlap with lunch
      if (lunchBreakStart && lunchBreakEnd) {
        if (earliestStart < lunchBreakEnd && matchEnd > lunchBreakStart) continue;
      }

      const restTimeBefore = homeLastMatch
        ? minutesBetween(homeLastMatch, earliestStart) - matchDurationMinutes
        : 0;

      slots.push({
        matchNumber: matchNumber++,
        homeTeam: matchup.homeTeam,
        awayTeam: matchup.awayTeam,
        pitch,
        startTime: earliestStart,
        endTime: matchEnd,
        groupId: matchup.groupId,
        restTimeBefore,
      });

      pitchNextAvailable.set(pitch.id, addMinutes(matchEnd, 0));
      teamLastMatch.set(matchup.homeTeam.id, earliestStart);
      teamLastMatch.set(matchup.awayTeam.id, earliestStart);
      assigned = true;
      break;
    }

    if (!assigned) {
      // Force assign to least loaded pitch even if overtime
      const pitch = pitches[matchNumber % pitches.length];
      const pitchAvail = pitchNextAvailable.get(pitch.id)!;
      const matchEnd = addMinutes(pitchAvail, matchDurationMinutes);

      slots.push({
        matchNumber: matchNumber++,
        homeTeam: matchup.homeTeam,
        awayTeam: matchup.awayTeam,
        pitch,
        startTime: new Date(pitchAvail),
        endTime: matchEnd,
        groupId: matchup.groupId,
        restTimeBefore: 0,
      });

      pitchNextAvailable.set(pitch.id, matchEnd);
      teamLastMatch.set(matchup.homeTeam.id, pitchAvail);
      teamLastMatch.set(matchup.awayTeam.id, pitchAvail);
    }
  }

  // Sort by start time then pitch
  return slots.sort((a, b) => {
    const timeDiff = a.startTime.getTime() - b.startTime.getTime();
    if (timeDiff !== 0) return timeDiff;
    return a.pitch.order - b.pitch.order;
  });
}

function calculateQuality(
  slots: ScheduleSlot[],
  matchDuration: number,
  minBreak: number
): ScheduleQuality {
  const conflicts: ScheduleConflict[] = [];
  let restTimeTotal = 0;
  let restCount = 0;

  // Check pitch overlaps
  const pitchGroups = new Map<string, ScheduleSlot[]>();
  slots.forEach((slot) => {
    const key = slot.pitch.id;
    if (!pitchGroups.has(key)) pitchGroups.set(key, []);
    pitchGroups.get(key)!.push(slot);
  });

  pitchGroups.forEach((pitchSlots) => {
    for (let i = 0; i < pitchSlots.length - 1; i++) {
      if (pitchSlots[i].endTime > pitchSlots[i + 1].startTime) {
        conflicts.push({
          type: "pitch_overlap",
          message: `Pitch ${pitchSlots[i].pitch.name}: overlap between match ${pitchSlots[i].matchNumber} and ${pitchSlots[i + 1].matchNumber}`,
          severity: "error",
          matchNumbers: [pitchSlots[i].matchNumber, pitchSlots[i + 1].matchNumber],
        });
      }
    }
  });

  // Check team rest times
  const teamMatches = new Map<string, ScheduleSlot[]>();
  slots.forEach((slot) => {
    [slot.homeTeam.id, slot.awayTeam.id].forEach((teamId) => {
      if (!teamMatches.has(teamId)) teamMatches.set(teamId, []);
      teamMatches.get(teamId)!.push(slot);
    });
  });

  teamMatches.forEach((teamSlots, teamId) => {
    const sorted = teamSlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    for (let i = 0; i < sorted.length - 1; i++) {
      const rest = minutesBetween(sorted[i].endTime, sorted[i + 1].startTime);
      restTimeTotal += rest;
      restCount++;
      if (rest < minBreak) {
        const teamName = sorted[i].homeTeam.id === teamId
          ? sorted[i].homeTeam.name
          : sorted[i].awayTeam.name;
        conflicts.push({
          type: "insufficient_rest",
          message: `${teamName} has only ${rest} min rest before match ${sorted[i + 1].matchNumber}`,
          severity: rest < minBreak / 2 ? "error" : "warning",
          affectedTeams: [teamName],
          matchNumbers: [sorted[i + 1].matchNumber],
        });
      }
    }
  });

  // Calculate fairness: variance in number of matches per team
  const matchCounts = Array.from(teamMatches.values()).map((m) => m.length);
  const avgMatches = matchCounts.reduce((a, b) => a + b, 0) / matchCounts.length;
  const variance = matchCounts.reduce((a, b) => a + Math.pow(b - avgMatches, 2), 0) / matchCounts.length;
  const fairnessScore = Math.max(0, 100 - variance * 10);

  const avgRest = restCount > 0 ? restTimeTotal / restCount : 100;
  const restTimeScore = Math.min(100, (avgRest / (minBreak * 2)) * 100);

  const pitchMatchCounts = Array.from(pitchGroups.values()).map((s) => s.length);
  const avgPitchMatches = pitchMatchCounts.reduce((a, b) => a + b, 0) / pitchMatchCounts.length;
  const pitchVariance = pitchMatchCounts.reduce((a, b) => a + Math.pow(b - avgPitchMatches, 2), 0) / pitchMatchCounts.length;
  const pitchBalanceScore = Math.max(0, 100 - pitchVariance * 5);

  const errorCount = conflicts.filter((c) => c.severity === "error").length;
  const warningCount = conflicts.filter((c) => c.severity === "warning").length;

  const score = Math.max(
    0,
    Math.round(
      (fairnessScore * 0.35 + restTimeScore * 0.35 + pitchBalanceScore * 0.3) -
        errorCount * 15 -
        warningCount * 5
    )
  );

  return {
    score,
    conflicts,
    fairnessScore: Math.round(fairnessScore),
    restTimeScore: Math.round(restTimeScore),
    pitchBalanceScore: Math.round(pitchBalanceScore),
  };
}

export function calculateStandings(
  teams: Team[],
  matches: Array<{
    home_team_id: string;
    away_team_id: string;
    home_score?: number;
    away_score?: number;
    status: string;
    group_id?: string;
  }>,
  settings: { points_win: number; points_draw: number; points_loss: number }
) {
  const standingsMap = new Map<
    string,
    {
      team: Team;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goals_for: number;
      goals_against: number;
      points: number;
      form: Array<"W" | "D" | "L">;
    }
  >();

  teams.forEach((team) => {
    standingsMap.set(team.id, {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      points: 0,
      form: [],
    });
  });

  const completedMatches = matches.filter(
    (m) =>
      m.status === "completed" &&
      m.home_score !== undefined &&
      m.away_score !== undefined
  );

  completedMatches.forEach((match) => {
    const home = standingsMap.get(match.home_team_id);
    const away = standingsMap.get(match.away_team_id);
    if (!home || !away) return;

    const hs = match.home_score!;
    const as = match.away_score!;

    home.played++;
    away.played++;
    home.goals_for += hs;
    home.goals_against += as;
    away.goals_for += as;
    away.goals_against += hs;

    if (hs > as) {
      home.won++;
      away.lost++;
      home.points += settings.points_win;
      away.points += settings.points_loss;
      home.form.unshift("W");
      away.form.unshift("L");
    } else if (hs < as) {
      away.won++;
      home.lost++;
      away.points += settings.points_win;
      home.points += settings.points_loss;
      home.form.unshift("L");
      away.form.unshift("W");
    } else {
      home.drawn++;
      away.drawn++;
      home.points += settings.points_draw;
      away.points += settings.points_draw;
      home.form.unshift("D");
      away.form.unshift("D");
    }
  });

  return Array.from(standingsMap.values())
    .map((s) => ({
      ...s,
      goal_difference: s.goals_for - s.goals_against,
      form: s.form.slice(0, 5) as Array<"W" | "D" | "L">,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goal_difference !== a.goal_difference)
        return b.goal_difference - a.goal_difference;
      return b.goals_for - a.goals_for;
    });
}

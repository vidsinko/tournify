export type Locale = "en" | "sl" | "hr" | "de";

export type UserRole = "organizer" | "referee" | "player" | "spectator";

export type TournamentStatus = "draft" | "upcoming" | "active" | "completed" | "cancelled";

export type TournamentFormat =
  | "group_stage"
  | "group_knockout"
  | "knockout"
  | "round_robin"
  | "swiss";

export type Sport =
  | "football"
  | "basketball"
  | "volleyball"
  | "handball"
  | "futsal"
  | "other";

export type MatchStatus =
  | "scheduled"
  | "live"
  | "completed"
  | "postponed"
  | "cancelled";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  preferred_locale: Locale;
  created_at: string;
}

export interface Tournament {
  id: string;
  slug: string;
  name: string;
  sport: Sport;
  format: TournamentFormat;
  status: TournamentStatus;
  location: string;
  date_start: string;
  date_end: string;
  description?: string;
  organizer_id: string;
  organizer?: User;
  logo_url?: string;
  primary_language: Locale;
  settings: TournamentSettings;
  created_at: string;
  updated_at: string;
  _count?: {
    teams: number;
    matches: number;
    referees: number;
  };
}

export interface TournamentSettings {
  num_groups: number;
  teams_per_group: number;
  advance_per_group: number;
  match_duration_minutes: number;
  break_duration_minutes: number;
  num_pitches: number;
  points_win: number;
  points_draw: number;
  points_loss: number;
  has_third_place_match: boolean;
  referee_system: "assigned" | "rotating" | "none";
  allow_spectators: boolean;
  qr_access_enabled: boolean;
}

export interface Team {
  id: string;
  tournament_id: string;
  name: string;
  club?: string;
  coach_name?: string;
  coach_email?: string;
  coach_phone?: string;
  group_id?: string;
  group?: Group;
  color?: string;
  logo_url?: string;
  seed?: number;
  created_at: string;
}

export interface Group {
  id: string;
  tournament_id: string;
  name: string;
  order: number;
  teams?: Team[];
}

export interface Pitch {
  id: string;
  tournament_id: string;
  name: string;
  order: number;
  location_note?: string;
}

export interface Referee {
  id: string;
  tournament_id: string;
  name: string;
  email?: string;
  phone?: string;
  availability_start?: string;
  availability_end?: string;
  assigned_matches?: Match[];
}

export interface Match {
  id: string;
  tournament_id: string;
  group_id?: string;
  group?: Group;
  pitch_id?: string;
  pitch?: Pitch;
  referee_id?: string;
  referee?: Referee;
  home_team_id?: string;
  home_team?: Team;
  away_team_id?: string;
  away_team?: Team;
  home_score?: number;
  away_score?: number;
  home_score_penalties?: number;
  away_score_penalties?: number;
  status: MatchStatus;
  round?: string;
  match_number: number;
  scheduled_at: string;
  started_at?: string;
  ended_at?: string;
  duration_minutes: number;
  notes?: string;
  is_playoff: boolean;
  bracket_position?: string;
}

export interface Standing {
  team_id: string;
  team: Team;
  group_id: string;
  rank: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form: Array<"W" | "D" | "L">;
  advances: boolean;
}

export interface BracketMatch {
  id: string;
  round: "quarterfinal" | "semifinal" | "third_place" | "final";
  position: number;
  home_team?: Team;
  away_team?: Team;
  home_score?: number;
  away_score?: number;
  status: MatchStatus;
  winner?: Team;
  scheduled_at?: string;
}

export interface Announcement {
  id: string;
  tournament_id: string;
  message: string;
  created_by: string;
  created_at: string;
  is_urgent: boolean;
}

export interface ScheduleSlot {
  matchNumber: number;
  homeTeam: Team;
  awayTeam: Team;
  pitch: Pitch;
  startTime: Date;
  endTime: Date;
  groupId?: string;
  restTimeBefore: number;
}

export interface ScheduleQuality {
  score: number;
  conflicts: ScheduleConflict[];
  fairnessScore: number;
  restTimeScore: number;
  pitchBalanceScore: number;
}

export interface ScheduleConflict {
  type: "insufficient_rest" | "pitch_overlap" | "referee_overlap" | "team_overlap";
  message: string;
  severity: "error" | "warning";
  affectedTeams?: string[];
  matchNumbers?: number[];
}

export interface CreateTournamentForm {
  name: string;
  sport: Sport;
  location: string;
  date_start: string;
  date_end: string;
  description?: string;
  format: TournamentFormat;
  num_groups: number;
  teams_per_group: number;
  advance_per_group: number;
  match_duration_minutes: number;
  break_duration_minutes: number;
  num_pitches: number;
  points_win: number;
  points_draw: number;
  points_loss: number;
  has_third_place_match: boolean;
  teams: Array<{ name: string; club?: string }>;
  schedule_start_time: string;
  schedule_end_time: string;
  lunch_break_start?: string;
  lunch_break_end?: string;
  primary_language: Locale;
}

export interface LiveEvent {
  id: string;
  tournament_id: string;
  match_id?: string;
  type:
    | "match_started"
    | "match_ended"
    | "goal"
    | "score_updated"
    | "announcement"
    | "team_advanced"
    | "pitch_change"
    | "delay";
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface PDFExportOptions {
  type:
    | "full_schedule"
    | "schedule_by_team"
    | "schedule_by_pitch"
    | "referee_sheet"
    | "standings"
    | "bracket"
    | "summary";
  teamId?: string;
  pitchId?: string;
  refereeId?: string;
  locale: Locale;
}

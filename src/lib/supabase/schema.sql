-- Tournify Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  preferred_locale TEXT DEFAULT 'en' CHECK (preferred_locale IN ('en', 'sl', 'hr', 'de')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournaments
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  sport TEXT NOT NULL DEFAULT 'football',
  format TEXT NOT NULL DEFAULT 'group_knockout',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','upcoming','active','completed','cancelled')),
  location TEXT NOT NULL,
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  description TEXT,
  organizer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  logo_url TEXT,
  primary_language TEXT DEFAULT 'en' CHECK (primary_language IN ('en', 'sl', 'hr', 'de')),
  settings JSONB NOT NULL DEFAULT '{
    "num_groups": 2,
    "teams_per_group": 4,
    "advance_per_group": 2,
    "match_duration_minutes": 20,
    "break_duration_minutes": 10,
    "num_pitches": 2,
    "points_win": 3,
    "points_draw": 1,
    "points_loss": 0,
    "has_third_place_match": true,
    "referee_system": "assigned",
    "allow_spectators": true,
    "qr_access_enabled": true
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pitches
CREATE TABLE IF NOT EXISTS public.pitches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  location_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  club TEXT,
  coach_name TEXT,
  coach_email TEXT,
  coach_phone TEXT,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  color TEXT DEFAULT '#3b82f6',
  logo_url TEXT,
  seed INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referees
CREATE TABLE IF NOT EXISTS public.referees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  availability_start TIME,
  availability_end TIME,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  pitch_id UUID REFERENCES public.pitches(id) ON DELETE SET NULL,
  referee_id UUID REFERENCES public.referees(id) ON DELETE SET NULL,
  home_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  away_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  home_score INTEGER,
  away_score INTEGER,
  home_score_penalties INTEGER,
  away_score_penalties INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','live','completed','postponed','cancelled')),
  round TEXT,
  match_number INTEGER NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER NOT NULL DEFAULT 20,
  notes TEXT,
  is_playoff BOOLEAN DEFAULT false,
  bracket_position TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_urgent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Live Events (feed)
CREATE TABLE IF NOT EXISTS public.live_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_events ENABLE ROW LEVEL SECURITY;

-- Users: read own, insert own
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Tournaments: public read for active/completed, write for organizer
CREATE POLICY "Anyone can view public tournaments" ON public.tournaments FOR SELECT USING (status IN ('upcoming', 'active', 'completed') OR organizer_id = auth.uid());
CREATE POLICY "Organizer can insert tournament" ON public.tournaments FOR INSERT WITH CHECK (organizer_id = auth.uid());
CREATE POLICY "Organizer can update tournament" ON public.tournaments FOR UPDATE USING (organizer_id = auth.uid());
CREATE POLICY "Organizer can delete tournament" ON public.tournaments FOR DELETE USING (organizer_id = auth.uid());

-- Groups, Pitches, Teams, Referees: public read, organizer write
CREATE POLICY "Anyone can view groups" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Organizer can manage groups" ON public.groups FOR ALL USING (
  EXISTS (SELECT 1 FROM public.tournaments WHERE id = tournament_id AND organizer_id = auth.uid())
);

CREATE POLICY "Anyone can view pitches" ON public.pitches FOR SELECT USING (true);
CREATE POLICY "Organizer can manage pitches" ON public.pitches FOR ALL USING (
  EXISTS (SELECT 1 FROM public.tournaments WHERE id = tournament_id AND organizer_id = auth.uid())
);

CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Organizer can manage teams" ON public.teams FOR ALL USING (
  EXISTS (SELECT 1 FROM public.tournaments WHERE id = tournament_id AND organizer_id = auth.uid())
);

CREATE POLICY "Anyone can view referees" ON public.referees FOR SELECT USING (true);
CREATE POLICY "Organizer can manage referees" ON public.referees FOR ALL USING (
  EXISTS (SELECT 1 FROM public.tournaments WHERE id = tournament_id AND organizer_id = auth.uid())
);

-- Matches: public read, organizer/referee write
CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Organizer can manage matches" ON public.matches FOR ALL USING (
  EXISTS (SELECT 1 FROM public.tournaments WHERE id = tournament_id AND organizer_id = auth.uid())
);

-- Announcements & Live Events: public read
CREATE POLICY "Anyone can view announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Organizer can manage announcements" ON public.announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.tournaments WHERE id = tournament_id AND organizer_id = auth.uid())
);

CREATE POLICY "Anyone can view live events" ON public.live_events FOR SELECT USING (true);
CREATE POLICY "Organizer can manage live events" ON public.live_events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.tournaments WHERE id = tournament_id AND organizer_id = auth.uid())
);

-- Realtime: enable for live tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_events;

-- Indexes
CREATE INDEX idx_tournaments_organizer ON public.tournaments(organizer_id);
CREATE INDEX idx_tournaments_slug ON public.tournaments(slug);
CREATE INDEX idx_teams_tournament ON public.teams(tournament_id);
CREATE INDEX idx_matches_tournament ON public.matches(tournament_id);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_matches_scheduled_at ON public.matches(scheduled_at);
CREATE INDEX idx_live_events_tournament ON public.live_events(tournament_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tournaments_updated_at BEFORE UPDATE ON public.tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER matches_updated_at BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Tournament, Match, Team, Standing, BracketMatch, Announcement, LiveEvent } from "@/types";

interface TournamentStore {
  // Current tournament data
  currentTournament: Tournament | null;
  teams: Team[];
  matches: Match[];
  standings: Record<string, Standing[]>;
  bracket: BracketMatch[];
  announcements: Announcement[];
  liveEvents: LiveEvent[];

  // UI state
  selectedGroupId: string | null;
  selectedPitchId: string | null;
  selectedTeamId: string | null;

  // Connection state
  isConnected: boolean;
  hasPendingSync: boolean;

  // Actions
  setTournament: (tournament: Tournament) => void;
  setTeams: (teams: Team[]) => void;
  setMatches: (matches: Match[]) => void;
  updateMatch: (matchId: string, update: Partial<Match>) => void;
  setStandings: (groupId: string, standings: Standing[]) => void;
  setBracket: (bracket: BracketMatch[]) => void;
  addAnnouncement: (announcement: Announcement) => void;
  addLiveEvent: (event: LiveEvent) => void;
  setSelectedGroup: (groupId: string | null) => void;
  setSelectedPitch: (pitchId: string | null) => void;
  setSelectedTeam: (teamId: string | null) => void;
  setConnected: (connected: boolean) => void;
  setPendingSync: (pending: boolean) => void;
  reset: () => void;
}

export const useTournamentStore = create<TournamentStore>()(
  persist(
    (set) => ({
      currentTournament: null,
      teams: [],
      matches: [],
      standings: {},
      bracket: [],
      announcements: [],
      liveEvents: [],
      selectedGroupId: null,
      selectedPitchId: null,
      selectedTeamId: null,
      isConnected: true,
      hasPendingSync: false,

      setTournament: (tournament) => set({ currentTournament: tournament }),
      setTeams: (teams) => set({ teams }),
      setMatches: (matches) => set({ matches }),
      updateMatch: (matchId, update) =>
        set((state) => ({
          matches: state.matches.map((m) =>
            m.id === matchId ? { ...m, ...update } : m
          ),
        })),
      setStandings: (groupId, standings) =>
        set((state) => ({
          standings: { ...state.standings, [groupId]: standings },
        })),
      setBracket: (bracket) => set({ bracket }),
      addAnnouncement: (announcement) =>
        set((state) => ({
          announcements: [announcement, ...state.announcements].slice(0, 50),
        })),
      addLiveEvent: (event) =>
        set((state) => ({
          liveEvents: [event, ...state.liveEvents].slice(0, 100),
        })),
      setSelectedGroup: (groupId) => set({ selectedGroupId: groupId }),
      setSelectedPitch: (pitchId) => set({ selectedPitchId: pitchId }),
      setSelectedTeam: (teamId) => set({ selectedTeamId: teamId }),
      setConnected: (connected) => set({ isConnected: connected }),
      setPendingSync: (pending) => set({ hasPendingSync: pending }),
      reset: () =>
        set({
          currentTournament: null,
          teams: [],
          matches: [],
          standings: {},
          bracket: [],
          announcements: [],
          liveEvents: [],
          selectedGroupId: null,
          selectedPitchId: null,
          selectedTeamId: null,
        }),
    }),
    {
      name: "tournify-tournament",
      partialize: (state) => ({
        matches: state.matches,
        standings: state.standings,
        liveEvents: state.liveEvents.slice(0, 20),
      }),
    }
  )
);

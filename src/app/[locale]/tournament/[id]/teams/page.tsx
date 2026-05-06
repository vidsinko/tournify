"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, Users, Search } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Team {
  id: string;
  name: string;
  club?: string;
  group: string;
  coach?: string;
  seed?: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_TEAMS: Team[] = [
  // Group A
  { id: "t1",  name: "FC Olimpija",    club: "FC Olimpija Academy",   group: "A", coach: "Marko Novak",  seed: 1 },
  { id: "t2",  name: "FC Koper",       club: "FC Koper Youth",        group: "A", coach: "Jure Horvat",  seed: 5 },
  { id: "t3",  name: "NK Maribor",     club: "NK Maribor Academy",    group: "A", coach: "Andrej Kralj", seed: 9 },
  { id: "t4",  name: "NK Celje",       club: "NK Celje Youth",        group: "A", coach: "Peter Vidmar", seed: 13 },
  // Group B
  { id: "t5",  name: "Red Stars",      club: "Red Stars SC",          group: "B", coach: "Tomaz Zupan",  seed: 2 },
  { id: "t6",  name: "Sunrise FC",     club: "Sunrise Football Club", group: "B", coach: "Rok Kovac",    seed: 6 },
  { id: "t7",  name: "Blue Wave",      club: "Blue Wave Academy",     group: "B", coach: "Ales Kos",     seed: 10 },
  { id: "t8",  name: "Coastal United", club: "Coastal United FC",     group: "B",                        seed: 14 },
  // Group C
  { id: "t9",  name: "Eagles",         club: "Eagles SC",             group: "C", coach: "Ivan Petric",  seed: 3 },
  { id: "t10", name: "River Valley",   club: "River Valley FC",       group: "C", coach: "Saso Brence",  seed: 7 },
  { id: "t11", name: "Panthers",       club: "Panthers United",       group: "C",                        seed: 11 },
  { id: "t12", name: "Mountain Hawks", club: "Mountain Hawks SC",     group: "C",                        seed: 15 },
  // Group D
  { id: "t13", name: "City Wolves",    club: "City Wolves Academy",   group: "D", coach: "Nejc Skubic",  seed: 4 },
  { id: "t14", name: "United XI",      club: "United XI FC",          group: "D", coach: "Matic Lah",    seed: 8 },
  { id: "t15", name: "Storm FC",       club: "Storm Football Club",   group: "D",                        seed: 12 },
  { id: "t16", name: "Desert Lions",   club: "Desert Lions SC",       group: "D",                        seed: 16 },
];

const GROUP_CONFIG: Record<string, { label: string; badge: string; header: string }> = {
  A: { label: "Group A", badge: "bg-brand-900/60 text-brand-300 border-brand-800", header: "bg-brand-900/20 border-brand-800/30" },
  B: { label: "Group B", badge: "bg-purple-900/60 text-purple-300 border-purple-800", header: "bg-purple-900/20 border-purple-800/30" },
  C: { label: "Group C", badge: "bg-amber-900/60 text-amber-300 border-amber-800", header: "bg-amber-900/20 border-amber-800/30" },
  D: { label: "Group D", badge: "bg-emerald-900/60 text-emerald-300 border-emerald-800", header: "bg-emerald-900/20 border-emerald-800/30" },
};

// ─── Team Form ────────────────────────────────────────────────────────────────

interface TeamFormData {
  name: string;
  club: string;
  group: string;
  coach: string;
}

function TeamForm({ data, onChange }: { data: TeamFormData; onChange: (d: TeamFormData) => void }) {
  const t = useTranslations("teams");
  return (
    <div className="space-y-3">
      <Input
        label={t("teamName")}
        value={data.name}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        placeholder="e.g. FC Lions"
        required
      />
      <Input
        label={t("club")}
        value={data.club}
        onChange={(e) => onChange({ ...data, club: e.target.value })}
        placeholder="Club or school (optional)"
      />
      <div className="w-full">
        <label className="block text-sm font-medium text-surface-200 mb-1.5">{t("group")}</label>
        <select
          value={data.group}
          onChange={(e) => onChange({ ...data, group: e.target.value })}
          className="w-full h-10 rounded-lg border bg-surface-900 text-white border-surface-700 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 px-3 text-sm outline-none"
        >
          {["A", "B", "C", "D"].map((g) => (
            <option key={g} value={g}>Group {g}</option>
          ))}
        </select>
      </div>
      <Input
        label={t("coach")}
        value={data.coach}
        onChange={(e) => onChange({ ...data, coach: e.target.value })}
        placeholder="Coach name (optional)"
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeamsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const t = useTranslations("teams");

  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [deleteTeam, setDeleteTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<TeamFormData>({ name: "", club: "", group: "A", coach: "" });

  const groups = ["all", "A", "B", "C", "D"];

  const filtered = teams.filter((team) => {
    const matchesSearch =
      !search.trim() ||
      team.name.toLowerCase().includes(search.toLowerCase()) ||
      team.club?.toLowerCase().includes(search.toLowerCase()) ||
      team.coach?.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = filterGroup === "all" || team.group === filterGroup;
    return matchesSearch && matchesGroup;
  });

  const groupedTeams = (filterGroup === "all" ? ["A", "B", "C", "D"] : [filterGroup]).map((g) => ({
    group: g,
    teams: filtered.filter((t) => t.group === g),
  })).filter((g) => g.teams.length > 0);

  const openAdd = () => {
    setFormData({ name: "", club: "", group: "A", coach: "" });
    setAddOpen(true);
  };

  const openEdit = (team: Team) => {
    setFormData({ name: team.name, club: team.club ?? "", group: team.group, coach: team.coach ?? "" });
    setEditTeam(team);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;
    if (editTeam) {
      setTeams((prev) =>
        prev.map((t) =>
          t.id === editTeam.id
            ? { ...t, name: formData.name, club: formData.club, group: formData.group, coach: formData.coach }
            : t
        )
      );
      setEditTeam(null);
    } else {
      const newTeam: Team = {
        id: `t${Date.now()}`,
        name: formData.name,
        club: formData.club || undefined,
        group: formData.group,
        coach: formData.coach || undefined,
      };
      setTeams((prev) => [...prev, newTeam]);
      setAddOpen(false);
    }
  };

  const handleDelete = () => {
    if (!deleteTeam) return;
    setTeams((prev) => prev.filter((t) => t.id !== deleteTeam.id));
    setDeleteTeam(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-950">
      <AppHeader locale={locale} userName="Alex Johnson" />
      <div className="flex flex-1">
        <Sidebar locale={locale} tournamentId={id} userName="Alex Johnson" userEmail="alex@example.com" />

        <main className="flex-1 p-4 lg:p-6 max-w-4xl mx-auto w-full">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-400" />
                {t("title")}
              </h1>
              <p className="text-sm text-surface-400 mt-0.5">
                {teams.length} teams · 4 groups · Spring Cup 2025
              </p>
            </div>
            <Button size="sm" onClick={openAdd}>
              <Plus className="h-3.5 w-3.5" />
              {t("addTeam")}
            </Button>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1">
              <Input
                placeholder="Search teams, clubs, coaches..."
                leftIcon={<Search className="h-4 w-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1.5 shrink-0">
              {groups.map((g) => (
                <button
                  key={g}
                  onClick={() => setFilterGroup(g)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    filterGroup === g
                      ? "bg-brand-600 text-white"
                      : "bg-surface-800 border border-surface-700 text-surface-300 hover:bg-surface-700"
                  )}
                >
                  {g === "all" ? "All" : `Grp ${g}`}
                </button>
              ))}
            </div>
          </div>

          {/* Team Stats */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {["A", "B", "C", "D"].map((g) => {
              const groupTeams = teams.filter((t) => t.group === g);
              const cfg = GROUP_CONFIG[g];
              return (
                <div
                  key={g}
                  className={cn("border rounded-xl p-3 text-center cursor-pointer transition-all", cfg.header)}
                  onClick={() => setFilterGroup(filterGroup === g ? "all" : g)}
                >
                  <p className="text-lg font-bold text-white">{groupTeams.length}</p>
                  <p className="text-xs text-surface-400 mt-0.5">Group {g}</p>
                </div>
              );
            })}
          </div>

          {/* Teams by group */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-surface-500">{t("noTeams")}</div>
          ) : (
            <div className="space-y-6">
              {groupedTeams.map(({ group, teams: groupTeams }) => {
                const cfg = GROUP_CONFIG[group];
                return (
                  <div key={group}>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                          cfg.badge
                        )}
                      >
                        {cfg.label}
                      </span>
                      <span className="text-xs text-surface-500">{groupTeams.length} teams</span>
                      <div className="flex-1 h-px bg-surface-800" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {groupTeams.map((team) => (
                        <Card key={team.id} className="group hover:border-surface-600 transition-all">
                          <CardContent className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={team.name} size="md" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-white truncate">{team.name}</p>
                                  {team.seed && team.seed <= 4 && (
                                    <Badge variant="brand" size="sm">Seeded</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-surface-400 truncate mt-0.5">
                                  {team.club || <span className="text-surface-600">No club</span>}
                                </p>
                                {team.coach && (
                                  <p className="text-xs text-surface-500 mt-0.5">
                                    Coach: {team.coach}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openEdit(team)}
                                  className="h-7 w-7 rounded-lg flex items-center justify-center text-surface-500 hover:text-brand-400 hover:bg-surface-700 transition-colors"
                                  aria-label="Edit team"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteTeam(team)}
                                  className="h-7 w-7 rounded-lg flex items-center justify-center text-surface-500 hover:text-danger-400 hover:bg-danger-900/20 transition-colors"
                                  aria-label="Delete team"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Add Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={t("addTeam")}
        description="Add a new team to Spring Cup 2025"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.name.trim()}>
              <Plus className="h-3.5 w-3.5" />
              Add Team
            </Button>
          </>
        }
      >
        <TeamForm data={formData} onChange={setFormData} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editTeam}
        onClose={() => setEditTeam(null)}
        title={t("editTeam")}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditTeam(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.name.trim()}>Save Changes</Button>
          </>
        }
      >
        <TeamForm data={formData} onChange={setFormData} />
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteTeam}
        onClose={() => setDeleteTeam(null)}
        title={t("deleteTeam")}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTeam(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 className="h-3.5 w-3.5" />
              Remove Team
            </Button>
          </>
        }
      >
        <p className="text-sm text-surface-300">
          Are you sure you want to remove{" "}
          <strong className="text-white">{deleteTeam?.name}</strong> from the
          tournament? This will also remove their match history.
        </p>
      </Modal>
    </div>
  );
}

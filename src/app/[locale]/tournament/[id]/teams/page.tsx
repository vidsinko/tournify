"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Plus, Pencil, Trash2, Users, Search } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
  club?: string;
  group: string;
  coach?: string;
}

const INITIAL_TEAMS: Team[] = [
  { id: "t1", name: "FC Lions", club: "FC Lions Academy", group: "A", coach: "Marko Novak" },
  { id: "t2", name: "Red Hawks", club: "Red Hawks FC", group: "A", coach: "Jure Horvat" },
  { id: "t3", name: "Blue Stars", club: "Stars Academy", group: "A", coach: "Andrej Kralj" },
  { id: "t4", name: "United FC", club: "United Youth", group: "A", coach: "Peter Vidmar" },
  { id: "t5", name: "Eagles", club: "Eagles SC", group: "B", coach: "Tomaz Zupan" },
  { id: "t6", name: "Tigers", club: "Tigers FC", group: "B", coach: "Rok Kovac" },
  { id: "t7", name: "City Boys", club: "City Youth FC", group: "B", coach: "Ales Kos" },
  { id: "t8", name: "Wolves", club: "Wolves Academy", group: "B" },
  { id: "t9", name: "Green Team", club: "Green Valley FC", group: "C" },
  { id: "t10", name: "Phoenix", club: "Phoenix United", group: "C" },
  { id: "t11", name: "River City", club: "River City SC", group: "C" },
  { id: "t12", name: "Storm FC", group: "C" },
  { id: "t13", name: "Thunder", club: "Thunder Boys", group: "D" },
  { id: "t14", name: "Dynamo", club: "Dynamo FC", group: "D" },
  { id: "t15", name: "United Stars", group: "D" },
  { id: "t16", name: "Galaxy FC", club: "Galaxy Youth", group: "D" },
];

const GROUP_COLORS: Record<string, string> = {
  A: "bg-brand-900/50 text-brand-300 border-brand-800",
  B: "bg-purple-900/50 text-purple-300 border-purple-800",
  C: "bg-amber-900/50 text-amber-300 border-amber-800",
  D: "bg-live-900/50 text-live-300 border-live-800",
};

export default function TeamsPage() {
  const t = useTranslations("teams");
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [search, setSearch] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [deleteTeam, setDeleteTeam] = useState<Team | null>(null);
  const [formName, setFormName] = useState("");
  const [formClub, setFormClub] = useState("");
  const [formGroup, setFormGroup] = useState("A");
  const [formCoach, setFormCoach] = useState("");

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.club?.toLowerCase().includes(search.toLowerCase())
  );

  const groups = [...new Set(teams.map((t) => t.group))].sort();
  const groupedTeams = groups.map((g) => ({
    group: g,
    teams: filtered.filter((t) => t.group === g),
  })).filter((g) => g.teams.length > 0);

  const openAdd = () => {
    setFormName(""); setFormClub(""); setFormGroup("A"); setFormCoach("");
    setAddModal(true);
  };

  const openEdit = (team: Team) => {
    setFormName(team.name); setFormClub(team.club ?? ""); setFormGroup(team.group); setFormCoach(team.coach ?? "");
    setEditTeam(team);
  };

  const handleSave = () => {
    if (!formName.trim()) { toast.error("Team name is required"); return; }
    if (editTeam) {
      setTeams((prev) => prev.map((t) => t.id === editTeam.id ? { ...t, name: formName, club: formClub, group: formGroup, coach: formCoach } : t));
      toast.success("Team updated");
      setEditTeam(null);
    } else {
      setTeams((prev) => [...prev, { id: `t${Date.now()}`, name: formName, club: formClub, group: formGroup, coach: formCoach }]);
      toast.success("Team added");
      setAddModal(false);
    }
  };

  const handleDelete = () => {
    if (!deleteTeam) return;
    setTeams((prev) => prev.filter((t) => t.id !== deleteTeam.id));
    toast.success("Team removed");
    setDeleteTeam(null);
  };

  const TeamForm = () => (
    <div className="space-y-3">
      <Input label={t("teamName")} value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Team name" />
      <Input label={t("club")} value={formClub} onChange={(e) => setFormClub(e.target.value)} placeholder="Club or school (optional)" />
      <div className="w-full">
        <label className="block text-sm font-medium text-surface-200 mb-1.5">{t("group")}</label>
        <select
          value={formGroup}
          onChange={(e) => setFormGroup(e.target.value)}
          className="w-full h-10 rounded-lg border bg-surface-900 text-white border-surface-700 focus:border-brand-500 px-3 text-sm outline-none"
        >
          {["A","B","C","D"].map((g) => <option key={g} value={g}>Group {g}</option>)}
        </select>
      </div>
      <Input label={t("coach")} value={formCoach} onChange={(e) => setFormCoach(e.target.value)} placeholder="Coach name (optional)" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader locale={locale} userName="Alex Johnson" />
      <div className="flex flex-1">
        <Sidebar locale={locale} tournamentId={id} userName="Alex Johnson" />
        <main className="flex-1 p-4 lg:p-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-white">{t("title")}</h1>
              <p className="text-sm text-surface-400">{teams.length} teams in {groups.length} groups</p>
            </div>
            <Button size="sm" onClick={openAdd}>
              <Plus className="h-4 w-4" />
              {t("addTeam")}
            </Button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search teams..."
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Teams by group */}
          <div className="space-y-5">
            {groupedTeams.map(({ group, teams: groupTeams }) => (
              <div key={group}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${GROUP_COLORS[group] ?? "bg-surface-700 text-surface-300 border-surface-600"}`}>
                    Group {group}
                  </span>
                  <span className="text-xs text-surface-500">{groupTeams.length} teams</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {groupTeams.map((team) => (
                    <Card key={team.id}>
                      <CardContent className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={team.name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{team.name}</p>
                            <p className="text-xs text-surface-400 truncate">{team.club || "—"}</p>
                            {team.coach && <p className="text-xs text-surface-500">Coach: {team.coach}</p>}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => openEdit(team)} className="p-1.5 text-surface-500 hover:text-brand-400 transition-colors">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setDeleteTeam(team)} className="p-1.5 text-surface-500 hover:text-danger-400 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Add Modal */}
      <Modal
        open={addModal}
        onClose={() => setAddModal(false)}
        title={t("addTeam")}
        footer={<><Button variant="ghost" onClick={() => setAddModal(false)}>Cancel</Button><Button onClick={handleSave}>Add Team</Button></>}
      >
        <TeamForm />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editTeam}
        onClose={() => setEditTeam(null)}
        title={t("editTeam")}
        footer={<><Button variant="ghost" onClick={() => setEditTeam(null)}>Cancel</Button><Button onClick={handleSave}>Save Changes</Button></>}
      >
        <TeamForm />
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteTeam}
        onClose={() => setDeleteTeam(null)}
        title={t("deleteTeam")}
        size="sm"
        footer={<><Button variant="ghost" onClick={() => setDeleteTeam(null)}>Cancel</Button><Button variant="danger" onClick={handleDelete}>Delete Team</Button></>}
      >
        <p className="text-sm text-surface-300">Are you sure you want to remove <strong className="text-white">{deleteTeam?.name}</strong> from the tournament? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}

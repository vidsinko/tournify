"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  UserCheck,
  Plus,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Search,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/avatar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Referee {
  id: string;
  name: string;
  email: string;
  phone: string;
  assigned_matches: number;
  next_match?: string;
  availability: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_REFEREES: Referee[] = [
  {
    id: "r1",
    name: "Luka Novak",
    email: "luka.novak@example.com",
    phone: "+386 41 123 456",
    assigned_matches: 6,
    next_match: "Grp A – FC Olimpija vs NK Celje · 13:00 · Pitch 1",
    availability: "08:00–17:00",
  },
  {
    id: "r2",
    name: "Maja Horvat",
    email: "maja.horvat@example.com",
    phone: "+386 40 234 567",
    assigned_matches: 6,
    next_match: "Grp B – Red Stars vs Coastal United · 13:00 · Pitch 2",
    availability: "08:00–17:00",
  },
  {
    id: "r3",
    name: "Rok Petek",
    email: "rok.petek@example.com",
    phone: "+386 51 345 678",
    assigned_matches: 6,
    next_match: "Grp C – Eagles vs Mountain Hawks · 13:25 · Pitch 1",
    availability: "09:00–16:00",
  },
  {
    id: "r4",
    name: "Ana Kos",
    email: "ana.kos@example.com",
    phone: "+386 70 456 789",
    assigned_matches: 6,
    next_match: "Grp D – Storm FC vs Desert Lions · 13:25 · Pitch 2",
    availability: "09:00–16:00",
  },
];

// ─── Ref Form ─────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  email: string;
  phone: string;
  availability: string;
}

const emptyForm: FormState = { name: "", email: "", phone: "", availability: "08:00–17:00" };

function RefereeForm({ form, onChange }: { form: FormState; onChange: (f: FormState) => void }) {
  const t = useTranslations("referees");
  return (
    <div className="space-y-3">
      <Input
        label={t("refereeName")}
        value={form.name}
        onChange={(e) => onChange({ ...form, name: e.target.value })}
        placeholder="Full name"
      />
      <Input
        label={t("email")}
        type="email"
        value={form.email}
        onChange={(e) => onChange({ ...form, email: e.target.value })}
        placeholder="referee@example.com"
        leftIcon={<Mail className="h-3.5 w-3.5" />}
      />
      <Input
        label={t("phone")}
        type="tel"
        value={form.phone}
        onChange={(e) => onChange({ ...form, phone: e.target.value })}
        placeholder="+386 41 000 000"
        leftIcon={<Phone className="h-3.5 w-3.5" />}
      />
      <Input
        label={t("availability")}
        value={form.availability}
        onChange={(e) => onChange({ ...form, availability: e.target.value })}
        placeholder="08:00–17:00"
        leftIcon={<Calendar className="h-3.5 w-3.5" />}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RefereesPage() {
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const t = useTranslations("referees");

  const [referees, setReferees] = useState<Referee[]>(INITIAL_REFEREES);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editRef, setEditRef] = useState<Referee | null>(null);
  const [deleteRef, setDeleteRef] = useState<Referee | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = referees.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm(emptyForm);
    setAddOpen(true);
  };

  const openEdit = (ref: Referee) => {
    setForm({
      name: ref.name,
      email: ref.email,
      phone: ref.phone,
      availability: ref.availability,
    });
    setEditRef(ref);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editRef) {
      setReferees((prev) =>
        prev.map((r) =>
          r.id === editRef.id
            ? { ...r, name: form.name, email: form.email, phone: form.phone, availability: form.availability }
            : r
        )
      );
      setEditRef(null);
    } else {
      setReferees((prev) => [
        ...prev,
        {
          id: `r${Date.now()}`,
          name: form.name,
          email: form.email,
          phone: form.phone,
          assigned_matches: 0,
          availability: form.availability,
        },
      ]);
      setAddOpen(false);
    }
  };

  const handleDelete = () => {
    if (!deleteRef) return;
    setReferees((prev) => prev.filter((r) => r.id !== deleteRef.id));
    setDeleteRef(null);
  };

  const totalAssigned = referees.reduce((sum, r) => sum + r.assigned_matches, 0);

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
                <UserCheck className="h-5 w-5 text-brand-400" />
                {t("title")}
              </h1>
              <p className="text-sm text-surface-400 mt-0.5">
                {referees.length} referees · {totalAssigned} matches assigned
              </p>
            </div>
            <Button size="sm" onClick={openAdd}>
              <Plus className="h-3.5 w-3.5" />
              {t("addReferee")}
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {referees.map((ref) => (
              <div
                key={ref.id}
                className="bg-surface-800 border border-surface-700 rounded-xl p-3 text-center"
              >
                <p className="text-2xl font-bold text-white">{ref.assigned_matches}</p>
                <p className="text-xs text-surface-400 mt-0.5 truncate">{ref.name.split(" ")[0]}</p>
                <p className="text-xs text-surface-600">matches</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search referees..."
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Referee cards */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-surface-500">{t("noReferees")}</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {filtered.map((ref) => (
                <Card key={ref.id} className="group">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <Avatar name={ref.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-white truncate">{ref.name}</p>
                          <Badge variant="outline" size="sm">
                            {ref.assigned_matches} matches
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          {ref.email && (
                            <a
                              href={`mailto:${ref.email}`}
                              className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-brand-400 transition-colors"
                            >
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate">{ref.email}</span>
                            </a>
                          )}
                          {ref.phone && (
                            <a
                              href={`tel:${ref.phone}`}
                              className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-brand-400 transition-colors"
                            >
                              <Phone className="h-3 w-3 shrink-0" />
                              <span>{ref.phone}</span>
                            </a>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-surface-500">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span>Available: {ref.availability}</span>
                          </div>
                        </div>

                        {ref.next_match && (
                          <div className="mt-2 pt-2 border-t border-surface-700">
                            <p className="text-xs text-surface-500">
                              <span className="text-brand-400 font-medium">Next: </span>
                              {ref.next_match}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-1.5 mt-3 pt-2 border-t border-surface-700">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => openEdit(ref)}
                          >
                            <Pencil className="h-3 w-3" />
                            {t("editReferee")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1 text-danger-400 hover:text-danger-300 hover:bg-danger-900/20"
                            onClick={() => setDeleteRef(ref)}
                          >
                            <Trash2 className="h-3 w-3" />
                            {t("deleteReferee")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={t("addReferee")}
        description="Add a referee to Spring Cup 2025"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>
              <Plus className="h-3.5 w-3.5" />
              Add Referee
            </Button>
          </>
        }
      >
        <RefereeForm form={form} onChange={setForm} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editRef}
        onClose={() => setEditRef(null)}
        title={t("editReferee")}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditRef(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>Save Changes</Button>
          </>
        }
      >
        <RefereeForm form={form} onChange={setForm} />
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteRef}
        onClose={() => setDeleteRef(null)}
        title={t("deleteReferee")}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteRef(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 className="h-3.5 w-3.5" />
              Remove Referee
            </Button>
          </>
        }
      >
        <p className="text-sm text-surface-300">
          Are you sure you want to remove{" "}
          <strong className="text-white">{deleteRef?.name}</strong> from the
          tournament? Their {deleteRef?.assigned_matches} assigned matches will
          become unassigned.
        </p>
      </Modal>
    </div>
  );
}

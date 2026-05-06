"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { Save, Trash2, QrCode, Download, AlertTriangle, Copy, Check } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";

export default function SettingsPage() {
  const t = useTranslations("tournament");
  const tc = useTranslations("common");
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [qrCopied, setQrCopied] = useState(false);

  const [form, setForm] = useState({
    name: "Spring Cup 2025",
    location: "Sports Centre Ljubljana",
    date_start: "2025-05-10",
    description: "Annual spring youth football tournament",
    match_duration: 20,
    break_duration: 10,
    points_win: 3,
    points_draw: 1,
    points_loss: 0,
    language: "en",
    allow_spectators: true,
    qr_access: true,
  });

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : "https://tournify.app"}/en/t/${id}`;

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success(tc("allChangesSaved"));
    setSaving(false);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setQrCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setQrCopied(false), 2000);
  };

  const handleDelete = () => {
    if (deleteConfirm !== form.name) {
      toast.error("Tournament name doesn't match");
      return;
    }
    toast.success("Tournament deleted");
    router.push(`/${locale}/dashboard`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader locale={locale} userName="Alex Johnson" />
      <div className="flex flex-1">
        <Sidebar locale={locale} tournamentId={id} userName="Alex Johnson" />
        <main className="flex-1 p-4 lg:p-6 max-w-2xl mx-auto w-full space-y-5">
          <h1 className="text-xl font-bold text-white">{tc("settings")}</h1>

          {/* General info */}
          <Card>
            <CardContent className="pt-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">General Information</h2>
              <Input
                label="Tournament name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                label="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <Input
                label="Date"
                type="date"
                value={form.date_start}
                onChange={(e) => setForm({ ...form, date_start: e.target.value })}
              />
              <Textarea
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
              <Select
                label="Primary language"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
              >
                <option value="en">English</option>
                <option value="sl">Slovenščina</option>
                <option value="hr">Hrvatski</option>
                <option value="de">Deutsch</option>
              </Select>
            </CardContent>
          </Card>

          {/* Match settings */}
          <Card>
            <CardContent className="pt-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">Match Settings</h2>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Match duration (min)"
                  type="number"
                  value={form.match_duration}
                  onChange={(e) => setForm({ ...form, match_duration: parseInt(e.target.value) })}
                />
                <Input
                  label="Break duration (min)"
                  type="number"
                  value={form.break_duration}
                  onChange={(e) => setForm({ ...form, break_duration: parseInt(e.target.value) })}
                />
                <Input
                  label="Points — Win"
                  type="number"
                  value={form.points_win}
                  onChange={(e) => setForm({ ...form, points_win: parseInt(e.target.value) })}
                />
                <Input
                  label="Points — Draw"
                  type="number"
                  value={form.points_draw}
                  onChange={(e) => setForm({ ...form, points_draw: parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>

          {/* QR & Access */}
          <Card>
            <CardContent className="pt-5 space-y-4">
              <h2 className="text-sm font-semibold text-white">QR Code & Public Access</h2>
              <div className="flex items-center justify-center bg-white rounded-xl p-6">
                <div className="text-center">
                  <div className="h-32 w-32 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <QrCode className="h-20 w-20 text-white" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">QR code for spectators</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-xs text-surface-400 truncate">
                  {publicUrl}
                </div>
                <Button variant="secondary" size="sm" onClick={handleCopyLink}>
                  {qrCopied ? <Check className="h-4 w-4 text-live-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="h-3.5 w-3.5" />
                Download QR Code
              </Button>
            </CardContent>
          </Card>

          {/* Save */}
          <Button className="w-full" size="lg" onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" />
            {tc("save")} Settings
          </Button>

          {/* Danger Zone */}
          <Card className="border-danger-900/50">
            <CardContent className="pt-5">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="h-4 w-4 text-danger-400 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold text-danger-400">Danger Zone</h2>
                  <p className="text-xs text-surface-400 mt-0.5">
                    Permanently delete this tournament and all its data. This action cannot be undone.
                  </p>
                </div>
              </div>
              <Button variant="danger" size="sm" onClick={() => setDeleteModal(true)}>
                <Trash2 className="h-4 w-4" />
                Delete Tournament
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>

      <Modal
        open={deleteModal}
        onClose={() => { setDeleteModal(false); setDeleteConfirm(""); }}
        title="Delete Tournament"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setDeleteModal(false); setDeleteConfirm(""); }}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleteConfirm !== form.name}>
              Delete permanently
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-surface-300">
            This will permanently delete <strong className="text-white">{form.name}</strong> and all associated data (teams, matches, standings).
          </p>
          <Input
            label={`Type "${form.name}" to confirm`}
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder={form.name}
          />
        </div>
      </Modal>
    </div>
  );
}

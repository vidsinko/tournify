"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Trophy,
  Zap,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { generateSchedule } from "@/lib/scheduling/engine";
import { generateSlug, formatTime, getGroupName } from "@/lib/utils";
import type { ScheduleSlot, ScheduleQuality } from "@/types";
import { parseISO } from "date-fns";

const schema = z.object({
  name: z.string().min(3, "Tournament name must be at least 3 characters"),
  sport: z.enum(["football", "basketball", "volleyball", "handball", "futsal", "other"]),
  location: z.string().min(2),
  date_start: z.string().min(1),
  description: z.string().optional(),
  format: z.enum(["group_stage", "group_knockout", "knockout", "round_robin", "swiss"]),
  num_groups: z.number().min(1).max(8),
  teams_per_group: z.number().min(3).max(12),
  advance_per_group: z.number().min(1).max(4),
  match_duration_minutes: z.number().min(5).max(90),
  break_duration_minutes: z.number().min(5).max(60),
  num_pitches: z.number().min(1).max(10),
  points_win: z.number().min(1).max(5),
  points_draw: z.number().min(0).max(3),
  points_loss: z.number().min(0).max(1),
  teams: z.array(z.object({ name: z.string().min(1), club: z.string().optional() })).min(4),
  schedule_start_time: z.string().min(1),
  schedule_end_time: z.string().min(1),
  lunch_break_start: z.string().optional(),
  lunch_break_end: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const STEPS = ["basics", "format", "teams", "schedule", "confirm"] as const;
type Step = (typeof STEPS)[number];

export default function CreateTournamentPage() {
  const t = useTranslations("create");
  const tc = useTranslations("common");
  const ts = useTranslations("tournament.sport");
  const tf = useTranslations("tournament.format");
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<Step>("basics");
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [quality, setQuality] = useState<ScheduleQuality | null>(null);
  const [scheduleGenerated, setScheduleGenerated] = useState(false);

  const stepIndex = STEPS.indexOf(currentStep);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sport: "football",
      format: "group_knockout",
      num_groups: 2,
      teams_per_group: 4,
      advance_per_group: 2,
      match_duration_minutes: 20,
      break_duration_minutes: 10,
      num_pitches: 2,
      points_win: 3,
      points_draw: 1,
      points_loss: 0,
      teams: [
        { name: "", club: "" },
        { name: "", club: "" },
        { name: "", club: "" },
        { name: "", club: "" },
      ],
      schedule_start_time: "09:00",
      schedule_end_time: "18:00",
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "teams" });
  const values = form.watch();

  const goNext = async () => {
    const stepFields: Record<Step, Array<keyof FormData>> = {
      basics: ["name", "sport", "location", "date_start"],
      format: ["format", "num_groups", "teams_per_group", "advance_per_group", "match_duration_minutes", "break_duration_minutes", "num_pitches"],
      teams: ["teams"],
      schedule: ["schedule_start_time", "schedule_end_time"],
      confirm: [],
    };

    const valid = await form.trigger(stepFields[currentStep]);
    if (!valid) return;
    const nextIdx = stepIndex + 1;
    if (nextIdx < STEPS.length) setCurrentStep(STEPS[nextIdx]);
  };

  const goBack = () => {
    const prevIdx = stepIndex - 1;
    if (prevIdx >= 0) setCurrentStep(STEPS[prevIdx]);
  };

  const handleGenerateSchedule = () => {
    const v = form.getValues();
    const teamCount = v.num_groups * v.teams_per_group;
    const date = v.date_start || new Date().toISOString().split("T")[0];

    const mockTeams = Array.from({ length: Math.min(v.teams.filter(t => t.name).length, teamCount) }, (_, i) => ({
      id: `team-${i}`,
      tournament_id: "new",
      name: v.teams[i]?.name || `Team ${i + 1}`,
      club: v.teams[i]?.club,
      group_id: `group-${Math.floor(i / v.teams_per_group)}`,
      created_at: new Date().toISOString(),
    }));

    const mockGroups = Array.from({ length: v.num_groups }, (_, i) => ({
      id: `group-${i}`,
      tournament_id: "new",
      name: `Group ${getGroupName(i)}`,
      order: i,
    }));

    const mockPitches = Array.from({ length: v.num_pitches }, (_, i) => ({
      id: `pitch-${i}`,
      tournament_id: "new",
      name: `Pitch ${i + 1}`,
      order: i,
    }));

    const startDT = new Date(`${date}T${v.schedule_start_time}:00`);
    const endDT = new Date(`${date}T${v.schedule_end_time}:00`);

    const lunchStart = v.lunch_break_start
      ? new Date(`${date}T${v.lunch_break_start}:00`)
      : undefined;
    const lunchEnd = v.lunch_break_end
      ? new Date(`${date}T${v.lunch_break_end}:00`)
      : undefined;

    const result = generateSchedule({
      teams: mockTeams,
      groups: mockGroups,
      pitches: mockPitches,
      matchDurationMinutes: v.match_duration_minutes,
      breakDurationMinutes: v.break_duration_minutes,
      startTime: startDT,
      endTime: endDT,
      lunchBreakStart: lunchStart,
      lunchBreakEnd: lunchEnd,
      format: v.format,
    });

    setSchedule(result.slots);
    setQuality(result.quality);
    setScheduleGenerated(true);
    toast.success(`${result.slots.length} ${t("schedule.matchesGenerated")}`);
  };

  const onSubmit = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const slug = generateSlug(values.name);
      toast.success("Tournament created successfully!");
      router.push(`/${locale}/tournament/${slug}`);
    } catch {
      toast.error("Failed to create tournament. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader locale={locale} userName="Alex Johnson" />
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* Step progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => i < stepIndex && setCurrentStep(step)}
                disabled={i > stepIndex}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  i <= stepIndex ? "bg-brand-500" : "bg-surface-700"
                } ${i < stepIndex ? "cursor-pointer" : "cursor-default"}`}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-surface-500 uppercase tracking-wide">
              {t("steps." + currentStep as never)}
            </p>
            <h1 className="text-xl font-bold text-white mt-0.5">{t("title")}</h1>
          </div>
          <span className="text-sm text-surface-500">
            {stepIndex + 1} / {STEPS.length}
          </span>
        </div>

        {/* Step: Basics */}
        {currentStep === "basics" && (
          <Card>
            <CardContent className="pt-5 space-y-4">
              <h2 className="text-base font-semibold text-white">{t("basics.title")}</h2>
              <Input label={t("basics.nameLabel")} placeholder={t("basics.namePlaceholder")} error={form.formState.errors.name?.message} {...form.register("name")} />
              <Select label={t("basics.sportLabel")} {...form.register("sport")}>
                {["football", "basketball", "volleyball", "handball", "futsal", "other"].map((s) => (
                  <option key={s} value={s}>{ts(s as never)}</option>
                ))}
              </Select>
              <Input label={t("basics.locationLabel")} placeholder={t("basics.locationPlaceholder")} error={form.formState.errors.location?.message} {...form.register("location")} />
              <Input label={t("basics.dateStartLabel")} type="date" error={form.formState.errors.date_start?.message} {...form.register("date_start")} />
              <Textarea label={t("basics.descriptionLabel")} placeholder={t("basics.descriptionPlaceholder")} rows={3} {...form.register("description")} />
            </CardContent>
          </Card>
        )}

        {/* Step: Format */}
        {currentStep === "format" && (
          <Card>
            <CardContent className="pt-5 space-y-4">
              <h2 className="text-base font-semibold text-white">{t("format.title")}</h2>
              <Select label={t("format.formatLabel")} {...form.register("format")}>
                {["group_stage", "group_knockout", "knockout", "round_robin", "swiss"].map((f) => (
                  <option key={f} value={f}>{tf(f as never)}</option>
                ))}
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Input label={t("format.groupsLabel")} type="number" min={1} max={8} {...form.register("num_groups", { valueAsNumber: true })} />
                <Input label={t("format.teamsPerGroupLabel")} type="number" min={3} max={12} {...form.register("teams_per_group", { valueAsNumber: true })} />
                <Input label={t("format.advancePerGroupLabel")} type="number" min={1} max={4} {...form.register("advance_per_group", { valueAsNumber: true })} />
                <Input label={t("format.pitchesLabel")} type="number" min={1} max={10} {...form.register("num_pitches", { valueAsNumber: true })} />
                <Input label={t("format.matchDurationLabel")} type="number" min={5} max={90} {...form.register("match_duration_minutes", { valueAsNumber: true })} />
                <Input label={t("format.breakDurationLabel")} type="number" min={5} max={60} {...form.register("break_duration_minutes", { valueAsNumber: true })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input label={t("format.pointsWinLabel")} type="number" min={1} max={5} {...form.register("points_win", { valueAsNumber: true })} />
                <Input label={t("format.pointsDrawLabel")} type="number" min={0} max={3} {...form.register("points_draw", { valueAsNumber: true })} />
                <Input label={t("format.pointsLossLabel")} type="number" min={0} max={1} {...form.register("points_loss", { valueAsNumber: true })} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step: Teams */}
        {currentStep === "teams" && (
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">{t("teams.title")}</h2>
                <span className="text-sm text-surface-400">{fields.length} {t("teams.teamsAdded")}</span>
              </div>
              <div className="space-y-2 mb-4">
                {fields.map((field, i) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <span className="h-10 w-7 flex items-center justify-center text-xs text-surface-500 shrink-0">{i + 1}</span>
                    <Input placeholder={t("teams.teamNamePlaceholder")} {...form.register(`teams.${i}.name`)} />
                    <Input placeholder={t("teams.clubPlaceholder")} className="hidden sm:block" {...form.register(`teams.${i}.club`)} />
                    <button
                      onClick={() => fields.length > 4 && remove(i)}
                      disabled={fields.length <= 4}
                      className="h-10 w-10 flex items-center justify-center text-surface-500 hover:text-danger-400 disabled:opacity-30 transition-colors shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {form.formState.errors.teams && (
                <p className="text-xs text-danger-400 mb-3">{t("teams.minTeams")}</p>
              )}
              <Button variant="secondary" size="sm" onClick={() => append({ name: "", club: "" })}>
                <Plus className="h-4 w-4" />
                {t("teams.addTeam")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step: Schedule */}
        {currentStep === "schedule" && (
          <Card>
            <CardContent className="pt-5 space-y-4">
              <h2 className="text-base font-semibold text-white">{t("schedule.title")}</h2>
              <p className="text-sm text-surface-400">{t("schedule.subtitle")}</p>
              <div className="grid grid-cols-2 gap-3">
                <Input label={t("schedule.startTimeLabel")} type="time" {...form.register("schedule_start_time")} />
                <Input label={t("schedule.endTimeLabel")} type="time" {...form.register("schedule_end_time")} />
                <Input label={t("schedule.lunchStartLabel")} type="time" placeholder="12:00" {...form.register("lunch_break_start")} />
                <Input label={t("schedule.lunchEndLabel")} type="time" placeholder="13:00" {...form.register("lunch_break_end")} />
              </div>

              <Button
                onClick={handleGenerateSchedule}
                className="w-full"
                variant={scheduleGenerated ? "secondary" : "primary"}
              >
                <Zap className="h-4 w-4" />
                {scheduleGenerated ? t("schedule.regenerate") : t("schedule.generateButton")}
              </Button>

              {quality && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-surface-400">{t("schedule.qualityScore")}</span>
                    <span className={`text-sm font-bold ${quality.score >= 80 ? "text-live-400" : quality.score >= 60 ? "text-warning-400" : "text-danger-400"}`}>
                      {quality.score}/100
                    </span>
                  </div>
                  {quality.conflicts.length === 0 ? (
                    <div className="flex items-center gap-2 text-live-400 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      {t("schedule.noConflicts")}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {quality.conflicts.slice(0, 3).map((c, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-warning-400">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          {c.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {schedule.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-surface-400 mb-2">{schedule.length} {t("schedule.matchesGenerated")}</p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {schedule.slice(0, 8).map((slot) => (
                      <div key={slot.matchNumber} className="flex items-center gap-3 bg-surface-900 rounded-lg px-3 py-2 text-xs">
                        <span className="text-surface-500 w-12">{formatTime(slot.startTime)}</span>
                        <span className="text-surface-400 w-12">{slot.pitch.name}</span>
                        <span className="text-white flex-1">{slot.homeTeam.name} vs {slot.awayTeam.name}</span>
                      </div>
                    ))}
                    {schedule.length > 8 && (
                      <p className="text-xs text-surface-500 text-center">+{schedule.length - 8} more matches</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step: Confirm */}
        {currentStep === "confirm" && (
          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 bg-brand-900/30 rounded-xl flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-brand-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{values.name}</h2>
                  <p className="text-sm text-surface-400">{values.location} · {values.date_start}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-surface-900 rounded-lg px-3 py-2.5">
                  <p className="text-surface-500 text-xs">Format</p>
                  <p className="text-white font-medium mt-0.5">{tf(values.format as never)}</p>
                </div>
                <div className="bg-surface-900 rounded-lg px-3 py-2.5">
                  <p className="text-surface-500 text-xs">Teams</p>
                  <p className="text-white font-medium mt-0.5">{values.teams.filter(t => t.name).length}</p>
                </div>
                <div className="bg-surface-900 rounded-lg px-3 py-2.5">
                  <p className="text-surface-500 text-xs">Pitches</p>
                  <p className="text-white font-medium mt-0.5">{values.num_pitches}</p>
                </div>
                <div className="bg-surface-900 rounded-lg px-3 py-2.5">
                  <p className="text-surface-500 text-xs">Match duration</p>
                  <p className="text-white font-medium mt-0.5">{values.match_duration_minutes} min</p>
                </div>
                {schedule.length > 0 && (
                  <div className="bg-surface-900 rounded-lg px-3 py-2.5">
                    <p className="text-surface-500 text-xs">Scheduled matches</p>
                    <p className="text-white font-medium mt-0.5">{schedule.length}</p>
                  </div>
                )}
                {quality && (
                  <div className="bg-surface-900 rounded-lg px-3 py-2.5">
                    <p className="text-surface-500 text-xs">Schedule quality</p>
                    <p className={`font-bold mt-0.5 ${quality.score >= 80 ? "text-live-400" : "text-warning-400"}`}>{quality.score}/100</p>
                  </div>
                )}
              </div>
              <Button className="w-full" size="lg" onClick={onSubmit} loading={loading}>
                <Trophy className="h-4 w-4" />
                {t("confirm.createButton")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <Button variant="ghost" onClick={goBack} disabled={stepIndex === 0}>
            <ChevronLeft className="h-4 w-4" />
            {tc("back")}
          </Button>
          {currentStep !== "confirm" && (
            <Button onClick={goNext}>
              {tc("next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

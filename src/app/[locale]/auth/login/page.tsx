"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trophy, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) {
        toast.error(t("title"), { description: error.message });
      } else {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 mb-10 justify-center">
            <div className="h-9 w-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Tournify</span>
          </Link>

          <h1 className="text-2xl font-bold text-white mb-1">{t("title")}</h1>
          <p className="text-surface-400 text-sm mb-8">{t("subtitle")}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={t("emailLabel")}
              placeholder={t("emailPlaceholder")}
              type="email"
              autoComplete="email"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label={t("passwordLabel")}
              placeholder={t("passwordPlaceholder")}
              type="password"
              autoComplete="current-password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register("password")}
            />

            <div className="flex justify-end">
              <Link
                href={`/${locale}/auth/forgot-password`}
                className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {t("submit")}
            </Button>
          </form>

          <p className="text-center text-sm text-surface-400 mt-6">
            {t("noAccount")}{" "}
            <Link
              href={`/${locale}/auth/register`}
              className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              {t("signUp")}
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-900/30 to-surface-900 border-l border-surface-800 items-center justify-center p-12">
        <div className="max-w-sm text-center">
          <div className="text-6xl mb-6">🏆</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Run tournaments like a pro
          </h2>
          <p className="text-surface-400 leading-relaxed">
            Smart scheduling, live scores, and real-time standings — all in one place.
          </p>
          <div className="mt-8 space-y-3">
            {[
              "Create a tournament in under 5 minutes",
              "Auto-generate conflict-free schedules",
              "Live scores for spectators via QR code",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-surface-300">
                <span className="h-4 w-4 bg-live-900/50 rounded-full flex items-center justify-center shrink-0">
                  <span className="h-1.5 w-1.5 bg-live-500 rounded-full" />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

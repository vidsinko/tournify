"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trophy, Mail, Lock, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const t = useTranslations("auth.register");
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
      const { error, data: authData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { name: data.name },
        },
      });

      if (error) {
        toast.error("Registration failed", { description: error.message });
      } else if (authData.user) {
        // Create user profile
        await supabase.from("users").insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          preferred_locale: locale,
        });
        toast.success("Account created! Welcome to Tournify.");
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
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
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
              label={t("nameLabel")}
              placeholder={t("namePlaceholder")}
              type="text"
              autoComplete="name"
              leftIcon={<User className="h-4 w-4" />}
              error={errors.name?.message}
              {...register("name")}
            />
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
              autoComplete="new-password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register("password")}
            />

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {t("submit")}
            </Button>
          </form>

          <p className="text-center text-xs text-surface-500 mt-4">
            {t("termsAgree")}{" "}
            <Link href="#" className="text-brand-400 hover:underline">{t("terms")}</Link>
            {" "}{t("and")}{" "}
            <Link href="#" className="text-brand-400 hover:underline">{t("privacy")}</Link>
          </p>

          <p className="text-center text-sm text-surface-400 mt-6">
            {t("hasAccount")}{" "}
            <Link
              href={`/${locale}/auth/login`}
              className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              {t("signIn")}
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-900/30 to-surface-900 border-l border-surface-800 items-center justify-center p-12">
        <div className="max-w-sm text-center">
          <div className="text-6xl mb-6">⚽</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Your next tournament starts here
          </h2>
          <p className="text-surface-400 leading-relaxed">
            Join hundreds of organizers who run stress-free tournaments with Tournify.
          </p>
        </div>
      </div>
    </div>
  );
}

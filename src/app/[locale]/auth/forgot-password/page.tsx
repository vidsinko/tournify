"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trophy, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";

const schema = z.object({ email: z.string().email() });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const { locale } = useParams<{ locale: string }>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/${locale}/auth/reset-password`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        setSent(true);
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href={`/${locale}`} className="flex items-center gap-2 mb-10 justify-center">
          <div className="h-9 w-9 bg-brand-600 rounded-xl flex items-center justify-center">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Tournify</span>
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="h-14 w-14 bg-live-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-7 w-7 text-live-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">{t("successTitle")}</h1>
            <p className="text-surface-400 text-sm mb-8">{t("successMessage")}</p>
            <Link
              href={`/${locale}/auth/login`}
              className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("backToLogin")}
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-1">{t("title")}</h1>
            <p className="text-surface-400 text-sm mb-8">{t("subtitle")}</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label={t("emailLabel")}
                type="email"
                autoComplete="email"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register("email")}
              />
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                {t("submit")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href={`/${locale}/auth/login`}
                className="inline-flex items-center gap-1.5 text-sm text-surface-400 hover:text-surface-200"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("backToLogin")}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

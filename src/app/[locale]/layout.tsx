import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Toaster } from "sonner";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "sl" | "hr" | "de")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full">
      <body className="min-h-full bg-surface-950 text-white antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1e293b",
                border: "1px solid #334155",
                color: "#f8fafc",
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

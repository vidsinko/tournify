import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Toaster } from "sonner";
import { MobileBottomNav } from "@/components/layout/mobile-nav";

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
      <body className="min-h-full bg-[#0a0a15] text-white antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {/* Content with bottom padding on mobile for nav bar */}
          <div className="pb-[60px] lg:pb-0">
            {children}
          </div>
          <MobileBottomNav />
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1e1e2e",
                border: "1px solid rgba(51,65,85,0.6)",
                color: "#f8fafc",
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

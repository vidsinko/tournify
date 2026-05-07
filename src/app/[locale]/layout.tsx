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
      <body className="min-h-full bg-[#f7f8fa] text-gray-900 antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <div className="pb-[60px] lg:pb-0">
            {children}
          </div>
          <MobileBottomNav />
          <Toaster
            theme="light"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                color: "#111827",
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

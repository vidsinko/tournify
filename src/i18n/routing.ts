import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "sl", "hr", "de"],
  defaultLocale: "en",
  localePrefix: "always",
});

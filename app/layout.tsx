import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/i18n";
import { AppChrome } from "@/components/app-chrome";
import { ServiceWorker } from "@/components/service-worker";

// Tajawal — the Arabic + Latin pairing from the design system.
const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "نجدة Najda — استجابة المجتمع في الدقائق الأولى",
  description:
    "تطبيق عربي أولاً يشارك موقعًا دقيقًا بدون عنوان ويُنبّه أقرب مستجيب في المجتمع خلال ثوانٍ — للقرى النائية حيث تبعد المساعدة الرسمية. يُكمل خدمات الطوارئ ولا يحل محلها.",
  manifest: "/manifest.webmanifest",
  applicationName: "Najda",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Najda" },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon-192.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#F7F3EC",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable} suppressHydrationWarning>
      <body>
        <I18nProvider>
          <AppChrome>{children}</AppChrome>
          <ServiceWorker />
        </I18nProvider>
      </body>
    </html>
  );
}

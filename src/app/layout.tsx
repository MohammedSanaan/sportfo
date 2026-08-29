import type { Metadata } from "next";
import {
  Inter,
  Noto_Sans_Devanagari,
  Noto_Sans_Kannada,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
  Noto_Sans_Malayalam,
} from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WelcomeToast } from "@/components/layout/WelcomeToast";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { getServerLocale } from "@/i18n/server";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Inter has no Indic-script glyphs at all -- these five cover Hindi,
// Kannada, Tamil, Telugu, and Malayalam. Loaded globally (rather than only
// on pages using them) since the header/footer render on every route and
// need to switch script the moment the locale changes. English keeps
// --font-sans/Inter untouched; see the :lang() rules in globals.css that
// route each script to its own family.
const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const notoKannada = Noto_Sans_Kannada({
  variable: "--font-noto-kannada",
  subsets: ["kannada"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const notoTamil = Noto_Sans_Tamil({
  variable: "--font-noto-tamil",
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const notoTelugu = Noto_Sans_Telugu({
  variable: "--font-noto-telugu",
  subsets: ["telugu"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const notoMalayalam = Noto_Sans_Malayalam({
  variable: "--font-noto-malayalam",
  subsets: ["malayalam"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SportFo",
  description:
    "SportFo is a sports-tech platform for athletes to build professional profiles and connect with coaches, academies, and sponsors.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Single source of truth for locale on the server -- read once here (not
  // separately in Header/Footer) and threaded down as a prop/initialLocale,
  // so every Server Component in the tree agrees with the client
  // LocaleProvider on first paint (no hydration mismatch).
  const locale = await getServerLocale();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${notoDevanagari.variable} ${notoKannada.variable} ${notoTamil.variable} ${notoTelugu.variable} ${notoMalayalam.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface-muted text-ink-900">
        <LocaleProvider initialLocale={locale}>
          <SiteChrome
            welcomeToast={<WelcomeToast />}
            header={<Header locale={locale} />}
            footer={<Footer locale={locale} />}
          >
            {children}
          </SiteChrome>
        </LocaleProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import { JsonLd } from "@/components/seo/JsonLd";
import { ThemeStyles } from "@/components/theme/ThemeStyles";
import { buildGlobalOrganizationGraph } from "@/lib/seo-site";
import { getSiteUrl } from "@/lib/site-url";
import { branding, formatPageTitle, getAppName, getThemeColor } from "@/lib/branding";
import { StandaloneViewportSync } from "@/components/layout/StandaloneViewportSync";
import { NavLayoutDebug } from "@/components/layout/NavLayoutDebug";
import { PwaUpdateManager } from "@/components/pwa/PwaUpdateManager";
import { PwaOfflineRecovery } from "@/components/pwa/PwaOfflineRecovery";
import { PwaNavDiagnostics } from "@/components/pwa/PwaNavDiagnostics";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: branding.seo.homeTitle,
    template: branding.seo.titleTemplate,
  },
  description: branding.seo.homeDescription,
  applicationName: getAppName(),
  authors: [{ name: branding.companyName }],
  keywords: [...branding.seo.keywords],

  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: getAppName(),
    statusBarStyle: "black-translucent",
  },

  icons: {
    icon: [
      { url: branding.icons.favicon, sizes: "32x32", type: "image/png" },
      { url: branding.icons.icon192, sizes: "192x192", type: "image/png" },
      { url: branding.icons.icon512, sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: branding.icons.appleTouchIcon, sizes: "180x180", type: "image/png" },
    ],
  },

  openGraph: {
    type: "website",
    locale: branding.locale.replace("-", "_"),
    siteName: getAppName(),
    title: branding.seo.homeTitle,
    description: branding.seo.homeDescription,
    images: [{ url: branding.icons.icon512, width: 512, height: 512, alt: getAppName() }],
  },

  twitter: {
    card: "summary_large_image",
    title: formatPageTitle(branding.tagline),
    description: branding.appDescription,
    images: [branding.icons.icon512],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: getThemeColor(),
  viewportFit: "cover",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={branding.language}
      suppressHydrationWarning
      className={`${montserrat.variable} ${geistMono.variable}`}
    >
      <head>
        <ThemeStyles />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <JsonLd data={buildGlobalOrganizationGraph()} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  var standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && navigator.standalone);
  if (!standalone) return;
  document.documentElement.classList.add("standalone-pwa");
})();
            `.trim(),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <PwaUpdateManager />
        <PwaOfflineRecovery />
        <PwaNavDiagnostics />
        <StandaloneViewportSync />
        {process.env.NODE_ENV === "development" ? <NavLayoutDebug /> : null}
        {children}
      </body>
    </html>
  );
}

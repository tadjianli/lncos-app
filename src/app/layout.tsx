import type { Metadata, Viewport } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildGlobalOrganizationGraph } from "@/lib/seo-site";
import { getSiteUrl } from "@/lib/site-url";
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
    default: "LN COS | Cosmétiques, Ongles, Beauté & Accessoires à La Réunion",
    template: "%s | LN COS",
  },
  description:
    "Découvrez LN COS : vernis semi-permanents, accessoires ongles, maquillage, soins beauté et nouveautés. Livraison rapide à La Réunion et en France.",
  applicationName: "LN COS",
  authors: [{ name: "LN COS" }],

  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "LN COS",
    statusBarStyle: "black-translucent",
  },

  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/assets/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "LN COS",
    title: "LN COS | Cosmétiques, Ongles, Beauté & Accessoires à La Réunion",
    description:
      "Découvrez LN COS : vernis semi-permanents, accessoires ongles, maquillage, soins beauté et nouveautés. Livraison rapide à La Réunion et en France.",
    images: [{ url: "/assets/icon-512.png", width: 512, height: 512, alt: "LN COS" }],
  },

  twitter: {
    card: "summary_large_image",
    title: "LN COS | Cosmétiques & beauté à La Réunion",
    description:
      "Vernis semi-permanents, accessoires ongles, maquillage et soins beauté. Livraison La Réunion & France.",
    images: ["/assets/icon-512.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0A",
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
      lang="fr"
      suppressHydrationWarning
      className={`${montserrat.variable} ${geistMono.variable}`}
    >
      <head>
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

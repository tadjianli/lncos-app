import type { Metadata, Viewport } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import { getSiteUrl } from "@/lib/site-url";
import { StandaloneViewportSync } from "@/components/layout/StandaloneViewportSync";
import { NavLayoutDebug } from "@/components/layout/NavLayoutDebug";
import { PwaUpdateManager } from "@/components/pwa/PwaUpdateManager";
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
  title: "LN COS — Beauté & Cosmétique",
  description: "Cosmétiques premium. Formulés en France.",
  alternates: { canonical: "/" },
  applicationName: "LN COS",
  keywords: ["beauté", "cosmétique", "soins", "maquillage", "premium"],
  authors: [{ name: "LN COS" }],

  /* ── PWA ── */
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "LN COS",
    statusBarStyle: "black-translucent",
  },

  /* ── Icons ── */
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

  /* ── Open Graph ── */
  openGraph: {
    type: "website",
    siteName: "LN COS",
    title: "LN COS — Beauté & Cosmétique",
    description: "Cosmétiques premium. Formulés en France.",
  },

  /* ── Twitter card ── */
  twitter: {
    card: "summary_large_image",
    title: "LN COS",
    description: "Cosmétiques premium. Formulés en France.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0A0A",
  /* viewport-fit=cover so safe-area-inset works on notched devices */
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
        {/* Preconnect to font origin for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* PWA iOS : hauteur viewport avant hydratation React (évite zone noire sous TabBar) */}
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
        <StandaloneViewportSync />
        <NavLayoutDebug />
        {children}
      </body>
    </html>
  );
}

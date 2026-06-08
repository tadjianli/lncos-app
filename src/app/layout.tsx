import type { Metadata, Viewport } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
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
  title: "LN COS — Beauté & Cosmétique",
  description: "Cosmétiques premium. Formulés en France.",
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
    apple: [
      { url: "/assets/icon-192.png", sizes: "192x192" },
      { url: "/assets/icon-512.png", sizes: "512x512" },
    ],
    icon: [
      { url: "/assets/icon-192.png", sizes: "192x192", type: "image/png" },
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

        {/* Disable legacy service workers that cached broken 404 responses */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(regs) {
    return Promise.all(regs.map(function(reg) { return reg.unregister(); }));
  }).catch(function() {});
}
if ('caches' in window) {
  caches.keys().then(function(keys) {
    return Promise.all(
      keys.filter(function(key) { return key.indexOf('lncos-') === 0; })
        .map(function(key) { return caches.delete(key); })
    );
  }).catch(function() {});
}
            `.trim(),
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "LN COS — Luxury Beauty",
  description: "Premium luxury cosmetics. Curated for the discerning.",
  applicationName: "LN COS",
  keywords: ["luxury", "beauty", "cosmetics", "skincare", "premium"],
  authors: [{ name: "LN COS" }],
  openGraph: {
    type: "website",
    siteName: "LN COS",
    title: "LN COS — Luxury Beauty",
    description: "Premium luxury cosmetics. Curated for the discerning.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LN COS — Luxury Beauty",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#080808",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable}`}
    >
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  beautyVideoMetadata,
  fetchBeautyVideoBySlug,
} from "@/lib/beauty-videos-server";
import { BeautyVideoPageClient } from "./BeautyVideoPageClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const video = await fetchBeautyVideoBySlug(decodeURIComponent(slug).trim());
  if (!video) return { title: "Vidéo introuvable | LN COS" };

  const { title, description, canonical, image } = await beautyVideoMetadata(video);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "LN COS",
      locale: "fr_FR",
      type: "video.other",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function BeautyVideoPage({ params }: Props) {
  const { slug } = await params;
  const video = await fetchBeautyVideoBySlug(decodeURIComponent(slug).trim());

  if (!video) {
    return (
      <AppShell>
        <div style={{ padding: 40, textAlign: "center" }}>
          <h1>Vidéo introuvable</h1>
          <Link href="/videos" style={{ color: "var(--gold)" }}>
            Retour aux vidéos
          </Link>
        </div>
      </AppShell>
    );
  }

  return <BeautyVideoPageClient video={video} />;
}

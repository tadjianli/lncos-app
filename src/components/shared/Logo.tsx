import Image from "next/image";
import { branding, getLogoAlt, getLogoPath } from "@/lib/branding";

interface LogoProps {
  size?: number;
  /** Conservé pour compatibilité — le logo officiel est toujours affiché en entier */
  mono?: boolean;
  /** @deprecated Le logo officiel utilise ses couleurs d'origine */
  color?: string;
}

export function Logo({ size = 30 }: LogoProps) {
  const height = size;
  const width = Math.round(size * branding.logo.aspectRatio);

  return (
    <Image
      src={getLogoPath()}
      alt={getLogoAlt()}
      width={width}
      height={height}
      className="lncos-logo"
      style={{ height, width: "auto", display: "block" }}
      priority
    />
  );
}

/** @deprecated Utiliser getLogoPath() depuis @/lib/branding */
export const LOGO_PATH = branding.logo.path;

import Image from "next/image";

/** Chemin public du logo officiel LN COS */
export const LOGO_PATH = "/assets/logo-lncos.jpg";

const LOGO_ASPECT = 1600 / 1460;

interface LogoProps {
  size?: number;
  /** Conservé pour compatibilité — le logo officiel est toujours affiché en entier */
  mono?: boolean;
  /** @deprecated Le logo officiel utilise ses couleurs d'origine */
  color?: string;
}

export function Logo({ size = 30 }: LogoProps) {
  const height = size;
  const width = Math.round(size * LOGO_ASPECT);

  return (
    <Image
      src={LOGO_PATH}
      alt="LN COS"
      width={width}
      height={height}
      className="lncos-logo"
      style={{ height, width: "auto", display: "block" }}
      priority
    />
  );
}

/** Durée alignée sur `pdOverlayExit` dans globals.css */
export const PRODUCT_EXIT_MS = 220;

type ExitCompleter = () => void;
type ExitAnimator = (complete: ExitCompleter) => void;

let exitAnimator: ExitAnimator | null = null;

export function registerProductExitAnimator(animator: ExitAnimator) {
  exitAnimator = animator;
}

export function unregisterProductExitAnimator() {
  exitAnimator = null;
}

export function productExitDurationMs(): number {
  if (typeof window === "undefined") return PRODUCT_EXIT_MS;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
  return PRODUCT_EXIT_MS;
}

/** Lance le fade-out si la fiche produit est montée. Retourne false si fermeture immédiate. */
export function requestProductExitAnimation(onComplete: ExitCompleter): boolean {
  if (!exitAnimator) return false;
  exitAnimator(onComplete);
  return true;
}

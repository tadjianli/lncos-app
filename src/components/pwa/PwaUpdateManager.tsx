"use client";

import { useEffect } from "react";
import { registerPwaUpdateHandlers } from "@/lib/pwa/client";

/** Enregistre le SW, vérifie les mises à jour toutes les 30 s et recharge après déploiement Vercel. */
export function PwaUpdateManager() {
  useEffect(() => registerPwaUpdateHandlers(), []);
  return null;
}

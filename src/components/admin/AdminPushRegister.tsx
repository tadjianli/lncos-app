"use client";

import { useEffect, useRef } from "react";
import { registerAdminPush } from "@/lib/push/client";

/**
 * Enregistre les notifications push Web pour l'admin connecté.
 * Chaque nouvelle commande déclenche une alerte sur le téléphone (PWA / navigateur).
 */
export function AdminPushRegister() {
  const tried = useRef(false);

  useEffect(() => {
    if (tried.current) return;
    tried.current = true;
    registerAdminPush().catch(() => {});
  }, []);

  return null;
}

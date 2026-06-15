"use client";

import { useEffect } from "react";
import { installPwaNavDiagnostics } from "@/lib/pwa/nav-diagnostics";

export function PwaNavDiagnostics() {
  useEffect(() => installPwaNavDiagnostics(), []);
  return null;
}

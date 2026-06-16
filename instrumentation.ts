import { logAiEnvStartupCheck } from "@/lib/ai-env";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    logAiEnvStartupCheck();
  }
}

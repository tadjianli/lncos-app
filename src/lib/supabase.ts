/**
 * @deprecated Import from `@/lib/supabase/client` or `@/lib/supabase/index` instead.
 */
export { createClient, getSupabase } from "./supabase/client";
export {
  getBrowserSession,
  getBrowserUser,
  clearLocalAuthSession,
  subscribeAuthChanges,
} from "./supabase/auth-client";
export { isSupabaseConfigured } from "./supabase/env";
export type { Database } from "./database.types";

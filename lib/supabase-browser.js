import { createClient } from "@supabase/supabase-js";

let browserSupabase = null;

const SUPABASE_URL = "https://yncrwhokizzufovxmauk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_CseZZhaqjoQxnImZixAenA_5M_Yxarl";

export function createBrowserSupabase() {
  if (
    !SUPABASE_PUBLISHABLE_KEY ||
    SUPABASE_PUBLISHABLE_KEY.trim().length < 20
  ) {
    throw new Error("Publishable key Supabase belum benar di lib/supabase-browser.js");
  }

  if (!browserSupabase) {
    browserSupabase = createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY.trim()
    );
  }

  return browserSupabase;
}
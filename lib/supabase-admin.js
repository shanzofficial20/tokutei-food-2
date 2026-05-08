import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://yncrwhokizzufovxmauk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_CseZZhaqjoQxnImZixAenA_5M_Yxarl";

export function createAdminSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diisi di Vercel.");
  }

  return createClient(SUPABASE_URL, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createAuthSupabase(accessToken) {
  if (
    !SUPABASE_PUBLISHABLE_KEY ||
    SUPABASE_PUBLISHABLE_KEY.trim().length < 20
  ) {
    throw new Error("Publishable key Supabase belum benar di lib/supabase-admin.js");
  }

  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY.trim(), {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
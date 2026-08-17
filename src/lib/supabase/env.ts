interface SupabaseEnv {
  url: string;
  anonKey: string;
}

// Fails fast with a clear message instead of letting the Supabase SDK throw
// an opaque error deep inside client construction.
export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL " +
        "and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (copy .env.example).",
    );
  }

  return { url, anonKey };
}

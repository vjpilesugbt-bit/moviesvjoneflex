import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

function createClient() {
  return createSupabaseBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export { createClient, createClient as createBrowserClient }

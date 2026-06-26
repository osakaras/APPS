/** Whether the public Supabase env is configured. Lets the app degrade
 *  gracefully into a design-preview mode when keys aren't present yet. */
export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Handles the OAuth / magic-link / password-reset callback. Supabase redirects
 * here with `?code=<one-time-code>`, which we exchange for a session cookie.
 * After that, `next` (default `/dashboard`) takes the user where they were
 * heading. For password resets the email link uses `next=/auth/reset-password`.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(new URL('/auth/signin?error=callback', url.origin));
}

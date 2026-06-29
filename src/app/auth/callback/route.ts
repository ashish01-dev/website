import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  if (code) {
    const response = NextResponse.redirect(`${origin}/dashboard`)
    const sb = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll().map(c => ({ name: c.name, value: c.value })),
          setAll: (cookies) => cookies.forEach(c => response.cookies.set(c.name, c.value, c.options)),
        },
      },
    )
    await sb.auth.exchangeCodeForSession(code)
    return response
  }
  return NextResponse.redirect(`${origin}/dashboard`)
}

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(`${origin}/?error=missing_config`)
  }

  if (code) {
    try {
      const response = NextResponse.redirect(`${origin}/dashboard`)
      const sb = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll: () => request.cookies.getAll().map(c => ({ name: c.name, value: c.value })),
          setAll: (cookies) => cookies.forEach(c => response.cookies.set(c.name, c.value, c.options)),
        },
      })
      await sb.auth.exchangeCodeForSession(code)
      return response
    } catch {
      return NextResponse.redirect(`${origin}/?error=auth_failed`)
    }
  }
  return NextResponse.redirect(`${origin}/dashboard`)
}

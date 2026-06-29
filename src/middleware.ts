import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== '/') {
    return NextResponse.next()
  }

  const cookies = request.cookies.getAll()
  const hasAuthCookie = cookies.some(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))

  if (hasAuthCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}

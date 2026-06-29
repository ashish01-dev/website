import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname !== '/' && pathname !== '/auth' && pathname !== '/auth/callback') {
    return NextResponse.next()
  }
  if (pathname !== '/') {
    return NextResponse.next()
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/pricing', '/about'],
}

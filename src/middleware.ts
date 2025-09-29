import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // If accessing admin pages
    if (pathname.startsWith('/admin')) {
      // If not logged in or not admin
      if (!token || (token.role !== 'admin' && token.email !== 'admin@electronic.com')) {
        return NextResponse.rewrite(new URL('/not-found', req.url))
      }
    }

    // Allow access to all other routes
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true, // Pass all requests to the middleware
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/checkout/:path*'],
}

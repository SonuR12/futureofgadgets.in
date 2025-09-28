import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Redirect non-admin users trying to access admin pages to not-found
    if (pathname.startsWith('/admin') && token?.role !== 'admin' && token?.email !== 'admin@electronic.com') {
      return NextResponse.rewrite(new URL('/not-found', req.url))
    }
  },
  {
    callbacks: {
      authorized: () => {
        // Allow all requests to pass through middleware function
        // We handle authorization in the middleware function above
        return true
      }
    }
  }
)

export const config = {
  matcher: ['/admin/:path*', '/checkout/:path*']
}
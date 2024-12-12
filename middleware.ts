import { auth } from '@/lib/auth'

export default auth((req, ctx) => {
  const isAuth = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/login')

  if (isAuthPage) {
    if (isAuth) {
      return Response.redirect(new URL('/', req.nextUrl))
    }
    return
  }

  if (!isAuth) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
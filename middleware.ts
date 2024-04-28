import { NextResponse } from 'next/server';
import { decodeJwt } from 'jose';
import { clerkMiddleware, createRouteMatcher, redirectToSignIn } from '@clerk/nextjs/server';


const publicRoutesDev = ["/api/clerk", "/api/seed", '/not-authorized', 'organization-profile']
const publicRoutesCypress = ["/api/clerk", "/api/seed", '/not-authorized', '/', '/transactions']
const publicRoutesProd = ["/api/clerk", '/not-authorized',]

let pubRoutes: string[]

switch (process.env.PUBLIC_ROUTES) {
  case "development":
    pubRoutes = publicRoutesDev
    break
  case "cypress":
    pubRoutes = publicRoutesCypress
    break
  case "production":
    pubRoutes = publicRoutesProd
    break
  default:
    pubRoutes = publicRoutesProd
}

const isProtectedRoute = createRouteMatcher([
  '/(.*)',
], );

export default clerkMiddleware((auth, req) => {
  if (!pubRoutes.includes(req.nextUrl.pathname) && isProtectedRoute(req)) auth().protect();
})





export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)","/","/(api|trpc)(.*)"],
};

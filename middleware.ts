import { NextResponse } from 'next/server';
import { decodeJwt } from 'jose';
import { clerkClient, clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const publicRoutesDev = ["/api/clerk", '/api/enums', "/api/seed", '/not-authorized', '/organization-profile']
const publicRoutesCypress = ["/api/clerk", '/api/enums', "/api/seed", '/not-authorized', '/', '/transactions']
const publicRoutesProd = ["/api/clerk", '/api/enums', '/not-authorized',]

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

export default clerkMiddleware(async (auth, req) => {
  if (pubRoutes.includes(req.nextUrl.pathname)) return
  let token, is_admin, is_org_enabled, orgId
     try {
        token = await auth().getToken({ template: 'custom' })
       // @ts-ignore
       const decoded = decodeJwt(token)
       is_admin = decoded.is_admin
       // @ts-ignore
       orgId = Object.keys(decoded.orgs)[0]
       const org = await clerkClient.organizations.getOrganization({
         organizationId: orgId
       })
       // @ts-ignore
       is_org_enabled = org.publicMetadata.is_org_enabled
     } catch (e) {
       console.error(e)
       auth().protect();
     }

    if (!orgId && !req.nextUrl.pathname.includes('organization-disabled')) {
      const notAuthUrl = new URL("/organization-disabled", req.url);
      return NextResponse.redirect(notAuthUrl)
    }
    if (!pubRoutes.includes(req.nextUrl.pathname) && isProtectedRoute(req)) {
      auth().protect();
    }
})





export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)","/","/(api|trpc)(.*)"],
};

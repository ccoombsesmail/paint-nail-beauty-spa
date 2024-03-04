import { authMiddleware, redirectToSignIn  } from "@clerk/nextjs";
import { NextResponse } from 'next/server';
import { decodeJwt } from 'jose';


const publicRoutesDev = ["/api/clerk", "/api/seed", '/not-authorized']
const publicRoutesCypress = ["/api/clerk", "/api/seed", '/not-authorized', '/', '/transactions']
const publicRoutesProd = ["/api/clerk", '/not-authorized',]

let pubRoutes

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

console.log(pubRoutes)
export default authMiddleware({
  publicRoutes: pubRoutes,
  async afterAuth(auth, req, evt) {

    if (req.nextUrl.pathname === '/not-authorized') {
      return NextResponse.next();
    }

    const token = await auth.getToken({ template: 'franchise_code'})

    if (token) {
      const payload = decodeJwt(token as string)

      if (!payload.franchise_code && req.nextUrl.href !== `${req.nextUrl.origin}/not-authorized`) {
        return NextResponse.redirect( `${req.nextUrl.origin}/not-authorized` );
      }

    }

    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    // If the user is logged in and trying to access a protected route, allow them to access route
    if (auth.userId && !auth.isPublicRoute) {
      return NextResponse.next();
    }
    // Allow users visiting public routes to access them
    return NextResponse.next();
  },
});




export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)","/","/(api|trpc)(.*)"],
};

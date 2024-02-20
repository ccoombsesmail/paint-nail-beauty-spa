import { authMiddleware } from "@clerk/nextjs";



export default authMiddleware({
  publicRoutes: ["/api/clerk", "/api/seed"]
});


export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)","/","/(api|trpc)(.*)"],
};

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

//create Route matcher is used to match whether the route is public or private
const protectedRoutes=createRouteMatcher([
    "/",
    "/credits",
    "/profile",
    "/transformations",
    
]) 

export default clerkMiddleware((auth ,req)=>{
    if(protectedRoutes(req))
      {
        auth().protect();
  
      }
      publicRoutes:['/api/webhooks/clerk']
  });



export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 
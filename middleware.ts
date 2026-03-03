// middleware.ts
// Installs Clerk's auth middleware for the entire Next.js app.
// Our router strategy: the homepage (/) is intentionally public and renders
// different content based on sign-in state — no hard redirect is needed.
// The middleware still processes every request so Clerk session cookies are
// validated and `auth()` / `useUser()` work correctly everywhere.
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Run on every route except Next.js internals and static assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

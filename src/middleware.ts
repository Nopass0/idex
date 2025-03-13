// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that require authentication
const PROTECTED_PATHS = ["/profile", "/admin", "/dashboard"];
// Paths that are only accessible if not authenticated
const AUTH_PATHS = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if token exists
  const token = request.cookies.get("auth-token")?.value;
  const isAuthenticated = !!token;

  // Redirect authenticated users away from login/register pages
  if (isAuthenticated && AUTH_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api (API routes)
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /sitemap.xml (static files)
     */
    "/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml).*)",
  ],
};
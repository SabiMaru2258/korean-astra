import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

const PUBLIC_PATHS = ["/login", "/admin/login"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static assets and public paths
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session")?.value;
  const session = verifyToken(token);

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect /admin routes - only ADMIN role
  if (pathname.startsWith("/admin") && session.role !== "admin") {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // /community routes are protected (any authenticated user can access)
  // This is already handled by the session check above

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

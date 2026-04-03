import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Check for NextAuth v5 session cookie
  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/jobs/:path*", "/candidates/:path*"],
};

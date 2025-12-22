import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authGuard, passwordChangeGuard } from "./lib/middleware/guards";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    // Check if user is administrator
    const auth = await authGuard(request);

    if (auth.error) {
      return NextResponse.redirect(new URL(auth.redirectTo!, request.url));
    }

    // Check for password change requirement
    const pwdCheck = passwordChangeGuard(auth.payload, pathname);
    if (pwdCheck.error) {
      return NextResponse.redirect(new URL(pwdCheck.redirectTo!, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/estudiante/:path*"],
};

import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Supabase may reject our redirectTo and fall back to site_url (root).
  // Catch the PKCE code on the wrong page and route it to the callback handler.
  if (
    searchParams.has("code") &&
    !pathname.startsWith("/auth/callback")
  ) {
    const isRecovery =
      request.cookies.get("password_recovery")?.value === "1";
    if (isRecovery) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/callback";
      url.searchParams.set("next", "/auth/update-password");
      return NextResponse.redirect(url);
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

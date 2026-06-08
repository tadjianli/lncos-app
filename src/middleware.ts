import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isAdminUser, updateSession } from "@/lib/supabase/middleware";

const LOGIN_PATH = "/login";
const ADMIN_PREFIX = "/admin";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute =
    pathname.startsWith(ADMIN_PREFIX) && pathname !== "/admin/login";
  const isLoginRoute = pathname === LOGIN_PATH;
  const isLegacyAdminLogin = pathname === "/admin/login";

  if (!isAdminRoute && !isLoginRoute) {
    if (isSupabaseConfigured()) {
      const { response } = await updateSession(request);
      return response;
    }
    return NextResponse.next();
  }

  if (isLegacyAdminLogin) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    return NextResponse.redirect(url);
  }

  if (!isSupabaseConfigured()) {
    if (isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = LOGIN_PATH;
      url.searchParams.set("error", "config");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const { supabase, response, user } = await updateSession(request);

  if (isAdminRoute) {
    if (!user || !supabase) {
      const url = request.nextUrl.clone();
      url.pathname = LOGIN_PATH;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const admin = await isAdminUser(supabase, user.id);
    if (!admin) {
      const url = request.nextUrl.clone();
      url.pathname = LOGIN_PATH;
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
  }

  if (isLoginRoute && user && supabase) {
    const admin = await isAdminUser(supabase, user.id);
    if (admin) {
      const next = request.nextUrl.searchParams.get("next");
      const url = request.nextUrl.clone();
      url.pathname = next?.startsWith(ADMIN_PREFIX) ? next : "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

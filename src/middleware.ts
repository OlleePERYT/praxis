import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

function getSubdomain(hostHeader: string | null): string | null {
  if (!hostHeader) return null;

  const hostname = hostHeader.split(":")[0].toLowerCase();
  const parts = hostname.split(".");

  if (hostname === "localhost" || parts.length < 3) {
    return null;
  }

  return parts[0] ?? null;
}

export default auth((req) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;

  const isAuthApi = pathname.startsWith("/api/auth");
  const isLoginPage = pathname === "/login";
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public");

  if (isAuthApi || isLoginPage || isPublicAsset) {
    return NextResponse.next();
  }

  if (!req.auth?.user) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const subdomain = getSubdomain(req.headers.get("host"));
  const requestHeaders = new Headers(req.headers);
  if (subdomain) {
    requestHeaders.set("x-practice-subdomain", subdomain);
  } else {
    requestHeaders.delete("x-practice-subdomain");
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

import NextAuth from "next-auth";
import type { NextAuthRequest } from "next-auth";
import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server";
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

const middlewareImpl = (req: NextAuthRequest) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;

  const isAuthApi = pathname.startsWith("/api/auth");
  const isLoginPage = pathname === "/login";
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public");

  const isMarketingPublic =
    pathname === "/" ||
    pathname.startsWith("/impressum") ||
    pathname.startsWith("/datenschutz");
  const isContactApi = pathname.startsWith("/api/contact");

  if (isAuthApi || isLoginPage || isPublicAsset) {
    return NextResponse.next();
  }

  if (isMarketingPublic || isContactApi) {
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
};

const withAuth = auth(middlewareImpl) as unknown as NextMiddleware;

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  return withAuth(request, event);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

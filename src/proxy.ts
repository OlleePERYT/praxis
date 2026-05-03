import NextAuth from "next-auth";
import type { NextAuthRequest } from "next-auth";
import type { NextFetchEvent, NextMiddleware, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { getSubdomainFromHost } from "@/lib/host";

const { auth } = NextAuth(authConfig);

function isLegalOrSupportPath(pathname: string): boolean {
  return (
    pathname.startsWith("/impressum") ||
    pathname.startsWith("/datenschutz") ||
    pathname.startsWith("/kontakt")
  );
}

/**
 * Praxis-Subdomain: zuerst aus dem Host (Kunden-Subdomain), sonst aus der
 * Session (Apex-Domain nach Login, z. B. praxis-kennzahlen.de).
 */
function getEffectivePracticeSubdomain(
  hostSubdomain: string | null,
  req: NextAuthRequest,
): string | null {
  if (hostSubdomain) {
    return hostSubdomain;
  }
  const fromSession = req.auth?.user?.practiceSubdomain;
  return typeof fromSession === "string" && fromSession.length > 0
    ? fromSession
    : null;
}

function withPracticeHeader(
  req: NextAuthRequest,
  base: Headers,
  hostSubdomain: string | null,
) {
  const tenant = getEffectivePracticeSubdomain(hostSubdomain, req);
  if (tenant) {
    base.set("x-practice-subdomain", tenant);
  } else {
    base.delete("x-practice-subdomain");
  }
}

const middlewareImpl = (req: NextAuthRequest) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;

  const hostSubdomain = getSubdomainFromHost(req.headers.get("host"));

  const isAuthApi = pathname.startsWith("/api/auth");
  const isLoginPage = pathname === "/login";
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/assets");

  const isMarketingPublic =
    !hostSubdomain &&
    (pathname === "/" ||
      pathname.startsWith("/impressum") ||
      pathname.startsWith("/datenschutz") ||
      pathname.startsWith("/kontakt"));
  const isContactApi = pathname.startsWith("/api/contact");

  if (isAuthApi || isLoginPage || isPublicAsset) {
    return NextResponse.next();
  }

  // Apex: eingeloggte Nutzer nicht auf die Verkaufsseite (/) schicken
  if (!hostSubdomain && pathname === "/" && req.auth?.user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Subdomain: Impressum, Datenschutz, Kontakt/Support ohne Login (Pflichtlinks im Footer)
  if (hostSubdomain && isLegalOrSupportPath(pathname)) {
    const requestHeaders = new Headers(req.headers);
    withPracticeHeader(req, requestHeaders, hostSubdomain);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (isMarketingPublic || isContactApi) {
    const requestHeaders = new Headers(req.headers);
    withPracticeHeader(req, requestHeaders, hostSubdomain);
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

  const requestHeaders = new Headers(req.headers);
  withPracticeHeader(req, requestHeaders, hostSubdomain);

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

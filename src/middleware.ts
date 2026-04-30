import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import { auth } from "@/auth";

const databaseUrl = process.env.DATABASE_URL ?? "./data/praxis-kennzahlen.db";
const sqlite = new Database(databaseUrl, { readonly: true });

type PracticeRow = {
  id: number;
  subdomain: string;
  name: string;
};

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
  if (!subdomain) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const practice = sqlite
    .prepare(
      "SELECT id, subdomain, name FROM practices WHERE subdomain = ? LIMIT 1",
    )
    .get(subdomain) as PracticeRow | undefined;

  if (!practice) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-practice-subdomain", practice.subdomain);
  requestHeaders.set("x-practice-id", String(practice.id));
  requestHeaders.set("x-practice-name", practice.name);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

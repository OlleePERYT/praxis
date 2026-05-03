import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { practices } from "@/db/schema";
import type { PraxisConfig } from "@/lib/engine";
import {
  buildPracticeConfigDocument,
  normalizePraxisConfig,
} from "@/lib/praxis-config";

/**
 * Aktualisiert die gespeicherte Praxis-Konfiguration (Tenant-isoliert).
 * Optional: Vergleichspunkt für „Was-wäre-wenn“ (comparisonAnchor).
 */
export async function PATCH(request: Request) {
  const session = await auth();
  const practiceId = session?.user?.practiceId;

  if (!practiceId) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Request-Body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Ungültiger Request-Body." }, { status: 400 });
  }

  const rec = body as Record<string, unknown>;
  const configRaw = rec.config;
  const anchorRaw = rec.comparisonAnchor;

  const config = normalizePraxisConfig(configRaw);

  let comparisonAnchor: { savedAt: string; snapshot: PraxisConfig } | null = null;

  if (anchorRaw !== undefined && anchorRaw !== null) {
    if (typeof anchorRaw !== "object") {
      return NextResponse.json({ error: "Ungültiger Vergleichspunkt." }, { status: 400 });
    }
    const a = anchorRaw as Record<string, unknown>;
    if (typeof a.savedAt !== "string" || a.snapshot === undefined) {
      return NextResponse.json({ error: "Ungültiger Vergleichspunkt." }, { status: 400 });
    }
    comparisonAnchor = {
      savedAt: a.savedAt,
      snapshot: normalizePraxisConfig(a.snapshot),
    };
  }

  const doc = buildPracticeConfigDocument(config, comparisonAnchor);

  await db
    .update(practices)
    .set({ config: JSON.stringify(doc) })
    .where(eq(practices.id, practiceId));

  return NextResponse.json({ ok: true });
}

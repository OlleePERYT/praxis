import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { scenarios } from "@/db/schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  const practiceId = session?.user?.practiceId;

  if (!practiceId) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await context.params;
  const scenarioId = Number(id);
  if (!Number.isInteger(scenarioId) || scenarioId <= 0) {
    return NextResponse.json({ error: "Ungueltige Szenario-ID." }, { status: 400 });
  }

  await db
    .delete(scenarios)
    .where(and(eq(scenarios.practiceId, practiceId), eq(scenarios.id, scenarioId)));

  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { count, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { scenarios } from "@/db/schema";
import { PraxisConfig } from "@/lib/engine";

type CreateScenarioBody = {
  name?: string;
  data?: PraxisConfig;
};

export async function GET() {
  const session = await auth();
  const practiceId = session?.user?.practiceId;

  if (!practiceId) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const rows = await db
    .select({
      id: scenarios.id,
      name: scenarios.name,
      data: scenarios.data,
      created_at: scenarios.createdAt,
    })
    .from(scenarios)
    .where(eq(scenarios.practiceId, practiceId))
    .orderBy(desc(scenarios.createdAt));

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const session = await auth();
  const practiceId = session?.user?.practiceId;

  if (!practiceId) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  let body: CreateScenarioBody;
  try {
    body = (await request.json()) as CreateScenarioBody;
  } catch {
    return NextResponse.json({ error: "Ungueltiger Request-Body." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  if (!name) {
    return NextResponse.json({ error: "Name darf nicht leer sein." }, { status: 400 });
  }

  if (!body.data) {
    return NextResponse.json({ error: "Szenario-Daten fehlen." }, { status: 400 });
  }

  const countResult = await db
    .select({ value: count() })
    .from(scenarios)
    .where(eq(scenarios.practiceId, practiceId));

  const existingCount = countResult[0]?.value ?? 0;
  if (existingCount >= 3) {
    return NextResponse.json({ error: "Max. 3 Szenarien erreicht." }, { status: 400 });
  }

  const inserted = await db
    .insert(scenarios)
    .values({
      practiceId,
      name,
      data: JSON.stringify(body.data),
      createdAt: new Date().toISOString(),
    })
    .returning({
      id: scenarios.id,
      name: scenarios.name,
      data: scenarios.data,
      created_at: scenarios.createdAt,
    });

  const createdScenario = inserted[0];

  if (!createdScenario) {
    return NextResponse.json({ error: "Szenario konnte nicht erstellt werden." }, { status: 500 });
  }

  return NextResponse.json(createdScenario, { status: 201 });
}

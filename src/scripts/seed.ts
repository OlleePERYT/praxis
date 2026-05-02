import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { practices, users } from "@/db/schema";

const DEMO_SUBDOMAIN = "demo";
const DEMO_EMAIL = "demo@praxis-kennzahlen.de";
const DEMO_PASSWORD = "demo1234";

const demoConfig = {
  employees: [
    {
      name: "Therapeutin 1",
      hours: 20,
      rate: 25,
      vacation: 30,
      sick: 5,
      training: 5,
      trainingCost: 1000,
    },
  ],
  revenueMode: "direct",
  revPerHour: 75,
  mieteMonat: 1200,
  untermiete: 0,
  handelswareJahr: 0,
  sachkosten: { mode: "direct", value: 24020 },
};

async function seed() {
  let practiceId: number;

  const existingPractice = await db.query.practices.findFirst({
    where: eq(practices.subdomain, DEMO_SUBDOMAIN),
  });

  if (existingPractice) {
    practiceId = existingPractice.id;
    console.log(
      `Practice uebersprungen: subdomain "${DEMO_SUBDOMAIN}" existiert bereits (id=${practiceId}).`,
    );
  } else {
    const insertedPractice = await db
      .insert(practices)
      .values({
        subdomain: DEMO_SUBDOMAIN,
        name: "Demo Praxis",
        logoPath: null,
        config: JSON.stringify(demoConfig),
        createdAt: new Date().toISOString(),
      })
      .returning({ id: practices.id });

    practiceId = insertedPractice[0].id;
    console.log(
      `Practice angelegt: subdomain "${DEMO_SUBDOMAIN}" (id=${practiceId}).`,
    );
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, DEMO_EMAIL),
  });

  if (existingUser) {
    console.log(`User uebersprungen: E-Mail "${DEMO_EMAIL}" existiert bereits.`);
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  await db.insert(users).values({
    practiceId,
    email: DEMO_EMAIL,
    passwordHash,
    createdAt: new Date().toISOString(),
  });

  console.log(
    `User angelegt: E-Mail "${DEMO_EMAIL}" fuer practice_id=${practiceId}.`,
  );
}

seed()
  .then(() => {
    console.log("Seed abgeschlossen.");
  })
  .catch((error) => {
    console.error("Seed fehlgeschlagen:", error);
    process.exit(1);
  });

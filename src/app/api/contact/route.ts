import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactBody = {
  name?: unknown;
  praxisname?: unknown;
  email?: unknown;
  message?: unknown;
};

export async function POST(request: Request) {
  let body: ContactBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Alle Felder sind Pflichtfelder." },
      { status: 400 },
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const praxisname =
    typeof body.praxisname === "string" ? body.praxisname.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message =
    typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !praxisname || !email || !message) {
    return NextResponse.json(
      { error: "Alle Felder sind Pflichtfelder." },
      { status: 400 },
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "Ungültige E-Mail-Adresse." },
      { status: 400 },
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const to = process.env.CONTACT_TO ?? "info@praxis-kennzahlen.de";

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `Neue Anfrage: ${name} – ${praxisname}`,
      text: [
        `Name: ${name}`,
        `Praxisname: ${praxisname}`,
        `E-Mail: ${email}`,
        "",
        "Nachricht:",
        message,
      ].join("\n"),
    });
  } catch (err) {
    console.error(
      "SMTP:",
      err instanceof Error ? err.message : String(err),
    );
    return NextResponse.json(
      { error: "E-Mail konnte nicht gesendet werden." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

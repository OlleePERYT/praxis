import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX = {
  name: 120,
  praxisname: 120,
  email: 254,
  phone: 30,
  message: 5000,
  pageUrl: 2048,
  honeypot: 200,
} as const;

const FROM = process.env.CONTACT_FROM ?? "hi@peryt.de";
const TO = process.env.CONTACT_TO ?? "ostoecker@gmx.de";
const SENDMAIL_PATH = process.env.SENDMAIL_PATH ?? "/usr/sbin/sendmail";
const SUBJECT = "Neue Kontaktformular-Anfrage von praxis-kennzahlen.de";

function trimField(value: unknown, max: number): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, max);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Bitte prüfen Sie Ihre Eingaben." },
      { status: 400 },
    );
  }

  const honeypot = trimField(body.website, MAX.honeypot);
  if (honeypot) {
    return NextResponse.json({ success: true });
  }

  const name = trimField(body.name, MAX.name);
  const praxisname = trimField(body.praxisname, MAX.praxisname);
  const email = trimField(body.email, MAX.email);
  const phone = trimField(body.phone, MAX.phone);
  const message = trimField(body.message, MAX.message);
  let pageUrl = trimField(body.pageUrl, MAX.pageUrl);
  if (!pageUrl) {
    pageUrl = trimField(request.headers.get("referer"), MAX.pageUrl);
  }

  if (!name || !praxisname) {
    return NextResponse.json(
      { error: "Bitte füllen Sie alle Pflichtfelder aus." },
      { status: 400 },
    );
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "Bitte geben Sie eine gültige E-Mail-Adresse ein." },
      { status: 400 },
    );
  }

  if (!message) {
    return NextResponse.json(
      { error: "Bitte geben Sie eine Nachricht ein." },
      { status: 400 },
    );
  }

  const transporter = nodemailer.createTransport({
    sendmail: true,
    newline: "unix",
    path: SENDMAIL_PATH,
  });

  const sentAt = new Date().toLocaleString("de-DE", {
    timeZone: "Europe/Berlin",
    dateStyle: "medium",
    timeStyle: "medium",
  });

  const textLines = [
    "Neue Kontaktformular-Anfrage",
    "",
    `Name: ${name}`,
    `E-Mail: ${email}`,
  ];
  if (phone) {
    textLines.push(`Telefon: ${phone}`);
  }
  textLines.push(`Praxisname: ${praxisname}`, "", "Nachricht:", message, "");
  textLines.push(`Zeitpunkt: ${sentAt}`);
  textLines.push(`Seite: ${pageUrl || "(nicht angegeben)"}`);

  try {
    await transporter.sendMail({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: SUBJECT,
      text: textLines.join("\n"),
    });
  } catch (err) {
    console.error(
      "contact/sendmail:",
      err instanceof Error ? err.message : "send failed",
    );
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

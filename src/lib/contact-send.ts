import { spawn } from "node:child_process";

const DEFAULT_TO = "ostoecker@gmx.de";
const DEFAULT_FROM = "hi@peryt.de";

/**
 * Versand über /usr/bin/mail (nutzt auf dem VPS msmtp/sendmail wie im Terminal-Test).
 * Nodemailer/sendmail lieferte exit 0, Mails kamen aber nicht an.
 */
export function sendContactMail(options: {
  subject: string;
  body: string;
  replyTo: string;
}): Promise<void> {
  const to = process.env.CONTACT_TO ?? DEFAULT_TO;
  const from = process.env.CONTACT_FROM ?? DEFAULT_FROM;
  const mailPath = process.env.MAIL_PATH ?? "/usr/bin/mail";
  const home = process.env.HOME ?? "/root";

  return new Promise((resolve, reject) => {
    const args = [
      "-s",
      options.subject,
      "-r",
      from,
      "-a",
      `Reply-To:${options.replyTo}`,
      to,
    ];

    const proc = spawn(mailPath, args, {
      env: { ...process.env, HOME: home },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stderr = "";
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on("error", (err) => {
      reject(err);
    });

    proc.stdin.write(options.body, "utf8");
    proc.stdin.end();

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      const detail = stderr.trim() || `exit ${code}`;
      reject(new Error(detail));
    });
  });
}

"use client";

import { type FormEvent, useState } from "react";

type SubmitStatus = "idle" | "loading" | "success" | "error";

type ContactFormProps = {
  /** Support-Seite (kompakt) vs. Landing „Jetzt anfragen“ */
  variant?: "landing" | "support";
};

export default function ContactForm({ variant = "landing" }: ContactFormProps) {
  const isSupport = variant === "support";
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [name, setName] = useState("");
  const [praxisname, setPraxisname] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          praxisname,
          email,
          message,
        }),
      });

      let data: { error?: string } = {};
      try {
        data = (await res.json()) as { error?: string };
      } catch {
        data = {};
      }

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          typeof data.error === "string"
            ? data.error
            : "E-Mail konnte nicht gesendet werden.",
        );
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage(
        "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.",
      );
    }
  }

  const inputClass =
    "w-full rounded-lg border border-brand-surface px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary";

  const idKontakt = isSupport ? undefined : "kontakt";
  const outerClass = isSupport
    ? ""
    : "bg-brand-bg py-20";
  const innerClass = isSupport
    ? "mx-auto w-full max-w-xl"
    : "mx-auto max-w-6xl px-4 md:px-6";

  return (
    <div id={idKontakt} className={outerClass}>
      <div className={innerClass}>
        <h2 className="text-center text-2xl font-bold text-brand-ink">
          {isSupport ? "Nachricht an den Support" : "Jetzt anfragen"}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-brand-text">
          {isSupport
            ? "Technische Fragen, Feedback oder Vertrags-Themen: Wir melden uns bei Ihnen."
            : "Wir richten alles ein. Sie müssen nur das Formular ausfüllen."}
        </p>

        <div
          className={
            isSupport
              ? "mx-auto mt-8 rounded-xl border border-brand-surface bg-white p-6 md:p-8"
              : "mx-auto mt-10 max-w-xl rounded-xl border border-brand-surface bg-white p-8"
          }
        >
          {status === "success" ? (
            <p className="text-center text-lg font-medium text-green-700">
              Vielen Dank! Wir melden uns bald.
            </p>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {status === "error" && errorMessage ? (
                <p
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {errorMessage}
                </p>
              ) : null}

              <div>
                <label
                  htmlFor={isSupport ? "support-contact-name" : "contact-name"}
                  className="text-sm font-medium text-brand-text"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id={isSupport ? "support-contact-name" : "contact-name"}
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  disabled={status === "loading"}
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                  className={`mt-2 ${inputClass}`}
                />
              </div>

              <div>
                <label
                  htmlFor={
                    isSupport ? "support-contact-praxisname" : "contact-praxisname"
                  }
                  className="text-sm font-medium text-brand-text"
                >
                  Praxisname <span className="text-red-500">*</span>
                </label>
                <input
                  id={isSupport ? "support-contact-praxisname" : "contact-praxisname"}
                  name="praxisname"
                  type="text"
                  autoComplete="organization"
                  required
                  disabled={status === "loading"}
                  value={praxisname}
                  onChange={(ev) => setPraxisname(ev.target.value)}
                  className={`mt-2 ${inputClass}`}
                />
              </div>

              <div>
                <label
                  htmlFor={isSupport ? "support-contact-email" : "contact-email"}
                  className="text-sm font-medium text-brand-text"
                >
                  E-Mail <span className="text-red-500">*</span>
                </label>
                <input
                  id={isSupport ? "support-contact-email" : "contact-email"}
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={status === "loading"}
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  className={`mt-2 ${inputClass}`}
                />
              </div>

              <div>
                <label
                  htmlFor={isSupport ? "support-contact-message" : "contact-message"}
                  className="text-sm font-medium text-brand-text"
                >
                  Nachricht <span className="text-red-500">*</span>
                </label>
                <textarea
                  id={isSupport ? "support-contact-message" : "contact-message"}
                  name="message"
                  rows={5}
                  required
                  disabled={status === "loading"}
                  value={message}
                  onChange={(ev) => setMessage(ev.target.value)}
                  className={`mt-2 resize-y ${inputClass}`}
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-lg bg-brand-primary px-8 py-4 font-semibold text-white transition-colors hover:bg-brand-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSupport ? "Nachricht senden →" : "Jetzt anfragen →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

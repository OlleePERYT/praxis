"use client";

import { type FormEvent, useState } from "react";
import Eyebrow from "@/components/ui/Eyebrow";

type SubmitStatus = "idle" | "loading" | "success" | "error";

type ContactFormProps = {
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

  const inputLanding =
    "w-full rounded-xl border border-brand-surface bg-white px-4 py-3 text-brand-ink outline-none transition-colors placeholder:text-brand-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";

  const inputSupport =
    "w-full rounded-lg border border-brand-surface px-4 py-3 text-brand-ink outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";

  const ic = isSupport ? inputSupport : inputLanding;

  if (isSupport) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <h2 className="text-center text-2xl font-bold text-brand-ink">
          Nachricht an den Support
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-brand-text">
          Technische Fragen, Feedback oder Vertrags-Themen: Wir melden uns bei
          Ihnen.
        </p>
        <div className="mx-auto mt-8 rounded-xl border border-brand-surface bg-white p-6 md:p-8">
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
              <Field
                label="Name"
                id="support-contact-name"
                type="text"
                autoComplete="name"
                required
                disabled={status === "loading"}
                value={name}
                onChange={setName}
                inputClass={ic}
              />
              <Field
                label="Praxisname"
                id="support-contact-praxisname"
                type="text"
                autoComplete="organization"
                required
                disabled={status === "loading"}
                value={praxisname}
                onChange={setPraxisname}
                inputClass={ic}
              />
              <Field
                label="E-Mail"
                id="support-contact-email"
                type="email"
                autoComplete="email"
                required
                disabled={status === "loading"}
                value={email}
                onChange={setEmail}
                inputClass={ic}
              />
              <div>
                <label
                  htmlFor="support-contact-message"
                  className="text-sm font-medium text-brand-text"
                >
                  Nachricht <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="support-contact-message"
                  name="message"
                  rows={5}
                  required
                  disabled={status === "loading"}
                  value={message}
                  onChange={(ev) => setMessage(ev.target.value)}
                  className={`mt-2 resize-y ${ic}`}
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-lg bg-brand-primary px-8 py-4 font-semibold text-white transition-colors hover:bg-brand-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                Nachricht senden →
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="kontakt" className="bg-brand-bg py-24 md:py-[100px]">
      <div className="mx-auto max-w-xl px-4 md:px-6">
        <div className="text-center">
          <Eyebrow>Jetzt anfragen</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold text-brand-ink md:text-4xl">
            Wir richten alles ein.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-brand-text">
            Sie füllen nur dieses Formular aus — wir melden uns mit einem
            konkreten Vorschlag.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-brand-surface bg-white p-8 shadow-sm">
          {status === "success" ? (
            <p className="text-center text-lg font-medium text-green-700">
              Vielen Dank! Wir melden uns bald.
            </p>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {status === "error" && errorMessage ? (
                <p
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {errorMessage}
                </p>
              ) : null}

              <Field
                label="Name"
                id="contact-name"
                type="text"
                autoComplete="name"
                required
                disabled={status === "loading"}
                value={name}
                onChange={setName}
                inputClass={inputLanding}
                labelBold
              />
              <Field
                label="Praxisname"
                id="contact-praxisname"
                type="text"
                autoComplete="organization"
                required
                disabled={status === "loading"}
                value={praxisname}
                onChange={setPraxisname}
                inputClass={inputLanding}
                labelBold
              />
              <Field
                label="E-Mail"
                id="contact-email"
                type="email"
                autoComplete="email"
                required
                disabled={status === "loading"}
                value={email}
                onChange={setEmail}
                inputClass={inputLanding}
                labelBold
              />
              <div>
                <label
                  htmlFor="contact-message"
                  className="text-sm font-semibold text-brand-text"
                >
                  Nachricht <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  disabled={status === "loading"}
                  value={message}
                  onChange={(ev) => setMessage(ev.target.value)}
                  className={`mt-2 resize-y ${inputLanding}`}
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-xl bg-gradient-to-br from-brand-primary to-[#3a8763] px-8 py-4 font-semibold text-white shadow-[var(--shadow-glow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow-md)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Jetzt anfragen →
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  type,
  autoComplete,
  required,
  disabled,
  value,
  onChange,
  inputClass,
  labelBold,
}: {
  label: string;
  id: string;
  type: string;
  autoComplete: string;
  required: boolean;
  disabled: boolean;
  value: string;
  onChange: (v: string) => void;
  inputClass: string;
  labelBold?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={
          labelBold
            ? "text-sm font-semibold text-brand-text"
            : "text-sm font-medium text-brand-text"
        }
      >
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        className={`mt-2 ${inputClass}`}
      />
    </div>
  );
}

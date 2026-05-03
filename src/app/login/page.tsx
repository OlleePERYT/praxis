import { AuthError } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import Card from "@/components/ui/Card";
import PraxisLogo from "@/components/ui/PraxisLogo";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const hasError = params.error === "credentials";

  async function loginAction(formData: FormData) {
    "use server";

    const email = formData.get("email");
    const password = formData.get("password");

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard",
      });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect("/login?error=credentials");
      }

      throw error;
    }
  }

  return (
    <div className="relative min-h-screen bg-brand-bg">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 80% 20%, rgba(82,183,136,0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 20% 80%, rgba(122,139,77,0.12) 0%, transparent 50%)
          `,
        }}
        aria-hidden
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card variant="glow" contentClassName="p-8">
            <div className="flex flex-col items-center text-center">
              <PraxisLogo size={40} />
              <p className="mt-3 text-lg text-brand-ink">
                praxis-<strong className="font-bold">kennzahlen</strong>
                <span className="text-brand-primary">.de</span>
              </p>
            </div>

            <h1 className="mt-8 text-center text-2xl font-bold text-brand-ink">
              Anmeldung
            </h1>
            <p className="mt-1 text-center text-sm text-brand-muted">
              Loggen Sie sich in Ihre Praxis-Instanz ein.
            </p>

            <form action={loginAction} className="mt-8 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-semibold text-brand-text"
                >
                  E-Mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@praxis.example"
                  className="w-full rounded-xl border border-[var(--color-brand-border-soft)] bg-white px-4 py-3 text-brand-ink placeholder:text-brand-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-semibold text-brand-text"
                >
                  Passwort
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[var(--color-brand-border-soft)] bg-white px-4 py-3 text-brand-ink placeholder:text-brand-muted focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>

              {hasError ? (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  Die Anmeldung ist leider fehlgeschlagen. Bitte prüfen Sie
                  E-Mail und Passwort und versuchen Sie es erneut.
                </div>
              ) : null}

              <button
                type="submit"
                className="mt-6 w-full rounded-xl bg-gradient-to-br from-brand-primary to-[#3a8763] py-3 text-base font-semibold text-white shadow-[var(--shadow-glow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow-md)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anmelden →
              </button>
            </form>
          </Card>

          <p className="mt-6 text-center text-xs text-brand-muted">
            Noch keine Lizenz?{" "}
            <Link
              href="/"
              className="text-brand-primary hover:underline"
            >
              Mehr über praxis-kennzahlen.de erfahren
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

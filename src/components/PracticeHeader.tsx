import { signOut } from "@/auth";
import { C } from "@/lib/colors";

type PracticeHeaderProps = {
  practiceName: string;
};

export function PracticeHeader({ practiceName }: PracticeHeaderProps) {
  async function logoutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <header
      className="border-b"
      style={{
        backgroundColor: C.white,
        borderColor: C.lightBg2,
      }}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4">
        <h1 className="truncate text-xl font-semibold sm:text-2xl" style={{ color: C.primary }}>
          {practiceName}
        </h1>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border px-3 py-1.5 text-sm"
            style={{ borderColor: C.lightBg2, color: C.gray }}
          >
            Abmelden
          </button>
        </form>
      </div>
    </header>
  );
}

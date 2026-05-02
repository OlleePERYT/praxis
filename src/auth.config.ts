import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Edge-kompatible NextAuth-Basis (kein @/db / kein better-sqlite3).
 * Wird von Middleware genutzt. Echte authorize-Logik liegt in src/auth.ts (Node).
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      // Edge: kein DB-Zugriff — Login läuft über vollständige Config in auth.ts
      authorize: async () => null,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = Number(user.id);
        token.practiceId = user.practiceId;
        token.practiceSubdomain = user.practiceSubdomain;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId);
        session.user.practiceId = token.practiceId as number;
        session.user.practiceSubdomain = token.practiceSubdomain as string;
      }

      return session;
    },
  },
};

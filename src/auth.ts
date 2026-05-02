import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { authConfig } from "@/auth.config";
import { db } from "@/db";
import { practices, users } from "@/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString();

        if (!email || !password) {
          return null;
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
          return null;
        }

        const practice = await db.query.practices.findFirst({
          where: eq(practices.id, user.practiceId),
        });

        if (!practice) {
          return null;
        }

        return {
          id: String(user.id),
          email: user.email,
          practiceId: user.practiceId,
          practiceSubdomain: practice.subdomain,
        };
      },
    }),
  ],
});

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: number;
      practiceId: number;
      practiceSubdomain: string;
    };
  }

  interface User {
    id: string;
    practiceId: number;
    practiceSubdomain: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: number;
    practiceId: number;
    practiceSubdomain: string;
  }
}

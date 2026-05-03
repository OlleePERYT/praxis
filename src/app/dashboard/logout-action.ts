"use server";

import { signOut } from "@/auth";

export async function logoutFromDashboard() {
  await signOut({ redirectTo: "/login" });
}

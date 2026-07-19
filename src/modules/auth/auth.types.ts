import type { User } from "@prisma/client";

export type SafeUser = Omit<User, "passwordHash" | "resetToken" | "resetTokenExpiresAt">;

export type AuthResponse = {
  user: SafeUser;
  accessToken: string;
};

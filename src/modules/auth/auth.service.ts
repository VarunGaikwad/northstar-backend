import crypto from "crypto";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../utils/ApiError";
import { comparePassword, hashPassword } from "../../utils/hash";
import { signAccessToken } from "../../utils/jwt";
import { sendPasswordResetEmail } from "../../utils/email";
import type { User } from "@prisma/client";
import type { AuthResponse, SafeUser } from "./auth.types";

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour

function sanitizeUser(user: User): SafeUser {
  const {
    passwordHash: _passwordHash,
    resetToken: _resetToken,
    resetTokenExpiresAt: _resetTokenExpiresAt,
    ...safeUser
  } = user;
  return safeUser;
}

function buildAuthResponse(user: User): AuthResponse {
  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: sanitizeUser(user),
    accessToken,
  };
}

export async function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<AuthResponse> {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ApiError("An account with this email already exists", 409);
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
    },
  });

  return buildAuthResponse(user);
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new ApiError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new ApiError("Account is deactivated", 403);
  }

  const isPasswordValid = await comparePassword(data.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError("Invalid email or password", 401);
  }

  return buildAuthResponse(user);
}

export async function forgotPassword(data: { email: string }): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  // Always return the same response so we don't leak whether the email exists.
  if (!user) {
    return;
  }

  const rawToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
  const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: rawToken,
      resetTokenExpiresAt,
    },
  });

  // Fire-and-forget email; failures are logged but not exposed to the client.
  sendPasswordResetEmail(user.email, rawToken).catch((err) => {
    console.error("Failed to send password reset email:", err);
  });
}

export async function resetPassword(data: {
  token: string;
  password: string;
}): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { resetToken: data.token },
  });

  if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
    throw new ApiError("Invalid or expired reset token", 400);
  }

  const passwordHash = await hashPassword(data.password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiresAt: null,
    },
  });
}

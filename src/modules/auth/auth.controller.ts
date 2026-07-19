import type { Request, Response } from "express";
import * as authService from "./auth.service";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "./auth.validation";

export async function register(req: Request<{}, {}, RegisterInput>, res: Response): Promise<void> {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
}

export async function login(req: Request<{}, {}, LoginInput>, res: Response): Promise<void> {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, data: result });
}

export async function forgotPassword(req: Request<{}, {}, ForgotPasswordInput>, res: Response): Promise<void> {
  await authService.forgotPassword(req.body);
  res.status(200).json({
    success: true,
    message: "If an account with that email exists, a reset link has been sent.",
  });
}

export async function resetPassword(req: Request<{}, {}, ResetPasswordInput>, res: Response): Promise<void> {
  await authService.resetPassword(req.body);
  res.status(200).json({
    success: true,
    message: "Password reset successfully. Please log in with your new password.",
  });
}

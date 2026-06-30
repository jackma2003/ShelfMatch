import { z } from "zod";

export const signupSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const resendVerificationSchema = z.object({
  email: z.email(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

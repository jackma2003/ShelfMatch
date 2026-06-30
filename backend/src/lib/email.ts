import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "ShelfMatch <onboarding@resend.dev>";

export async function sendVerificationEmail(to: string, name: string, verifyUrl: string) {
  if (!resend) {
    console.log(`[email:dev] RESEND_API_KEY not set — verification link for ${to}:\n${verifyUrl}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Verify your ShelfMatch email",
    html: `
      <p>Hi ${name},</p>
      <p>Confirm your email to start using ShelfMatch:</p>
      <p><a href="${verifyUrl}">Verify email address</a></p>
      <p>This link expires in 24 hours. If you didn't sign up for ShelfMatch, you can ignore this email.</p>
    `,
  });

  if (error) {
    console.error("Failed to send verification email:", error);
  }
}

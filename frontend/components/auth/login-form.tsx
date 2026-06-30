"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, useLogin, useResendVerification } from "@/hooks/use-auth";
import { loginSchema, type LoginFormValues } from "@/lib/validators/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const resendVerification = useResendVerification();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values, {
      onSuccess: () => router.push("/dashboard"),
    });
  };

  const isUnverified =
    login.isError && login.error instanceof ApiError && login.error.code === "EMAIL_NOT_VERIFIED";
  const invalidTokenRedirect = searchParams.get("error") === "invalid_token";

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Log in to see what you can make right now.</CardDescription>
      </CardHeader>
      <CardContent>
        {invalidTokenRedirect && !login.isError && (
          <p className="text-destructive mb-4 text-sm">
            That verification link is invalid or has expired. Request a new one below by trying
            to log in.
          </p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          {login.isError && (
            <div className="space-y-2">
              <p className="text-sm text-destructive">
                {login.error instanceof ApiError ? login.error.message : "Something went wrong"}
              </p>
              {isUnverified && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={resendVerification.isPending || resendVerification.isSuccess}
                  onClick={() => resendVerification.mutate(getValues("email"))}
                >
                  {resendVerification.isSuccess
                    ? "Verification email sent"
                    : resendVerification.isPending
                      ? "Sending..."
                      : "Resend verification email"}
                </Button>
              )}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? "Logging in..." : "Log in"}
          </Button>
        </form>
        <div className="my-4 flex items-center gap-3">
          <div className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs">OR</span>
          <div className="bg-border h-px flex-1" />
        </div>
        <GoogleButton />
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-foreground underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

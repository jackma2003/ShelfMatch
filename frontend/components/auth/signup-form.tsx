"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { GoogleButton } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignup } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-client";
import { signupSchema, type SignupFormValues } from "@/lib/validators/auth";

export function SignupForm() {
  const signup = useSignup();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = (values: SignupFormValues) => {
    signup.mutate(values, {
      onSuccess: () => setSubmittedEmail(values.email),
    });
  };

  if (submittedEmail) {
    return (
      <Card className="w-full max-w-sm shadow-lg shadow-foreground/5">
        <CardHeader>
          <div className="mb-2 text-4xl">📬</div>
          <CardTitle className="text-xl font-bold">Check your inbox</CardTitle>
          <CardDescription>
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">{submittedEmail}</span>.
            Click it to activate your account, then log in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/login"
            className="text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            ← Back to log in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm shadow-lg shadow-foreground/5">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold">Create your account</CardTitle>
        <CardDescription>Start turning what&apos;s in your kitchen into meals.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              className="h-10"
              placeholder="Your name"
              {...register("name")}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="h-10"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              className="h-10"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          {signup.isError && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {signup.error instanceof ApiError ? signup.error.message : "Something went wrong"}
            </p>
          )}
          <Button type="submit" className="w-full h-10" disabled={signup.isPending}>
            {signup.isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <GoogleButton />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

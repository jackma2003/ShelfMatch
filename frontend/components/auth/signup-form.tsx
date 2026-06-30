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
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a verification link to <span className="font-medium">{submittedEmail}</span>.
            Click it to activate your account, then log in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className="text-foreground text-sm underline underline-offset-4">
            Back to log in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start turning what&apos;s in your kitchen into meals.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" type="text" autoComplete="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
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
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          {signup.isError && (
            <p className="text-sm text-destructive">
              {signup.error instanceof ApiError ? signup.error.message : "Something went wrong"}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={signup.isPending}>
            {signup.isPending ? "Creating account..." : "Sign up"}
          </Button>
        </form>
        <div className="my-4 flex items-center gap-3">
          <div className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs">OR</span>
          <div className="bg-border h-px flex-1" />
        </div>
        <GoogleButton />
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground underline underline-offset-4">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

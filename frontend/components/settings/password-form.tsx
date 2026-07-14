"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/hooks/use-auth";
import { useChangePassword } from "@/hooks/use-settings";
import { ApiError } from "@/lib/api-client";
import { changePasswordSchema, type ChangePasswordFormValues } from "@/lib/validators/settings";

export function PasswordForm({ user }: { user: User }) {
  const changePassword = useChangePassword();
  const id = useId();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = (values: ChangePasswordFormValues) => {
    changePassword.mutate(values, { onSuccess: () => reset() });
  };

  if (!user.hasPassword) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            You signed in with Google — there&apos;s no password to change.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Change your account password.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-current`}>Current password</Label>
            <Input
              id={`${id}-current`}
              type="password"
              autoComplete="current-password"
              className="h-10"
              {...register("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="text-destructive text-sm">{errors.currentPassword.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-new`}>New password</Label>
            <Input
              id={`${id}-new`}
              type="password"
              autoComplete="new-password"
              className="h-10"
              {...register("newPassword")}
            />
            {errors.newPassword ? (
              <p className="text-destructive text-sm">{errors.newPassword.message}</p>
            ) : (
              <p className="text-muted-foreground text-sm">At least 8 characters.</p>
            )}
          </div>
          {changePassword.isError && (
            <p className="bg-destructive/10 text-destructive animate-fade-in rounded-lg px-3 py-2 text-sm">
              {changePassword.error instanceof ApiError
                ? changePassword.error.message
                : "Something went wrong"}
            </p>
          )}
          <Button type="submit" disabled={changePassword.isPending} className="h-9">
            {changePassword.isPending ? "Updating..." : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

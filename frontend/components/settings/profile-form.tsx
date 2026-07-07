"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/use-settings";
import { ApiError } from "@/lib/api-client";
import { updateProfileSchema, type UpdateProfileFormValues } from "@/lib/validators/settings";

export function ProfileForm({ user }: { user: User }) {
  const updateProfile = useUpdateProfile();
  const id = useId();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user.name },
  });

  const onSubmit = (values: UpdateProfileFormValues) => {
    updateProfile.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your display name.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={`${id}-name`}>Name</Label>
            <Input id={`${id}-name`} className="h-10" {...register("name")} />
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
          </div>
          {updateProfile.isError && (
            <p className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">
              {updateProfile.error instanceof ApiError
                ? updateProfile.error.message
                : "Something went wrong"}
            </p>
          )}
          {updateProfile.isSuccess && <p className="text-sm text-green-600">Saved.</p>}
          <Button type="submit" disabled={updateProfile.isPending} className="h-9">
            {updateProfile.isPending ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

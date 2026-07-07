"use client";

import { DangerZone } from "@/components/settings/danger-zone";
import { PasswordForm } from "@/components/settings/password-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { useMe } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { data: user } = useMe();
  if (!user) return null;

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your account.</p>
      </div>
      <div className="space-y-6">
        <ProfileForm user={user} />
        <PasswordForm user={user} />
        <DangerZone />
      </div>
    </main>
  );
}

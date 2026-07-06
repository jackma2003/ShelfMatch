"use client";

import { AuthGuard } from "@/components/layout/auth-guard";
import { Navbar } from "@/components/layout/navbar";
import { DangerZone } from "@/components/settings/danger-zone";
import { PasswordForm } from "@/components/settings/password-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { useMe } from "@/hooks/use-auth";

function SettingsContent() {
  const { data: user } = useMe();
  if (!user) return null;

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account.</p>
      </div>
      <div className="space-y-6">
        <ProfileForm user={user} />
        <PasswordForm user={user} />
        <DangerZone />
      </div>
    </main>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <Navbar />
      <SettingsContent />
    </AuthGuard>
  );
}

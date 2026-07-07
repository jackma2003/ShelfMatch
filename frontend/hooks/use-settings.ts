import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useToastManager } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api-client";
import type { ChangePasswordFormValues, UpdateProfileFormValues } from "@/lib/validators/settings";
import { ME_QUERY_KEY, type User } from "@/hooks/use-auth";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const toastManager = useToastManager();
  return useMutation({
    mutationFn: (input: UpdateProfileFormValues) =>
      apiFetch<{ user: User }>("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(ME_QUERY_KEY, user);
      toastManager.add({ title: "Profile saved" });
    },
  });
}

export function useChangePassword() {
  const toastManager = useToastManager();
  return useMutation({
    mutationFn: (input: ChangePasswordFormValues) =>
      apiFetch<{ success: true }>("/api/users/me/password", {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      toastManager.add({ title: "Password updated" });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<{ success: true }>("/api/users/me", { method: "DELETE" }),
    onSuccess: () => {
      queryClient.setQueryData(ME_QUERY_KEY, null);
      queryClient.clear();
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError, apiFetch } from "@/lib/api-client";
import type { LoginFormValues, SignupFormValues } from "@/lib/validators/auth";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: string;
}

const ME_QUERY_KEY = ["auth", "me"];

export function useMe() {
  return useQuery<User>({
    queryKey: ME_QUERY_KEY,
    queryFn: async () => {
      const { user } = await apiFetch<{ user: User }>("/api/auth/me");
      return user;
    },
    retry: false,
  });
}

// Signup no longer logs the user in — the account stays unverified until they
// click the link in their verification email, so there's no session to cache yet.
export function useSignup() {
  return useMutation({
    mutationFn: (input: SignupFormValues) =>
      apiFetch<{ user: User }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginFormValues) =>
      apiFetch<{ user: User }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(ME_QUERY_KEY, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<{ success: true }>("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.setQueryData(ME_QUERY_KEY, null);
      queryClient.clear();
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) =>
      apiFetch<{ message: string }>("/api/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
  });
}

export { ApiError };

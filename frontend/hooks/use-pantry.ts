import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { PantryCategory } from "@/lib/pantry-categories";
import type { PantryItemFormValues } from "@/lib/validators/pantry";

export interface PantryItem {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  unit: string;
  category: PantryCategory;
  expirationDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const PANTRY_QUERY_KEY = ["pantry"];

export function usePantryItems(sort?: "expiring") {
  return useQuery<PantryItem[]>({
    queryKey: [...PANTRY_QUERY_KEY, sort ?? "default"],
    queryFn: async () => {
      const search = sort ? `?sort=${sort}` : "";
      const { items } = await apiFetch<{ items: PantryItem[] }>(`/api/pantry${search}`);
      return items;
    },
  });
}

export function useCreatePantryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PantryItemFormValues) =>
      apiFetch<{ item: PantryItem }>("/api/pantry", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PANTRY_QUERY_KEY });
    },
  });
}

export function useUpdatePantryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PantryItemFormValues }) =>
      apiFetch<{ item: PantryItem }>(`/api/pantry/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PANTRY_QUERY_KEY });
    },
  });
}

export function useDeletePantryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ success: true }>(`/api/pantry/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PANTRY_QUERY_KEY });
    },
  });
}

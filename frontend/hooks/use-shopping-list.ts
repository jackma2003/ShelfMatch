import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";

export interface ShoppingListItem {
  id: string;
  userId: string;
  recipeId: string | null;
  recipe: { title: string } | null;
  name: string;
  quantity: number;
  unit: string;
  isChecked: boolean;
  createdAt: string;
}

const SHOPPING_LIST_QUERY_KEY = ["shopping-list"];

export function useShoppingListItems() {
  return useQuery<ShoppingListItem[]>({
    queryKey: SHOPPING_LIST_QUERY_KEY,
    queryFn: async () => {
      const { items } = await apiFetch<{ items: ShoppingListItem[] }>("/api/shopping-list");
      return items;
    },
  });
}

interface ManualAddInput {
  name: string;
  quantity: number;
  unit: string;
}

export function useAddShoppingListItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ManualAddInput) =>
      apiFetch<{ items: ShoppingListItem[] }>("/api/shopping-list", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOPPING_LIST_QUERY_KEY });
    },
  });
}

export function useAddMissingFromRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recipeId: string) =>
      apiFetch<{ items: ShoppingListItem[] }>("/api/shopping-list", {
        method: "POST",
        body: JSON.stringify({ recipeId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOPPING_LIST_QUERY_KEY });
    },
  });
}

export function useUpdateShoppingListItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ManualAddInput & { isChecked: boolean }> }) =>
      apiFetch<{ item: ShoppingListItem }>(`/api/shopping-list/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOPPING_LIST_QUERY_KEY });
    },
  });
}

export function useDeleteShoppingListItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: true }>(`/api/shopping-list/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOPPING_LIST_QUERY_KEY });
    },
  });
}

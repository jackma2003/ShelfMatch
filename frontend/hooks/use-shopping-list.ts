import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useToastManager } from "@/components/ui/toast";
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
  const toastManager = useToastManager();
  return useMutation({
    mutationFn: (input: ManualAddInput) =>
      apiFetch<{ items: ShoppingListItem[] }>("/api/shopping-list", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOPPING_LIST_QUERY_KEY });
      toastManager.add({ title: "Added to your list" });
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
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<ManualAddInput & { isChecked: boolean }>;
    }) =>
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
  const toastManager = useToastManager();
  const addItem = useAddShoppingListItem();
  return useMutation({
    mutationFn: (item: ShoppingListItem) =>
      apiFetch<{ success: true }>(`/api/shopping-list/${item.id}`, { method: "DELETE" }),
    onSuccess: (_data, item) => {
      queryClient.invalidateQueries({ queryKey: SHOPPING_LIST_QUERY_KEY });
      toastManager.add({
        title: "Removed from list",
        actionProps: {
          children: "Undo",
          onClick: () =>
            addItem.mutate({ name: item.name, quantity: item.quantity, unit: item.unit }),
        },
      });
    },
  });
}

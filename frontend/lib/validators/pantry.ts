import { z } from "zod";

import { PANTRY_CATEGORIES } from "@/lib/pantry-categories";

export const pantryItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  unit: z.string().min(1, "Unit is required").max(20),
  category: z.enum(PANTRY_CATEGORIES),
  expirationDate: z.string().optional(),
});

// Input = what the form holds before submit (quantity as a raw string from the number input).
// Output = what the resolver produces after zod's coercion (quantity as a number) — this is
// what onSubmit actually receives and what the API expects.
export type PantryItemFormInput = z.input<typeof pantryItemSchema>;
export type PantryItemFormValues = z.output<typeof pantryItemSchema>;

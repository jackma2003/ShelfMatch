import { z } from "zod";

export const PANTRY_CATEGORIES = [
  "PRODUCE",
  "DAIRY",
  "MEAT_SEAFOOD",
  "GRAIN_BREAD",
  "CANNED_JARRED",
  "CONDIMENT_SAUCE",
  "SPICE_SEASONING",
  "BAKING",
  "FROZEN",
  "BEVERAGE",
  "OTHER",
] as const;

// HTML <input type="date"> sends "" rather than omitting the field when left blank — preprocess
// that to null before validation, since z.iso.date() rejects "" as an invalid ISO date.
const expirationDateField = z.preprocess(
  (val) => (val === "" ? null : val),
  z.iso.date().optional().nullable(),
);

export const createPantryItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unit: z.string().min(1, "Unit is required").max(20),
  category: z.enum(PANTRY_CATEGORIES).default("OTHER"),
  expirationDate: expirationDateField,
});

// Built independently rather than via createPantryItemSchema.partial(): .partial() only
// makes fields optional to omit, it doesn't strip .default() — an omitted `category` would
// still get filled with "OTHER" by Zod, which the service would then treat as an explicit
// change and overwrite an existing item's category on every partial update.
export const updatePantryItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  quantity: z.number().positive("Quantity must be greater than 0").optional(),
  unit: z.string().min(1, "Unit is required").max(20).optional(),
  category: z.enum(PANTRY_CATEGORIES).optional(),
  expirationDate: expirationDateField,
});

export const pantryListQuerySchema = z.object({
  sort: z.enum(["expiring"]).optional(),
});

export type CreatePantryItemInput = z.infer<typeof createPantryItemSchema>;
export type UpdatePantryItemInput = z.infer<typeof updatePantryItemSchema>;
export type PantryListQuery = z.infer<typeof pantryListQuerySchema>;

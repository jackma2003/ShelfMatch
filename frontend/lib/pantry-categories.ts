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

export type PantryCategory = (typeof PANTRY_CATEGORIES)[number];

export const PANTRY_CATEGORY_LABELS: Record<PantryCategory, string> = {
  PRODUCE: "Produce",
  DAIRY: "Dairy",
  MEAT_SEAFOOD: "Meat & Seafood",
  GRAIN_BREAD: "Grain & Bread",
  CANNED_JARRED: "Canned & Jarred",
  CONDIMENT_SAUCE: "Condiments & Sauces",
  SPICE_SEASONING: "Spices & Seasoning",
  BAKING: "Baking",
  FROZEN: "Frozen",
  BEVERAGE: "Beverages",
  OTHER: "Other",
};

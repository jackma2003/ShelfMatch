function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function isInPantry(ingredientName: string, pantryNames: string[]): boolean {
  const normalized = normalize(ingredientName);
  return pantryNames.some((pantryName) => {
    const normalizedPantryName = normalize(pantryName);
    return (
      normalizedPantryName === normalized ||
      normalizedPantryName.includes(normalized) ||
      normalized.includes(normalizedPantryName)
    );
  });
}

export function withMatchInfo<T extends { ingredients: { name: string }[] }>(
  recipe: T,
  pantryNames: string[],
) {
  const ingredients = recipe.ingredients.map((ingredient) => ({
    ...ingredient,
    inPantry: isInPantry(ingredient.name, pantryNames),
  }));
  const matchedCount = ingredients.filter((i) => i.inPantry).length;

  return {
    ...recipe,
    ingredients,
    matchedCount,
    totalCount: ingredients.length,
  };
}

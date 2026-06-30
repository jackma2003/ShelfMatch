import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

const recipes = [
  {
    title: "Garlic Butter Pasta",
    description: "A fast weeknight pasta that turns pantry basics into something craveable.",
    instructions: [
      "Bring a pot of salted water to a boil and cook pasta until al dente.",
      "Melt butter in a pan over medium heat and add minced garlic, cooking until fragrant.",
      "Toss the drained pasta in the garlic butter with a splash of pasta water.",
      "Season with salt, pepper, and grated parmesan before serving.",
    ],
    cookTimeMinutes: 20,
    difficulty: "EASY" as const,
    source: "SEED" as const,
    ingredients: [
      { name: "Pasta", quantity: 200, unit: "g" },
      { name: "Butter", quantity: 2, unit: "tbsp" },
      { name: "Garlic", quantity: 3, unit: "cloves" },
      { name: "Parmesan", quantity: 30, unit: "g", isOptional: true },
    ],
  },
  {
    title: "Veggie Fried Rice",
    description: "Use up leftover rice and whatever vegetables are starting to wilt.",
    instructions: [
      "Heat oil in a wok or large pan over high heat.",
      "Scramble the eggs and set aside.",
      "Stir-fry chopped vegetables until just tender.",
      "Add cold cooked rice, soy sauce, and the scrambled eggs, tossing until combined.",
    ],
    cookTimeMinutes: 15,
    difficulty: "EASY" as const,
    source: "SEED" as const,
    ingredients: [
      { name: "Cooked rice", quantity: 2, unit: "cups" },
      { name: "Eggs", quantity: 2, unit: "pieces" },
      { name: "Soy sauce", quantity: 2, unit: "tbsp" },
      { name: "Mixed vegetables", quantity: 1, unit: "cup" },
      { name: "Onion", quantity: 1, unit: "piece", isOptional: true },
    ],
  },
  {
    title: "Chicken & Broccoli Stir-Fry",
    description: "A protein-forward stir-fry built around two ingredients most fridges already have.",
    instructions: [
      "Slice chicken breast into thin strips and season with salt and pepper.",
      "Sear chicken in a hot pan with oil until cooked through, then remove.",
      "In the same pan, stir-fry broccoli florets until bright green and tender-crisp.",
      "Return the chicken to the pan, add soy sauce and garlic, and toss to combine.",
    ],
    cookTimeMinutes: 25,
    difficulty: "MEDIUM" as const,
    source: "SEED" as const,
    ingredients: [
      { name: "Chicken breast", quantity: 300, unit: "g" },
      { name: "Broccoli", quantity: 2, unit: "cups" },
      { name: "Soy sauce", quantity: 2, unit: "tbsp" },
      { name: "Garlic", quantity: 2, unit: "cloves" },
      { name: "Vegetable oil", quantity: 1, unit: "tbsp" },
    ],
  },
  {
    title: "Tomato & Egg Drop Soup",
    description: "A 10-minute soup that rescues soft tomatoes and a couple of eggs.",
    instructions: [
      "Saute chopped tomatoes in oil until they break down into a sauce.",
      "Add water or stock and bring to a simmer.",
      "Beat eggs and slowly drizzle them into the simmering soup while stirring.",
      "Season with salt, white pepper, and a drizzle of sesame oil.",
    ],
    cookTimeMinutes: 10,
    difficulty: "EASY" as const,
    source: "SEED" as const,
    ingredients: [
      { name: "Tomatoes", quantity: 3, unit: "pieces" },
      { name: "Eggs", quantity: 2, unit: "pieces" },
      { name: "Vegetable stock", quantity: 2, unit: "cups" },
      { name: "Sesame oil", quantity: 1, unit: "tsp", isOptional: true },
    ],
  },
];

async function main() {
  for (const { ingredients, ...recipe } of recipes) {
    await prisma.recipe.create({
      data: {
        ...recipe,
        ingredients: { create: ingredients },
      },
    });
  }
  console.log(`Seeded ${recipes.length} recipes.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

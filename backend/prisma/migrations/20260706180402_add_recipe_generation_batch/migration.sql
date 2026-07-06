-- CreateTable
CREATE TABLE "recipe_generation_batches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pantryHash" TEXT NOT NULL,
    "recipeIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_generation_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recipe_generation_batches_userId_pantryHash_idx" ON "recipe_generation_batches"("userId", "pantryHash");

-- AddForeignKey
ALTER TABLE "recipe_generation_batches" ADD CONSTRAINT "recipe_generation_batches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

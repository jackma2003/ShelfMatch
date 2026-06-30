"use client";

import { useState } from "react";

import { PantryItemForm } from "@/components/pantry/pantry-item-form";
import { PantryList } from "@/components/pantry/pantry-list";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreatePantryItem } from "@/hooks/use-pantry";
import type { PantryItemFormValues } from "@/lib/validators/pantry";

function PantryContent() {
  const [sortExpiring, setSortExpiring] = useState(false);
  const createItem = useCreatePantryItem();

  const handleCreate = (values: PantryItemFormValues) => {
    createItem.mutate(values);
  };

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Add to pantry</CardTitle>
          </CardHeader>
          <CardContent>
            <PantryItemForm
              onSubmit={handleCreate}
              submitLabel="Add item"
              isPending={createItem.isPending}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your pantry</h2>
          <div className="flex gap-2">
            <Button
              variant={sortExpiring ? "outline" : "default"}
              size="sm"
              onClick={() => setSortExpiring(false)}
            >
              All items
            </Button>
            <Button
              variant={sortExpiring ? "default" : "outline"}
              size="sm"
              onClick={() => setSortExpiring(true)}
            >
              Expiring soon
            </Button>
          </div>
        </div>

        <PantryList sortExpiring={sortExpiring} />
      </main>
    </div>
  );
}

export default function PantryPage() {
  return (
    <AuthGuard>
      <PantryContent />
    </AuthGuard>
  );
}

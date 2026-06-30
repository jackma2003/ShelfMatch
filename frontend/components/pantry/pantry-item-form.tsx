"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PANTRY_CATEGORIES, PANTRY_CATEGORY_LABELS } from "@/lib/pantry-categories";
import {
  pantryItemSchema,
  type PantryItemFormInput,
  type PantryItemFormValues,
} from "@/lib/validators/pantry";

interface PantryItemFormProps {
  defaultValues?: Partial<PantryItemFormInput>;
  onSubmit: (values: PantryItemFormValues) => void;
  submitLabel: string;
  isPending?: boolean;
}

export function PantryItemForm({
  defaultValues,
  onSubmit,
  submitLabel,
  isPending,
}: PantryItemFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PantryItemFormInput, unknown, PantryItemFormValues>({
    resolver: zodResolver(pantryItemSchema),
    defaultValues: {
      name: "",
      quantity: "",
      unit: "",
      category: "OTHER",
      expirationDate: "",
      ...defaultValues,
    },
  });

  const submit = (values: PantryItemFormValues) => {
    onSubmit(values);
    reset({ name: "", quantity: "", unit: "", category: "OTHER", expirationDate: "" });
  };

  const id = useId();
  const nameId = `${id}-name`;
  const quantityId = `${id}-quantity`;
  const unitId = `${id}-unit`;
  const categoryId = `${id}-category`;
  const expirationDateId = `${id}-expirationDate`;

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-2">
          <Label htmlFor={nameId}>Name</Label>
          <Input id={nameId} placeholder="e.g. Eggs" {...register("name")} />
          {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor={quantityId}>Quantity</Label>
          <Input id={quantityId} type="number" step="any" {...register("quantity")} />
          {errors.quantity && (
            <p className="text-destructive text-sm">{errors.quantity.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor={unitId}>Unit</Label>
          <Input id={unitId} placeholder="e.g. pieces" {...register("unit")} />
          {errors.unit && <p className="text-destructive text-sm">{errors.unit.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor={categoryId}>Category</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={categoryId} className="w-full">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {PANTRY_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {PANTRY_CATEGORY_LABELS[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={expirationDateId}>Expires (optional)</Label>
          <Input id={expirationDateId} type="date" {...register("expirationDate")} />
        </div>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

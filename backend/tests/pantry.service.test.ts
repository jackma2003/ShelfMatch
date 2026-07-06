import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  pantryItem: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../src/lib/prisma.js", () => ({ prisma: mockPrisma }));

const { listPantryItems, updatePantryItem, deletePantryItem } = await import(
  "../src/services/pantry.service.js"
);

const OWNER_ID = "user-1";
const OTHER_USER_ID = "user-2";
const ITEM_ID = "item-1";

const ownedItem = {
  id: ITEM_ID,
  userId: OWNER_ID,
  name: "Garlic",
  quantity: 3,
  unit: "cloves",
  category: "PRODUCE",
  expirationDate: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listPantryItems", () => {
  it("orders by category then name by default", async () => {
    mockPrisma.pantryItem.findMany.mockResolvedValue([]);

    await listPantryItems(OWNER_ID, { sort: undefined });

    expect(mockPrisma.pantryItem.findMany).toHaveBeenCalledWith({
      where: { userId: OWNER_ID },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  });

  it("orders by soonest-expiring first (nulls last) when sort=expiring", async () => {
    mockPrisma.pantryItem.findMany.mockResolvedValue([]);

    await listPantryItems(OWNER_ID, { sort: "expiring" });

    expect(mockPrisma.pantryItem.findMany).toHaveBeenCalledWith({
      where: { userId: OWNER_ID },
      orderBy: [{ expirationDate: { sort: "asc", nulls: "last" } }, { name: "asc" }],
    });
  });
});

describe("ownership checks", () => {
  it("refuses to update a pantry item belonging to another user", async () => {
    mockPrisma.pantryItem.findUnique.mockResolvedValue(ownedItem);

    await expect(
      updatePantryItem(OTHER_USER_ID, ITEM_ID, { name: "Hijacked" }),
    ).rejects.toMatchObject({ statusCode: 404 });

    expect(mockPrisma.pantryItem.update).not.toHaveBeenCalled();
  });

  it("refuses to delete a pantry item belonging to another user", async () => {
    mockPrisma.pantryItem.findUnique.mockResolvedValue(ownedItem);

    await expect(deletePantryItem(OTHER_USER_ID, ITEM_ID)).rejects.toMatchObject({ statusCode: 404 });

    expect(mockPrisma.pantryItem.delete).not.toHaveBeenCalled();
  });

  it("404s on a missing item rather than leaking existence", async () => {
    mockPrisma.pantryItem.findUnique.mockResolvedValue(null);

    await expect(deletePantryItem(OWNER_ID, "does-not-exist")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("allows the owner to update their own item", async () => {
    mockPrisma.pantryItem.findUnique.mockResolvedValue(ownedItem);
    mockPrisma.pantryItem.update.mockResolvedValue({ ...ownedItem, name: "Shallot" });

    const updated = await updatePantryItem(OWNER_ID, ITEM_ID, { name: "Shallot" });

    expect(updated.name).toBe("Shallot");
    expect(mockPrisma.pantryItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: ITEM_ID } }),
    );
  });
});

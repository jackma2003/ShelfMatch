import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../src/lib/prisma.js", () => ({ prisma: mockPrisma }));

const { updateProfile, changePassword, deleteAccount } = await import("../src/services/user.service.js");

const USER_ID = "user-1";

const baseUser = {
  id: USER_ID,
  email: "cook@example.com",
  name: "Cook",
  avatarUrl: null,
  emailVerified: true,
  createdAt: new Date("2026-01-01"),
  passwordHash: null as string | null,
  googleId: null as string | null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateProfile", () => {
  it("updates the user's name and returns the public shape", async () => {
    mockPrisma.user.update.mockResolvedValue({ ...baseUser, name: "New Name" });

    const user = await updateProfile(USER_ID, { name: "New Name" });

    expect(user.name).toBe("New Name");
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: USER_ID },
      data: { name: "New Name" },
    });
  });
});

describe("changePassword", () => {
  it("rejects a Google-only account with no password to change", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash: null });

    await expect(
      changePassword(USER_ID, { currentPassword: "anything", newPassword: "newpassword123" }),
    ).rejects.toMatchObject({ statusCode: 400, code: "GOOGLE_ACCOUNT" });
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it("rejects an incorrect current password", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 10);
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash });

    await expect(
      changePassword(USER_ID, { currentPassword: "wrong-password", newPassword: "newpassword123" }),
    ).rejects.toMatchObject({ statusCode: 401 });
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it("hashes and stores the new password when the current one is correct", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 10);
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash });
    mockPrisma.user.update.mockResolvedValue({ ...baseUser });

    await changePassword(USER_ID, { currentPassword: "correct-password", newPassword: "newpassword123" });

    const updateCall = mockPrisma.user.update.mock.calls[0][0];
    expect(updateCall.where).toEqual({ id: USER_ID });
    expect(await bcrypt.compare("newpassword123", updateCall.data.passwordHash)).toBe(true);
  });
});

describe("deleteAccount", () => {
  it("deletes the user by id", async () => {
    mockPrisma.user.delete.mockResolvedValue(baseUser);

    await deleteAccount(USER_ID);

    expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: USER_ID } });
  });
});

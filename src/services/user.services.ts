import prisma from "../db";
import type { UpdateProfileInput } from "../validators/user.schema";

export const userService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    // Check if new email already exists
    if (input.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new Error("Email already in use");
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        email: input.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    return updatedUser;
  },
};

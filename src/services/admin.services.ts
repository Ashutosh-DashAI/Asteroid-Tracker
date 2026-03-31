import prisma from "../db";

export const adminService = {
  async getAllUsers(limit: number = 20, offset: number = 0) {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        isVerified: true,
        isBanned: true,
        createdAt: true,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.user.count();

    return {
      users,
      total,
      hasMore: offset + limit < total,
    };
  },

  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: "User deleted successfully" };
  },

  async banUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.isBanned) {
      throw new Error("User is already banned");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isBanned: true },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        isBanned: true,
      },
    });

    return updated;
  },

  async unbanUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isBanned) {
      throw new Error("User is not banned");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isBanned: false },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        isBanned: true,
      },
    });

    return updated;
  },

  async getSystemStats() {
    const totalUsers = await prisma.user.count();
    const totalConversations = await prisma.conversation.count();
    const totalMessages = await prisma.message.count();
    const totalNotifications = await prisma.notification.count();
    const bannedUsers = await prisma.user.count({ where: { isBanned: true } });
    const verifiedUsers = await prisma.user.count({ where: { isVerified: true } });

    // Get last 7 days users
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    return {
      totalUsers,
      totalConversations,
      totalMessages,
      totalNotifications,
      bannedUsers,
      verifiedUsers,
      newUsersInLastWeek: newUsers,
    };
  },

  async getLatestRegisteredUsers(limit: number = 10) {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        createdAt: true,
        isVerified: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return users;
  },
};

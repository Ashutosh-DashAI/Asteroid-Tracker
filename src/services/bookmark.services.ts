import prisma from "../db";

export const bookmarkService = {
  async bookmarkMessage(messageId: string, userId: string) {
    // Check if message exists
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    // Check if already bookmarked
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_messageId: {
          userId,
          messageId,
        },
      },
    });

    if (existingBookmark) {
      throw new Error("Message already bookmarked");
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        messageId,
      },
      include: {
        message: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return bookmark;
  },

  async removeBookmark(messageId: string, userId: string) {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_messageId: {
          userId,
          messageId,
        },
      },
    });

    if (!bookmark) {
      throw new Error("Bookmark not found");
    }

    await prisma.bookmark.delete({
      where: {
        userId_messageId: {
          userId,
          messageId,
        },
      },
    });

    return { message: "Bookmark removed" };
  },

  async getBookmarkedMessages(userId: string, limit: number = 20, offset: number = 0) {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        message: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.bookmark.count({
      where: { userId },
    });

    return {
      bookmarks,
      total,
      hasMore: offset + limit < total,
    };
  },
};

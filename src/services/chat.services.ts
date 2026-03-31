import prisma from "../db";
import type { SendMessageInput } from "../validators/chat.schema";

export const chatService = {
  async createConversation(participantId: string, userId: string) {
    if (participantId === userId) {
      throw new Error("Cannot create conversation with yourself");
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            OR: [
              {
                participantOneId: userId,
                participantTwoId: participantId,
              },
              {
                participantOneId: participantId,
                participantTwoId: userId,
              },
            ],
          },
        ],
      },
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        participantOneId: userId,
        participantTwoId: participantId,
      },
    });

    return conversation;
  },

  async getConversations(userId: string, limit: number = 20, offset: number = 0) {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ participantOneId: userId }, { participantTwoId: userId }],
      },
      include: {
        participantOne: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        participantTwo: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            content: true,
            createdAt: true,
            sender: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.conversation.count({
      where: {
        OR: [{ participantOneId: userId }, { participantTwoId: userId }],
      },
    });

    return {
      conversations,
      total,
      hasMore: offset + limit < total,
    };
  },

  async getMessages(conversationId: string, limit: number = 50, offset: number = 0) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
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
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.message.count({
      where: { conversationId },
    });

    return {
      messages: messages.reverse(),
      total,
      hasMore: offset + limit < total,
    };
  },

  async sendMessage(input: SendMessageInput, senderId: string) {
    // Get or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            OR: [
              {
                participantOneId: senderId,
                participantTwoId: input.receiverId,
              },
              {
                participantOneId: input.receiverId,
                participantTwoId: senderId,
              },
            ],
          },
        ],
      },
    });

    if (!conversation) {
      conversation = await this.createConversation(input.receiverId, senderId);
    }

    // Send message
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: input.receiverId,
        conversationId: conversation.id,
        content: input.content,
      },
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
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: input.receiverId,
        type: "MESSAGE",
        title: "New Message",
        message: `${message.sender.name} sent you a message`,
      },
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return message;
  },

  async markAsRead(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.receiverId !== userId) {
      throw new Error("Not authorized to mark this message as read");
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
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
    });

    return updatedMessage;
  },

  async editMessage(messageId: string, content: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== userId) {
      throw new Error("Not authorized to edit this message");
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { content },
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
    });

    return updatedMessage;
  },

  async deleteMessage(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.senderId !== userId) {
      throw new Error("Not authorized to delete this message");
    }

    const deletedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { deletedBy: userId, content: "[deleted]" },
    });

    return { message: "Message deleted successfully" };
  },
};

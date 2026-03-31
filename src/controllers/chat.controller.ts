import type { Request, Response } from "express";
import { chatService } from "../services/chat.services";
import { sendSuccess, sendError } from "../utils/sendResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const chatController = {
  createConversation: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const { participantId } = req.body;
    const conversation = await chatService.createConversation(participantId, req.user.userId);
    return sendSuccess(res, 201, "Conversation created", conversation);
  }),

  getConversations: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const { limit = 20, offset = 0 } = req.query;
    const result = await chatService.getConversations(
      req.user.userId,
      Number(limit),
      Number(offset)
    );
    return sendSuccess(res, 200, "Conversations fetched", result);
  }),

  getMessages: asyncHandler(async (req: Request, res: Response) => {
    const { conversationId } = req.params as { conversationId: string };
    const { limit = 50, offset = 0 } = req.query;

    const result = await chatService.getMessages(conversationId, Number(limit), Number(offset));
    return sendSuccess(res, 200, "Messages fetched", result);
  }),

  sendMessage: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const message = await chatService.sendMessage(req.body, req.user.userId);
    return sendSuccess(res, 201, "Message sent", message);
  }),

  markAsRead: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const { messageId } = req.body;
    const message = await chatService.markAsRead(messageId, req.user.userId);
    return sendSuccess(res, 200, "Message marked as read", message);
  }),

  editMessage: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const { id } = req.params as { id: string };
    const { content } = req.body;

    const message = await chatService.editMessage(id, content, req.user.userId);
    return sendSuccess(res, 200, "Message updated", message);
  }),

  deleteMessage: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const { id } = req.params as { id: string };
    const result = await chatService.deleteMessage(id, req.user.userId);
    return sendSuccess(res, 200, "Message deleted", result);
  }),
};

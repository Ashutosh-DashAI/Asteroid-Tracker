import type { Request, Response } from "express";
import { bookmarkService } from "../services/bookmark.services";
import { sendSuccess, sendError } from "../utils/sendResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const bookmarkController = {
  bookmarkMessage: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const { messageId } = req.params as { messageId: string };
    const bookmark = await bookmarkService.bookmarkMessage(messageId, req.user.userId);
    return sendSuccess(res, 201, "Message bookmarked", bookmark);
  }),

  removeBookmark: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const { messageId } = req.params as { messageId: string };
    const result = await bookmarkService.removeBookmark(messageId, req.user.userId);
    return sendSuccess(res, 200, "Bookmark removed", result);
  }),

  getBookmarkedMessages: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const { limit = 20, offset = 0 } = req.query;
    const result = await bookmarkService.getBookmarkedMessages(
      req.user.userId,
      Number(limit),
      Number(offset)
    );
    return sendSuccess(res, 200, "Bookmarked messages fetched", result);
  }),
};

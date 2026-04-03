
import { Router } from "express";
import { chatController } from "../controllers/chat.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import { validate } from "../middleware/validate";
import {
  createConversationSchema,
  sendMessageSchema,
  updateMessageSchema,
} from "../validators/chat.schema";
import { asteroidChatParamSchema, chatCreateSchema } from "../validators/chat-thread.schema";
import prisma from "../db";
import { sendError, sendSuccess } from "../utils/sendResponse";

const router = Router();

// All chat routes are protected
router.use(authenticateToken);

const sanitize = (value: string) => value.replace(/<[^>]*>/g, "").trim();

/**
 * @route GET /api/chat/global
 * @description Returns last 50 global chat messages.
 */
router.get("/global", async (_req, res, next) => {
  try {
    const items = await prisma.chatMessage.findMany({
      where: { asteroidId: null },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return success(res, items.reverse());
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/chat/asteroid/:nasaId
 * @description Returns last 50 asteroid-thread messages.
 */
router.get("/asteroid/:nasaId", validate(asteroidChatParamSchema, "params"), async (req, res, next) => {
  try {
    const nasaId = String(req.params.nasaId);
    const asteroid = await prisma.asteroid.findUnique({ where: { nasaId } });
    if (!asteroid) return sendError(res, 404, "Asteroid not found");
    const items = await prisma.chatMessage.findMany({
      where: { asteroidId: asteroid.id },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return sendSuccess(res, 200, "Asteroid chat messages", items.reverse());
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /api/chat
 * @description Creates a new chat message (global or asteroid thread).
 */
router.post("/", validate(chatCreateSchema), async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 401, "Unauthorized");
    const content = sanitize(req.body.content).slice(0, 500);
    if (!content) return sendError(res, 400, "Content is required");

    let asteroidId: string | null = null;
    if (req.body.nasaId) {
      const asteroid = await prisma.asteroid.findUnique({ where: { nasaId: req.body.nasaId } });
      if (!asteroid) return error(res, "Asteroid not found", 404);
      asteroidId = asteroid.id;
    }

    const message = await prisma.chatMessage.create({
      data: { userId, asteroidId, content },
      include: { user: { select: { username: true } } },
    });
    return sendSuccess(res, 201, "Message sent", message);
  } catch (err) {
    next(err);
  }
});

// Conversation routes
router.post(
  "/conversation",
  validateRequest(createConversationSchema),
  chatController.createConversation
);

router.get("/conversations", chatController.getConversations);

router.get("/messages/:conversationId", chatController.getMessages);

// Message routes
router.post(
  "/message",
  validateRequest(sendMessageSchema),
  chatController.sendMessage
);

router.post("/message/read", chatController.markAsRead);

router.put(
  "/message/:id",
  validateRequest(updateMessageSchema),
  chatController.editMessage
);

router.delete("/message/:id", chatController.deleteMessage);

export default router;

import { Router } from "express";
import { chatController } from "../controllers/chat.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import {
  createConversationSchema,
  sendMessageSchema,
  updateMessageSchema,
} from "../validators/chat.schema";

const router = Router();

// All chat routes are protected
router.use(authenticateToken);

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

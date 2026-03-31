import { z } from "zod";

export const createConversationSchema = z.object({
  participantId: z.string().min(1, "Participant ID is required"),
});

export const sendMessageSchema = z.object({
  receiverId: z.string().min(1, "Receiver ID is required"),
  content: z.string().min(1, "Message content is required").max(5000, "Message is too long"),
});

export const updateMessageSchema = z.object({
  content: z.string().min(1, "Message content is required").max(5000, "Message is too long"),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;

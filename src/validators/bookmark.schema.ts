import { z } from "zod";

export const bookmarkMessageSchema = z.object({
  messageId: z.string().min(1, "Message ID is required"),
});

export type BookmarkMessageInput = z.infer<typeof bookmarkMessageSchema>;

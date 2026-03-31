import { z } from "zod";

export const markNotificationAsReadSchema = z.object({
  notificationId: z.string().min(1, "Notification ID is required"),
});

export type MarkNotificationAsReadInput = z.infer<
  typeof markNotificationAsReadSchema
>;

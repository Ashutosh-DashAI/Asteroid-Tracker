export interface SocketUser {
  userId: string;
  socketId: string;
}

export interface ChatSocketEvents {
  "user:online": (data: { userId: string }) => void;
  "user:offline": (data: { userId: string }) => void;
  "message:send": (data: any) => void;
  "message:receive": (data: any) => void;
  "message:typing": (data: { conversationId: string; senderId: string }) => void;
  "message:stop-typing": (data: {
    conversationId: string;
    senderId: string;
  }) => void;
  "message:read": (data: { messageId: string }) => void;
}

import { Server, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { verifyToken } from "../utils/jwt";
import prisma from "../db";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

type OnlineUsers = Map<
  string,
  {
    socketId: string;
    userId: string;
  }
>;

const onlineUsers: OnlineUsers = new Map();
let ioRef: Server | null = null;

export const setupSocket = (httpServer: HTTPServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
    },
  });

  ioRef = io;

  const authenticate = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication token not provided"));
    }

    const payload = verifyToken(token);

    if (!payload) {
      return next(new Error("Invalid or expired token"));
    }

    socket.userId = payload.userId;
    next();
  };

  io.use(authenticate);

  io.of("/alerts").use(authenticate).on("connection", (socket: AuthenticatedSocket) => {
    socket.join(`user:${socket.userId}`);
  });

  io.of("/chat").use(authenticate).on("connection", (socket: AuthenticatedSocket) => {
    socket.on("join_room", (payload: { nasaId?: string }) => {
      if (payload?.nasaId) socket.join(`asteroid:${payload.nasaId}`);
      else socket.join("global");
    });

    socket.on("leave_room", (payload: { nasaId?: string }) => {
      if (payload?.nasaId) socket.leave(`asteroid:${payload.nasaId}`);
      else socket.leave("global");
    });

    socket.on("send_message", async (payload: { content: string; nasaId?: string }) => {
      try {
        const clean = payload.content.replace(/<[^>]*>/g, "").trim().slice(0, 500);
        if (!clean) return;
        let asteroidId: string | null = null;
        if (payload.nasaId) {
          const asteroid = await prisma.asteroid.findUnique({ where: { nasaId: payload.nasaId } });
          if (!asteroid) return;
          asteroidId = asteroid.id;
        }
        const saved = await prisma.chatMessage.create({
          data: { userId: socket.userId!, asteroidId, content: clean },
          include: { user: { select: { username: true } } },
        });
        const room = payload.nasaId ? `asteroid:${payload.nasaId}` : "global";
        io.of("/chat").to(room).emit("new_message", saved);
      } catch (_err) {
        socket.emit("message:error", { message: "Failed to send chat message" });
      }
    });
  });

  // Existing default namespace connection handler
  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId} (${socket.id})`);

    // Add user to online users
    if (socket.userId) {
      onlineUsers.set(socket.userId, {
        socketId: socket.id,
        userId: socket.userId,
      });

      // Notify others that user is online
      io.emit("user:online", { userId: socket.userId });
    }

    // Join user-specific room for receiving messages
    socket.join(`user:${socket.userId}`);

    // Handle typing
    socket.on("message:typing", (data: { conversationId: string; senderId: string }) => {
      socket.broadcast.emit("message:typing", data);
    });

    // Handle stop typing
    socket.on(
      "message:stop-typing",
      (data: { conversationId: string; senderId: string }) => {
        socket.broadcast.emit("message:stop-typing", data);
      }
    );

    // Handle message read
    socket.on("message:read", async (data: { messageId: string }) => {
      try {
        await prisma.message.update({
          where: { id: data.messageId },
          data: { isRead: true, readAt: new Date() },
        });

        socket.broadcast.emit("message:read", data);
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });

    // Handle new message
    socket.on(
      "message:send",
      async (data: { receiverId: string; conversationId: string; content: string }) => {
        try {
          const message = await prisma.message.create({
            data: {
              senderId: socket.userId!,
              receiverId: data.receiverId,
              conversationId: data.conversationId,
              content: data.content,
            },
          });

          // Send to receiver's room
          io.to(`user:${data.receiverId}`).emit("message:receive", {
            ...message,
            sender: { id: socket.userId },
          });

          // Create notification
          await prisma.notification.create({
            data: {
              userId: data.receiverId,
              type: "MESSAGE",
              title: "New Message",
              message: "You received a new message",
            },
          });

          // Emit notification to receiver
          io.to(`user:${data.receiverId}`).emit("notification:new", {
            type: "MESSAGE",
            title: "New Message",
            message: "You received a new message",
          });
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("message:error", { message: "Failed to send message" });
        }
      }
    );

    // Disconnect handler
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId} (${socket.id})`);

      if (socket.userId) {
        onlineUsers.delete(socket.userId);

        // Notify others that user is offline
        io.emit("user:offline", { userId: socket.userId });
      }
    });

    // Error handler
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  return io;
};

export const getOnlineUsers = () => {
  return Array.from(onlineUsers.values());
};

export const emitNewAlert = (userId: string, alert: unknown) => {
  if (!ioRef) return;
  ioRef.of("/alerts").to(`user:${userId}`).emit("new_alert", alert);
};

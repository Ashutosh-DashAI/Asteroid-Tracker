/**
 * User and Authentication Types
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

/**
 * Chat and Message Types
 */
export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  sender?: User;
}

export interface Chat {
  id: string;
  participantId: string;
  participant: User;
  lastMessage?: Message;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface ChatPayload {
  recipientId: string;
  content: string;
}

/**
 * Notification Types
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

export interface ToastNotification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
}

/**
 * API Error Types
 */
export interface ApiError {
  message: string;
  statusCode: number;
  details?: Record<string, string>;
}

/**
 * Socket.IO Events
 */
export interface SocketEvents {
  MESSAGE_RECEIVED: 'message:received';
  MESSAGE_SENT: 'message:sent';
  USER_ONLINE: 'user:online';
  USER_OFFLINE: 'user:offline';
  NOTIFICATION: 'notification';
  TYPING: 'typing';
  STOP_TYPING: 'stop:typing';
}

/**
 * Store State Types
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface ChatState {
  chats: Chat[];
  selectedChatId: string | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  typing: { userId: string; isTyping: boolean }[];
}

export interface NotificationState {
  notifications: ToastNotification[];
}

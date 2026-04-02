import { create } from 'zustand';
import { apiService } from '@/api/api';
import type { Chat, Message } from '@/types';

interface ChatState {
  chats: Chat[];
  selectedChatId: string | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  typing: { userId: string; isTyping: boolean }[];

  // Actions
  setChats: (chats: Chat[]) => void;
  selectChat: (chatId: string) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateChatLastMessage: (chatId: string, message: Message) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  clearChat: () => void;

  // API methods
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  markChatAsRead: (chatId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  selectedChatId: null,
  messages: [],
  loading: false,
  error: null,
  typing: [],

  setChats: (chats) => set({ chats }),

  selectChat: (chatId) => set({ selectedChatId: chatId, messages: [] }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) => {
    const currentMessages = get().messages;
    set({ messages: [...currentMessages, message] });
  },

  updateChatLastMessage: (chatId, message) => {
    const chats = get().chats.map((chat) => {
      if (chat.id === chatId) {
        return { ...chat, lastMessage: message, lastMessageTime: message.timestamp };
      }
      return chat;
    });
    set({ chats });
  },

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setTyping: (userId, isTyping) => {
    const typing = get().typing.filter((t) => t.userId !== userId);
    if (isTyping) {
      typing.push({ userId, isTyping: true });
    }
    set({ typing });
  },

  clearChat: () => set({ selectedChatId: null, messages: [], error: null }),

  fetchChats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.chats.getAll();
      set({ chats: response.data as Chat[], loading: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch chats';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchMessages: async (chatId) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.chats.getMessages(chatId);
      set({ messages: response.data as Message[], loading: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch messages';
      set({ error: errorMessage, loading: false });
    }
  },

  sendMessage: async (chatId, content) => {
    set({ error: null });
    try {
      const response = await apiService.chats.sendMessage(chatId, content);
      const newMessage = response.data as Message;
      get().addMessage(newMessage);
      get().updateChatLastMessage(chatId, newMessage);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to send message';
      set({ error: errorMessage });
      throw err;
    }
  },

  markChatAsRead: async (chatId) => {
    try {
      await apiService.chats.markAsRead(chatId);
      const chats = get().chats.map((chat) => {
        if (chat.id === chatId) {
          return { ...chat, unreadCount: 0 };
        }
        return chat;
      });
      set({ chats });
    } catch (err) {
      console.error('Failed to mark chat as read:', err);
    }
  },
}));

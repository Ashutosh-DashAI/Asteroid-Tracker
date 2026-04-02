import { create } from 'zustand';
import * as chatApi from '@/api/chat.api';

interface ChatState {
  messages: Record<string, any[]>;
  activeRoom: string;
  isConnected: boolean;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  sendMessage: (room: string, content: string) => Promise<void>;
  loadMessages: (room: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: {},
  activeRoom: 'global',
  isConnected: false,
  joinRoom: (room) => set({ activeRoom: room }),
  leaveRoom: () => set({ activeRoom: 'global' }),
  sendMessage: async (room, content) => {
    await chatApi.sendMessage(room, content);
  },
  loadMessages: async (room) => {
    const data = room === 'global' ? await chatApi.getGlobalMessages() : await chatApi.getAsteroidMessages(room);
    set((s) => ({ messages: { ...s.messages, [room]: data?.items || data || [] } }));
  },
}));

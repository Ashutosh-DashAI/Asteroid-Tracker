import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import * as alertsApi from '@/api/alerts.api';
import { useAuthStore } from './authStore';

interface AlertState {
  alerts: any[];
  unreadCount: number;
  isLoading: boolean;
  socket: Socket | null;
  fetchAlerts: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  addAlert: (alert: any) => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  unreadCount: 0,
  isLoading: false,
  socket: null,
  fetchAlerts: async () => {
    set({ isLoading: true });
    const data = await alertsApi.getAlerts();
    const alerts = data?.items || data || [];
    set({ alerts, unreadCount: alerts.filter((a: any) => !a.read).length, isLoading: false });
  },
  markRead: async (id) => {
    await alertsApi.markRead(id);
    await get().fetchAlerts();
  },
  markAllRead: async () => {
    await alertsApi.markAllRead();
    await get().fetchAlerts();
  },
  deleteAlert: async (id) => {
    await alertsApi.deleteAlert(id);
    await get().fetchAlerts();
  },
  addAlert: (alert) => set((s) => ({ alerts: [alert, ...s.alerts], unreadCount: s.unreadCount + 1 })),
  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken || get().socket) return;
    const socket = io('/alerts', { auth: { token: accessToken }, transports: ['websocket'] });
    socket.on('new_alert', (alert) => get().addAlert(alert));
    set({ socket });
  },
  disconnectSocket: () => {
    get().socket?.disconnect();
    set({ socket: null });
  },
}));

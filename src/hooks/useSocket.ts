import { useCallback, useEffect, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

export function useSocket(namespace = '/') {
  const token = useAuthStore((s) => s.token);
  const socket = useMemo<Socket | null>(() => {
    if (!token) return null;
    return io(namespace, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket'],
    });
  }, [namespace, token]);

  useEffect(() => () => { socket?.disconnect(); }, [socket]);

  const emit = useCallback((event: string, payload?: unknown) => socket?.emit(event, payload), [socket]);
  const on = useCallback((event: string, cb: (data: unknown) => void) => {
    socket?.on(event, cb);
    return () => socket?.off(event, cb);
  }, [socket]);
  const once = useCallback((event: string, cb: (data: unknown) => void) => socket?.once(event, cb), [socket]);
  const isConnected = useCallback(() => !!socket?.connected, [socket]);

  return { socket, emit, on, once, isConnected };
}

export const useSocketEvent = (eventName: string, callback: (data: unknown) => void, enabled = true) => {
  const { on } = useSocket();
  useEffect(() => {
    if (!enabled) return;
    const unsubscribe = on(eventName, callback);
    return () => {
      unsubscribe?.();
    };
  }, [enabled, eventName, callback, on]);
};

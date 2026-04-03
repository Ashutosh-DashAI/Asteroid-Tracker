import { useCallback, useEffect, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

export function useSocket(namespace = '/') {
  const accessToken = useAuthStore((s) => s.accessToken);
  const socket = useMemo<Socket | null>(() => {
    if (!accessToken) return null;
    return io(namespace, {
      path: '/socket.io',
      auth: { token: accessToken },
      transports: ['websocket'],
    });
  }, [namespace, accessToken]);

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

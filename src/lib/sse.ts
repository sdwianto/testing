/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { useState, useEffect, useCallback } from 'react';

// ========================================
// SSE CLIENT (P1 - Offline Backbone)
// ========================================

export interface SSEMessage {
  type: string;
  data: unknown;
  timestamp: string;
}

export function useSSE() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const connect = useCallback(() => {
    if (eventSource) {
      eventSource.close();
    }

    const es = new EventSource('/api/events');
    
    es.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    es.onmessage = (event) => {
      try {
        const message: SSEMessage = JSON.parse(event.data);
        setMessages(prev => [...prev.slice(-99), message]); // Keep last 100 messages
      } catch (err) {
        console.error('Failed to parse SSE message:', err);
      }
    };

    es.onerror = (err) => {
      setIsConnected(false);
      setError('Connection failed');
      console.error('SSE error:', err);
    };

    setEventSource(es);
  }, [eventSource]);

  const disconnect = useCallback(() => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      setIsConnected(false);
    }
  }, [eventSource]);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [connect, disconnect]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  return {
    isConnected,
    messages,
    error,
    connect,
    disconnect,
    reconnect,
  };
}
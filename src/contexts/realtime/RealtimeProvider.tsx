'use client';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type RealtimeCtx = {
  status: 'connecting'|'open'|'closed'|'error';
  lastError?: string;
  send?: (msg: unknown) => void; // kalau perlu POST emit
};
const Ctx = createContext<RealtimeCtx>({ status: 'connecting' });

type Props = { children: React.ReactNode; url?: string };

export function RealtimeProvider({ children, url }: Props) {
  const [status, setStatus] = useState<RealtimeCtx['status']>('connecting');
  const [lastError, setLastError] = useState<string | undefined>();
  const esRef = useRef<EventSource | null>(null);
  const initOnceRef = useRef(false);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const isDev = process.env.NODE_ENV !== 'production';

  useEffect(() => {
    // Hindari double-init efek StrictMode (dev)
    if (isDev && initOnceRef.current) return;
    initOnceRef.current = true;

    let stopped = false;
    const endpoint = url ?? '/api/events'; // menggunakan endpoint SSE yang sudah ada

    const connect = () => {
      if (stopped) return;
      setStatus('connecting');

      // EventSource otomatis retry; tapi kita tetap kasih handler sendiri
      const es = new EventSource(endpoint, { withCredentials: true });
      esRef.current = es;

      es.onopen = () => {
        setStatus('open');
        setLastError(undefined);
        console.log('✅ SSE connection established');
      };

      es.onerror = () => {
        setStatus('error');
        setLastError('eventsource error');
        console.log('❌ SSE connection error');
        es.close();
        // backoff sederhana
        if (!stopped) {
          if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
          reconnectTimer.current = setTimeout(connect, 1500);
        }
      };

      es.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data as string) as unknown;
          // TODO: dispatch ke store (Zustand/Context) atau trpc invalidate
          // handleMessage(payload);
          console.log('📨 SSE message received:', payload);
        } catch {
          console.log('📨 SSE raw message:', ev.data);
        }
      };
    };

    connect();

    const onVisibility = () => {
      // ⚠️ JANGAN abort SSE saat hidden — cukup throttle pekerjaan lain
      // Kalau mau, bisa kirim "presence/heartbeat" ringan saat visible.
      if (document.visibilityState === 'visible' && status === 'error') {
        console.log('📱 Page visible, attempting reconnect...');
        connect();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stopped = true;
      document.removeEventListener('visibilitychange', onVisibility);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      esRef.current?.close();
      esRef.current = null;
    };
  }, [url, isDev]); // Removed status dependency to prevent re-runs

  // (opsional) fungsi kirim event via fetch POST
  const send = (msg: unknown) => {
    void fetch('/api/events/emit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
      keepalive: true,
    }).catch((error) => {
      console.error('Failed to send event:', error);
    });
  };

  return (
    <Ctx.Provider value={{ status, lastError, send }}>
      {children}
    </Ctx.Provider>
  );
}

export const useRealtime = () => useContext(Ctx);

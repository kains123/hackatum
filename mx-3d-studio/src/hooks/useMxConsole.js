// src/hooks/useMxConsole.js
import { useCallback, useEffect, useRef, useState } from 'react';

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return String(Date.now() + Math.random());
}

export function useMxConsole() {
  const [connected, setConnectedState] = useState(false);
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);

  const wsRef = useRef(null);
  const activeTimeoutRef = useRef(null);

  // 🔹 Single place that updates events + activeEvent
  const applyEvent = useCallback((evt) => {
    const payload = {
      id: makeId(),
      type: evt.type ?? 'unknown',
      label: evt.label ?? evt.type ?? 'MX Event',
      // support count/delta/value all in one place
      value: evt.value ?? evt.delta ?? evt.count ?? null,
      timestamp: new Date(),
    };

    setEvents((prev) => [payload, ...prev]);
    setActiveEvent(payload);

    if (activeTimeoutRef.current) {
      clearTimeout(activeTimeoutRef.current);
    }
    activeTimeoutRef.current = setTimeout(() => {
      setActiveEvent(null);
    }, 1500);
  }, []);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[MX] WebSocket connected');
      setConnectedState(true);
    };

    ws.onclose = () => {
      console.log('[MX] WebSocket disconnected');
      setConnectedState(false);
    };

    ws.onerror = (err) => {
      console.error('[MX] WebSocket error', err);
      setConnectedState(false);
    };

    ws.onmessage = (event) => {
      try {
        console.log('[MX] raw message from server:', event.data);

        const data = JSON.parse(event.data);
        console.log('[MX] parsed message:', data);

        // 👇 Use shared handler
        applyEvent(data);
      } catch (e) {
        console.error('[MX] Failed to parse message', e);
      }
    };

    return () => {
      if (activeTimeoutRef.current) clearTimeout(activeTimeoutRef.current);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [applyEvent]);

  // Used by App when you load a model
  const pushEvent = useCallback(
    (evt) => {
      // Just reuse the same pipeline the WebSocket uses
      applyEvent(evt);
    },
    [applyEvent],
  );

  const setConnected = useCallback((fnOrValue) => {
    setConnectedState((prev) =>
      typeof fnOrValue === 'function' ? fnOrValue(prev) : fnOrValue,
    );
  }, []);

  return {
    connected,
    setConnected,
    events,
    activeEvent,
    pushEvent,
  };
}

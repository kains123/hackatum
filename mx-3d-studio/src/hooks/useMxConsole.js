import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * MX Console hook
 *
 * API surface for your hardware layer:
 *   - setConnected(true/false) from your device connection logic
 *   - pushEvent({ type, label, value }) when knobs/faders/buttons change
 */
export function useMxConsole() {
  const [connected, setConnected] = useState(true);
  const [events, setEvents] = useState([]); // newest first
  const [activeEvent, setActiveEvent] = useState(null);

  const pushEvent = useCallback((event) => {
    const fullEvent = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      ...event,
    };

    setEvents((prev) => [fullEvent, ...prev.slice(0, 19)]); // keep last 20
    setActiveEvent(fullEvent);
  }, []);

  // Auto-clear the “toast” after a few seconds
  useEffect(() => {
    if (!activeEvent) return;
    const timeout = setTimeout(() => setActiveEvent(null), 3000);
    return () => clearTimeout(timeout);
  }, [activeEvent]);

  // Demo: simulate random MX events every few seconds
  useEffect(() => {
    if (!connected) return;
    const interval = setInterval(() => {
      const randomValue = Math.random();
      const demoEvent = {
        type: 'fader',
        label: `Fader ${1 + Math.floor(Math.random() * 4)}`,
        value: Number((randomValue * 100).toFixed(1)),
      };
      pushEvent(demoEvent);
    }, 8000);

    return () => clearInterval(interval);
  }, [connected, pushEvent]);

  const lastEvent = useMemo(() => events[0] || null, [events]);

  return {
    connected,
    setConnected, // expose so you can wire real hardware connection events
    events,
    lastEvent,
    activeEvent,
    pushEvent,
  };
}

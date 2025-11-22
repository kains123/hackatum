import React, { useCallback, useEffect, useState } from 'react';
import { ThreeCanvas } from './components/ThreeCanvas.jsx';
import { useMxConsole } from './hooks/useMxConsole.js';

function formatTime(date) {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function App() {
  const [objUrl, setObjUrl] = useState(null);
  const [modelName, setModelName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const mx = useMxConsole();
  const { pushEvent, activeEvent } = useMxConsole();

// revoke object URL when replaced/unmounted
// When a new event comes from Node/WS, update those values
// useEffect(() => {
//   const { activeEvent, pushEvent } = mx;
//   pushEvent()
//   console.log("evt:", activeEvent)
//   if (!evt) {
//     return
//   };

//   // you can adjust these mappings to your needs
//   if (evt.type === 'zoom' && typeof evt.value === 'number') {
//     console.log("hii2");
//     setZoomOffset((z) => z + evt.value * 0.2); // 0.2 is just a scaling factor
//   }

//   if (evt.type === 'rotate' && typeof evt.value === 'number') {
//     setRotationY((r) => r + evt.value * 0.1); // rotate a bit per step
//   }
// }, [mx.activeEvent]);
useEffect(() => {
  if (activeEvent) {
    console.log('New active event:', activeEvent.value);
  }
}, [activeEvent]);

  const handleObjFile = useCallback(
    (file) => {
      if (!file) return;

      if (!file.name.toLowerCase().endsWith('.obj')) {
        setError('Only .obj files are supported right now.');
        return;
      }

      const url = URL.createObjectURL(file);

      setError('');
      setModelName(file.name);

      setObjUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });

      // Optional: let MX Console overlay know about a “load” event
      mx.pushEvent({
        type: 'scene',
        label: 'Model loaded',
        value: file.name,
      });
    },
    [mx],
  );

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleObjFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only reset if leaving the container itself
    if (e.currentTarget === e.target) {
      setDragActive(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleObjFile(file);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <span className="text-lg font-semibold">3D</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                MX 3D Studio
              </h1>
              <p className="text-xs text-slate-500">
                Drag &amp; drop .obj models into the scene
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => mx.setConnected((prev) => !prev)}
              className="rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-200 hover:border-slate-500 transition"
            >
              {mx.connected ? 'Simulate Disconnect' : 'Simulate Connect'}
            </button>

            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  mx.connected ? 'bg-emerald-400' : 'bg-rose-500'
                } shadow-[0_0_0_3px_rgba(34,197,94,0.25)]`}
              />
              <div className="leading-tight text-right">
                <p className="text-[11px] font-semibold text-slate-200">
                  MX Console
                </p>
                <p className="text-[10px] text-slate-500">
                  {mx.connected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative flex-1">
        <div
          className="relative h-full w-full"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <ThreeCanvas objUrl={objUrl} modelName={modelName} activeEvent={activeEvent} />

          {/* Drag & drop overlay */}
          <div
            className={`pointer-events-none absolute inset-0 flex items-center justify-center transition duration-200 ${
              dragActive ? 'bg-slate-950/60 backdrop-blur-sm' : 'bg-transparent'
            }`}
          >
            <div className="pointer-events-auto">
              <div
                className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-4 text-center text-xs shadow-lg ${
                  dragActive
                    ? 'border-emerald-400/80 bg-slate-900/90'
                    : 'border-slate-700/80 bg-slate-950/80'
                }`}
              >
                <p className="font-medium text-slate-200">
                  {dragActive
                    ? 'Drop your .obj file to import'
                    : 'Drag & drop a .obj file into the scene'}
                </p>
                <p className="text-[11px] text-slate-500">
                  The model will be centered and scaled to fit the studio.
                </p>

                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-200 hover:border-slate-500">
                  <span>Browse files</span>
                  <input
                    type="file"
                    accept=".obj"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </label>

                {error && (
                  <p className="mt-1 text-[11px] text-rose-400">{error}</p>
                )}
              </div>
            </div>
          </div>

          {/* MX Console floating toast for live hardware feedback */}
          {mx.activeEvent && (
            <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2">
              <div className="rounded-full border border-emerald-500/40 bg-slate-950/95 px-4 py-1 text-xs font-medium text-emerald-300 shadow-lg backdrop-blur">
                <span className="uppercase text-[10px] text-emerald-400/80">
                  MX EVENT
                </span>{' '}
                {mx.activeEvent.label}{' '}
                {typeof mx.activeEvent.value === 'number'
                  ? `→ ${mx.activeEvent.value}`
                  : mx.activeEvent.value}
              </div>
            </div>
          )}

          {/* MX Console side panel: status + recent events */}
          <aside className="pointer-events-none absolute right-4 top-20 flex w-72 flex-col gap-3 text-xs">
            <div className="pointer-events-auto rounded-xl border border-slate-800/80 bg-slate-950/90 p-3 shadow-lg backdrop-blur">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold text-slate-200">
                    MX Console
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Device status &amp; activity
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    mx.connected
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {mx.connected ? 'CONNECTED' : 'OFFLINE'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Mode</span>
                <span className="font-medium text-slate-200">Studio</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Linked scene</span>
                <span className="truncate font-medium text-slate-200">
                  {modelName || 'No model loaded'}
                </span>
              </div>
            </div>

            <div className="pointer-events-auto rounded-xl border border-slate-800/80 bg-slate-950/90 p-3 shadow-lg backdrop-blur">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-slate-200">
                  Recent interactions
                </p>
                <span className="text-[10px] text-slate-500">
                  {mx.events.length ? `${mx.events.length} events` : 'Idle'}
                </span>
              </div>

              <ul className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {mx.events.slice(0, 5).map((evt) => (
                  <li
                    key={evt.id}
                    className="flex items-center justify-between rounded-lg bg-slate-900/80 px-2 py-1"
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium text-slate-200">
                        {evt.label}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {evt.type}{' '}
                        {typeof evt.value === 'number'
                          ? `→ ${evt.value}`
                          : evt.value}
                      </span>
                    </div>
                    <span className="ml-2 text-[10px] text-slate-500">
                      {formatTime(evt.timestamp)}
                    </span>
                  </li>
                ))}
                {!mx.events.length && (
                  <li className="rounded-lg bg-slate-900/60 px-2 py-1 text-[11px] text-slate-500">
                    No activity yet. Move controls on the MX Console (or use
                    the simulated events).
                  </li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";

type DebugType = "init" | "page_view" | "event";

interface DebugItem {
  type: DebugType;
  name?: string;
  payload: Record<string, unknown>;
  at: string;
}

function GADebugPanel() {
  const [events, setEvents] = useState<DebugItem[]>([]);

  useEffect(() => {
    const handleDebugEvent = (event: Event) => {
      const customEvent = event as CustomEvent<DebugItem>;
      const detail = customEvent.detail;
      if (!detail) return;

      setEvents((prev) => [detail, ...prev].slice(0, 8));
    };

    window.addEventListener("ga-debug-event", handleDebugEvent);
    return () => {
      window.removeEventListener("ga-debug-event", handleDebugEvent);
    };
  }, []);

  return (
    <aside className="ga-debug-panel" aria-live="polite">
      <div className="ga-debug-panel__header">
        <strong>GA Debug</strong>
        <span>{events.length} events</span>
      </div>

      {events.length === 0 ? (
        <p className="ga-debug-panel__empty">No GA events yet.</p>
      ) : (
        <ul className="ga-debug-panel__list">
          {events.map((item, index) => (
            <li key={`${item.at}-${index}`} className="ga-debug-panel__item">
              <div className="ga-debug-panel__meta">
                <span>
                  {item.type}
                  {item.name ? `:${item.name}` : ""}
                </span>
                <time>{new Date(item.at).toLocaleTimeString()}</time>
              </div>
              <pre>{JSON.stringify(item.payload, null, 2)}</pre>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

export default GADebugPanel;

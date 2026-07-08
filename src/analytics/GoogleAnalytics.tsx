// GoogleAnalytics.tsx
import React from "react";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

interface GoogleAnalyticsProps {
  measurementId?: string;
  location?: {
    pathname: string;
    search?: string;
    hash?: string;
  };
}

interface GADebugEventDetail {
  type: "init" | "page_view" | "event";
  name?: string;
  payload: Record<string, unknown>;
  at: string;
}

// Initialize gtag immediately
if (typeof window !== "undefined") {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer.push(args);
  };
}

class GoogleAnalytics extends React.Component<GoogleAnalyticsProps> {
  static initialized = false;
  static pendingEvents: Array<{
    action: string;
    params: Record<string, unknown>;
  }> = [];

  private publishDebugEvent(detail: GADebugEventDetail): void {
    window.dispatchEvent(
      new CustomEvent<GADebugEventDetail>("ga-debug-event", { detail }),
    );
  }

  constructor(props: GoogleAnalyticsProps) {
    super(props);
    this.initGA(props.measurementId ?? "G-0FW2W48YBN");
  }

  componentDidMount(): void {
    this.trackPageView(this.buildPath(this.props.location));
  }

  componentDidUpdate(prevProps: GoogleAnalyticsProps): void {
    const prevPath = this.buildPath(prevProps.location);
    const currentPath = this.buildPath(this.props.location);
    if (prevPath !== currentPath) {
      this.trackPageView(currentPath);
    }
  }

  private buildPath(
    location?: GoogleAnalyticsProps["location"],
  ): string | undefined {
    if (!location) return undefined;
    return `${location.pathname}${location.search ?? ""}${location.hash ?? ""}`;
  }

  private initGA(measurementId: string): void {
    if (!measurementId || GoogleAnalytics.initialized) return;

    // Only inject the script if it hasn't been loaded
    if (!document.querySelector(`script[src*="gtag/js?id=${measurementId}"]`)) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      script.addEventListener("error", () => {
        console.warn(
          "[GA] Failed to load gtag.js. Check ad blockers, CSP, or network settings.",
        );
      });
    }

    // Configure gtag
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      send_page_view: false,
      cookie_domain: window.location.hostname,
    });

    // Flush any events captured before gtag was available
    if (GoogleAnalytics.pendingEvents.length > 0) {
      for (const pending of GoogleAnalytics.pendingEvents) {
        const payload = { ...pending.params, debug_mode: true };
        this.publishDebugEvent({
          type: "event",
          name: pending.action,
          payload: { ...payload, _ga_status: "flushed" },
          at: new Date().toISOString(),
        });
        window.gtag("event", pending.action, payload);
      }
      GoogleAnalytics.pendingEvents = [];
    }

    console.info("[GA] Initialized", { measurementId });
    this.publishDebugEvent({
      type: "init",
      payload: { measurementId },
      at: new Date().toISOString(),
    });

    GoogleAnalytics.initialized = true;
  }

  private trackPageView(path?: string): void {
    if (typeof window.gtag !== "function") return;
    const payload = {
      page_path: path || window.location.pathname,
      page_title: document.title,
      page_location: window.location.href,
      debug_mode: true,
    };

    console.info("[GA] page_view", payload);
    this.publishDebugEvent({
      type: "page_view",
      payload,
      at: new Date().toISOString(),
    });
    window.gtag("event", "page_view", payload);
  }

  static trackEvent(
    action: string,
    params: Record<string, unknown> = {},
  ): void {
    // Check if gtag is available (it should be now since we initialized it globally)
    if (!window.gtag) {
      console.warn("[GA] gtag not available; queueing event", {
        action,
        params,
      });
      window.dispatchEvent(
        new CustomEvent<GADebugEventDetail>("ga-debug-event", {
          detail: {
            type: "event",
            name: action,
            payload: { ...params, _ga_status: "queued" },
            at: new Date().toISOString(),
          },
        }),
      );
      GoogleAnalytics.pendingEvents.push({ action, params });
      return;
    }

    const payload = {
      ...params,
      debug_mode: true,
      transport_type: "beacon",
      event_callback: () => {
        console.info(`[GA] ${action} sent`);
      },
    };

    console.info(`[GA] ${action}`, payload);
    window.dispatchEvent(
      new CustomEvent<GADebugEventDetail>("ga-debug-event", {
        detail: {
          type: "event",
          name: action,
          payload: { ...params, debug_mode: true, _ga_status: "sent" },
          at: new Date().toISOString(),
        },
      }),
    );

    // Use window.gtag directly
    window.gtag("event", action, payload);
  }

  render(): null {
    return null;
  }
}

export default GoogleAnalytics;

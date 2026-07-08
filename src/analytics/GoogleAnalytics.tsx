// GoogleAnalytics.tsx
import React from "react";

// Extend the Window interface so TypeScript knows about gtag/dataLayer
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

    // Inject the gtag.js script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      send_page_view: false,
      cookie_domain: window.location.hostname,
    }); // manual page_view tracking

    // Flush any events captured before gtag was available.
    if (GoogleAnalytics.pendingEvents.length > 0) {
      for (const pending of GoogleAnalytics.pendingEvents) {
        const payload = { ...pending.params, debug_mode: true };
        window.gtag("event", pending.action, payload);
      }
      GoogleAnalytics.pendingEvents = [];
    }

    script.addEventListener("error", () => {
      console.warn(
        "[GA] Failed to load gtag.js. Check ad blockers, CSP, or network settings.",
      );
    });

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

  // Static helper so you can fire custom events from anywhere:
  // GoogleAnalytics.trackEvent('button_click', { category: 'engagement', label: 'signup' });
  static trackEvent(
    action: string,
    params: Record<string, unknown> = {},
  ): void {
    if (typeof window.gtag !== "function") {
      console.warn("[GA] gtag is not ready yet; queueing event", {
        action,
        params,
      });
      GoogleAnalytics.pendingEvents.push({ action, params });
      return;
    }
    const payload = { ...params, debug_mode: true };
    console.info(`[GA] ${action}`, payload);
    window.dispatchEvent(
      new CustomEvent<GADebugEventDetail>("ga-debug-event", {
        detail: {
          type: "event",
          name: action,
          payload,
          at: new Date().toISOString(),
        },
      }),
    );
    window.gtag("event", action, payload);
  }

  render(): null {
    return null;
  }
}

export default GoogleAnalytics;

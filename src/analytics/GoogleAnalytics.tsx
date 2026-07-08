import { useEffect, useRef } from "react";
import ReactGA from "react-ga4";

interface GoogleAnalyticsProps {
  measurementId?: string;
  location?: {
    pathname: string;
    search?: string;
    hash?: string;
  };
}

let initialized = false;

function buildPath(
  location?: GoogleAnalyticsProps["location"],
): string | undefined {
  if (!location) return undefined;
  return `${location.pathname}${location.search ?? ""}${location.hash ?? ""}`;
}

export default function GoogleAnalytics({
  measurementId = "G-0FW2W48YBN",
  location,
}: GoogleAnalyticsProps) {
  const lastPath = useRef<string | undefined>(undefined);

  // Initialize once
  useEffect(() => {
    if (initialized || !measurementId) return;
    ReactGA.initialize(measurementId, {
      gtagOptions: { send_page_view: false },
    });
    initialized = true;
  }, [measurementId]);

  // Track page views on mount and whenever the path changes
  useEffect(() => {
    const path = buildPath(location) || window.location.pathname;
    if (path === lastPath.current) return;
    lastPath.current = path;

    ReactGA.send({ hitType: "pageview", page: path, title: document.title });
  }, [location?.pathname, location?.search, location?.hash]);

  return null;
}

// Call from anywhere in the app to track a custom event
export function trackEvent(
  action: string,
  params: Record<string, unknown> = {},
) {
  if (!initialized) {
    console.warn("[GA] not initialized yet; event dropped", action);
    return;
  }
  ReactGA.event(action, params);
}

/**
 * Abstract Analytics Layer — Loopora
 *
 * Implements a unified tracking interface to decouple components from specific providers
 * (PostHog, Plausible, Google Analytics 4, or none/console).
 *
 * Configuration is driven by the environment variable:
 * `NEXT_PUBLIC_ANALYTICS_PROVIDER` ("posthog" | "plausible" | "ga4" | "none")
 *
 * @module lib/analytics
 * @see 06_Implementation_Plan_Build_Order.md User Decision #5 (Abstract Analytics Layer)
 */

export type AnalyticsProvider = "posthog" | "plausible" | "ga4" | "none";

// Declare global structures for window properties to avoid "any" lint warnings
declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
    plausible?: (event: string, options?: { props?: Record<string, unknown>; u?: string }) => void;
    gtag?: (command: string, name: string, properties?: Record<string, unknown>) => void;
  }
}

const PROVIDER = (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || "none") as AnalyticsProvider;

/**
 * Log message helper for development
 */
function devLog(action: string, data: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics: ${PROVIDER}] ${action}:`, data);
  }
}

/**
 * Dynamic event property schema
 */
export interface EventProps {
  category?: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}

/**
 * Tracks a page view event.
 * Call this inside client-side router changes or layout effects.
 *
 * @param url The target destination URL
 */
export function trackPageview(url: string) {
  devLog("Page View", { url });

  if (typeof window === "undefined") return;

  switch (PROVIDER) {
    case "posthog":
      if (window.posthog) {
        window.posthog.capture("$pageview");
      }
      break;
    case "plausible":
      if (window.plausible) {
        window.plausible("pageview", { u: url });
      }
      break;
    case "ga4":
      if (window.gtag) {
        window.gtag("event", "page_view", { page_path: url });
      }
      break;
    case "none":
    default:
      break;
  }
}

/**
 * Tracks a custom user interaction event (e.g. expand solution, play video, change tab).
 *
 * @param eventName Name of the action (e.g. "expand_question", "play_video")
 * @param properties Additional context properties (e.g. difficulty, slug, presenter name)
 */
export function trackEvent(eventName: string, properties: EventProps = {}) {
  devLog("Custom Event", { eventName, properties });

  if (typeof window === "undefined") return;

  // Cast properties to safe Record for window interface compatibility
  const trackProperties = properties as Record<string, unknown>;

  switch (PROVIDER) {
    case "posthog":
      if (window.posthog) {
        window.posthog.capture(eventName, trackProperties);
      }
      break;
    case "plausible":
      if (window.plausible) {
        window.plausible(eventName, { props: trackProperties });
      }
      break;
    case "ga4":
      if (window.gtag) {
        window.gtag("event", eventName, {
          event_category: properties.category,
          event_label: properties.label,
          value: properties.value,
          ...trackProperties,
        });
      }
      break;
    case "none":
    default:
      break;
  }
}

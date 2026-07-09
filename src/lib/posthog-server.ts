import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

/**
 * Returns a singleton PostHog server-side client.
 *
 * Uses the same NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN as the client SDK.
 * This is the official PostHog Next.js App Router pattern — see:
 * https://posthog.com/docs/libraries/next-js#server-side-analytics
 *
 * For short-lived serverless functions, set flushAt:1 and flushInterval:0
 * and call `await posthog.shutdown()` after sending events.
 */
export function getPostHogClient(): PostHog {
  if (!posthogClient) {
    posthogClient = new PostHog(
      process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!,
      {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        flushAt: 1,
        flushInterval: 0,
      }
    );
  }
  return posthogClient;
}

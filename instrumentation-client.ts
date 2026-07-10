import posthog from "posthog-js";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (!token) {
  console.error(
    "[PostHog] NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is not set. " +
      "Skipping PostHog initialization. " +
      "Ensure it is defined in your Vercel project environment variables."
  );
} else {
  if (process.env.NODE_ENV === "development") {
    console.log("[PostHog] Initializing with token:", token ? `${token.slice(0, 8)}...` : "undefined");
    console.log("[PostHog] API host:", "/ingest");
  }

  posthog.init(token, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2026-01-30",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
    mask_all_text: true,
    mask_all_element_attributes: true,
    session_recording: {
      maskTextSelector: ".ph-mask",
      blockSelector: ".ph-block",
      maskAllInputs: true,
    },
  });
}

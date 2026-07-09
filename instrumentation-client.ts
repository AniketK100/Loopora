import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
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

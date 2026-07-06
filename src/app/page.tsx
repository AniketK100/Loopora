/**
 * Placeholder Landing Page — InterviewLoop
 *
 * Temporary page verifying fonts, design tokens, and basic rendering.
 * Will be replaced with the full landing page in Phase 5.
 *
 * @module app/page
 */

export default function Home() {
  return (
    <main className="paper-grain min-h-screen flex flex-col items-center justify-center p-8">
      <div
        className="wobbly border-2 p-8 max-w-xl w-full text-center"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-bg)",
          boxShadow: "var(--shadow-default)",
        }}
      >
        <h1
          className="text-4xl font-bold mb-4"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-fg)",
          }}
        >
          InterviewLoop
        </h1>
        <p
          className="text-lg mb-6"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-fg-muted)",
          }}
        >
          Ace every kind of interview question.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <span
            className="wobbly-sm px-4 py-2 text-sm font-bold"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-bg)",
              fontFamily: "var(--font-heading)",
            }}
          >
            Phase 0 ✓
          </span>
          <span
            className="wobbly-sm px-4 py-2 text-sm font-bold"
            style={{
              backgroundColor: "var(--color-secondary)",
              color: "var(--color-bg)",
              fontFamily: "var(--font-heading)",
            }}
          >
            Fonts Loaded
          </span>
          <span
            className="wobbly-sm px-4 py-2 text-sm font-bold"
            style={{
              backgroundColor: "var(--color-post-it)",
              color: "var(--color-fg)",
              fontFamily: "var(--font-heading)",
            }}
          >
            Tokens Active
          </span>
        </div>
      </div>
    </main>
  );
}

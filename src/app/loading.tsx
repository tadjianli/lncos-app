/**
 * LN COS — Route loading state
 * Shown by Next.js App Router while a route segment suspends.
 * Renders inside AppShell (inherits the fixed viewport container).
 */

export default function Loading() {
  return (
    <div
      style={{
        flex: "1 1 auto",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        color: "var(--ink-mute)",
        animation: "fadeIn 0.3s ease both",
      }}
    >
      {/* Gold ring spinner */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "2px solid rgba(212,175,55,.18)",
          borderTopColor: "var(--gold)",
          animation: "spin 0.9s linear infinite",
        }}
      />

      {/* Brand wordmark */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--ink-mute)",
          animation: "loadingPulse 1.6s ease-in-out infinite",
        }}
      >
        LN COS
      </span>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes loadingPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

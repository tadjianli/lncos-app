"use client";
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message ?? "Erreur inattendue." };
  }

  componentDidCatch(err: Error, info: { componentStack?: string | null }) {
    console.error("[ErrorBoundary]", err, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,90,90,.1)", border: "1px solid rgba(255,90,90,.2)", display: "grid", placeItems: "center", marginBottom: 16, fontSize: 22 }}>
          ⚠
        </div>
        <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>
          Une erreur est survenue
        </p>
        <p style={{ margin: "0 0 20px", fontSize: 12.5, color: "var(--ink-mute)", lineHeight: 1.5 }}>
          {this.state.message}
        </p>
        <button
          onClick={() => this.setState({ hasError: false, message: "" })}
          style={{ padding: "10px 24px", borderRadius: "var(--r-pill)", background: "var(--charcoal)", border: "1px solid rgba(255,255,255,.1)", color: "var(--ink-soft)", fontSize: 13, cursor: "pointer" }}
        >
          Réessayer
        </button>
      </div>
    );
  }
}

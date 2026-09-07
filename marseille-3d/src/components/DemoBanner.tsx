import { useState } from "react";

const KEY = "mkr3d-demo-banner-dismissed";

export default function DemoBanner() {
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(KEY) === "1";
    } catch {
      return false;
    }
  });

  if (hidden) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setHidden(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: 14,
        transform: "translateX(-50%)",
        width: "calc(100% - 28px)",
        maxWidth: 460,
        zIndex: 20,
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 12,
        background: "rgba(18, 18, 10, 0.9)",
        border: "1px solid rgba(245, 158, 11, 0.4)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
      }}
    >
      <span style={{ fontSize: 14, lineHeight: 1.3 }}>💸</span>
      <p style={{ color: "#e2e8f0", fontSize: 11.5, lineHeight: 1.45, flex: 1 }}>
        These are the real 3D scenes from the Fresh Route app. The routing
        engine (heat-aware pathfinding) is offline to keep hosting free.{" "}
        <a
          href="https://github.com/Emanuelee00/green_site"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#fbbf24", textDecoration: "underline" }}
        >
          Source ↗
        </a>
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: "none",
          border: "none",
          color: "#94a3b8",
          cursor: "pointer",
          fontSize: 15,
          lineHeight: 1,
          padding: 2,
        }}
      >
        ×
      </button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { checkHealth } from "../lib/api";

export default function TopNav() {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const ok = await checkHealth();
      setConnected(ok);
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const badgeBorder =
    connected === null ? "#e0e0e0" : connected ? "#d4edda" : "#f5c6cb";
  const badgeBg =
    connected === null ? "#fafafa" : connected ? "#f6fef7" : "#fef6f6";
  const badgeColor =
    connected === null ? "#747878" : connected ? "#2d6a3f" : "#8b2d37";
  const dotColor =
    connected === null ? "#aaa" : connected ? "#34c759" : "#ff3b30";
  const label =
    connected === null ? "Checking…" : connected ? "Backend Connected" : "Disconnected";

  return (
    <header
      style={{
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        borderBottom: "1px solid #f0f0f0",
        flexShrink: 0,
        background: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Brand */}
      <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.03em", color: "#1a1c1c" }}>
        RecruitAI
      </span>

      {/* Right Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Connection Status */}
        <div
          id="connection-status"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 500,
            border: `1px solid ${badgeBorder}`,
            background: badgeBg,
            color: badgeColor,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: dotColor,
              flexShrink: 0,
              display: "inline-block",
            }}
          />
          {label}
        </div>

        {/* Notifications Bell */}
        <button
          id="notifications-btn"
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            color: "#747878",
            cursor: "pointer",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
      </div>
    </header>
  );
}

"use client";

import { CandidateMatch } from "../lib/api";

interface CandidateCardProps {
  candidate: CandidateMatch;
  index: number;
}

export default function CandidateCard({ candidate, index }: CandidateCardProps) {
  const confidencePercent = Math.round(candidate.confidence * 100);
  const badgeBg =
    confidencePercent >= 80 ? "#1a1c1c" : confidencePercent >= 60 ? "#3a3d3d" : "#5a5d5d";

  return (
    <div
      className="animate-fade-up"
      style={{
        border: "1px solid #c4c7c7",
        borderRadius: 8,
        padding: 24,
        background: "#fff",
        transition: "all 0.2s",
        animationDelay: `${index * 0.06}s`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#a0a3a3";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#c4c7c7";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Top Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em", color: "#1a1c1c", margin: 0 }}>
          {candidate.name}
        </h3>
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: "#fff",
            background: badgeBg,
          }}
        >
          {confidencePercent}% Match
        </span>
      </div>

      {/* Middle Row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
        <span style={{ fontSize: 14, color: "#747878" }}>{candidate.email}</span>
        <span
          style={{
            fontSize: 12,
            padding: "2px 8px",
            borderRadius: 9999,
            background: "#f3f3f3",
            color: "#5a5d5d",
          }}
        >
          {candidate.experience_years} {candidate.experience_years === 1 ? "year" : "years"} exp.
        </span>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#999" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        {candidate.source_file}
      </div>
    </div>
  );
}

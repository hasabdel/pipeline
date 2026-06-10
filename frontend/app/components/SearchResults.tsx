"use client";

import { CandidateMatch } from "../lib/api";
import CandidateCard from "./CandidateCard";

interface SearchResultsProps {
  results: CandidateMatch[];
  query: string;
}

export default function SearchResults({ results, query }: SearchResultsProps) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 0" }}>
      {/* Results Header */}
      <div className="animate-fade-up" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: "#1a1c1c", margin: 0 }}>
            Matching Candidates
          </h2>
          <span
            style={{
              display: "inline-block",
              padding: "2px 10px",
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 500,
              background: "#f0f0f0",
              color: "#5a5d5d",
              marginLeft: 12,
            }}
          >
            {results.length} {results.length === 1 ? "result" : "results"}
          </span>
        </div>
        <p style={{ fontSize: 14, color: "#999", marginTop: 4 }}>
          Showing results for &ldquo;{query}&rdquo;
        </p>
      </div>

      {/* Results List */}
      {results.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {results.map((candidate, i) => (
            <CandidateCard key={`${candidate.email}-${i}`} candidate={candidate} index={i} />
          ))}
        </div>
      ) : (
        <div
          className="animate-fade-up"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px 0",
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p style={{ marginTop: 16, fontSize: 15, fontWeight: 500, color: "#999" }}>
            No candidates found
          </p>
          <p style={{ fontSize: 13, color: "#bbb", marginTop: 4 }}>
            Try adjusting your search query
          </p>
        </div>
      )}
    </div>
  );
}

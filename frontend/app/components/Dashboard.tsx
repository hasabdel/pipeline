"use client";

import { useState, useEffect } from "react";
import {
  getDashboardStatistics,
  DashboardStatistics,
  SearchHistoryItem,
} from "../lib/api";

interface DashboardProps {
  onNavigateToSearch: () => void;
}

export default function Dashboard({ onNavigateToSearch }: DashboardProps) {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const response = await getDashboardStatistics();
        setStatistics(response.statistics);
        setRecentSearches(response.recent_searches);
      } catch (error) {
        console.error("Failed to load statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatistics();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return num.toLocaleString();
    }
    return String(num);
  };

  // SVG Icons
  const GroupsIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4c4546" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  const ChartIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4c4546" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );

  const TrophyIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4c4546" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );

  const CalendarIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );

  const BellIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );

  const ArrowIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );

  const PieChartIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4c4546" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );

  // Skeleton loading cards
  const SkeletonCard = () => (
    <div className="bento-card" style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ width: 120, height: 12, background: "#eeeeee", borderRadius: 4, animation: "pulse 2s infinite" }} />
        <div style={{ width: 22, height: 22, background: "#eeeeee", borderRadius: 4, animation: "pulse 2s infinite" }} />
      </div>
      <div style={{ width: 100, height: 36, background: "#eeeeee", borderRadius: 4, animation: "pulse 2s infinite" }} />
      <div style={{ width: "100%", height: 4, background: "#eeeeee", borderRadius: 9999, marginTop: 24 }} />
    </div>
  );

  // Skill distribution data (decorative)
  const skillDistribution = [
    { name: "Software Engineering", percent: 45, opacity: 1 },
    { name: "Data Science", percent: 28, opacity: 0.6 },
    { name: "Product Design", percent: 18, opacity: 0.4 },
    { name: "Other", percent: 9, opacity: 0.2 },
  ];

  return (
    <div className="dashboard-scroll">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Dashboard Overview</h2>
          <p className="dashboard-subtitle">
            Welcome back, Alex. Here&apos;s your current talent landscape.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#ffffff",
              border: "1px solid #cfc4c5",
              borderRadius: 9999,
              padding: "8px 16px",
              color: "#4c4546",
              fontSize: 14,
            }}
          >
            {CalendarIcon}
            <span>Last 30 Days</span>
          </div>
          <button
            id="dashboard-notifications-btn"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1px solid #cfc4c5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ffffff",
              cursor: "pointer",
              color: "#1a1c1c",
              transition: "border-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#000";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#cfc4c5";
            }}
          >
            {BellIcon}
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : statistics ? (
          <>
            {/* Total Candidates */}
            <div className="bento-card" style={{ padding: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span className="stat-label">Total Candidates</span>
                {GroupsIcon}
              </div>
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <span className="stat-value">{formatNumber(statistics.total_candidates)}</span>
                <span className="stat-growth">+12%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: "75%" }} />
              </div>
            </div>

            {/* Average Experience */}
            <div className="bento-card" style={{ padding: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span className="stat-label">Average Experience</span>
                {ChartIcon}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span className="stat-value">{statistics.average_experience}</span>
                <span className="stat-suffix">years</span>
              </div>
              {/* Mini bar chart */}
              <div style={{ display: "flex", gap: 3, marginTop: 24 }}>
                {[0.2, 0.4, 0.6, 0.8, 1, 0, 0].map((opacity, i) => (
                  <div
                    key={i}
                    style={{
                      height: 16,
                      width: 8,
                      borderRadius: 2,
                      background: opacity > 0 ? "#000000" : "#eeeeee",
                      opacity: opacity > 0 ? opacity : 1,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Max Experience */}
            <div className="bento-card" style={{ padding: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span className="stat-label">Max Experience</span>
                {TrophyIcon}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span className="stat-value">{statistics.max_experience}</span>
                <span className="stat-suffix">years</span>
              </div>
              <p style={{ fontSize: 14, color: "#4c4546", marginTop: 24 }}>
                Top 2% of the candidate pool
              </p>
            </div>
          </>
        ) : (
          <div className="bento-card" style={{ padding: 32, gridColumn: "1 / -1", textAlign: "center", color: "#4c4546" }}>
            <p>Unable to load statistics. Please check backend connection.</p>
          </div>
        )}
      </div>

      {/* Middle Section: Recent Searches + Skill Distribution */}
      <div className="middle-grid">
        {/* Recent Searches Table */}
        <section className="bento-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div className="section-header">
            <h3 className="section-title">Recent Searches</h3>
            <button
              id="view-all-searches-btn"
              onClick={onNavigateToSearch}
              style={{
                background: "none",
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#000000",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.textDecoration = "none";
              }}
            >
              View All
            </button>
          </div>
          <div style={{ flex: 1, overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr className="table-header-row">
                  <th className="table-cell" style={{ fontWeight: 600 }}>Query</th>
                  <th className="table-cell" style={{ fontWeight: 600 }}>Matches</th>
                  <th className="table-cell" style={{ fontWeight: 600 }}>Status</th>
                  <th className="table-cell" style={{ fontWeight: 600 }}></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="table-cell" colSpan={4} style={{ textAlign: "center", color: "#4c4546", padding: 32 }}>
                      Loading searches...
                    </td>
                  </tr>
                ) : recentSearches.length === 0 ? (
                  <tr>
                    <td className="table-cell" colSpan={4} style={{ textAlign: "center", padding: 32 }}>
                      <p style={{ color: "#999", marginBottom: 12 }}>No recent searches</p>
                      <button
                        onClick={onNavigateToSearch}
                        style={{
                          padding: "8px 20px",
                          backgroundColor: "#000",
                          color: "#fff",
                          border: "none",
                          borderRadius: 9999,
                          cursor: "pointer",
                          fontSize: 14,
                          fontWeight: 500,
                          fontFamily: "inherit",
                        }}
                      >
                        Go to Search
                      </button>
                    </td>
                  </tr>
                ) : (
                  recentSearches.slice(0, 5).map((search, index) => (
                    <tr
                      key={search.search_id}
                      className="table-row"
                      style={{ cursor: "pointer" }}
                      onClick={() => onNavigateToSearch()}
                    >
                      <td className="table-cell" style={{ fontWeight: 500, color: "#000000", fontSize: 16 }}>
                        {search.query}
                      </td>
                      <td className="table-cell" style={{ fontSize: 14, color: "#4c4546" }}>
                        {search.results_count} results
                      </td>
                      <td className="table-cell">
                        <span className="status-pill">
                          {index === 0 ? "Active" : index % 3 === 1 ? "Saved" : index % 3 === 2 ? "Archived" : "Active"}
                        </span>
                      </td>
                      <td className="table-cell" style={{ textAlign: "right", color: "#4c4546" }}>
                        <span
                          style={{ cursor: "pointer", display: "inline-flex", transition: "color 0.15s ease" }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLSpanElement).style.color = "#000";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLSpanElement).style.color = "#4c4546";
                          }}
                        >
                          {ArrowIcon}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Skill Distribution */}
        <section className="bento-card" style={{ padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <h3 className="section-title">Skill Distribution</h3>
            {PieChartIcon}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>
            {skillDistribution.map((skill) => (
              <div key={skill.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
                  <span style={{ color: "#1a1c1c" }}>{skill.name}</span>
                  <span style={{ fontWeight: 600 }}>{skill.percent}%</span>
                </div>
                <div className="skill-bar-track">
                  <div
                    className="skill-bar-fill"
                    style={{ width: `${skill.percent}%`, opacity: skill.opacity }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p
            style={{
              fontSize: 14,
              color: "#4c4546",
              marginTop: 32,
              textAlign: "center",
              background: "#f3f3f3",
              padding: "8px 0",
              borderRadius: 4,
            }}
          >
            Analysis based on {statistics ? formatNumber(statistics.total_candidates) : "—"} unique profiles.
          </p>
        </section>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>
          RecruitAI semantic search relies on vector embeddings. Verify critical profile information.
        </p>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

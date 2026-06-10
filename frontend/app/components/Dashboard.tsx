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

  const StatCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: string | number;
    icon: string;
    color: string;
  }) => (
    <div
      style={{
        padding: "20px",
        borderRadius: "12px",
        backgroundColor: color,
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flex: 1,
        minWidth: "200px",
      }}
    >
      <div
        style={{
          fontSize: "32px",
          minWidth: "50px",
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: "12px",
            color: "#666",
            fontWeight: 500,
            marginBottom: "4px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#1a1c1c",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        maxWidth: "900px",
        margin: "0 auto",
        width: "100%",
        padding: "24px",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "32px",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#1a1c1c",
            margin: "0 0 8px 0",
          }}
        >
          Dashboard
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#666",
            margin: 0,
          }}
        >
          Overview of your talent pool and recent searches
        </p>
      </div>

      {/* Statistics Cards */}
      {isLoading ? (
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              backgroundColor: "#f0f0f0",
              flex: 1,
              minWidth: "200px",
              height: "100px",
              animation: "pulse 2s infinite",
            }}
          />
          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              backgroundColor: "#f0f0f0",
              flex: 1,
              minWidth: "200px",
              height: "100px",
              animation: "pulse 2s infinite",
            }}
          />
          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              backgroundColor: "#f0f0f0",
              flex: 1,
              minWidth: "200px",
              height: "100px",
              animation: "pulse 2s infinite",
            }}
          />
          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              backgroundColor: "#f0f0f0",
              flex: 1,
              minWidth: "200px",
              height: "100px",
              animation: "pulse 2s infinite",
            }}
          />
        </div>
      ) : statistics ? (
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "32px",
          }}
        >
          <StatCard
            title="Total Candidates"
            value={statistics.total_candidates}
            icon="👥"
            color="#e0f2fe"
          />
          <StatCard
            title="Average Experience"
            value={`${statistics.average_experience}y`}
            icon="📊"
            color="#f0fdf4"
          />
          <StatCard
            title="Max Experience"
            value={`${statistics.max_experience}y`}
            icon="⭐"
            color="#fef3c7"
          />
          <StatCard
            title="Min Experience"
            value={`${statistics.min_experience}y`}
            icon="🌱"
            color="#fde2e4"
          />
        </div>
      ) : null}

      {/* Recent Searches */}
      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#1a1c1c",
            margin: "0 0 16px 0",
          }}
        >
          Recent Searches
        </h2>

        {recentSearches.length === 0 ? (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              color: "#999",
            }}
          >
            <p style={{ margin: 0, marginBottom: "12px" }}>No recent searches</p>
            <button
              onClick={onNavigateToSearch}
              style={{
                padding: "8px 16px",
                backgroundColor: "#000",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Go to Search
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {recentSearches.map((search) => (
              <div
                key={search.search_id}
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 500,
                      color: "#1a1c1c",
                      marginBottom: "4px",
                    }}
                  >
                    {search.query}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#999",
                    }}
                  >
                    {search.results_count} results •{" "}
                    {new Date(search.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div
        style={{
          padding: "24px",
          backgroundColor: "#f0f0f0",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "#1a1c1c",
            margin: "0 0 12px 0",
          }}
        >
          Ready to find talent?
        </h3>
        <button
          onClick={onNavigateToSearch}
          style={{
            padding: "10px 24px",
            backgroundColor: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Search Candidates
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

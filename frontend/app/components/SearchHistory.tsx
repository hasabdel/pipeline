"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSearchHistory,
  deleteSearch,
  clearSearchHistory,
  SearchHistoryItem,
} from "../lib/api";

interface SearchHistoryProps {
  onSelectSearch: (query: string) => void;
  onHistoryChange?: () => void;
}

export default function SearchHistory({
  onSelectSearch,
  onHistoryChange,
}: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await getSearchHistory();
      setHistory(items);
    } catch (error) {
      console.error("Failed to load search history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (expanded) {
      loadHistory();
    }
  }, [expanded, loadHistory]);

  const handleSelectSearch = (query: string) => {
    onSelectSearch(query);
  };

  const handleDeleteSearch = async (
    e: React.MouseEvent,
    searchId: string
  ) => {
    e.stopPropagation();
    try {
      await deleteSearch(searchId);
      setHistory(history.filter((item) => item.search_id !== searchId));
      onHistoryChange?.();
    } catch (error) {
      console.error("Failed to delete search:", error);
    }
  };

  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to clear all search history?")) {
      try {
        await clearSearchHistory();
        setHistory([]);
        onHistoryChange?.();
      } catch (error) {
        console.error("Failed to clear history:", error);
      }
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    } catch {
      return timestamp;
    }
  };

  return (
    <div
      style={{
        marginTop: 24,
        borderTop: "1px solid #e5e7eb",
        paddingTop: 16,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "none",
          border: "none",
          padding: "8px 0",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          fontSize: 14,
          fontWeight: 600,
          color: "#374151",
        }}
      >
        <span>🕐 Search History</span>
        <span style={{ fontSize: 12 }}>
          {expanded ? "▼" : "▶"} {history.length}
        </span>
      </button>

      {expanded && (
        <div
          style={{
            marginTop: 12,
            maxHeight: 400,
            overflowY: "auto",
          }}
        >
          {isLoading ? (
            <div style={{ padding: "8px 0", color: "#9ca3af", fontSize: 12 }}>
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div style={{ padding: "8px 0", color: "#9ca3af", fontSize: 12 }}>
              No search history yet
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {history.map((item) => (
                  <div
                    key={item.search_id}
                    onClick={() => handleSelectSearch(item.query)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 6,
                      backgroundColor: "#f3f4f6",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 12,
                    }}
                    onMouseEnter={(e) => {
                      if (e.currentTarget instanceof HTMLElement) {
                        e.currentTarget.style.backgroundColor = "#e5e7eb";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (e.currentTarget instanceof HTMLElement) {
                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                      }
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: "#1f2937",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginBottom: 2,
                        }}
                        title={item.query}
                      >
                        {item.query}
                      </div>
                      <div
                        style={{
                          color: "#9ca3af",
                          fontSize: 11,
                          display: "flex",
                          gap: 8,
                        }}
                      >
                        <span>{item.results_count} results</span>
                        <span>{formatDate(item.timestamp)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) =>
                        handleDeleteSearch(e, item.search_id)
                      }
                      style={{
                        background: "none",
                        border: "none",
                        padding: 4,
                        cursor: "pointer",
                        color: "#ef4444",
                        fontSize: 14,
                        marginLeft: 8,
                      }}
                      title="Delete search"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  style={{
                    marginTop: 12,
                    padding: "6px 10px",
                    borderRadius: 4,
                    backgroundColor: "#fee2e2",
                    border: "1px solid #fecaca",
                    color: "#991b1b",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                    width: "100%",
                  }}
                >
                  Clear All History
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { getSearchHistory, deleteSearch, clearSearchHistory, SearchHistoryItem } from "../lib/api";

interface AllSearchHistoryProps {
  onSelectSearch?: (query: string) => void;
}

export default function AllSearchHistory({ onSelectSearch }: AllSearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSearchHistory();
      setHistory(data);
    } catch (error) {
      console.error("Failed to load search history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (searchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this search record?")) return;

    setDeletingId(searchId);
    try {
      await deleteSearch(searchId);
      await fetchHistory();
    } catch (error) {
      console.error("Failed to delete search:", error);
      alert("Failed to delete search record.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear ALL search history? This cannot be undone.")) return;

    setIsClearing(true);
    try {
      await clearSearchHistory();
      await fetchHistory();
    } catch (error) {
      console.error("Failed to clear history:", error);
      alert("Failed to clear search history.");
    } finally {
      setIsClearing(false);
    }
  };

  const TrashIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );

  return (
    <div className="dashboard-scroll">
      {/* Header */}
      <header className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 className="dashboard-title">Search History</h2>
          <p className="dashboard-subtitle">
            Browse and manage all your past candidate searches.
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={isClearing}
            style={{
              padding: "10px 16px",
              backgroundColor: "#fee2e2",
              color: "#ef4444",
              border: "1px solid #f87171",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "14px",
              cursor: isClearing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
              opacity: isClearing ? 0.7 : 1,
            }}
          >
            {isClearing ? "Clearing..." : "Clear All History"}
          </button>
        )}
      </header>

      {/* Main Content */}
      <div style={{ padding: "0 40px", paddingBottom: 60, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div className="bento-card" style={{ display: "flex", flexDirection: "column", minHeight: 400 }}>
          <div style={{ flex: 1, overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr className="table-header-row" style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th className="table-cell" style={{ fontWeight: 600 }}>Query</th>
                  <th className="table-cell" style={{ fontWeight: 600 }}>Matches</th>
                  <th className="table-cell" style={{ fontWeight: 600 }}>Date</th>
                  <th className="table-cell" style={{ fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="table-cell" colSpan={4} style={{ textAlign: "center", color: "#4c4546", padding: 48 }}>
                      <div className="spinner" style={{ margin: "0 auto 16px" }} />
                      Loading history...
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td className="table-cell" colSpan={4} style={{ textAlign: "center", color: "#4c4546", padding: 48 }}>
                      No search history found.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => {
                    const date = new Date(item.timestamp);
                    const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                    const formattedTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <tr 
                        key={item.id} 
                        className="table-row hoverable-row" 
                        style={{ borderBottom: "1px solid #f3f4f6", cursor: onSelectSearch ? "pointer" : "default" }}
                        onClick={() => onSelectSearch && onSelectSearch(item.query)}
                        title={onSelectSearch ? "Click to re-run this search" : ""}
                      >
                        <td className="table-cell" style={{ fontWeight: 500, color: "#000000" }}>
                          {item.query}
                        </td>
                        <td className="table-cell" style={{ color: "#4c4546" }}>
                          <span style={{ 
                            background: item.results_count > 0 ? "#e0e7ff" : "#f3f4f6", 
                            color: item.results_count > 0 ? "#4338ca" : "#6b7280",
                            padding: "4px 8px", 
                            borderRadius: "12px", 
                            fontSize: "12px",
                            fontWeight: 600
                          }}>
                            {item.results_count} found
                          </span>
                        </td>
                        <td className="table-cell" style={{ color: "#4c4546", fontSize: 14 }}>
                          {formattedDate} at {formattedTime}
                        </td>
                        <td className="table-cell" style={{ textAlign: "right" }}>
                          <button
                            onClick={(e) => handleDelete(item.search_id, e)}
                            disabled={deletingId === item.search_id}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: deletingId === item.search_id ? "#9ca3af" : "#ef4444",
                              cursor: deletingId === item.search_id ? "not-allowed" : "pointer",
                              padding: "8px",
                              borderRadius: "4px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "background 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              if (deletingId !== item.search_id) {
                                (e.currentTarget as HTMLButtonElement).style.background = "#fee2e2";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (deletingId !== item.search_id) {
                                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                              }
                            }}
                            title="Delete Record"
                          >
                            {deletingId === item.search_id ? (
                              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderColor: "#9ca3af", borderTopColor: "transparent" }} />
                            ) : (
                              TrashIcon
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hoverable-row:hover {
          background-color: #f9fafb;
        }
      `}} />
    </div>
  );
}

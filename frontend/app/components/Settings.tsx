"use client";

import { useState, useEffect, useCallback } from "react";
import { getCandidates, deleteCandidate, CandidateListItem } from "../lib/api";

export default function Settings() {
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchCandidates = useCallback(async (query: string = "") => {
    setIsLoading(true);
    try {
      const response = await getCandidates(query);
      setCandidates(response.candidates);
    } catch (error) {
      console.error("Failed to load candidates:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchCandidates(val);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this resume? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(id);
    try {
      await deleteCandidate(id);
      await fetchCandidates(searchQuery); // Refresh the list
    } catch (error) {
      console.error("Failed to delete candidate:", error);
      alert("Failed to delete candidate. Please check the backend connection.");
    } finally {
      setIsDeleting(null);
    }
  };

  const SearchIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  const TrashIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );

  return (
    <div className="dashboard-scroll">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Manage Database</h2>
          <p className="dashboard-subtitle">
            Search, view, and remove candidate resumes from the vector database.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ padding: "0 40px", paddingBottom: 60, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div className="bento-card" style={{ display: "flex", flexDirection: "column", minHeight: 400 }}>
          {/* Search Bar */}
          <div style={{ padding: 24, borderBottom: "1px solid #cfc4c5", display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
              <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#4c4546", display: "flex" }}>
                {SearchIcon}
              </div>
              <input
                type="text"
                placeholder="Search by name, email, or filename..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 48px",
                  borderRadius: 8,
                  border: "1px solid #cfc4c5",
                  fontSize: 15,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          {/* Candidates List */}
          <div style={{ flex: 1, overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr className="table-header-row" style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th className="table-cell" style={{ fontWeight: 600 }}>Candidate</th>
                  <th className="table-cell" style={{ fontWeight: 600 }}>Email</th>
                  <th className="table-cell" style={{ fontWeight: 600 }}>Experience</th>
                  <th className="table-cell" style={{ fontWeight: 600 }}>Source File</th>
                  <th className="table-cell" style={{ fontWeight: 600, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="table-cell" colSpan={5} style={{ textAlign: "center", color: "#4c4546", padding: 48 }}>
                      <div className="spinner" style={{ margin: "0 auto 16px" }} />
                      Loading candidates...
                    </td>
                  </tr>
                ) : candidates.length === 0 ? (
                  <tr>
                    <td className="table-cell" colSpan={5} style={{ textAlign: "center", color: "#4c4546", padding: 48 }}>
                      No candidates found.
                    </td>
                  </tr>
                ) : (
                  candidates.map((candidate) => (
                    <tr key={candidate.id} className="table-row" style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td className="table-cell" style={{ fontWeight: 500, color: "#000000" }}>
                        {candidate.name}
                      </td>
                      <td className="table-cell" style={{ color: "#4c4546" }}>
                        {candidate.email}
                      </td>
                      <td className="table-cell" style={{ color: "#4c4546" }}>
                        {candidate.experience_years} yrs
                      </td>
                      <td className="table-cell" style={{ color: "#4c4546", fontSize: 13, wordBreak: "break-all", maxWidth: 300 }}>
                        {candidate.source_file.split(/[\/\\]/).pop()}
                      </td>
                      <td className="table-cell" style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleDelete(candidate.id)}
                          disabled={isDeleting === candidate.id}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: isDeleting === candidate.id ? "#9ca3af" : "#ef4444",
                            cursor: isDeleting === candidate.id ? "not-allowed" : "pointer",
                            padding: "8px",
                            borderRadius: "4px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (isDeleting !== candidate.id) {
                              (e.currentTarget as HTMLButtonElement).style.background = "#fee2e2";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (isDeleting !== candidate.id) {
                              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                            }
                          }}
                          title="Delete Resume"
                        >
                          {isDeleting === candidate.id ? (
                            <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, borderColor: "#9ca3af", borderTopColor: "transparent" }} />
                          ) : (
                            TrashIcon
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

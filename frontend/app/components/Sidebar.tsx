"use client";

import { useState, useRef } from "react";
import { uploadResume } from "../lib/api";
import SearchHistory from "./SearchHistory";

interface SidebarProps {
  currentPage: "dashboard" | "search";
  onNavigateToDashboard: () => void;
  onNavigateToSearch: () => void;
  onUploadSuccess: (message: string) => void;
  onSelectSearch?: (query: string) => void;
}

export default function Sidebar({ 
  currentPage, 
  onNavigateToDashboard, 
  onNavigateToSearch,
  onUploadSuccess, 
  onSelectSearch 
}: SidebarProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadResume(file);
      onUploadSuccess(response.message || "Resume uploaded successfully");
    } catch {
      onUploadSuccess("Upload failed. Please check if the backend is running.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const NavButton = ({ 
    label, 
    icon, 
    onClick, 
    isActive 
  }: { 
    label: string; 
    icon: React.JSX.Element; 
    onClick: () => void; 
    isActive: boolean 
  }) => (
    <button
      id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "10px 12px",
        borderRadius: 8,
        border: "none",
        background: isActive ? "#eeeeee" : "transparent",
        fontFamily: "inherit",
        fontSize: 14,
        color: isActive ? "#1a1c1c" : "#5a5d5d",
        fontWeight: isActive ? 500 : 400,
        cursor: "pointer",
        transition: "all 0.15s",
        textAlign: "left",
      }}
    >
      <span style={{ opacity: isActive ? 1 : 0.65, flexShrink: 0, display: "flex" }}>
        {icon}
      </span>
      {label}
    </button>
  );

  const DashboardIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );

  const TalentIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  const SettingsIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: 260,
        background: "#f9f9f9",
        borderRight: "1px solid #ececec",
        display: "flex",
        flexDirection: "column",
        zIndex: 40,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ padding: "28px 24px 20px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em", color: "#1a1c1c", lineHeight: 1.2, margin: 0 }}>
          AI Recruiter
        </h1>
        <span style={{ fontSize: 12, fontWeight: 400, letterSpacing: "0.06em", textTransform: "uppercase", color: "#747878", marginTop: 2, display: "block" }}>
          Intelligent Partner
        </span>
      </div>

      {/* Upload Button */}
      <div style={{ padding: "0 20px 20px" }}>
        <button
          id="upload-resume-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            width: "100%",
            height: 44,
            borderRadius: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 500,
            fontFamily: "inherit",
            border: "none",
            background: uploading ? "#333" : "#000",
            color: "#fff",
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {uploading ? (
            <>
              <div className="spinner" />
              <span>Uploading…</span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Upload Resumes</span>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          style={{ display: "none" }}
          onChange={handleFileSelect}
          id="file-upload-input"
        />
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "0 12px", overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <NavButton 
            label="Dashboard"
            icon={DashboardIcon}
            onClick={onNavigateToDashboard}
            isActive={currentPage === "dashboard"}
          />
          <NavButton 
            label="Talent Pool"
            icon={TalentIcon}
            onClick={onNavigateToSearch}
            isActive={currentPage === "search"}
          />
        </div>
      </nav>

      {/* Search History - Now under Talent Pool */}
      <div style={{ padding: "0 12px", borderTop: "1px solid #ececec" }}>
        <SearchHistory
          onSelectSearch={(query) => {
            onSelectSearch?.(query);
            onNavigateToSearch();
          }}
        />
      </div>

      {/* Settings - Now above User Profile */}
      <div style={{ padding: "12px", borderTop: "1px solid #ececec" }}>
        <NavButton 
          label="Settings"
          icon={SettingsIcon}
          onClick={() => {}}
          isActive={false}
        />
      </div>

      {/* Footer - User Profile */}
      <div style={{ padding: 20, borderTop: "1px solid #ececec" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "#1a1c1c",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            AT
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1c1c", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Alex Thorne
            </div>
            <div style={{ fontSize: 12, color: "#747878", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Senior Recruiter
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

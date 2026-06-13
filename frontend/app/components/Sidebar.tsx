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

  const DashboardIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );

  const TalentIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  const SettingsIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );

  const LogoIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );

  const LogoutIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4c4546" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );

  const navItems = [
    { label: "Dashboard", icon: DashboardIcon, onClick: onNavigateToDashboard, isActive: currentPage === "dashboard" },
    { label: "Talent Pool", icon: TalentIcon, onClick: onNavigateToSearch, isActive: currentPage === "search" },
    { label: "Settings", icon: SettingsIcon, onClick: () => {}, isActive: false },
  ];

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: 260,
        background: "#f3f3f3",
        borderRight: "1px solid #cfc4c5",
        display: "flex",
        flexDirection: "column",
        zIndex: 40,
        fontFamily: "Inter, sans-serif",
        padding: "24px",
        gap: 16,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <div
          style={{
            width: 40,
            height: 40,
            background: "#000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            flexShrink: 0,
          }}
        >
          {LogoIcon}
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#000000", lineHeight: 1.2, margin: 0 }}>
            RecruitAI
          </h1>
          <span style={{ fontSize: 14, fontWeight: 400, color: "#4c4546", display: "block" }}>
            Recruitment Engine
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map((item) => (
          <button
            key={item.label}
            id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            onClick={item.onClick}
            className={item.isActive ? "sidebar-active" : ""}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: item.isActive ? undefined : "transparent",
              fontFamily: "inherit",
              fontSize: 16,
              color: item.isActive ? "#151c27" : "#4c4546",
              fontWeight: item.isActive ? 500 : 400,
              cursor: "pointer",
              transition: "all 0.15s ease",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              if (!item.isActive) {
                (e.currentTarget as HTMLButtonElement).style.background = "#e8e8e8";
              }
            }}
            onMouseLeave={(e) => {
              if (!item.isActive) {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }
            }}
          >
            <span style={{ display: "flex", flexShrink: 0 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        {/* Search History - collapsible under navigation */}
        <div style={{ marginTop: 8 }}>
          <SearchHistory
            onSelectSearch={(query) => {
              onSelectSearch?.(query);
              onNavigateToSearch();
            }}
          />
        </div>
      </nav>

      {/* Upload Button */}
      <div>
        <button
          id="upload-resume-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 16,
            fontWeight: 500,
            fontFamily: "inherit",
            border: "none",
            background: uploading ? "#333" : "#000",
            color: "#fff",
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "background 0.2s ease",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
          }}
          onMouseEnter={(e) => {
            if (!uploading) {
              (e.currentTarget as HTMLButtonElement).style.background = "#27272a";
            }
          }}
          onMouseLeave={(e) => {
            if (!uploading) {
              (e.currentTarget as HTMLButtonElement).style.background = "#000";
            }
          }}
        >
          {uploading ? (
            <>
              <div className="spinner" />
              <span>Uploading…</span>
            </>
          ) : (
            <span>+ Upload Resumes</span>
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

      {/* Footer - User Profile */}
      <div style={{ borderTop: "1px solid #cfc4c5", paddingTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 8px" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#1a1c1c",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              flexShrink: 0,
              border: "1px solid #cfc4c5",
            }}
          >
            AT
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1c1c", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Alex Thorne
            </div>
            <div style={{ fontSize: 12, color: "#4c4546", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Premium Plan
            </div>
          </div>
          <span style={{ cursor: "pointer", display: "flex", flexShrink: 0 }}>
            {LogoutIcon}
          </span>
        </div>
      </div>
    </aside>
  );
}

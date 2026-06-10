"use client";

import { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import Dashboard from "./components/Dashboard";
import HeroSection from "./components/HeroSection";
import SearchResults from "./components/SearchResults";
import ChatInput from "./components/ChatInput";
import Toast from "./components/Toast";
import { searchCandidates, CandidateMatch } from "./lib/api";

export default function Home() {
  const [currentPage, setCurrentPage] = useState<"dashboard" | "search">("search");
  const [results, setResults] = useState<CandidateMatch[] | null>(null);
  const [lastQuery, setLastQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [chipValue, setChipValue] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSearch = useCallback(async (query: string, saveToHistory: boolean = true) => {
    setIsSearching(true);
    setLastQuery(query);
    try {
      const response = await searchCandidates(query, saveToHistory);
      setResults(response.matches);
    } catch {
      setToastMessage("Search failed. Please check if the backend is running.");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleChipClick = useCallback((text: string) => {
    setChipValue(text);
  }, []);

  const handleUploadSuccess = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  const handleSelectSearch = useCallback((query: string) => {
    setChipValue(query);
    handleSearch(query, false);  // Don't save to history when re-running previous searches
  }, [handleSearch]);

  const handleNavigateToDashboard = useCallback(() => {
    setCurrentPage("dashboard");
  }, []);

  const handleNavigateToSearch = useCallback(() => {
    setCurrentPage("search");
  }, []);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* Left Sidebar */}
      <Sidebar 
        currentPage={currentPage}
        onNavigateToDashboard={handleNavigateToDashboard}
        onNavigateToSearch={handleNavigateToSearch}
        onUploadSuccess={handleUploadSuccess} 
        onSelectSearch={handleSelectSearch} 
      />

      {/* Main Workspace */}
      <main
        style={{
          marginLeft: 260,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          backgroundColor: "#ffffff",
          minWidth: 0,
        }}
      >
        {/* Top Navigation */}
        <TopNav />

        {/* Center Content */}
        {currentPage === "dashboard" ? (
          <Dashboard onNavigateToSearch={handleNavigateToSearch} />
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              maxWidth: 800,
              margin: "0 auto",
              width: "100%",
              padding: "0 24px",
            }}
          >
            {results !== null ? (
              <SearchResults results={results} query={lastQuery} />
            ) : (
              <HeroSection onChipClick={handleChipClick} />
            )}

            {/* Chat Input - Always visible */}
            <ChatInput
              onSubmit={handleSearch}
              isLoading={isSearching}
              initialValue={chipValue}
            />
          </div>
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

export default function ChatInput({ onSubmit, isLoading, initialValue }: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
      inputRef.current?.focus();
    }
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  };

  const canSubmit = value.trim().length > 0 && !isLoading;

  return (
    <div style={{ flexShrink: 0, padding: "12px 0 20px" }}>
      <form onSubmit={handleSubmit} style={{ position: "relative" }}>
        <input
          ref={inputRef}
          id="search-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search for candidates by skill, experience, or role..."
          disabled={isLoading}
          className="chat-input"
          style={{
            width: "100%",
            height: 56,
            padding: "0 56px 0 20px",
            borderRadius: 16,
            border: "1px solid #c4c7c7",
            background: "#ffffff",
            fontSize: 14,
            fontFamily: "inherit",
            color: "#1a1c1c",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <button
          id="search-submit-btn"
          type="submit"
          disabled={!canSubmit}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "none",
            background: canSubmit ? "#000" : "#e0e0e0",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: canSubmit ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          {isLoading ? (
            <div className="spinner" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          )}
        </button>
      </form>
      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "#747878",
          marginTop: 12,
          lineHeight: 1.5,
        }}
      >
        RecruitAI semantic search relies on vector embeddings. Verify critical profile information.
      </p>
    </div>
  );
}

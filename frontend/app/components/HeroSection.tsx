"use client";

interface HeroSectionProps {
  onChipClick: (text: string) => void;
}

const PROMPT_CHIPS = [
  "Find Python developers with 3 years experience",
  "Show me networking experts",
  "Newest applicants",
];

export default function HeroSection({ onChipClick }: HeroSectionProps) {
  return (
    <div
      className="animate-fade-up"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        padding: 24,
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontSize: 40,
          fontWeight: 600,
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
          color: "#1a1c1c",
          marginBottom: 16,
          maxWidth: 620,
        }}
      >
        How can I help you find talent today?
      </h2>
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.6,
          color: "#747878",
          maxWidth: 480,
          marginBottom: 40,
        }}
      >
        Your intelligent partner for high-velocity hiring.
        <br />
        Ask me to source or filter your candidate pipeline.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
        {PROMPT_CHIPS.map((chip) => (
          <button
            key={chip}
            id={`chip-${chip.toLowerCase().replace(/\s+/g, "-").slice(0, 30)}`}
            onClick={() => onChipClick(chip)}
            className="chip"
            style={{
              padding: "10px 16px",
              borderRadius: 9999,
              fontSize: 13,
              fontFamily: "inherit",
              color: "#3a3d3d",
              background: "#ffffff",
              border: "1px solid #dddede",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#b0b2b2";
              (e.currentTarget as HTMLButtonElement).style.background = "#f7f7f7";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#dddede";
              (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
            }}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}

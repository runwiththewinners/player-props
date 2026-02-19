"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Play, UserAccess, BetResult } from "@/lib/types";

const CHALKBOARD_LINK = "https://go.chalkboard.io/websignup-v1-tt?utm_source=promo&offer=flare";
const CHALKBOARD_CODE = "FLARE";

const SPORTS_ICONS: Record<string, string> = {
  NBA: "🏀", NFL: "🏈", NCAAB: "🏀", NCAAF: "🏈",
  MLB: "⚾", NHL: "🏒", Soccer: "⚽", UFC: "🥊", Tennis: "🎾",
};

// ─── Play Card ───────────────────────────────────────────────────
function PlayCard({
  play,
  isPaywalled,
  isAdmin,
  onGrade,
}: {
  play: Play;
  isPaywalled: boolean;
  isAdmin: boolean;
  onGrade?: (id: string, result: BetResult) => void;
}) {
  const resultColors: Record<string, string> = {
    pending: "#9ca3af",
    win: "#22c55e",
    loss: "#ef4444",
    push: "#eab308",
  };

  const isWin = play.result === "win";
  const isLoss = play.result === "loss";

  return (
    <div
      style={{
        background: isWin
          ? "rgba(34,197,94,0.08)"
          : isLoss
          ? "rgba(239,68,68,0.06)"
          : "rgba(74,222,128,0.04)",
        border: `1px solid ${
          isWin
            ? "rgba(34,197,94,0.3)"
            : isLoss
            ? "rgba(239,68,68,0.2)"
            : "rgba(74,222,128,0.15)"
        }`,
        borderRadius: 16,
        overflow: "hidden",
        animation: "fadeSlideIn 0.5s ease forwards",
      }}
    >
      <div
        style={{
          height: 3,
          background: isWin
            ? "linear-gradient(90deg, transparent, #22c55e, transparent)"
            : isLoss
            ? "linear-gradient(90deg, transparent, #ef4444, transparent)"
            : "linear-gradient(90deg, #166534, #4ade80, #166534)",
        }}
      />
      <div style={{ padding: "20px 24px" }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>
              {SPORTS_ICONS[play.sport] || "🎯"}
            </span>
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "'Courier Prime', monospace",
                  color: "#4ade80",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                {play.sport}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  fontFamily: "'Courier Prime', monospace",
                }}
              >
                {play.postedAt}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontFamily: "'Courier Prime', monospace",
                color: "#4ade80",
                background: "rgba(74,222,128,0.1)",
                border: "1px solid rgba(74,222,128,0.2)",
                borderRadius: 6,
                padding: "3px 8px",
                letterSpacing: 1,
              }}
            >
              {play.units}U
            </span>
            <span
              style={{
                fontSize: 11,
                fontFamily: "'Courier Prime', monospace",
                color: resultColors[play.result],
                background: `${resultColors[play.result]}18`,
                border: `1px solid ${resultColors[play.result]}40`,
                borderRadius: 6,
                padding: "3px 8px",
                letterSpacing: 1,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {play.result === "win"
                ? "WIN ✓"
                : play.result === "loss"
                ? "LOSS ✗"
                : play.result === "push"
                ? "PUSH ⟳"
                : "PENDING"}
            </span>
          </div>
        </div>

        {/* Pick & Odds */}
        <div style={{ marginBottom: 12, position: "relative" }}>
          {isPaywalled && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                background: "rgba(0,0,0,0.3)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "'Oswald', sans-serif",
                  color: "#4ade80",
                  letterSpacing: 2,
                }}
              >
                🔒 SUBSCRIBE TO VIEW
              </span>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: isPaywalled ? "transparent" : "#f5f5f5",
                fontFamily: "'Oswald', sans-serif",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {isPaywalled ? "XXXXXXXXXX" : play.team}
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: isPaywalled ? "transparent" : "#4ade80",
                fontFamily: "'Oswald', sans-serif",
              }}
            >
              {isPaywalled ? "XXX" : play.odds}
            </div>
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#6b7280",
              fontFamily: "'Courier Prime', monospace",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginTop: 4,
            }}
          >
            {play.betType}
          </div>
        </div>

        {/* Matchup */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: "#d4a843",
              fontFamily: "'Courier Prime', monospace",
            }}
          >
            {play.matchup}
          </span>
          <span
            style={{
              fontSize: 12,
              color: "#6b7280",
              fontFamily: "'Courier Prime', monospace",
            }}
          >
            {play.time}
          </span>
        </div>

        {/* Admin grading */}
        {isAdmin && play.result === "pending" && onGrade && (
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 12,
              paddingTop: 12,
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {(["win", "loss", "push"] as BetResult[]).map((r) => (
              <button
                key={r}
                onClick={() => onGrade(play.id, r)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 8,
                  border: `1px solid ${resultColors[r]}40`,
                  background: `${resultColors[r]}12`,
                  color: resultColors[r],
                  fontSize: 11,
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 600,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ChalkBoard Verification Upload ──────────────────────────────
function ChalkBoardVerify({ userId }: { userId: string | null }) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [existingClaim, setExistingClaim] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/verify-chalkboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.claimed) {
          setExistingClaim(data);
        }
        setCheckingStatus(false);
      })
      .catch(() => setCheckingStatus(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setResult(null);
    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Full = ev.target?.result as string;
      const base64Data = base64Full.split(",")[1];
      const mediaType = file.type || "image/png";

      try {
        const res = await fetch("/api/verify-chalkboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: base64Data, mediaType }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setResult(data);
        } else {
          setError(data.message || "Verification failed. Please try again.");
          if (data.error === "already_claimed") {
            setExistingClaim({ promoCode: data.promoCode, checkoutUrl: `https://whop.com/rwtw/rwtw-propboard/?code=${data.promoCode}` });
          }
        }
      } catch (err) {
        setError("Something went wrong. Please try again.");
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (checkingStatus) return null;

  // Promo code display component (shared between existing claim and new result)
  const PromoCodeDisplay = ({ promoCode, checkoutUrl }: { promoCode: string; checkoutUrl: string }) => (
    <div
      style={{
        background: "rgba(34,197,94,0.08)",
        border: "1px solid rgba(34,197,94,0.3)",
        borderRadius: 16,
        padding: 28,
        marginBottom: 28,
        textAlign: "center",
        animation: "fadeSlideIn 0.5s ease forwards",
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 10 }}>🎉</div>
      <div
        style={{
          fontSize: 18,
          fontFamily: "'Oswald', sans-serif",
          fontWeight: 700,
          color: "#22c55e",
          letterSpacing: 3,
          marginBottom: 16,
        }}
      >
        CHALKBOARD VERIFIED!
      </div>

      {/* Big promo code box */}
      <div
        style={{
          margin: "0 auto 16px",
          padding: "16px 24px",
          borderRadius: 12,
          background: "rgba(0,0,0,0.4)",
          border: "2px dashed rgba(74,222,128,0.4)",
          display: "inline-block",
          minWidth: 200,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontFamily: "'Oswald', sans-serif",
            color: "#6b7280",
            letterSpacing: 3,
            marginBottom: 6,
            textTransform: "uppercase",
          }}
        >
          Your Promo Code
        </div>
        <div
          style={{
            fontSize: 32,
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 800,
            color: "#4ade80",
            letterSpacing: 5,
          }}
        >
          {promoCode}
        </div>
        <button
          onClick={() => copyCode(promoCode)}
          style={{
            marginTop: 8,
            padding: "6px 16px",
            borderRadius: 8,
            border: "1px solid rgba(74,222,128,0.3)",
            background: "rgba(74,222,128,0.1)",
            color: "#4ade80",
            fontSize: 11,
            fontFamily: "'Oswald', sans-serif",
            letterSpacing: 2,
            cursor: "pointer",
          }}
        >
          {copied ? "COPIED ✓" : "COPY CODE"}
        </button>
      </div>

      {/* Instructions */}
      <div
        style={{
          fontSize: 13,
          color: "#d4d4d4",
          lineHeight: 1.7,
          marginBottom: 20,
          maxWidth: 340,
          margin: "0 auto 20px",
        }}
      >
        Use this code at checkout to get{" "}
        <span style={{ color: "#4ade80", fontWeight: 700 }}>100% off</span>{" "}
        your first month of Player Props!
      </div>

      <a
        href={checkoutUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          padding: "16px 40px",
          borderRadius: 12,
          background: "linear-gradient(135deg, #166534, #22c55e)",
          color: "#0a0a0a",
          fontSize: 15,
          fontFamily: "'Oswald', sans-serif",
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: "uppercase",
          textDecoration: "none",
          cursor: "pointer",
        }}
      >
        CLAIM YOUR FREE MONTH
      </a>

      <div
        style={{
          fontSize: 11,
          color: "#6b7280",
          marginTop: 12,
          fontFamily: "'Courier Prime', monospace",
        }}
      >
        Code will be auto-applied when you click the link above
      </div>
    </div>
  );

  // Already claimed
  if (existingClaim) {
    return (
      <PromoCodeDisplay
        promoCode={existingClaim.promoCode}
        checkoutUrl={existingClaim.checkoutUrl}
      />
    );
  }

  // Success - just verified
  if (result) {
    return (
      <PromoCodeDisplay
        promoCode={result.promoCode}
        checkoutUrl={result.checkoutUrl}
      />
    );
  }

  // Upload form
  return (
    <div
      style={{
        background: "rgba(74,222,128,0.03)",
        border: "1px solid rgba(74,222,128,0.12)",
        borderRadius: 16,
        padding: 24,
        marginBottom: 28,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontFamily: "'Oswald', sans-serif",
          fontWeight: 700,
          color: "#4ade80",
          letterSpacing: 2,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Already Signed Up?
      </div>
      <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16, lineHeight: 1.6 }}>
        Upload a screenshot of your ChalkBoard account showing a deposit of at least $10 to verify and unlock your free month.
      </p>

      <label
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 20,
          borderRadius: 12,
          border: uploading
            ? "2px solid rgba(74,222,128,0.5)"
            : "2px dashed rgba(74,222,128,0.2)",
          background: uploading ? "rgba(74,222,128,0.06)" : "rgba(0,0,0,0.2)",
          cursor: uploading ? "wait" : "pointer",
          transition: "all 0.3s ease",
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          style={{ display: "none" }}
        />
        {uploading ? (
          <>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🤖</div>
            <div
              style={{
                fontSize: 12,
                fontFamily: "'Oswald', sans-serif",
                color: "#4ade80",
                letterSpacing: 2,
              }}
            >
              VERIFYING SCREENSHOT...
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
              AI is checking your ChalkBoard account
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📸</div>
            <div
              style={{
                fontSize: 12,
                fontFamily: "'Oswald', sans-serif",
                color: "#4ade80",
                letterSpacing: 2,
              }}
            >
              UPLOAD CHALKBOARD SCREENSHOT
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
              Must show account with $10+ deposit
            </div>
          </>
        )}
      </label>

      {error && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#ef4444",
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

// ─── ChalkBoard CTA (for paywalled users) ───────────────────────
function ChalkBoardCTA() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(22,101,52,0.3), rgba(0,0,0,0.6))",
        border: "1px solid rgba(74,222,128,0.3)",
        borderRadius: 20,
        padding: 28,
        marginBottom: 28,
        textAlign: "center",
        animation: "fadeSlideIn 0.5s ease forwards",
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 12 }}>🎯</div>
      <h2
        style={{
          fontSize: 24,
          fontFamily: "'Oswald', sans-serif",
          fontWeight: 800,
          color: "#4ade80",
          letterSpacing: 2,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Get Free Player Props
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "#9ca3af",
          lineHeight: 1.6,
          maxWidth: 400,
          margin: "12px auto 10px",
        }}
      >
        Sign up on ChalkBoard using our link and get a{" "}
        <span style={{ color: "#4ade80", fontWeight: 700 }}>
          free month of Player Prop plays
        </span>
        !
      </p>

      <div
        style={{
          margin: "8px auto",
          padding: "12px 20px",
          borderRadius: 10,
          background: "rgba(74,222,128,0.08)",
          border: "1px dashed rgba(74,222,128,0.3)",
          display: "inline-block",
        }}
      >
        <div style={{ fontSize: 10, fontFamily: "'Oswald', sans-serif", color: "#6b7280", letterSpacing: 2, marginBottom: 4 }}>
          PROMO CODE
        </div>
        <div style={{ fontSize: 24, fontFamily: "'Oswald', sans-serif", fontWeight: 800, color: "#4ade80", letterSpacing: 4 }}>
          {CHALKBOARD_CODE}
        </div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6, fontFamily: "'Courier Prime', monospace" }}>
          Deposit match up to <span style={{ color: "#4ade80", fontWeight: 700 }}>$100</span>
        </div>
      </div>

      <br />

      <a
        href={CHALKBOARD_LINK}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          padding: "14px 36px",
          borderRadius: 12,
          background: "linear-gradient(135deg, #166534, #22c55e)",
          color: "#0a0a0a",
          fontSize: 14,
          fontFamily: "'Oswald', sans-serif",
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: "uppercase",
          textDecoration: "none",
          cursor: "pointer",
          transition: "all 0.3s ease",
          marginBottom: 12,
        }}
      >
        Sign Up on ChalkBoard
      </a>

      <div
        style={{
          fontSize: 11,
          color: "#6b7280",
          marginTop: 8,
        }}
      >
        Or subscribe to{" "}
        <a href="https://whop.com/rwtw/rwtw-propboard/" target="_blank" rel="noopener noreferrer" style={{ color: "#d4a843", textDecoration: "underline", textUnderlineOffset: 2 }}>Player Props</a> or{" "}
        <a href="https://whop.com/rwtw/rwtw-premium-copy/" target="_blank" rel="noopener noreferrer" style={{ color: "#d4a843", textDecoration: "underline", textUnderlineOffset: 2 }}>High Rollers</a> for instant
        access
      </div>
    </div>
  );
}

// ─── Admin Panel ─────────────────────────────────────────────────
function AdminPanel({
  onPost,
  onClose,
}: {
  onPost: (data: any) => void;
  onClose: () => void;
}) {
  const [team, setTeam] = useState("");
  const [betType, setBetType] = useState("PLAYER PROP");
  const [odds, setOdds] = useState("");
  const [matchup, setMatchup] = useState("");
  const [time, setTime] = useState("");
  const [sport, setSport] = useState("NBA");
  const [units, setUnits] = useState("1");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError("");
    setScanning(true);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Full = ev.target?.result as string;
      const base64Data = base64Full.split(",")[1];
      const mediaType = file.type || "image/png";

      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "image",
                    source: { type: "base64", media_type: mediaType, data: base64Data },
                  },
                  {
                    type: "text",
                    text: `Read this ChalkBoard or sportsbook bet slip screenshot. Extract fields and respond ONLY with JSON, no markdown:
{
  "team": "Player name and prop line, e.g. 'LeBron James Over 25.5 Points'",
  "betType": "PLAYER PROP",
  "odds": "The odds e.g. '-110' or '+140'",
  "sport": "One of: NCAAB, NBA, NFL, NCAAF, NHL, MLB, Soccer, UFC, Tennis",
  "matchup": "Teams playing, e.g. 'Lakers vs Celtics'",
  "time": "Game time if visible, e.g. '7:30PM ET', or empty string"
}`,
                  },
                ],
              },
            ],
          }),
        });

        const data = await response.json();
        const text = data.content?.map((b: any) => (b.type === "text" ? b.text : "")).join("") || "";
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);

        if (parsed.team) setTeam(parsed.team);
        if (parsed.betType) setBetType(parsed.betType);
        if (parsed.odds) setOdds(parsed.odds);
        if (parsed.sport) setSport(parsed.sport);
        if (parsed.matchup) setMatchup(parsed.matchup);
        if (parsed.time) setTime(parsed.time);
      } catch (err) {
        console.error("Scan error:", err);
        setScanError("Couldn't read that slip. Fill in manually.");
      }
      setScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const handlePost = () => {
    if (!team) return;
    onPost({ team, betType, odds, matchup, time, sport, units: parseInt(units) || 1 });
    setTeam(""); setOdds(""); setMatchup(""); setTime("");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid rgba(74,222,128,0.15)",
    background: "rgba(74,222,128,0.04)",
    color: "#f5f5f5",
    fontSize: 14,
    fontFamily: "'Courier Prime', monospace",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontFamily: "'Oswald', sans-serif",
    color: "#4ade80",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
    display: "block",
  };

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(74,222,128,0.2)",
        borderRadius: 20,
        padding: 28,
        marginBottom: 28,
        animation: "fadeSlideIn 0.4s ease forwards",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontFamily: "'Oswald', sans-serif", fontWeight: 700, color: "#4ade80", letterSpacing: 3, textTransform: "uppercase" }}>
          🎯 New Player Prop
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b7280", fontSize: 22, cursor: "pointer" }}>×</button>
      </div>

      {/* Scan */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px", borderRadius: 14, border: scanning ? "2px solid rgba(74,222,128,0.5)" : "2px dashed rgba(74,222,128,0.15)", background: scanning ? "rgba(74,222,128,0.06)" : "rgba(74,222,128,0.02)", cursor: "pointer" }}>
          <input type="file" accept="image/*" onChange={handleScan} style={{ display: "none" }} />
          {scanning ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
              <div style={{ fontSize: 13, fontFamily: "'Oswald', sans-serif", color: "#4ade80", letterSpacing: 2 }}>SCANNING SLIP...</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
              <div style={{ fontSize: 13, fontFamily: "'Oswald', sans-serif", color: "#4ade80", letterSpacing: 2, marginBottom: 4 }}>SCAN BET SLIP</div>
              <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center" }}>Upload a ChalkBoard or sportsbook screenshot</div>
            </>
          )}
        </label>
        {scanError && <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: 12 }}>{scanError}</div>}
      </div>

      {/* Form */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Player Prop</label><input style={inputStyle} placeholder="e.g. LeBron James Over 25.5 Points" value={team} onChange={(e) => setTeam(e.target.value)} /></div>
        <div><label style={labelStyle}>Odds</label><input style={inputStyle} placeholder="-110" value={odds} onChange={(e) => setOdds(e.target.value)} /></div>
        <div><label style={labelStyle}>Sport</label>
          <select value={sport} onChange={(e) => setSport(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
            {["NBA", "NFL", "NCAAB", "NCAAF", "NHL", "MLB", "Soccer", "UFC", "Tennis"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div><label style={labelStyle}>Matchup</label><input style={inputStyle} placeholder="Lakers vs Celtics" value={matchup} onChange={(e) => setMatchup(e.target.value)} /></div>
        <div><label style={labelStyle}>Game Time</label><input style={inputStyle} placeholder="7:30PM ET" value={time} onChange={(e) => setTime(e.target.value)} /></div>
        <div><label style={labelStyle}>Units</label><input style={inputStyle} type="number" min="1" max="10" value={units} onChange={(e) => setUnits(e.target.value)} /></div>
        <div><label style={labelStyle}>Bet Type</label><input style={inputStyle} value={betType} onChange={(e) => setBetType(e.target.value)} /></div>
      </div>

      <button onClick={handlePost} disabled={!team} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: !team ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #166534, #22c55e)", color: !team ? "#4b5563" : "#0a0a0a", fontSize: 14, fontFamily: "'Oswald', sans-serif", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", cursor: !team ? "not-allowed" : "pointer" }}>
        Post Player Prop 🎯
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function PlayerPropsClient({
  userAccess,
}: {
  userAccess: UserAccess;
}) {
  const [plays, setPlays] = useState<Play[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [filter, setFilter] = useState<"all" | "live">("all");
  const [notification, setNotification] = useState<Play | null>(null);
  const [loading, setLoading] = useState(true);
  const [gradedPlays, setGradedPlays] = useState<Play[]>([]);
  const [showGraded, setShowGraded] = useState(false);

  const { hasPremiumAccess, isAdmin } = userAccess;

  const fetchPlays = useCallback(async () => {
    try {
      const res = await fetch("/api/plays");
      if (res.ok) {
        const data = await res.json();
        setPlays(data.plays.filter((p: Play) => p.result === "pending"));
        setGradedPlays(data.plays.filter((p: Play) => p.result !== "pending"));
      }
    } catch (err) {
      console.error("Error fetching plays:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlays();
    const interval = setInterval(fetchPlays, 30000);
    return () => clearInterval(interval);
  }, [fetchPlays]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handlePost = async (playData: any) => {
    try {
      const res = await fetch("/api/plays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(playData),
      });
      if (res.ok) {
        const data = await res.json();
        setPlays((prev) => [data.play, ...prev]);
        setShowAdmin(false);

        try {
          await fetch("/api/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              team: playData.team,
              odds: playData.odds,
              sport: playData.sport,
              experienceId: userAccess.experienceId,
              companyId: "biz_KfwlM1WObd2QW6",
            }),
          });
        } catch (err) {
          console.error("Notification error:", err);
        }

        setNotification(data.play);
        setTimeout(() => setNotification(null), 6000);
      }
    } catch (err) {
      console.error("Error posting play:", err);
    }
  };

  const handleGrade = async (id: string, result: BetResult) => {
    try {
      const res = await fetch("/api/plays", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, result }),
      });
      if (res.ok) {
        setPlays((prev) => prev.filter((p) => p.id !== id));
        const graded = plays.find((p) => p.id === id);
        if (graded) {
          setGradedPlays((prev) => [{ ...graded, result }, ...prev]);
        }
      }
    } catch (err) {
      console.error("Error grading play:", err);
    }
  };

  const filteredPlays = filter === "live" ? plays : plays;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#f5f5f5",
        fontFamily: "'Courier Prime', monospace",
      }}
    >
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes notifSlide {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(74,222,128,0.3); border-radius: 3px; }
      `}</style>

      {/* Notification banner */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: "linear-gradient(135deg, #166534, #22c55e)",
            padding: "14px 20px",
            animation: "notifSlide 0.3s ease",
          }}
        >
          <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontFamily: "'Oswald', sans-serif", fontWeight: 700, color: "#0a0a0a", letterSpacing: 1 }}>
              🎯 NEW PROP: {notification.team} ({notification.odds})
            </span>
            <button onClick={() => setNotification(null)} style={{ background: "none", border: "none", color: "#0a0a0a", fontSize: 18, cursor: "pointer" }}>×</button>
          </div>
        </div>
      )}

      {/* Background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.05) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "40px 20px 80px",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 36,
            animation: "fadeSlideIn 0.5s ease forwards",
          }}
        >
          <div
            style={{
              display: "inline-block",
              fontSize: 10,
              fontFamily: "'Oswald', sans-serif",
              color: "#4ade80",
              letterSpacing: 4,
              textTransform: "uppercase",
              border: "1px solid rgba(74,222,128,0.3)",
              borderRadius: 100,
              padding: "6px 20px",
              marginBottom: 20,
              background: "rgba(74,222,128,0.06)",
            }}
          >
            Live Feed
          </div>

          <h1
            style={{
              fontSize: 52,
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 800,
              lineHeight: 1,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            <span
              style={{
                background:
                  "linear-gradient(135deg, #b8860b, #d4a843, #f0d078)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Player Props
            </span>
          </h1>

          {/* Powered by ChalkBoard badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginTop: 16,
              padding: "8px 16px",
              borderRadius: 10,
              background: "rgba(74,222,128,0.06)",
              border: "1px solid rgba(74,222,128,0.15)",
            }}
          >
            <span style={{ fontSize: 14 }}>🟢</span>
            <span
              style={{
                fontSize: 11,
                fontFamily: "'Oswald', sans-serif",
                color: "#4ade80",
                letterSpacing: 2,
              }}
            >
              POWERED BY CHALKBOARD
            </span>
          </div>
        </div>

        {/* ChalkBoard CTA for paywalled users */}
        {!hasPremiumAccess && !isAdmin && <ChalkBoardCTA />}

        {/* ChalkBoard verification upload */}
        {!hasPremiumAccess && !isAdmin && userAccess.userId && (
          <ChalkBoardVerify userId={userAccess.userId} />
        )}

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            justifyContent: "center",
          }}
        >
          {(["all", "live"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                border:
                  filter === f
                    ? "1px solid rgba(74,222,128,0.4)"
                    : "1px solid rgba(255,255,255,0.08)",
                background:
                  filter === f
                    ? "rgba(74,222,128,0.12)"
                    : "rgba(255,255,255,0.02)",
                color: filter === f ? "#4ade80" : "#6b7280",
                fontSize: 12,
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {f === "all" ? "All" : "Live"}
            </button>
          ))}
        </div>

        {/* Admin controls */}
        {isAdmin && (
          <div style={{ marginBottom: 24 }}>
            {showAdmin ? (
              <AdminPanel
                onPost={handlePost}
                onClose={() => setShowAdmin(false)}
              />
            ) : (
              <button
                onClick={() => setShowAdmin(true)}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 14,
                  border: "1px solid rgba(74,222,128,0.2)",
                  background: "rgba(74,222,128,0.06)",
                  color: "#4ade80",
                  fontSize: 13,
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 600,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                🎯 New Player Prop
              </button>
            )}
          </div>
        )}

        {/* Loading / Empty */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b7280", fontSize: 14 }}>
            Loading props...
          </div>
        ) : filteredPlays.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#4b5563", fontSize: 14 }}>
            No player props posted yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredPlays.map((play) => (
              <PlayCard
                key={play.id}
                play={play}
                isPaywalled={!hasPremiumAccess && !isAdmin}
                isAdmin={isAdmin}
                onGrade={handleGrade}
              />
            ))}
          </div>
        )}

        {/* Graded plays (admin only) */}
        {isAdmin && gradedPlays.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <button
              onClick={() => setShowGraded(!showGraded)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
                color: "#6b7280",
                fontSize: 12,
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: "uppercase",
                cursor: "pointer",
                marginBottom: showGraded ? 16 : 0,
              }}
            >
              {showGraded ? "Hide" : "Show"} Graded Props ({gradedPlays.length})
            </button>
            {showGraded && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {gradedPlays.map((play) => (
                  <PlayCard key={play.id} play={play} isPaywalled={false} isAdmin={false} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#374151",
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            FlareGotLocks × ChalkBoard
          </div>
        </div>
      </div>
    </div>
  );
}

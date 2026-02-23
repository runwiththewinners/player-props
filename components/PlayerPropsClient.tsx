"use client";

import { useState, useEffect, useCallback } from "react";
import type { Play, Leg, UserAccess, BetResult, Sport } from "@/lib/types";

const CHALKBOARD_LINK = "https://go.chalkboard.io/websignup-v1-tt?utm_source=promo&offer=flare";
const CHALKBOARD_CODE = "FLARE";

const SPORTS_ICONS: Record<string, string> = {
  NBA: "🏀", NFL: "🏈", NCAAB: "🏀", NCAAF: "🏈",
  MLB: "⚾", NHL: "🏒", Soccer: "⚽", UFC: "🥊", Tennis: "🎾",
};

const SPORTS_LIST: Sport[] = ["NBA", "NFL", "NCAAB", "NCAAF", "NHL", "MLB", "Soccer", "UFC", "Tennis"];

// ─── Slip Image Viewer Modal ─────────────────────────────────────
function SlipImageModal({ playId, onClose }: { playId: string; onClose: () => void }) {
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/slip-image?id=${playId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.imageData) {
          setImageData(data.imageData);
        } else {
          setError("Could not load bet slip image.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load bet slip image.");
        setLoading(false);
      });
  }, [playId]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 400,
          width: "100%",
          maxHeight: "85vh",
          background: "#0c0f0c",
          borderRadius: 20,
          border: "1px solid rgba(74,222,128,0.2)",
          overflow: "hidden",
          animation: "scaleIn 0.3s ease",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 12, fontFamily: "'Oswald', sans-serif", color: "#4ade80", letterSpacing: 2, fontWeight: 600 }}>
            📋 BET SLIP
          </div>
          <button
            onClick={onClose}
            style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, color: "#9ca3af", fontSize: 16, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 16, maxHeight: "calc(85vh - 60px)", overflowY: "auto" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ width: 32, height: 32, border: "3px solid rgba(74,222,128,0.15)", borderTopColor: "#4ade80", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
              <div style={{ fontSize: 12, color: "#6b7280", fontFamily: "'Oswald', sans-serif", letterSpacing: 2 }}>LOADING SLIP...</div>
            </div>
          )}
          {error && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#ef4444", fontSize: 13 }}>{error}</div>
          )}
          {imageData && (
            <img
              src={`data:image/png;base64,${imageData}`}
              alt="Bet slip"
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid rgba(74,222,128,0.1)",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Play Card ───────────────────────────────────────────────────
function PlayCard({
  play,
  isPaywalled,
  isAdmin,
  onGrade,
}: {
  play: Play & { hasSlipImage?: boolean };
  isPaywalled: boolean;
  isAdmin: boolean;
  onGrade?: (id: string, result: BetResult) => void;
}) {
  const [showSlip, setShowSlip] = useState(false);

  const resultColors: Record<string, string> = {
    pending: "#9ca3af",
    win: "#22c55e",
    loss: "#ef4444",
    push: "#eab308",
  };

  const isWin = play.result === "win";
  const isLoss = play.result === "loss";
  const hasLegs = play.legs && play.legs.length > 0;

  return (
    <>
      {showSlip && <SlipImageModal playId={play.id} onClose={() => setShowSlip(false)} />}
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>
                {SPORTS_ICONS[play.sport] || "🎯"}
              </span>
              <div>
                <div style={{ fontSize: 11, fontFamily: "'Courier Prime', monospace", color: "#4ade80", letterSpacing: 2, textTransform: "uppercase" }}>
                  {hasLegs ? `${play.legs!.length}-LEG PARLAY` : play.sport}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "'Courier Prime', monospace" }}>
                  {play.postedAt}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontFamily: "'Courier Prime', monospace", color: "#4ade80", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 6, padding: "3px 8px", letterSpacing: 1 }}>
                {play.units}U
              </span>
              <span
                style={{
                  fontSize: 11, fontFamily: "'Courier Prime', monospace",
                  color: resultColors[play.result], background: `${resultColors[play.result]}18`,
                  border: `1px solid ${resultColors[play.result]}40`,
                  borderRadius: 6, padding: "3px 8px", letterSpacing: 1, fontWeight: 700, textTransform: "uppercase",
                }}
              >
                {play.result === "win" ? "WIN ✓" : play.result === "loss" ? "LOSS ✗" : play.result === "push" ? "PUSH ⟳" : "PENDING"}
              </span>
            </div>
          </div>

          {/* Multi-leg display */}
          {hasLegs && !isPaywalled ? (
            <div style={{ marginBottom: 12 }}>
              {play.legs!.map((leg, i) => (
                <div
                  key={leg.id}
                  style={{
                    padding: "12px 14px",
                    background: i % 2 === 0 ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.1)",
                    borderRadius: i === 0 ? "10px 10px 0 0" : i === play.legs!.length - 1 ? "0 0 10px 10px" : 0,
                    borderBottom: i < play.legs!.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#f5f5f5", fontFamily: "'Oswald', sans-serif", textTransform: "uppercase" }}>
                      {leg.player}
                    </div>
                    <span style={{ fontSize: 10, color: "#4ade80", fontFamily: "'Courier Prime', monospace", letterSpacing: 1 }}>
                      {SPORTS_ICONS[leg.sport] || ""} {leg.sport}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13, color: "#4ade80", fontFamily: "'Oswald', sans-serif", fontWeight: 600 }}>
                      {leg.prop} {leg.line}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "'Courier Prime', monospace" }}>
                      {leg.matchup}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : hasLegs && isPaywalled ? (
            <div style={{ marginBottom: 12, position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.3)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
                <span style={{ fontSize: 12, fontFamily: "'Oswald', sans-serif", color: "#4ade80", letterSpacing: 2 }}>
                  🔒 SUBSCRIBE TO VIEW {play.legs!.length} LEGS
                </span>
              </div>
              {play.legs!.map((_, i) => (
                <div key={i} style={{ padding: "14px", background: i % 2 === 0 ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.1)", borderRadius: i === 0 ? "10px 10px 0 0" : i === play.legs!.length - 1 ? "0 0 10px 10px" : 0, height: 52 }} />
              ))}
            </div>
          ) : (
            /* Single play (legacy) */
            <div style={{ marginBottom: 12, position: "relative" }}>
              {isPaywalled && (
                <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", background: "rgba(0,0,0,0.3)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
                  <span style={{ fontSize: 12, fontFamily: "'Oswald', sans-serif", color: "#4ade80", letterSpacing: 2 }}>🔒 SUBSCRIBE TO VIEW</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: isPaywalled ? "transparent" : "#f5f5f5", fontFamily: "'Oswald', sans-serif", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {isPaywalled ? "XXXXXXXXXX" : play.team}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: isPaywalled ? "transparent" : "#4ade80", fontFamily: "'Oswald', sans-serif" }}>
                  {isPaywalled ? "XXX" : play.odds}
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "'Courier Prime', monospace", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 4 }}>
                {play.betType}
              </div>
            </div>
          )}

          {/* Footer: Odds + View Slip button */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 12,
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {hasLegs ? (
              <>
                <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "'Courier Prime', monospace", letterSpacing: 1 }}>PARLAY ODDS</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {(play as any).hasSlipImage && !isPaywalled && (
                    <button
                      onClick={() => setShowSlip(true)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 8,
                        border: "1px solid rgba(74,222,128,0.2)",
                        background: "rgba(74,222,128,0.06)",
                        color: "#4ade80",
                        fontSize: 10,
                        fontFamily: "'Oswald', sans-serif",
                        letterSpacing: 2,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      📋 VIEW SLIP
                    </button>
                  )}
                  <span style={{ fontSize: 20, fontWeight: 800, color: isPaywalled ? "transparent" : "#4ade80", fontFamily: "'Oswald', sans-serif" }}>
                    {isPaywalled ? "XXX" : play.odds}
                  </span>
                </div>
              </>
            ) : (
              <>
                <span style={{ fontSize: 13, color: "#d4a843", fontFamily: "'Courier Prime', monospace" }}>{play.matchup}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {(play as any).hasSlipImage && !isPaywalled && (
                    <button
                      onClick={() => setShowSlip(true)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 8,
                        border: "1px solid rgba(74,222,128,0.2)",
                        background: "rgba(74,222,128,0.06)",
                        color: "#4ade80",
                        fontSize: 10,
                        fontFamily: "'Oswald', sans-serif",
                        letterSpacing: 2,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      📋 VIEW SLIP
                    </button>
                  )}
                  <span style={{ fontSize: 12, color: "#6b7280", fontFamily: "'Courier Prime', monospace" }}>{play.time}</span>
                </div>
              </>
            )}
          </div>

          {/* Admin grading */}
          {isAdmin && play.result === "pending" && onGrade && (
            <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {(["win", "loss", "push"] as BetResult[]).map((r) => (
                <button
                  key={r}
                  onClick={() => onGrade(play.id, r)}
                  style={{
                    flex: 1, padding: "8px 0", borderRadius: 8,
                    border: `1px solid ${resultColors[r]}40`, background: `${resultColors[r]}12`,
                    color: resultColors[r], fontSize: 11, fontFamily: "'Oswald', sans-serif",
                    fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Leg Editor Row ──────────────────────────────────────────────
function LegEditor({
  leg, index, onChange, onRemove, canRemove,
}: {
  leg: Leg; index: number;
  onChange: (index: number, field: keyof Leg, value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) {
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1px solid rgba(74,222,128,0.15)", background: "rgba(74,222,128,0.04)",
    color: "#f5f5f5", fontSize: 13, fontFamily: "'Courier Prime', monospace", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 9, fontFamily: "'Oswald', sans-serif", color: "#4ade80",
    letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, display: "block",
  };

  return (
    <div style={{ padding: 16, background: index % 2 === 0 ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.1)", borderRadius: 12, border: "1px solid rgba(74,222,128,0.08)", marginBottom: 10, animation: "fadeSlideIn 0.3s ease forwards" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontFamily: "'Oswald', sans-serif", fontWeight: 700, color: "#4ade80", letterSpacing: 2 }}>LEG {index + 1}</div>
        {canRemove && (
          <button onClick={() => onRemove(index)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, color: "#ef4444", fontSize: 10, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, padding: "4px 10px", cursor: "pointer" }}>
            REMOVE
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Player & Prop</label>
          <input style={inputStyle} placeholder="e.g. LeBron James Over 25.5 Points" value={leg.player} onChange={(e) => onChange(index, "player", e.target.value)} />
        </div>
        <div><label style={labelStyle}>Prop Type</label><input style={inputStyle} placeholder="e.g. Over/Under" value={leg.prop} onChange={(e) => onChange(index, "prop", e.target.value)} /></div>
        <div><label style={labelStyle}>Line</label><input style={inputStyle} placeholder="e.g. O 25.5" value={leg.line} onChange={(e) => onChange(index, "line", e.target.value)} /></div>
        <div><label style={labelStyle}>Matchup</label><input style={inputStyle} placeholder="Lakers vs Celtics" value={leg.matchup} onChange={(e) => onChange(index, "matchup", e.target.value)} /></div>
        <div>
          <label style={labelStyle}>Sport</label>
          <select value={leg.sport} onChange={(e) => onChange(index, "sport", e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
            {SPORTS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
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
    fetch("/api/verify-chalkboard").then((r) => r.json()).then((data) => { if (data.claimed) setExistingClaim(data); setCheckingStatus(false); }).catch(() => setCheckingStatus(false));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setError(""); setResult(null); setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Full = ev.target?.result as string;
      const base64Data = base64Full.split(",")[1];
      const mediaType = file.type || "image/png";
      try {
        const res = await fetch("/api/verify-chalkboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageData: base64Data, mediaType }) });
        const data = await res.json();
        if (res.ok && data.success) { setResult(data); }
        else { setError(data.message || "Verification failed."); if (data.error === "already_claimed") setExistingClaim({ promoCode: data.promoCode, checkoutUrl: `https://whop.com/rwtw/rwtw-propboard/?code=${data.promoCode}` }); }
      } catch { setError("Something went wrong. Please try again."); }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const copyCode = (code: string) => { navigator.clipboard.writeText(code).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  if (checkingStatus) return null;

  const PromoCodeDisplay = ({ promoCode, checkoutUrl }: { promoCode: string; checkoutUrl: string }) => (
    <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 16, padding: 28, marginBottom: 28, textAlign: "center", animation: "fadeSlideIn 0.5s ease forwards" }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>🎉</div>
      <div style={{ fontSize: 18, fontFamily: "'Oswald', sans-serif", fontWeight: 700, color: "#22c55e", letterSpacing: 3, marginBottom: 16 }}>CHALKBOARD VERIFIED!</div>
      <div style={{ margin: "0 auto 16px", padding: "16px 24px", borderRadius: 12, background: "rgba(0,0,0,0.4)", border: "2px dashed rgba(74,222,128,0.4)", display: "inline-block", minWidth: 200 }}>
        <div style={{ fontSize: 10, fontFamily: "'Oswald', sans-serif", color: "#6b7280", letterSpacing: 3, marginBottom: 6, textTransform: "uppercase" }}>Your Promo Code</div>
        <div style={{ fontSize: 32, fontFamily: "'Oswald', sans-serif", fontWeight: 800, color: "#4ade80", letterSpacing: 5 }}>{promoCode}</div>
        <button onClick={() => copyCode(promoCode)} style={{ marginTop: 8, padding: "6px 16px", borderRadius: 8, border: "1px solid rgba(74,222,128,0.3)", background: "rgba(74,222,128,0.1)", color: "#4ade80", fontSize: 11, fontFamily: "'Oswald', sans-serif", letterSpacing: 2, cursor: "pointer" }}>{copied ? "COPIED ✓" : "COPY CODE"}</button>
      </div>
      <div style={{ fontSize: 13, color: "#d4d4d4", lineHeight: 1.7, marginBottom: 20, maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>Use this code at checkout to get <span style={{ color: "#4ade80", fontWeight: 700 }}>100% off</span> your first month of Player Props!</div>
      <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "16px 40px", borderRadius: 12, background: "linear-gradient(135deg, #166534, #22c55e)", color: "#0a0a0a", fontSize: 15, fontFamily: "'Oswald', sans-serif", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", textDecoration: "none", cursor: "pointer" }}>CLAIM YOUR FREE MONTH</a>
      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 12, fontFamily: "'Courier Prime', monospace" }}>Code will be auto-applied when you click the link above</div>
    </div>
  );

  if (existingClaim) return <PromoCodeDisplay promoCode={existingClaim.promoCode} checkoutUrl={existingClaim.checkoutUrl} />;
  if (result) return <PromoCodeDisplay promoCode={result.promoCode} checkoutUrl={result.checkoutUrl} />;

  return (
    <div style={{ background: "rgba(74,222,128,0.03)", border: "1px solid rgba(74,222,128,0.12)", borderRadius: 16, padding: 24, marginBottom: 28, textAlign: "center" }}>
      <div style={{ fontSize: 14, fontFamily: "'Oswald', sans-serif", fontWeight: 700, color: "#4ade80", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Already Signed Up?</div>
      <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16, lineHeight: 1.6 }}>Upload a screenshot of your ChalkBoard account showing a deposit of at least $10 to verify and unlock your free month.</p>
      <label style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 20, borderRadius: 12, border: uploading ? "2px solid rgba(74,222,128,0.5)" : "2px dashed rgba(74,222,128,0.2)", background: uploading ? "rgba(74,222,128,0.06)" : "rgba(0,0,0,0.2)", cursor: uploading ? "wait" : "pointer", transition: "all 0.3s ease" }}>
        <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: "none" }} />
        {uploading ? (<><div style={{ fontSize: 24, marginBottom: 8 }}>🤖</div><div style={{ fontSize: 12, fontFamily: "'Oswald', sans-serif", color: "#4ade80", letterSpacing: 2 }}>VERIFYING SCREENSHOT...</div><div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>AI is checking your ChalkBoard account</div></>) : (<><div style={{ fontSize: 24, marginBottom: 8 }}>📸</div><div style={{ fontSize: 12, fontFamily: "'Oswald', sans-serif", color: "#4ade80", letterSpacing: 2 }}>UPLOAD CHALKBOARD SCREENSHOT</div><div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>Must show account with $10+ deposit</div></>)}
      </label>
      {error && <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: 12, lineHeight: 1.5 }}>{error}</div>}
    </div>
  );
}

// ─── ChalkBoard CTA ──────────────────────────────────────────────
function ChalkBoardCTA() {
  return (
    <div style={{ background: "linear-gradient(135deg, rgba(22,101,52,0.3), rgba(0,0,0,0.6))", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 20, padding: 28, marginBottom: 28, textAlign: "center", animation: "fadeSlideIn 0.5s ease forwards" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🎯</div>
      <h2 style={{ fontSize: 24, fontFamily: "'Oswald', sans-serif", fontWeight: 800, color: "#4ade80", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Get Free Player Props</h2>
      <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.6, maxWidth: 400, margin: "12px auto 10px" }}>Sign up on ChalkBoard using our link and get a <span style={{ color: "#4ade80", fontWeight: 700 }}>free month of Player Prop plays</span>!</p>
      <div style={{ margin: "8px auto", padding: "12px 20px", borderRadius: 10, background: "rgba(74,222,128,0.08)", border: "1px dashed rgba(74,222,128,0.3)", display: "inline-block" }}>
        <div style={{ fontSize: 10, fontFamily: "'Oswald', sans-serif", color: "#6b7280", letterSpacing: 2, marginBottom: 4 }}>PROMO CODE</div>
        <div style={{ fontSize: 24, fontFamily: "'Oswald', sans-serif", fontWeight: 800, color: "#4ade80", letterSpacing: 4 }}>{CHALKBOARD_CODE}</div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6, fontFamily: "'Courier Prime', monospace" }}>Deposit match up to <span style={{ color: "#4ade80", fontWeight: 700 }}>$100</span></div>
      </div>
      <br />
      <a href={CHALKBOARD_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "14px 36px", borderRadius: 12, background: "linear-gradient(135deg, #166534, #22c55e)", color: "#0a0a0a", fontSize: 14, fontFamily: "'Oswald', sans-serif", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", textDecoration: "none", cursor: "pointer", marginBottom: 12 }}>Sign Up on ChalkBoard</a>
      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 8 }}>Or subscribe to <a href="https://whop.com/rwtw/rwtw-propboard/" target="_blank" rel="noopener noreferrer" style={{ color: "#d4a843", textDecoration: "underline", textUnderlineOffset: 2 }}>Player Props</a> or <a href="https://whop.com/rwtw/rwtw-premium-copy/" target="_blank" rel="noopener noreferrer" style={{ color: "#d4a843", textDecoration: "underline", textUnderlineOffset: 2 }}>High Rollers</a> for instant access</div>
    </div>
  );
}

// ─── Admin Panel ─────────────────────────────────────────────────
function AdminPanel({ onPost, onClose }: { onPost: (data: any) => void; onClose: () => void }) {
  const createEmptyLeg = (): Leg => ({
    id: `leg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    player: "", prop: "", line: "", matchup: "", sport: "NBA" as Sport,
  });

  const [legs, setLegs] = useState<Leg[]>([createEmptyLeg(), createEmptyLeg()]);
  const [odds, setOdds] = useState("");
  const [units, setUnits] = useState("1");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [slipImageData, setSlipImageData] = useState<string | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);

  const handleLegChange = (index: number, field: keyof Leg, value: string) => {
    setLegs((prev) => { const updated = [...prev]; updated[index] = { ...updated[index], [field]: value }; return updated; });
  };

  const addLeg = () => setLegs((prev) => [...prev, createEmptyLeg()]);

  const removeLeg = (index: number) => {
    if (legs.length <= 2) return;
    setLegs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setScanError(""); setScanning(true);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setSlipPreview(previewUrl);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Full = ev.target?.result as string;
      const base64Data = base64Full.split(",")[1];
      const mediaType = file.type || "image/png";

      // Store the image data for posting later
      setSlipImageData(base64Data);

      try {
        const response = await fetch("/api/scan-slip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: base64Data, mediaType }),
        });
        const data = await response.json();
        if (data.legs && data.legs.length > 0) {
          const scannedLegs: Leg[] = data.legs.map((l: any, i: number) => ({
            id: `leg_${Date.now()}_${i}`, player: l.player || "", prop: l.prop || "",
            line: l.line || "", matchup: l.matchup || "", sport: (l.sport as Sport) || "NBA",
          }));
          while (scannedLegs.length < 2) scannedLegs.push(createEmptyLeg());
          setLegs(scannedLegs);
          if (data.odds) setOdds(data.odds);
        } else {
          setScanError("Couldn't read the slip. Fill in manually.");
        }
      } catch { setScanError("Couldn't read that slip. Fill in manually."); }
      setScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const filledLegs = legs.filter((l) => l.player.trim() !== "");
  const canPost = filledLegs.length >= 2;

  const handlePost = () => {
    if (!canPost) return;
    const primarySport = filledLegs[0].sport;
    const teamSummary = filledLegs.map((l) => l.player).join(" + ");
    onPost({
      team: teamSummary, betType: "PLAYER PROP", odds, matchup: `${filledLegs.length}-Leg Parlay`,
      time: "", sport: primarySport, units: parseInt(units) || 1, legs: filledLegs, slipImage: slipImageData,
    });
    setLegs([createEmptyLeg(), createEmptyLeg()]); setOdds(""); setSlipImageData(null); setSlipPreview(null);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: "1px solid rgba(74,222,128,0.15)", background: "rgba(74,222,128,0.04)",
    color: "#f5f5f5", fontSize: 14, fontFamily: "'Courier Prime', monospace", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 10, fontFamily: "'Oswald', sans-serif", color: "#4ade80",
    letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, display: "block",
  };

  return (
    <div style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(20px)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 20, padding: 28, marginBottom: 28, animation: "fadeSlideIn 0.4s ease forwards" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontFamily: "'Oswald', sans-serif", fontWeight: 700, color: "#4ade80", letterSpacing: 3, textTransform: "uppercase" }}>🎯 New Parlay</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b7280", fontSize: 22, cursor: "pointer" }}>×</button>
      </div>

      {/* Scan slip */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "18px", borderRadius: 14, border: scanning ? "2px solid rgba(74,222,128,0.5)" : "2px dashed rgba(74,222,128,0.15)", background: scanning ? "rgba(74,222,128,0.06)" : "rgba(74,222,128,0.02)", cursor: "pointer" }}>
          <input type="file" accept="image/*" onChange={handleScan} style={{ display: "none" }} />
          {scanning ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
              <div style={{ fontSize: 13, fontFamily: "'Oswald', sans-serif", color: "#4ade80", letterSpacing: 2 }}>SCANNING BET SLIP...</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>Reading all legs from your slip</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
              <div style={{ fontSize: 13, fontFamily: "'Oswald', sans-serif", color: "#4ade80", letterSpacing: 2, marginBottom: 4 }}>SCAN BET SLIP</div>
              <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center" }}>Upload a ChalkBoard or sportsbook screenshot to auto-fill legs</div>
            </>
          )}
        </label>
        {scanError && <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: 12 }}>{scanError}</div>}

        {/* Slip preview */}
        {slipPreview && (
          <div style={{ marginTop: 12, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(74,222,128,0.15)", position: "relative" }}>
            <img src={slipPreview} alt="Bet slip preview" style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 12px", background: "linear-gradient(transparent, rgba(0,0,0,0.8))", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontFamily: "'Oswald', sans-serif", color: "#4ade80", letterSpacing: 2 }}>✅ SLIP ATTACHED</span>
              <button
                onClick={() => { setSlipPreview(null); setSlipImageData(null); }}
                style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, color: "#ef4444", fontSize: 9, fontFamily: "'Oswald', sans-serif", letterSpacing: 1, padding: "3px 8px", cursor: "pointer" }}
              >
                REMOVE
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legs */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontFamily: "'Oswald', sans-serif", color: "#9ca3af", letterSpacing: 2 }}>
            {legs.length} LEG{legs.length > 1 ? "S" : ""} {legs.length < 2 && <span style={{ color: "#ef4444" }}>(MIN 2)</span>}
          </div>
        </div>
        {legs.map((leg, i) => (
          <LegEditor key={leg.id} leg={leg} index={i} onChange={handleLegChange} onRemove={removeLeg} canRemove={legs.length > 2} />
        ))}
        <button onClick={addLeg} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px dashed rgba(74,222,128,0.2)", background: "rgba(74,222,128,0.04)", color: "#4ade80", fontSize: 12, fontFamily: "'Oswald', sans-serif", fontWeight: 600, letterSpacing: 2, cursor: "pointer", marginTop: 4 }}>
          + ADD LEG
        </button>
      </div>

      {/* Odds & Units */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div><label style={labelStyle}>Parlay Odds</label><input style={inputStyle} placeholder="+450" value={odds} onChange={(e) => setOdds(e.target.value)} /></div>
        <div><label style={labelStyle}>Units</label><input style={inputStyle} type="number" min="1" max="10" value={units} onChange={(e) => setUnits(e.target.value)} /></div>
      </div>

      <button onClick={handlePost} disabled={!canPost} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: !canPost ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #166534, #22c55e)", color: !canPost ? "#4b5563" : "#0a0a0a", fontSize: 14, fontFamily: "'Oswald', sans-serif", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", cursor: !canPost ? "not-allowed" : "pointer" }}>
        {canPost ? `Post ${filledLegs.length}-Leg Parlay 🎯` : "Add at least 2 legs to post"}
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function PlayerPropsClient({ userAccess }: { userAccess: UserAccess }) {
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
    } catch (err) { console.error("Error fetching plays:", err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPlays(); const interval = setInterval(fetchPlays, 30000); return () => clearInterval(interval); }, [fetchPlays]);
  useEffect(() => { if (notification) { const timer = setTimeout(() => setNotification(null), 6000); return () => clearTimeout(timer); } }, [notification]);

  const handlePost = async (playData: any) => {
    try {
      const res = await fetch("/api/plays", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(playData) });
      if (res.ok) {
        const data = await res.json();
        setPlays((prev) => [data.play, ...prev]);
        setShowAdmin(false);
        try {
          await fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ team: playData.team, odds: playData.odds, sport: playData.sport, experienceId: userAccess.experienceId, companyId: "biz_KfwlM1WObd2QW6" }) });
        } catch (err) { console.error("Notification error:", err); }
        setNotification(data.play);
      }
    } catch (err) { console.error("Error posting play:", err); }
  };

  const handleGrade = async (id: string, result: BetResult) => {
    try {
      const res = await fetch("/api/plays", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, result }) });
      if (res.ok) {
        setPlays((prev) => prev.filter((p) => p.id !== id));
        const graded = plays.find((p) => p.id === id);
        if (graded) setGradedPlays((prev) => [{ ...graded, result }, ...prev]);
      }
    } catch (err) { console.error("Error grading play:", err); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f5f5f5", fontFamily: "'Courier Prime', monospace" }}>
      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes notifSlide { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(74,222,128,0.3); border-radius: 3px; }
      `}</style>

      {notification && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: "linear-gradient(135deg, #166534, #22c55e)", padding: "14px 20px", animation: "notifSlide 0.3s ease" }}>
          <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontFamily: "'Oswald', sans-serif", fontWeight: 700, color: "#0a0a0a", letterSpacing: 1 }}>🎯 NEW PARLAY: {notification.legs?.length || 0} legs ({notification.odds})</span>
            <button onClick={() => setNotification(null)} style={{ background: "none", border: "none", color: "#0a0a0a", fontSize: 18, cursor: "pointer" }}>×</button>
          </div>
        </div>
      )}

      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.05) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px 80px", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 36, animation: "fadeSlideIn 0.5s ease forwards" }}>
          <div style={{ display: "inline-block", fontSize: 10, fontFamily: "'Oswald', sans-serif", color: "#4ade80", letterSpacing: 4, textTransform: "uppercase", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 100, padding: "6px 20px", marginBottom: 20, background: "rgba(74,222,128,0.06)" }}>Live Feed</div>
          <h1 style={{ fontSize: 52, fontFamily: "'Oswald', sans-serif", fontWeight: 800, lineHeight: 1, textTransform: "uppercase", marginBottom: 4 }}>
            <span style={{ background: "linear-gradient(135deg, #b8860b, #d4a843, #f0d078)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Player Props</span>
          </h1>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16, padding: "8px 16px", borderRadius: 10, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)" }}>
            <span style={{ fontSize: 14 }}>🟢</span>
            <span style={{ fontSize: 11, fontFamily: "'Oswald', sans-serif", color: "#4ade80", letterSpacing: 2 }}>POWERED BY CHALKBOARD</span>
          </div>
        </div>

        {!hasPremiumAccess && !isAdmin && <ChalkBoardCTA />}
        {!hasPremiumAccess && !isAdmin && userAccess.userId && <ChalkBoardVerify userId={userAccess.userId} />}

        <div style={{ display: "flex", gap: 8, marginBottom: 24, justifyContent: "center" }}>
          {(["all", "live"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 18px", borderRadius: 10, border: filter === f ? "1px solid rgba(74,222,128,0.4)" : "1px solid rgba(255,255,255,0.08)", background: filter === f ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.02)", color: filter === f ? "#4ade80" : "#6b7280", fontSize: 12, fontFamily: "'Oswald', sans-serif", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}>
              {f === "all" ? "All" : "Live"}
            </button>
          ))}
        </div>

        {isAdmin && (
          <div style={{ marginBottom: 24 }}>
            {showAdmin ? (
              <AdminPanel onPost={handlePost} onClose={() => setShowAdmin(false)} />
            ) : (
              <button onClick={() => setShowAdmin(true)} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "1px solid rgba(74,222,128,0.2)", background: "rgba(74,222,128,0.06)", color: "#4ade80", fontSize: 13, fontFamily: "'Oswald', sans-serif", fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", cursor: "pointer" }}>🎯 New Parlay</button>
            )}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b7280", fontSize: 14 }}>Loading props...</div>
        ) : plays.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#4b5563", fontSize: 14 }}>No player props posted yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {plays.map((play) => (
              <PlayCard key={play.id} play={play} isPaywalled={!hasPremiumAccess && !isAdmin} isAdmin={isAdmin} onGrade={handleGrade} />
            ))}
          </div>
        )}

        {isAdmin && gradedPlays.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <button onClick={() => setShowGraded(!showGraded)} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#6b7280", fontSize: 12, fontFamily: "'Oswald', sans-serif", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", marginBottom: showGraded ? 16 : 0 }}>
              {showGraded ? "Hide" : "Show"} Graded Props ({gradedPlays.length})
            </button>
            {showGraded && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {gradedPlays.map((play) => <PlayCard key={play.id} play={play} isPaywalled={false} isAdmin={false} />)}
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: 11, color: "#374151", fontFamily: "'Oswald', sans-serif", letterSpacing: 3, textTransform: "uppercase" }}>FlareGotLocks × ChalkBoard</div>
        </div>
      </div>
    </div>
  );
}

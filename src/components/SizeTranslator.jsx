// src/components/SizeTranslator.jsx
// ─────────────────────────────────────────────────────────────────────────────
// PakFit Cross-Brand Size Translator
// Drop this file in src/components/ and import it wherever you want in App.jsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "https://ham-462-pakfit-backend.hf.space";

// ── Confidence badge colours ─────────────────────────────────────────────────
function ConfidenceBadge({ score }) {
  const pct = Math.round(score);
  let bg, color;
  if      (pct >= 88) { bg = "#d4edda"; color = "#1a6633"; }
  else if (pct >= 72) { bg = "#fff3cd"; color = "#856404"; }
  else                { bg = "#f8d7da"; color = "#721c24"; }

  return (
    <span style={{
      display:       "inline-block",
      padding:       "2px 10px",
      borderRadius:  "12px",
      fontSize:      "13px",
      fontWeight:    600,
      background:    bg,
      color:         color,
    }}>
      {pct}%
    </span>
  );
}

// ── Single brand translation card ────────────────────────────────────────────
function BrandCard({ t, index }) {
  const [open, setOpen] = useState(false);
  const SIZE_EMOJI = { XS:"🟣", S:"🔵", M:"🟢", L:"🟡", XL:"🟠", XXL:"🔴" };

  return (
    <div style={{
      background:   "#fff",
      border:       "1.5px solid #e8e0f5",
      borderRadius: "14px",
      padding:      "16px 18px",
      marginBottom: "10px",
      boxShadow:    "0 2px 8px rgba(80,40,120,0.06)",
      transition:   "box-shadow .2s",
      animation:    `fadeUp .35s ease ${index * 0.06}s both`,
    }}>
      {/* Top row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <span style={{ fontSize:"22px" }}>{SIZE_EMOJI[t.recommended_size] || "⚪"}</span>
          <div>
            <div style={{ fontWeight:700, fontSize:"16px", color:"#2d1b6b" }}>
              {t.brand}
            </div>
            <div style={{ fontSize:"12px", color:"#888" }}>
              {t.fit_type}
              {t.note && <span style={{ marginLeft:"6px", color:"#aaa" }}>· {t.note}</span>}
            </div>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:"28px", fontWeight:800, color:"#5b2fc9", lineHeight:1 }}>
            {t.recommended_size}
          </div>
          <ConfidenceBadge score={t.confidence} />
        </div>
      </div>

      {/* Runner-up */}
      {t.runner_up && (
        <div style={{ marginTop:"8px", fontSize:"12px", color:"#888" }}>
          Runner-up: <strong>{t.runner_up}</strong> ({Math.round(t.runner_up_confidence)}%)
        </div>
      )}

      {/* All sizes toggle */}
      {t.all_sizes && t.all_sizes.length > 1 && (
        <button
          onClick={() => setOpen(!open)}
          style={{
            marginTop:    "10px",
            background:   "none",
            border:       "none",
            color:        "#5b2fc9",
            fontSize:     "12px",
            cursor:       "pointer",
            padding:      0,
            fontWeight:   600,
          }}
        >
          {open ? "▲ Hide all sizes" : "▼ Show all sizes"}
        </button>
      )}

      {open && (
        <div style={{ marginTop:"10px", overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"12px" }}>
            <thead>
              <tr style={{ background:"#f4f0fc" }}>
                <th style={TH}>Size</th>
                <th style={TH}>Fit Score</th>
                <th style={TH}>Fit Type</th>
                {t.all_sizes[0]?.deltas?.chest !== undefined && <th style={TH}>Chest Δ</th>}
              </tr>
            </thead>
            <tbody>
              {t.all_sizes.map((s, i) => (
                <tr key={s.size}
                  style={{ background: i === 0 ? "#f0ebff" : "transparent" }}>
                  <td style={TD}>{s.size}{i===0?" ✓":""}</td>
                  <td style={TD}><ConfidenceBadge score={s.score} /></td>
                  <td style={TD}>{s.fit_type}</td>
                  {s.deltas?.chest !== undefined && (
                    <td style={{...TD, color: s.deltas.chest < -0.5 ? "#c00":"#1a6633"}}>
                      {s.deltas.chest > 0 ? "+" : ""}{s.deltas.chest}"
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const TH = {
  padding:"6px 8px", textAlign:"left", fontWeight:600,
  color:"#5b2fc9", borderBottom:"1px solid #e0d8f5"
};
const TD = { padding:"5px 8px", borderBottom:"1px solid #f0ece8" };

// ── Main component ───────────────────────────────────────────────────────────
export default function SizeTranslator() {
  const GARMENT_TYPES = ["Kameez", "Kurta", "Shalwar", "Waistcoat"];
  const SIZE_ORDER    = ["XS", "S", "M", "L", "XL", "XXL"];

  const [brands,       setBrands]       = useState([]);
  const [sizes,        setSizes]        = useState([]);
  const [sourceBrand,  setSourceBrand]  = useState("");
  const [sourceSize,   setSourceSize]   = useState("");
  const [garmentType,  setGarmentType]  = useState("Kameez");
  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [brandsLoading,setBrandsLoading]= useState(false);

  // ── Load brands whenever garment type changes ─────────────────────────────
  useEffect(() => {
    if (!garmentType) return;
    setBrandsLoading(true);
    setSourceBrand("");
    setSourceSize("");
    setResult(null);
    setSizes([]);

    fetch(`${API}/api/brands-for-garment?garment_type=${encodeURIComponent(garmentType)}`)
      .then(r => r.json())
      .then(d => { setBrands(d.brands || []); setBrandsLoading(false); })
      .catch(() => { setBrands([]); setBrandsLoading(false); });
  }, [garmentType]);

  // ── Load sizes whenever source brand changes ──────────────────────────────
  useEffect(() => {
    if (!sourceBrand || !garmentType) { setSizes([]); return; }
    setSourceSize("");
    setResult(null);

    fetch(`${API}/api/sizes-for-brand?brand=${encodeURIComponent(sourceBrand)}&garment_type=${encodeURIComponent(garmentType)}`)
      .then(r => r.json())
      .then(d => setSizes(d.sizes || []))
      .catch(() => setSizes([]));
  }, [sourceBrand, garmentType]);

  // ── Translate ─────────────────────────────────────────────────────────────
  const handleTranslate = useCallback(async () => {
    if (!sourceBrand || !sourceSize) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API}/api/translate-size`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_brand:  sourceBrand,
          source_size:   sourceSize,
          garment_type:  garmentType,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Translation failed");
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [sourceBrand, sourceSize, garmentType]);

  // ── Share results ─────────────────────────────────────────────────────────
  const handleShare = () => {
    if (!result) return;
    const lines = [
      `🇵🇰 PakFit Size Translation — ${result.source.garment_type}`,
      `I wear ${result.source.brand} ${result.source.size}`,
      "",
      ...result.translations.map(
        t => `${t.brand}: ${t.recommended_size} (${Math.round(t.confidence)}%)`
      ),
      "",
      result.insight,
      "",
      "Generated by PakFit — pakfit.app",
    ].join("\n");

    if (navigator.share) {
      navigator.share({ title: "My PakFit Size Card", text: lines });
    } else {
      navigator.clipboard.writeText(lines).then(() =>
        alert("Size translation copied to clipboard! Paste in WhatsApp.")
      );
    }
  };

  return (
    <div style={{
      fontFamily:   "'Segoe UI', system-ui, sans-serif",
      maxWidth:     "520px",
      margin:       "0 auto",
      padding:      "0 16px 32px",
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        select, button { font-family: inherit; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign:"center", padding:"28px 0 20px" }}>
        <div style={{ fontSize:"32px", marginBottom:"6px" }}>🔄</div>
        <h2 style={{ margin:0, fontSize:"22px", fontWeight:800, color:"#2d1b6b" }}>
          Size Translator
        </h2>
        <p style={{ margin:"6px 0 0", fontSize:"14px", color:"#777" }}>
          Know your size at one brand? Find your size at all others.
        </p>
        <p style={{ margin:"2px 0 0", fontSize:"13px", color:"#aaa" }}>
          اپنی سائز جانیں — ہر برانڈ میں
        </p>
      </div>

      {/* Controls */}
      <div style={{
        background:   "#fff",
        borderRadius: "16px",
        padding:      "20px",
        boxShadow:    "0 4px 20px rgba(80,40,120,0.10)",
        border:       "1.5px solid #ede8ff",
        marginBottom: "20px",
      }}>
        {/* Garment type */}
        <label style={LABEL}>Garment Type / لباس کی قسم</label>
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"14px" }}>
          {GARMENT_TYPES.map(g => (
            <button
              key={g}
              onClick={() => setGarmentType(g)}
              style={{
                padding:      "7px 16px",
                borderRadius: "20px",
                border:       garmentType === g ? "none" : "1.5px solid #d0c8ee",
                background:   garmentType === g ? "#5b2fc9" : "#f8f6ff",
                color:        garmentType === g ? "#fff" : "#5b2fc9",
                fontWeight:   600,
                fontSize:     "13px",
                cursor:       "pointer",
                transition:   "all .15s",
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Source brand */}
        <label style={LABEL}>
          I know my size at… / میری سائز اس برانڈ میں:
        </label>
        <select
          value={sourceBrand}
          onChange={e => setSourceBrand(e.target.value)}
          style={SELECT}
          disabled={brandsLoading}
        >
          <option value="">{brandsLoading ? "Loading brands…" : "Select brand"}</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        {/* Source size */}
        {sizes.length > 0 && (
          <>
            <label style={{...LABEL, marginTop:"12px"}}>
              My size at {sourceBrand}:
            </label>
            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
              {sizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSourceSize(s)}
                  style={{
                    padding:      "8px 18px",
                    borderRadius: "10px",
                    border:       sourceSize === s ? "none" : "1.5px solid #d0c8ee",
                    background:   sourceSize === s ? "#5b2fc9" : "#f8f6ff",
                    color:        sourceSize === s ? "#fff" : "#5b2fc9",
                    fontWeight:   700,
                    fontSize:     "15px",
                    cursor:       "pointer",
                    transition:   "all .15s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Translate button */}
        <button
          onClick={handleTranslate}
          disabled={!sourceBrand || !sourceSize || loading}
          style={{
            marginTop:    "18px",
            width:        "100%",
            padding:      "14px",
            borderRadius: "12px",
            border:       "none",
            background:   (!sourceBrand || !sourceSize) ? "#ccc" : "linear-gradient(135deg, #5b2fc9, #8b5cf6)",
            color:        "#fff",
            fontSize:     "16px",
            fontWeight:   700,
            cursor:       (!sourceBrand || !sourceSize) ? "not-allowed" : "pointer",
            transition:   "opacity .2s",
            opacity:      loading ? 0.7 : 1,
          }}
        >
          {loading ? "Translating…" : "🔄 Translate My Size"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background:"#fff0f0", border:"1.5px solid #ffc0c0",
          borderRadius:"12px", padding:"12px 16px",
          color:"#c00", marginBottom:"16px", fontSize:"14px"
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ animation:"fadeUp .35s ease" }}>
          {/* Summary bar */}
          <div style={{
            background:   "linear-gradient(135deg, #5b2fc9, #8b5cf6)",
            borderRadius: "14px",
            padding:      "16px 20px",
            color:        "#fff",
            marginBottom: "16px",
          }}>
            <div style={{ fontSize:"13px", opacity:0.85, marginBottom:"4px" }}>
              Translating from
            </div>
            <div style={{ fontSize:"22px", fontWeight:800, letterSpacing:"-0.5px" }}>
              {result.source.brand} — {result.source.size}
            </div>
            <div style={{ fontSize:"12px", opacity:0.8, marginTop:"2px" }}>
              {result.source.garment_type}
            </div>
            {result.insight && (
              <div style={{
                marginTop:    "10px",
                background:   "rgba(255,255,255,0.15)",
                borderRadius: "8px",
                padding:      "8px 12px",
                fontSize:     "13px",
                lineHeight:   1.4,
              }}>
                💡 {result.insight}
              </div>
            )}
          </div>

          {/* Brand cards */}
          <div style={{ fontSize:"13px", color:"#888", marginBottom:"10px", fontWeight:600 }}>
            {result.translations.length} brands translated
          </div>

          {result.translations.map((t, i) => (
            <BrandCard key={t.brand} t={t} index={i} />
          ))}

          {/* Share button */}
          <button
            onClick={handleShare}
            style={{
              marginTop:    "16px",
              width:        "100%",
              padding:      "13px",
              borderRadius: "12px",
              border:       "1.5px solid #5b2fc9",
              background:   "transparent",
              color:        "#5b2fc9",
              fontSize:     "15px",
              fontWeight:   700,
              cursor:       "pointer",
            }}
          >
            📤 Share via WhatsApp
          </button>

          <p style={{ textAlign:"center", fontSize:"11px", color:"#bbb", marginTop:"12px" }}>
            Powered by PakFit Engine v1 · {result.translations.length} brands · Real measurements
          </p>
        </div>
      )}
    </div>
  );
}

// ── Shared style tokens ───────────────────────────────────────────────────────
const LABEL = {
  display:      "block",
  fontSize:     "13px",
  fontWeight:   600,
  color:        "#555",
  marginBottom: "8px",
};
const SELECT = {
  width:        "100%",
  padding:      "10px 14px",
  borderRadius: "10px",
  border:       "1.5px solid #d0c8ee",
  fontSize:     "15px",
  color:        "#2d1b6b",
  background:   "#f8f6ff",
  appearance:   "none",
  cursor:       "pointer",
};

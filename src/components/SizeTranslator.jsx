// src/components/SizeTranslator.jsx — PakFit v3 — Urdu + User Friendly + Risk Score
import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "https://ham-462-pakfit-backend.hf.space";

// ── i18n ──────────────────────────────────────────────────────────────────────
const ST = {
  en: {
    badge:        "Cross-Brand Intelligence",
    title:        "Size Translator",
    sub:          "Know your size at one brand? Find it at all others.",
    subUr:        "اپنی سائز جانیں — ہر برانڈ میں",
    garmentLabel: "GARMENT TYPE",
    brandLabel:   "I KNOW MY SIZE AT…",
    sizeLabel:    "MY SIZE AT",
    translateBtn: "🔄 Translate My Size",
    translating:  "Translating…",
    selectBrand:  "Select brand",
    loading:      "Loading…",
    fromLabel:    "Translating from",
    brandsCount:  (n) => `${n} brands translated`,
    shareBtn:     "Share via WhatsApp",
    footer:       "PakFit Engine v1 · Computed from real measurements",
    showDetails:  "Show details",
    hideDetails:  "Hide details",
    runnerUp:     "Runner-up",
    betweenSizes: "Try both sizes",
    noData:       "Not available yet",
    verdicts: {
      great:    "✦ Great fit",
      good:     "✓ Good fit",
      check:    "~ Worth checking",
      between:  "⚠ You're between sizes",
      tightUp:  "Size up recommended",
      looseDown:"Size down available",
    },
    details: {
      confidence: "Confidence",
      fitType:    "Fit type",
      chestDelta: "Chest room",
      tooTight:   "Runs small",
      loose:      "Has extra room",
      regular:    "True to size",
      slim:       "Slightly slim",
      comfort:    "Comfortable room",
    },
    garments: ["Kameez","Kurta","Shalwar","Waistcoat"],
  },
  ur: {
    badge:        "تمام برانڈز کا موازنہ",
    title:        "سائز ترجمان",
    sub:          "ایک برانڈ کی سائز جانتے ہیں؟ باقی سب میں تلاش کریں۔",
    subUr:        "Know your size at one brand? Find it at all others.",
    garmentLabel: "لباس کی قسم",
    brandLabel:   "میری سائز اس برانڈ میں معلوم ہے",
    sizeLabel:    "میری سائز",
    translateBtn: "🔄 سائز ترجمہ کریں",
    translating:  "ترجمہ ہو رہا ہے…",
    selectBrand:  "برانڈ منتخب کریں",
    loading:      "لوڈ ہو رہا ہے…",
    fromLabel:    "ترجمہ ہو رہا ہے",
    brandsCount:  (n) => `${n} برانڈز کا ترجمہ`,
    shareBtn:     "واٹس ایپ پر شیئر کریں",
    footer:       "PakFit Engine v1 · حقیقی پیمائش سے حساب",
    showDetails:  "تفصیل دیکھیں",
    hideDetails:  "تفصیل چھپائیں",
    runnerUp:     "متبادل سائز",
    betweenSizes: "دونوں سائز آزمائیں",
    noData:       "ابھی دستیاب نہیں",
    verdicts: {
      great:    "✦ بہترین فٹ",
      good:     "✓ اچھی فٹ",
      check:    "~ جانچ کریں",
      between:  "⚠ دو سائز کے درمیان ہیں",
      tightUp:  "ایک سائز بڑا لیں",
      looseDown:"ایک سائز چھوٹا بھی چل سکتا ہے",
    },
    details: {
      confidence: "اعتماد",
      fitType:    "فٹ قسم",
      chestDelta: "سینے کی جگہ",
      tooTight:   "چھوٹا ہے",
      loose:      "ڈھیلا ہے",
      regular:    "بالکل صحیح",
      slim:       "قدرے تنگ",
      comfort:    "آرام دہ گنجائش",
    },
    garments: ["کمیز","کرتہ","شلوار","واسکٹ"],
  },
};

const GARMENT_VALUES = ["Kameez","Kurta","Shalwar","Waistcoat"];

// ── Risk engine ───────────────────────────────────────────────────────────────
function getRisk(score, fitType, runnerUpScore, lang) {
  const t = ST[lang];
  const boundary  = runnerUpScore && (score - runnerUpScore) < 6;
  const isTight   = fitType === "Too Tight";
  const isLoose   = fitType === "Loose";

  if (boundary)
    return { verdict: t.verdicts.between,  color:"#A78BFA", barColor:"#6366F1", barPct: score };
  if (isTight)
    return { verdict: t.verdicts.tightUp,  color:"#F87171", barColor:"#EF4444", barPct: score };
  if (isLoose)
    return { verdict: t.verdicts.looseDown,color:"#FBBF24", barColor:"#F59E0B", barPct: score };
  if (score >= 88)
    return { verdict: t.verdicts.great,    color:"#818CF8", barColor:"#4F46E5", barPct: score };
  if (score >= 72)
    return { verdict: t.verdicts.good,     color:"#A78BFA", barColor:"#6366F1", barPct: score };
  return   { verdict: t.verdicts.check,    color:"#6B7280", barColor:"#374151", barPct: score };
}

function getFitLabel(fitType, lang) {
  const map = {
    "Regular":   ST[lang].details.regular,
    "Comfort":   ST[lang].details.comfort,
    "Slim":      ST[lang].details.slim,
    "Too Tight": ST[lang].details.tooTight,
    "Loose":     ST[lang].details.loose,
  };
  return map[fitType] || fitType;
}

function getChestLabel(delta, lang) {
  if (delta === undefined || delta === null) return "—";
  if (delta > 1.5)  return lang==="ur" ? `+${delta}" ڈھیلا` : `+${delta}" room`;
  if (delta < -0.5) return lang==="ur" ? `${delta}" چھوٹا` : `${delta}" tight`;
  return lang==="ur" ? "بالکل صحیح" : "True to size";
}

// ── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score, barColor, animate }) {
  return (
    <div style={{ height:3, borderRadius:2, background:"rgba(255,255,255,0.06)", overflow:"hidden", marginTop:10 }}>
      <div style={{
        height:"100%", borderRadius:2,
        background:`linear-gradient(90deg,${barColor},${barColor}99)`,
        width: animate ? `${Math.round(score)}%` : "0%",
        transition:"width 1.2s cubic-bezier(0.16,1,0.3,1)",
        boxShadow:`0 0 6px ${barColor}66`,
      }}/>
    </div>
  );
}

// ── Brand card ────────────────────────────────────────────────────────────────
function BrandCard({ t: translation, index, lang }) {
  const [open,    setOpen]    = useState(false);
  const [animate, setAnimate] = useState(false);
  const st = ST[lang];
  const isRTL = lang === "ur";

  useEffect(() => {
    const id = setTimeout(() => setAnimate(true), index * 60 + 80);
    return () => clearTimeout(id);
  }, [index]);

  const isNA = translation.recommended_size === "N/A";
  const risk = !isNA ? getRisk(translation.confidence, translation.fit_type, translation.runner_up_confidence, lang) : null;
  const chestDelta = translation.all_sizes?.[0]?.deltas?.chest;

  return (
    <div style={{
      background:"rgba(255,255,255,0.04)",
      border:`1px solid ${open ? "rgba(79,70,229,0.35)" : "rgba(255,255,255,0.07)"}`,
      borderRadius:16, padding:"16px 18px", marginBottom:10,
      opacity: animate ? 1 : 0,
      transform: animate ? "translateY(0)" : "translateY(10px)",
      transition:"opacity .3s ease, transform .3s ease, border-color .2s, box-shadow .2s",
      boxShadow: open ? "0 0 0 1px rgba(79,70,229,0.15), 0 8px 20px rgba(0,0,0,0.2)" : "none",
      direction: isRTL ? "rtl" : "ltr",
    }}>
      {/* Main row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        {/* Left */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:15, color:"#F1F1F3", marginBottom:4, letterSpacing:"-0.2px" }}>
            {translation.brand}
          </div>
          {!isNA && risk && (
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
              <span style={{
                fontSize:12, fontWeight:600, color: risk.color,
                background:`${risk.barColor}22`,
                border:`1px solid ${risk.barColor}44`,
                borderRadius:20, padding:"2px 10px",
                fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit",
              }}>
                {risk.verdict}
              </span>
            </div>
          )}
          {isNA && (
            <span style={{ fontSize:12, color:"#4B5563", fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit" }}>
              {st.noData}
            </span>
          )}
        </div>

        {/* Right — size */}
        <div style={{ textAlign: isRTL ? "left" : "right", marginLeft: isRTL ? 0 : 16, marginRight: isRTL ? 16 : 0, flexShrink:0 }}>
          <div style={{
            fontFamily:"'Libre Baskerville',Georgia,serif",
            fontSize: isNA ? 16 : 30, fontWeight:700, lineHeight:1,
            background: isNA ? "none" : "linear-gradient(135deg,#fff 20%,#818CF8 100%)",
            WebkitBackgroundClip: isNA ? "none" : "text",
            WebkitTextFillColor: isNA ? "#4B5563" : "transparent",
            color: isNA ? "#4B5563" : "unset",
          }}>
            {translation.recommended_size}
          </div>
        </div>
      </div>

      {/* Score bar */}
      {!isNA && risk && <ScoreBar score={risk.barPct} barColor={risk.barColor} animate={animate}/>}

      {/* Runner-up plain language */}
      {translation.runner_up && !isNA && (
        <div style={{
          marginTop:8, fontSize:12,
          color: (translation.confidence - translation.runner_up_confidence) < 6 ? "#A78BFA" : "#4B5563",
          fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit",
        }}>
          {(translation.confidence - translation.runner_up_confidence) < 6
            ? `⚠ ${st.betweenSizes}: ${translation.recommended_size} / ${translation.runner_up}`
            : `${st.runnerUp}: ${translation.runner_up}`
          }
        </div>
      )}

      {/* Show/hide details */}
      {!isNA && (
        <button
          onClick={() => setOpen(!open)}
          style={{
            marginTop:10, background:"none", border:"none",
            color:"#4F46E5", fontSize:12, cursor:"pointer",
            padding:0, fontWeight:600, fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit",
            display:"flex", alignItems:"center", gap:4,
          }}
        >
          {open ? `▲ ${st.hideDetails}` : `▼ ${st.showDetails}`}
        </button>
      )}

      {/* Technical details — hidden by default */}
      {open && !isNA && (
        <div style={{
          marginTop:12, borderTop:"1px solid rgba(255,255,255,0.05)",
          paddingTop:12, direction: isRTL ? "rtl" : "ltr",
        }}>
          {/* Detail pills */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
            <DetailPill
              label={st.details.confidence}
              value={`${Math.round(translation.confidence)}%`}
              color="#818CF8" isRTL={isRTL}
            />
            <DetailPill
              label={st.details.fitType}
              value={getFitLabel(translation.fit_type, lang)}
              color="#A78BFA" isRTL={isRTL}
            />
            {chestDelta !== undefined && (
              <DetailPill
                label={st.details.chestDelta}
                value={getChestLabel(chestDelta, lang)}
                color="#6366F1" isRTL={isRTL}
              />
            )}
          </div>

          {/* All sizes table */}
          {translation.all_sizes && translation.all_sizes.length > 1 && (
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr>
                  {["Size", st.details.confidence, st.details.fitType].map(h => (
                    <th key={h} style={{
                      padding:"4px 6px", textAlign: isRTL ? "right" : "left",
                      color:"#4F46E5", fontWeight:600, fontSize:11,
                      borderBottom:"1px solid rgba(79,70,229,0.15)",
                      fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {translation.all_sizes.map((s, i) => (
                  <tr key={s.size} style={{ background: i===0 ? "rgba(79,70,229,0.08)" : "transparent" }}>
                    <td style={{ padding:"6px 6px", color: i===0?"#fff":"#6B7280", fontWeight: i===0?700:400 }}>
                      {s.size}{i===0?" ✓":""}
                    </td>
                    <td style={{ padding:"6px 6px", color: s.score>=88?"#818CF8":s.score>=72?"#A78BFA":"#6B7280", fontWeight:600 }}>
                      {Math.round(s.score)}%
                    </td>
                    <td style={{ padding:"6px 6px", color:"#6B7280", fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit" }}>
                      {getFitLabel(s.fit_type, lang)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function DetailPill({ label, value, color, isRTL }) {
  return (
    <div style={{
      background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)",
      borderRadius:10, padding:"6px 12px",
    }}>
      <div style={{
        fontSize:10, color:"#6B7280", fontWeight:600,
        textTransform:"uppercase", letterSpacing:.4, marginBottom:2,
        fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit",
      }}>{label}</div>
      <div style={{
        fontSize:13, color, fontWeight:600,
        fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit",
      }}>{value}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SizeTranslator({ lang: propLang }) {
  const lang   = propLang || "en";
  const st     = ST[lang];
  const isRTL  = lang === "ur";

  const [brands,        setBrands]        = useState([]);
  const [sizes,         setSizes]         = useState([]);
  const [sourceBrand,   setSourceBrand]   = useState("");
  const [sourceSize,    setSourceSize]    = useState("");
  const [garmentIndex,  setGarmentIndex]  = useState(0);
  const [result,        setResult]        = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [brandsLoading, setBrandsLoading] = useState(false);

  const garmentType = GARMENT_VALUES[garmentIndex];

  useEffect(() => {
    setBrandsLoading(true);
    setSourceBrand(""); setSourceSize(""); setResult(null); setSizes([]);
    fetch(`${API}/api/brands-for-garment?garment_type=${encodeURIComponent(garmentType)}`)
      .then(r => r.json())
      .then(d => { setBrands(d.brands || []); setBrandsLoading(false); })
      .catch(() => { setBrands([]); setBrandsLoading(false); });
  }, [garmentType]);

  useEffect(() => {
    if (!sourceBrand) { setSizes([]); return; }
    setSourceSize(""); setResult(null);
    fetch(`${API}/api/sizes-for-brand?brand=${encodeURIComponent(sourceBrand)}&garment_type=${encodeURIComponent(garmentType)}`)
      .then(r => r.json())
      .then(d => setSizes(d.sizes || []))
      .catch(() => setSizes([]));
  }, [sourceBrand, garmentType]);

  const handleTranslate = useCallback(async () => {
    if (!sourceBrand || !sourceSize) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${API}/api/translate-size`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ source_brand:sourceBrand, source_size:sourceSize, garment_type:garmentType }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Translation failed");
      setResult(data);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, [sourceBrand, sourceSize, garmentType]);

  const handleShare = () => {
    if (!result) return;
    const lines = [
      `🇵🇰 PakFit ${st.title} — ${result.source.garment_type}`,
      `${result.source.brand} ${result.source.size}`,
      "",
      ...result.translations.map(t =>
        t.recommended_size !== "N/A"
          ? `${t.brand}: ${t.recommended_size} — ${getRisk(t.confidence, t.fit_type, t.runner_up_confidence, lang).verdict}`
          : `${t.brand}: ${st.noData}`
      ),
      "",
      result.insight || "",
      "",
      "PakFit — pakfit.app",
    ].join("\n");
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile && navigator.share) {
      navigator.share({ title:`PakFit ${st.title}`, text:lines })
        .catch(() => window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, "_blank"));
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, "_blank");
    }
  };

  const canTranslate = sourceBrand && sourceSize && !loading;

  return (
    <div style={{
      fontFamily:"'Poppins',sans-serif",
      maxWidth:520, margin:"0 auto", padding:"0 0 40px",
      direction: isRTL ? "rtl" : "ltr",
    }}>

      {/* Header */}
      <div style={{ textAlign:"center", padding:"20px 0 24px" }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:7,
          background:"rgba(79,70,229,0.12)", border:"1px solid rgba(79,70,229,0.25)",
          borderRadius:20, padding:"5px 14px", marginBottom:16,
        }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#4F46E5", animation:"pulse 2s infinite" }}/>
          <span style={{ fontSize:11.5, color:"#818CF8", fontWeight:500,
            fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit" }}>
            {st.badge}
          </span>
        </div>
        <h2 style={{
          margin:0, fontSize:24, fontWeight:700, color:"#F1F1F3",
          fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "'Libre Baskerville',Georgia,serif",
          letterSpacing: isRTL ? 0 : "-0.3px",
        }}>
          {st.title}
        </h2>
        <p style={{
          margin:"8px 0 4px", fontSize:13, color:"#6B7280", lineHeight:1.6,
          fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit",
        }}>{st.sub}</p>
        <p style={{
          margin:0, fontSize:12, color:"#374151",
          fontFamily: isRTL ? "inherit" : "'Noto Sans Arabic',sans-serif",
        }}>{st.subUr}</p>
      </div>

      {/* Step 1 — Garment */}
      <StepCard step="1" label={st.garmentLabel} isRTL={isRTL}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {st.garments.map((g, i) => (
            <button key={g} onClick={() => setGarmentIndex(i)} style={{
              padding:"8px 18px", borderRadius:20,
              border: garmentIndex===i ? "none" : "1px solid rgba(255,255,255,0.08)",
              background: garmentIndex===i ? "#4F46E5" : "rgba(255,255,255,0.03)",
              color: garmentIndex===i ? "#fff" : "#6B7280",
              fontWeight:600, fontSize:13, cursor:"pointer",
              fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit",
              transition:"all .2s",
              boxShadow: garmentIndex===i ? "0 4px 14px rgba(79,70,229,0.35)" : "none",
            }}>{g}</button>
          ))}
        </div>
      </StepCard>

      {/* Step 2 — Brand */}
      <StepCard step="2" label={st.brandLabel} isRTL={isRTL}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {brandsLoading
            ? <span style={{ fontSize:13, color:"#4B5563",
                fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit" }}>
                {st.loading}
              </span>
            : <>
              {brands.map(b => (
                <button key={b} onClick={() => setSourceBrand(b)} style={{
                  padding:"7px 16px", borderRadius:10,
                  border: sourceBrand===b ? "1px solid #4F46E5" : "1px solid rgba(255,255,255,0.07)",
                  background: sourceBrand===b ? "rgba(79,70,229,0.15)" : "rgba(255,255,255,0.03)",
                  color: sourceBrand===b ? "#818CF8" : "#6B7280",
                  fontWeight: sourceBrand===b ? 700 : 400,
                  fontSize:13, cursor:"pointer",
                  fontFamily:"inherit", transition:"all .2s",
                }}>{b}</button>
              ))}
              <button onClick={() => setSourceBrand("__unknown__")} style={{
                padding:"7px 16px", borderRadius:10,
                border: sourceBrand==="__unknown__" || sourceBrand?.startsWith("__unknown__:") ? "1px solid #F59E0B" : "1px dashed rgba(245,158,11,0.3)",
                background: sourceBrand==="__unknown__" || sourceBrand?.startsWith("__unknown__:") ? "rgba(245,158,11,0.1)" : "transparent",
                color: sourceBrand==="__unknown__" || sourceBrand?.startsWith("__unknown__:") ? "#F59E0B" : "#4B5563",
                fontWeight:500, fontSize:12, cursor:"pointer",
                fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit",
                transition:"all .2s",
              }}>
                {isRTL ? "+ میرا برانڈ یہاں نہیں" : "+ My brand isn't listed"}
              </button>
            </>
          }
        </div>
      </StepCard>

      {/* Step 3 — Size */}
      {sizes.length > 0 && (
        <StepCard step="3" label={`${st.sizeLabel} ${sourceBrand}`} isRTL={isRTL}>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {sizes.map(s => (
              <button key={s} onClick={() => setSourceSize(s)} style={{
                padding:"10px 22px", borderRadius:10,
                border: sourceSize===s ? "none" : "1px solid rgba(255,255,255,0.08)",
                background: sourceSize===s
                  ? "linear-gradient(135deg,#4F46E5,#6366F1)"
                  : "rgba(255,255,255,0.03)",
                color: sourceSize===s ? "#fff" : "#9CA3AF",
                fontWeight:700, fontSize:16, cursor:"pointer",
                fontFamily:"inherit", transition:"all .2s",
                boxShadow: sourceSize===s ? "0 4px 16px rgba(79,70,229,0.4)" : "none",
              }}>{s}</button>
            ))}
          </div>
        </StepCard>
      )}

      {(sourceBrand === "__unknown__" || sourceBrand?.startsWith("__unknown__:")) && (
        <div style={{
          background:"rgba(245,158,11,0.06)",
          border:"1px solid rgba(245,158,11,0.2)",
          borderRadius:14, padding:"16px", marginBottom:12,
        }}>
          <p style={{ fontSize:12, fontWeight:600, color:"#F59E0B", marginBottom:8,
            fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit" }}>
            {isRTL ? "اپنا برانڈ اور سائز درج کریں" : "Enter your brand and size"}
          </p>
          <input
            placeholder={isRTL ? "برانڈ کا نام" : "Brand name (e.g. Tarzz, Breakout)"}
            style={{
              width:"100%", padding:"10px 14px", borderRadius:10, marginBottom:10,
              border:"1px solid rgba(245,158,11,0.2)",
              background:"rgba(255,255,255,0.04)", color:"#F1F1F3",
              fontSize:13, fontFamily:"inherit", outline:"none",
            }}
            onChange={e => setSourceBrand(`__unknown__:${e.target.value}`)}
          />
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {["XS","S","M","L","XL","XXL"].map(s => (
              <button key={s} onClick={() => setSourceSize(s)} style={{
                padding:"8px 16px", borderRadius:10,
                border: sourceSize===s ? "none" : "1px solid rgba(255,255,255,0.08)",
                background: sourceSize===s ? "linear-gradient(135deg,#4F46E5,#6366F1)" : "rgba(255,255,255,0.03)",
                color: sourceSize===s ? "#fff" : "#9CA3AF",
                fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit",
                boxShadow: sourceSize===s ? "0 4px 12px rgba(79,70,229,0.4)" : "none",
              }}>{s}</button>
            ))}
          </div>
          <p style={{ fontSize:11, color:"#6B7280", marginTop:10, lineHeight:1.5,
            fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit" }}>
            {isRTL
              ? "ہم آپ کے تمام معلوم برانڈز میں سائز دکھائیں گے۔ آپ کا برانڈ جلد شامل کریں گے۔"
              : "We'll show your equivalent size at all 11 known brands. We'll add your brand to PakFit soon."}
          </p>
        </div>
      )}

      {/* Translate button */}
      {sourceBrand && sizes.length > 0 && (
        <button
          onClick={handleTranslate}
          disabled={!canTranslate}
          style={{
            width:"100%", padding:15, borderRadius:14, border:"none",
            background: !canTranslate
              ? "rgba(255,255,255,0.04)"
              : "linear-gradient(135deg,#4F46E5,#6366F1)",
            color: !canTranslate ? "#4B5563" : "#fff",
            fontSize:15, fontWeight:700,
            cursor: !canTranslate ? "not-allowed" : "pointer",
            fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit",
            transition:"all .25s", marginBottom:16,
            boxShadow: canTranslate ? "0 6px 24px rgba(79,70,229,0.4)" : "none",
            opacity: loading ? 0.8 : 1,
          }}
        >
          {loading
            ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <span style={{
                  width:16, height:16, borderRadius:"50%",
                  border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff",
                  animation:"spin .7s linear infinite", display:"inline-block",
                }}/>
                {st.translating}
              </span>
            : st.translateBtn
          }
        </button>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)",
          borderRadius:12, padding:"12px 16px", color:"#F87171",
          marginBottom:16, fontSize:13,
          fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit",
        }}>⚠ {error}</div>
      )}

      {/* Results */}
      {result && (
        <div>
          {/* Summary */}
          <div style={{
            background:"linear-gradient(135deg,rgba(79,70,229,0.18),rgba(99,102,241,0.08))",
            border:"1px solid rgba(79,70,229,0.25)",
            borderRadius:16, padding:"18px 20px", marginBottom:14,
          }}>
            <div style={{
              fontSize:11, color:"#6B7280", fontWeight:600,
              textTransform:"uppercase", letterSpacing:.6, marginBottom:4,
              fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit",
            }}>
              {st.fromLabel}
            </div>
            <div style={{
              fontSize:26, fontWeight:800, color:"#F1F1F3",
              letterSpacing:"-0.5px",
              fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "'Libre Baskerville',Georgia,serif",
            }}>
              {result.source.brand} — {result.source.size}
            </div>
            <div style={{
              fontSize:12, color:"#6B7280", marginTop:2,
              fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit",
            }}>
              {result.source.garment_type}
            </div>
            {result.insight && (
              <div style={{
                marginTop:12, background:"rgba(255,255,255,0.04)",
                borderRadius:10, padding:"10px 14px",
                fontSize:13, color:"#9CA3AF", lineHeight:1.6,
                border:"1px solid rgba(255,255,255,0.06)",
                fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit",
              }}>
                💡 {result.insight}
              </div>
            )}
          </div>

          <div style={{
            fontSize:12, color:"#4B5563", marginBottom:10, fontWeight:600,
            fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit",
          }}>
            {st.brandsCount(result.translations.length)}
          </div>

          {result.translations.map((t, i) => (
            <BrandCard key={t.brand} t={t} index={i} lang={lang}/>
          ))}

          {/* Share */}
          <button
            onClick={handleShare}
            style={{
              marginTop:16, width:"100%", padding:14, borderRadius:12,
              border:"none", background:"#25D366", color:"#fff",
              fontSize:14, fontWeight:700, cursor:"pointer",
              fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit",
              transition:"all .25s cubic-bezier(0.34,1.56,0.64,1)",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow:"0 4px 14px rgba(37,211,102,0.3)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background="#1ebe5d";
              e.currentTarget.style.transform="translateY(-2px)";
              e.currentTarget.style.boxShadow="0 8px 24px rgba(37,211,102,0.5)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background="#25D366";
              e.currentTarget.style.transform="translateY(0)";
              e.currentTarget.style.boxShadow="0 4px 14px rgba(37,211,102,0.3)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.498 14.382c-.301-.151-1.767-.867-2.04-.966-.273-.099-.473-.148-.673.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-1.746-.872-2.888-1.554-4.035-3.524-.305-.524.305-.487.873-1.62.099-.198.05-.371-.025-.52-.075-.149-.667-1.612-.916-2.21-.241-.579-.487-.5-.667-.51-.173-.008-.371-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.04 3.121 4.946 4.249 2.906 1.129 2.906.752 3.43.703.524-.05 1.692-.69 1.93-1.357.238-.667.238-1.238.165-1.357-.074-.119-.272-.198-.57-.347z"/>
              <path d="M12.04 2c-5.523 0-10 4.477-10 10 0 1.77.464 3.434 1.276 4.876L2 22l5.236-1.276A9.953 9.953 0 0012.04 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 18.182a8.16 8.16 0 01-4.16-1.142l-.298-.177-3.09.752.752-3.014-.198-.31a8.181 8.181 0 01-1.215-4.291c0-4.518 3.665-8.182 8.21-8.182 4.546 0 8.21 3.664 8.21 8.182 0 4.517-3.665 8.182-8.21 8.182z"/>
            </svg>
            {st.shareBtn}
          </button>

          <p style={{
            textAlign:"center", fontSize:11, color:"#374151", marginTop:14,
            fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit",
          }}>
            {st.footer}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Step card wrapper ─────────────────────────────────────────────────────────
function StepCard({ step, label, children, isRTL }) {
  return (
    <div style={{
      background:"rgba(255,255,255,0.04)",
      border:"1px solid rgba(255,255,255,0.07)",
      borderRadius:16, padding:"18px 20px", marginBottom:12,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <div style={{
          width:24, height:24, borderRadius:8,
          background:"rgba(79,70,229,0.2)",
          border:"1px solid rgba(79,70,229,0.3)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:12, fontWeight:700, color:"#818CF8", flexShrink:0,
        }}>{step}</div>
        <span style={{
          fontSize:11, fontWeight:600, color:"#6B7280",
          textTransform: isRTL ? "none" : "uppercase",
          letterSpacing: isRTL ? 0 : ".5px",
          fontFamily: isRTL ? "'Noto Sans Arabic',sans-serif" : "inherit",
        }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API } from "../../config.js";
import Spinner from "../Spinner.jsx";
import StepDots from "../StepDots.jsx";

function ResultStep({ t, lang, isDark, ctx, measurements, onReset, onBack }) {
  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [loadStage,   setLoadStage]   = useState(0);
  const [error,       setError]       = useState("");
  const [name,        setName]        = useState("");
  const [saved,       setSaved]       = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showTryOn,   setShowTryOn]   = useState(false);
  const [personPhoto, setPersonPhoto] = useState(null);
  const [garmentPhoto, setGarmentPhoto] = useState(null);
  const garmentRef = useRef();
  const [tryOnResult, setTryOnResult] = useState(null);
  const [tryOnLoading,setTryOnLoading]= useState(false);
  const personRef = useRef();
  const isRTL = lang==="ur";

  const loadingStages = [t.loading1, t.loading2, t.loading3];

  useEffect(() => {
    // Cycle loading stages
    const timer = setInterval(() => setLoadStage(s => (s+1) % 3), 1800);
    const isCombined = ctx.garment === "Shalwar Kameez";
    const kameezMeasurements = isCombined
      ? Object.fromEntries(Object.entries(measurements).filter(([k])=>k!=="waist"))
      : measurements;
    const shalwarMeasurements = { waist: measurements.waist, length: 0 };

    const mainCall = axios.post(`${API}/api/recommend-size`, {
      product_url:   ctx.url||"",
      brand:         ctx.brand||"",
      garment_type: isCombined ? "Kameez" : ctx.garment,
      measurements:  kameezMeasurements,
      fit_pref:      ctx.fitPref,
      height_cm:     ctx.heightCm||175,
      input_method:  "manual",
    });

    const calls = isCombined && measurements.waist
      ? [mainCall, axios.post(`${API}/api/recommend-size`, {
          product_url:  ctx.url||"",
          brand:        ctx.brand||"",
          garment_type: "Shalwar",
          measurements: shalwarMeasurements,
          fit_pref:     ctx.fitPref,
          height_cm:    ctx.heightCm||175,
          input_method: "manual",
        })]
      : [mainCall];

    Promise.all(calls).then(([kameezRes, shalwarRes]) => {
      const combined = { ...kameezRes.data };
      if (shalwarRes) {
        const kSizes = kameezRes.data.all_sizes || [];
        const sSizes = shalwarRes.data.all_sizes || [];
        const sMap = {};
        sSizes.forEach(s => { sMap[s.size] = s.score; });
        const unified = kSizes.map(k => ({
          size: k.size,
          score: Math.round(0.85 * k.score + 0.15 * (sMap[k.size] || 0)),
        })).sort((a, b) => b.score - a.score);
        if (unified.length > 0) {
          combined.recommended_size = unified[0].size;
          combined.confidence = unified[0].score + "% confidence";
          combined.fitscore = unified[0].score;
          combined.all_sizes = unified;
          combined.shalwar_note = kameezRes.data.recommended_size !== shalwarRes.data.recommended_size
            ? "Shalwar length optimised for this size. Waist adjustable via naara."
            : null;
        }
        combined.shalwar_recommendation = null;
      }
      setResult(combined);
      setLoading(false);
      clearInterval(timer);
    }).catch(e => {
      setError(e.response?.data?.error||"Something went wrong.");
      setLoading(false);
      clearInterval(timer);
    });
    return () => clearInterval(timer);
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaveLoading(true);
    try {
      const res = await axios.post(`${API}/api/save-sizecard`, {
        name, measurements,
        brand_sizes: result ? { [result.brand]: result.recommended_size } : {},
      });
      setSaved(`${API}/api/size-card/${res.data.card_id}`);
    } catch {}
    setSaveLoading(false);
  };

  const handleTryOn = async () => {
    if (!personPhoto) return;
    setTryOnLoading(true);
    try {
      const fd = new FormData();
      fd.append("person_photo", personPhoto);
      if (garmentPhoto) fd.append("garment_image", garmentPhoto);
      if (ctx.url) fd.append("product_url", ctx.url);
      fd.append("garment_type", ctx.garment || "Kameez");
      const res = await axios.post(`${API}/api/try-on`, fd, { timeout: 180000 });
      setTryOnResult(res.data.result_path);
    } catch (e) {
      alert(e.response?.data?.error || "Try-on failed. Please try again in 30 seconds.");
    }
    setTryOnLoading(false);
  };

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ textAlign:"center", padding:"60px 20px" }}>
      <div style={{
        width:64, height:64, borderRadius:"50%",
        background:"rgba(79,70,229,0.15)",
        border:"1px solid rgba(79,70,229,0.3)",
        display:"flex", alignItems:"center", justifyContent:"center",
        margin:"0 auto 24px",
        boxShadow:"0 0 30px rgba(79,70,229,0.2)",
        animation:"pulse 2s infinite",
      }}>
        <div style={{ width:28, height:28, borderRadius:"50%", border:"3px solid rgba(79,70,229,0.3)", borderTopColor:"#818CF8", animation:"spin .9s linear infinite" }}/>
      </div>

      <div style={{ height:36, overflow:"hidden", marginBottom:12 }}>
        {loadingStages.map((s,i) => (
          <p key={i} className="loading-stage" style={{
            fontSize:16, fontWeight:500, color: i===loadStage?"#fff":"transparent",
            opacity: i===loadStage ? 1 : 0,
            transition:"all .4s ease",
            height:36, lineHeight:"36px",
            marginTop: i===loadStage ? 0 : -36,
          }}>{s}</p>
        ))}
      </div>

      <div style={{ maxWidth:240, margin:"0 auto" }}>
        <div className="score-bar-track">
          <div style={{
            height:"100%", borderRadius:3,
            background:"linear-gradient(90deg,#4F46E5,#818CF8)",
            width:`${((loadStage+1)/3)*100}%`,
            transition:"width 1.8s ease",
          }}/>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="glass fade-up" style={{ padding:32, textAlign:"center" }}>
      <div style={{ fontSize:36, marginBottom:12 }}>⚠️</div>
      <p style={{ color:"#F87171", marginBottom:20, fontSize:14 }}>{error}</p>
      <button className="btn-pakfit-primary" onClick={onReset}>Try Again</button>
    </div>
  );

  const sourceLabel = {
    live_scraped:    "Live brand website",
    fallback_csv:    "PakFit dataset",
    generic_standard: t.generic,
    cache:           "Cached data",
  }[result?.source] || result?.source;

  return (
    <div className="fade-up" style={{ direction: isRTL?"rtl":"ltr" }}>
      <StepDots step={2} total={3}/>

      {/* Main result */}
      <div className="glass" style={{ padding:32, marginBottom:14, textAlign:"center" }}>
        <p style={{ fontSize:11, fontWeight:600, letterSpacing:1, color:"#6B7280", textTransform:"uppercase", marginBottom:6 }}>
          {t.resultTitle}
        </p>
        {/* Kameez size */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, marginBottom:10 }}>
          <div style={{ textAlign:"center" }}>
            {result.shalwar_recommendation && <p style={{ fontSize:10, color:"#6B7280", marginBottom:2 }}>Kameez</p>}
            <div style={{
              fontFamily:"'Libre Baskerville',serif",
              fontSize: result.shalwar_recommendation ? "clamp(60px,12vw,80px)" : "clamp(80px,16vw,110px)",
              fontWeight:700, lineHeight:1,
              background:"linear-gradient(135deg,#fff 30%,#818CF8 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            }}>
              {result.recommended_size}
            </div>
          </div>
          {result.shalwar_recommendation && (
            <>
              <div style={{ color:"#374151", fontSize:24, fontWeight:300 }}>·</div>
              <div style={{ textAlign:"center" }}>
                <p style={{ fontSize:10, color:"#6B7280", marginBottom:2 }}>Shalwar</p>
                <div style={{
                  fontFamily:"'Libre Baskerville',serif",
                  fontSize:"clamp(60px,12vw,80px)", fontWeight:700, lineHeight:1,
                  background:"linear-gradient(135deg,#818CF8 30%,#C4B5FD 100%)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                }}>
                  {result.shalwar_recommendation.recommended_size}
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", flexWrap:"wrap", gap:8, marginBottom:20 }}>
          <span className="tag">✦ {result.confidence} {t.confidence}</span>
          <span style={{ color:"#374151", fontSize:12 }}>·</span>
          <span style={{ fontSize:12, color:"#6B7280" }}>{result.brand} · {result.garment_type}</span>
        </div>

        <div className="score-bar-track" style={{ marginBottom:24 }}>
          <div className="score-bar-fill" style={{ width:`${result.fitscore}%` }}/>
        </div>

        {result.explanation && (
          <div className="glass-sm" style={{ padding:16, textAlign:"left" }}>
            <p style={{ fontSize:11, color:"#6B7280", fontWeight:600, marginBottom:6, textTransform:"uppercase", letterSpacing:.5 }}>{t.whyThis}</p>
            <p style={{ fontSize:14, lineHeight:1.65, color:"#D1D5DB" }}>
              {lang==="en" ? result.explanation.english : result.explanation.urdu}
            </p>
          </div>
        )}
      </div>

      {/* All sizes */}
      <div className="glass" style={{ padding:22, marginBottom:14 }}>
        <p style={{ fontSize:11, color:"#6B7280", fontWeight:600, textTransform:"uppercase", letterSpacing:.5, marginBottom:14 }}>{t.allSizes}</p>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {result.all_sizes.map((s,i) => (
            <div key={s.size} className="size-pill"
              style={{
                animation:`stagger .35s ease ${i*.06}s both`,
                background: i===0 ? "rgba(79,70,229,0.2)" : "rgba(255,255,255,0.04)",
                border:`1px solid ${i===0?"#4F46E5":"rgba(255,255,255,0.07)"}`,
                minWidth:56,
              }}>
              <div style={{ fontSize:17, fontWeight:700, color:i===0?"#fff":"#9CA3AF" }}>{s.size}</div>
              <div style={{ fontSize:11, color:i===0?"#818CF8":"#4B5563" }}>{s.score.toFixed(0)}%</div>
            </div>
          ))}
        </div>
        {result.source === "generic_standard" && (
          <div style={{
            marginTop:12, padding:"12px 14px",
            background:"rgba(245,158,11,0.08)",
            border:"1px solid rgba(245,158,11,0.2)",
            borderRadius:12,
            display:"flex", alignItems:"flex-start", gap:10,
          }}>
            <span style={{ fontSize:16, flexShrink:0 }}>⚠️</span>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:"#F59E0B", marginBottom:3 }}>
                Brand not in our database yet
              </p>
              <p style={{ fontSize:12, color:"#9CA3AF", lineHeight:1.5 }}>
                We used the standard Pakistani men's size chart for {result.brand}. Our algorithm still calculated your best fit — accuracy is around 80%.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Try-On section */}
      <div className="glass" style={{ padding:22, marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: showTryOn?16:0 }}>
          <div>
            <p style={{ fontSize:14, fontWeight:600, display:"flex", alignItems:"center", gap:8 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>{t.tryOnTitle}</p>
            <p style={{ fontSize:12, color:"#6B7280", marginTop:2 }}>{t.tryOnSub}</p>
          </div>
          <button className="btn-ghost" style={{ padding:"7px 14px", fontSize:12 }}
            onClick={() => setShowTryOn(!showTryOn)}>
            {showTryOn ? "▲" : "▼"}
          </button>
        </div>

        {showTryOn && (
          <div className="fade-in">
            {/* Person photo upload */}
            <p style={{ fontSize:11, color:"#6B7280", fontWeight:600, textTransform:"uppercase", letterSpacing:.5, marginBottom:6 }}>Your photo</p>
            <div
              className={`drop-zone ${personPhoto?"has-file":""}`}
              onClick={() => personRef.current.click()}
              style={{ marginBottom:12 }}
            >
              <input ref={personRef} type="file" accept="image/*" style={{ display:"none" }}
                onChange={e => setPersonPhoto(e.target.files[0])}/>
              {personPhoto ? (
                <><div style={{ fontSize:22, marginBottom:4 }}>✓</div>
                  <p style={{ color:"#4ADE80", fontSize:13 }}>{personPhoto.name}</p></>
              ) : (
                <><div style={{ fontSize:22, marginBottom:4 }}>🧍</div>
                  <p style={{ fontSize:13 }}>Upload full-body photo</p>
                  <p style={{ fontSize:11, color:"#6B7280", marginTop:4 }}>Stand straight · Full body visible</p></>
              )}
            </div>

            {/* Garment image upload */}
            <p style={{ fontSize:11, color:"#6B7280", fontWeight:600, textTransform:"uppercase", letterSpacing:.5, marginBottom:6 }}>
              Garment image <span style={{ color:"#4B5563", fontWeight:400 }}>(if not auto-detected)</span>
            </p>
            <div
              className={`drop-zone ${garmentPhoto?"has-file":""}`}
              onClick={() => garmentRef.current.click()}
              style={{ marginBottom:12 }}
            >
              <input ref={garmentRef} type="file" accept="image/*" style={{ display:"none" }}
                onChange={e => setGarmentPhoto(e.target.files[0])}/>
              {garmentPhoto ? (
                <><div style={{ fontSize:22, marginBottom:4 }}>✓</div>
                  <p style={{ color:"#4ADE80", fontSize:13 }}>{garmentPhoto.name}</p></>
              ) : (
                <><div style={{ fontSize:22, marginBottom:4 }}>👕</div>
                  <p style={{ fontSize:13 }}>Upload garment photo</p>
                  <p style={{ fontSize:11, color:"#6B7280", marginTop:4 }}>From the brand website or your phone</p></>
              )}
            </div>

            {tryOnResult ? (
              <div className="fade-in" style={{ textAlign:"center" }}>
                <div style={{ position:"relative", display:"inline-block", width:"100%" }}>
                  <img src={tryOnResult} alt="Try-on result" style={{
                    maxWidth:"100%", borderRadius:16,
                    border:"1px solid rgba(79,70,229,0.3)",
                    boxShadow:"0 8px 32px rgba(79,70,229,0.25)",
                    display:"block", margin:"0 auto",
                  }}/>
                  <div style={{
                    position:"absolute", top:12, left:12,
                    background:"rgba(79,70,229,0.85)",
                    backdropFilter:"blur(8px)",
                    borderRadius:20, padding:"4px 12px",
                    fontSize:11, fontWeight:600, color:"#fff",
                    letterSpacing:"0.5px",
                  }}>✦ Naapify Try-On</div>
                </div>
                <div style={{
                  marginTop:16, padding:"16px",
                  background:"rgba(255,255,255,0.04)",
                  border:"1px solid rgba(255,255,255,0.07)",
                  borderRadius:16,
                }}>
                  <p style={{ fontSize:12, color:"#6B7280", marginBottom:12, fontWeight:500 }}>
                    Save or share your try-on result
                  </p>
                  <div style={{ display:"flex", gap:10 }}>
                    <a href={tryOnResult} download="Naapify-TryOn.jpg" style={{
                      flex:1, padding:"12px", borderRadius:12,
                      background:"linear-gradient(135deg,#4F46E5,#6366F1)",
                      color:"#fff", textDecoration:"none",
                      fontSize:13, fontWeight:700,
                      fontFamily:"'Poppins',sans-serif",
                      display:"flex", alignItems:"center",
                      justifyContent:"center", gap:6,
                      boxShadow:"0 4px 14px rgba(79,70,229,0.4)",
                    }}>⬇ Download</a>
                    <button onClick={() => {
                      const shareText = `I just tried on this outfit virtually using PakFit AI!\n\nGet your perfect size at naapify.com`;
                      if (navigator.share) {
                        fetch(tryOnResult)
                          .then(r => r.blob())
                          .then(blob => {
                            const file = new File([blob], "Naapify-TryOn.jpg", { type:"image/jpeg" });
                            navigator.share({ files:[file], title:"My Naapify Try-On", text: shareText });
                          })
                          .catch(() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank"));
                      } else {
                        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
                      }
                    }} style={{
                      flex:1, padding:"12px", borderRadius:12,
                      background:"linear-gradient(135deg,#25D366,#1ebe5d)",
                      color:"#fff", border:"none",
                      fontSize:13, fontWeight:700, cursor:"pointer",
                      fontFamily:"'Poppins',sans-serif",
                      display:"flex", alignItems:"center",
                      justifyContent:"center", gap:6,
                      boxShadow:"0 4px 14px rgba(37,211,102,0.4)",
                    }}>📱 WhatsApp</button>
                  </div>
                </div>
              </div>
            ) : (
              <button className="btn-pakfit-primary" style={{ width:"100%" }}
                disabled={!personPhoto||tryOnLoading} onClick={handleTryOn}>
                {tryOnLoading
                  ? <span style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}><Spinner/> {t.generating}</span>
                  : t.generateTryOn}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Save Size Card */}
      <div className="glass" style={{ padding:22, marginBottom:14 }}>
        <p style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>{t.saveSizeCard}</p>
        <p style={{ fontSize:12, color:"#6B7280", marginBottom:14 }}>Save your measurements and sizes to use across brands in the future.</p>
        {!saved ? (
          <div style={{ display:"flex", gap:8 }}>
            <input className="inp" value={name} onChange={e=>setName(e.target.value)}
              placeholder={t.yourName} style={{ flex:1 }}/>
            <button className="btn-pakfit-primary" onClick={handleSave}
              disabled={saveLoading||!name.trim()}>
              {saveLoading?<Spinner size={16}/>:t.saveBtn}
            </button>
          </div>
        ) : (
          <div className="fade-in">
            {/* Size card visual */}
            <div id="pakfit-size-card" style={{
              background:"linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              border:"1px solid rgba(79,70,229,0.4)",
              borderRadius:14, padding:20, marginBottom:12,
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <p style={{ fontSize:11, color:"#6B7280", marginBottom:3 }}>Naapify Size Card</p>
                  <p style={{ fontSize:18, fontWeight:700, fontFamily:"'Libre Baskerville',serif", color:"#fff" }}>{name}</p>
                </div>
                <div style={{
                  width:36, height:36, borderRadius:8, background:"#4F46E5",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"'Libre Baskerville',serif", fontSize:16, fontWeight:700, color:"#fff",
                }}>P</div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                {Object.entries(measurements).filter(([k]) => !["method","confidence","note","height_cm","weight_kg"].includes(k)).map(([k,v]) => (
                  <div key={k} style={{ background:"rgba(255,255,255,0.05)", borderRadius:8, padding:"8px 10px" }}>
                    <p style={{ fontSize:10, color:"#6B7280", marginBottom:2, textTransform:"uppercase", letterSpacing:.4 }}>{k}</p>
                    <p style={{ fontSize:15, fontWeight:600, color:"#fff" }}>{v}<span style={{ fontSize:10, color:"#6B7280", marginLeft:2 }}>in</span></p>
                  </div>
                ))}
              </div>
              <div style={{ background:"rgba(79,70,229,0.15)", borderRadius:8, padding:"10px 12px" }}>
                <p style={{ fontSize:11, color:"#818CF8", marginBottom:2 }}>Recommended at {result.brand}</p>
                <p style={{ fontSize:20, fontWeight:700, color:"#fff", fontFamily:"'Libre Baskerville',serif" }}>{result.recommended_size} <span style={{ fontSize:12, color:"#818CF8" }}>{result.confidence} confidence</span></p>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {/* Download */}
              <button className="btn-ghost" style={{ padding:"10px", textAlign:"center" }}
                onClick={() => {
                  const canvas = document.createElement("canvas");
                  canvas.width  = 680;
                  canvas.height = 400;
                  const ctx = canvas.getContext("2d");

                  // Background gradient
                  const bg = ctx.createLinearGradient(0, 0, 680, 400);
                  bg.addColorStop(0, "#0D0D14");
                  bg.addColorStop(1, "#1a1a3e");
                  ctx.fillStyle = bg;
                  ctx.fillRect(0, 0, 680, 400);

                  // Border
                  ctx.strokeStyle = "rgba(79,70,229,0.6)";
                  ctx.lineWidth = 1.5;
                  ctx.strokeRect(8, 8, 664, 384);

                  // Left accent bar
                  ctx.fillStyle = "#4F46E5";
                  ctx.fillRect(24, 24, 4, 72);

                  // PakFit label
                  ctx.fillStyle = "#6B7280";
                  ctx.font = "12px sans-serif";
                  ctx.fillText("Naapify Size Card", 38, 40);

                  // Name
                  ctx.fillStyle = "#FFFFFF";
                  ctx.font = "bold 30px serif";
                  ctx.fillText(name, 38, 78);

                  // Recommended size box
                  ctx.fillStyle = "rgba(79,70,229,0.25)";
                  ctx.fillRect(480, 20, 180, 88);
                  ctx.strokeStyle = "rgba(79,70,229,0.4)";
                  ctx.lineWidth = 1;
                  ctx.strokeRect(480, 20, 180, 88);

                  ctx.fillStyle = "#818CF8";
                  ctx.font = "11px sans-serif";
                  ctx.textAlign = "center";
                  ctx.fillText(result.brand || "PakFit", 570, 40);

                  ctx.fillStyle = "#FFFFFF";
                  ctx.font = "bold 56px serif";
                  ctx.fillText(result.recommended_size, 570, 90);

                  ctx.fillStyle = "#818CF8";
                  ctx.font = "11px sans-serif";
                  ctx.fillText(result.confidence + " confidence", 570, 108);

                  // Divider
                  ctx.strokeStyle = "rgba(255,255,255,0.06)";
                  ctx.lineWidth = 1;
                  ctx.beginPath();
                  ctx.moveTo(24, 116);
                  ctx.lineTo(656, 116);
                  ctx.stroke();

                  // Measurements
                  ctx.textAlign = "left";
                  const mFields = Object.entries(measurements).filter(([k]) => !["method","confidence","note","height_cm","weight_kg"].includes(k));
                  const cols = 4;
                  const colW = 154;
                  const rowH = 70;
                  mFields.forEach(([key, val], idx) => {
                    const col = idx % cols;
                    const row = Math.floor(idx / cols);
                    const x = 24 + col * colW;
                    const y = 128 + row * rowH;
                    ctx.fillStyle = "rgba(255,255,255,0.05)";
                    ctx.fillRect(x, y, colW - 8, 58);
                    ctx.fillStyle = "#6B7280";
                    ctx.font = "10px sans-serif";
                    ctx.fillText(key.charAt(0).toUpperCase() + key.slice(1), x + 8, y + 16);
                    ctx.fillStyle = "#FFFFFF";
                    ctx.font = "bold 22px sans-serif";
                    ctx.fillText(String(val), x + 8, y + 42);
                    ctx.fillStyle = "#6B7280";
                    ctx.font = "10px sans-serif";
                    ctx.fillText(" in", x + 8 + ctx.measureText(String(val)).width + 2, y + 42);
                  });

                  // Footer
                  ctx.strokeStyle = "rgba(255,255,255,0.06)";
                  ctx.beginPath(); ctx.moveTo(24, 370); ctx.lineTo(656, 370); ctx.stroke();
                  ctx.fillStyle = "#374151";
                  ctx.font = "10px sans-serif";
                  ctx.fillText("Generated by PakFit  •  naapify.com", 24, 388);
                  ctx.textAlign = "right";
                  ctx.fillText(new Date().toLocaleDateString(), 656, 388);

                  canvas.toBlob(blob => {
                    const url = URL.createObjectURL(blob);
                    const a   = document.createElement("a");
                    a.href = url;
                    a.download = `Naapify-${name}-SizeCard.png`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }, "image/png");
                }}>
                ⬇ Download Card (PNG)
              </button>
              {/* WhatsApp */}
              <button style={{
                background:"#25D366", color:"#fff", border:"none", borderRadius:10,
                padding:"10px", fontFamily:"'Poppins',sans-serif", fontSize:13,
                fontWeight:500, cursor:"pointer", transition:"all .25s ease",
              }}
                onMouseEnter={e=>e.target.style.background="#1ebe5d"}
                onMouseLeave={e=>e.target.style.background="#25D366"}
                onClick={() => {
                  const text = `My Naapify Size Card\n\nName: ${name}\nRecommended size at ${result.brand}: *${result.recommended_size}* (${result.confidence} confidence)\n\nMeasurements:\n${Object.entries(measurements).filter(([k])=>!["method","confidence","note","height_cm","weight_kg"].includes(k)).map(([k,v])=>`${k}: ${v} in`).join("\n")}\n\nFind your size at naapifyv2.netlify.app`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                }}>
                <span style={{ marginRight:6 }}>📱</span> Share on WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display:"flex", gap:10, marginTop:8 }}>
        <button className="btn-ghost" style={{ flex:1 }} onClick={onBack}>← {lang==="ur" ? "واپس" : "Back"}</button>
        <button className="btn-ghost" style={{ flex:1 }} onClick={onReset}>↺ {t.tryAnother}</button>
      </div>
    </div>
  );
}

export default ResultStep;

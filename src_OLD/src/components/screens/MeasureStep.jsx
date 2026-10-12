import { useState, useRef } from "react";
import axios from "axios";
import { API } from "../../config.js";
import { MEASUREMENT_FIELDS, FIELD_SECTIONS, FIELD_LABELS, FIELD_LABELS_UR, fieldLabel, fieldGuide } from "../../data/garments.js";
import { convertHeight } from "../../utils/units.js";
import Spinner from "../Spinner.jsx";
import StepDots from "../StepDots.jsx";
import MeasureDiagram from "../MeasureDiagram.jsx";

function MeasureStep({ t, lang, isDark, ctx, onNext, onBack }) {
  const [method,   setMethod]  = useState(null); // 0=photo 1=manual 2=hw
  const [loading,  setLoading] = useState(false);
  const [dragOver, setDragOver]= useState(false);
  const [photo,    setPhoto]   = useState(null);
  const [heightVal,setHeightVal]=useState(175);
  const [heightUnit,setHeightUnit]=useState("cm");
  const [weight,   setWeight]  = useState(70);
  const [manualM,  setManualM] = useState({});
  const [showGuide,setShowGuide]=useState(false);
  const [error,    setError]   = useState("");
  const fileRef = useRef();
  const isRTL = lang==="ur";

  const heightCm = convertHeight(heightVal, heightUnit);
  const fields   = MEASUREMENT_FIELDS[ctx.garment] || MEASUREMENT_FIELDS.Kameez;
  // Guide should cover every field actually shown — including the shalwar
  // section of a combined Shalwar Kameez, which `fields` alone omits.
  const guideFields = FIELD_SECTIONS[ctx.garment]
    ? [...FIELD_SECTIONS[ctx.garment].kameez, ...FIELD_SECTIONS[ctx.garment].shalwar]
    : fields;

  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) setPhoto(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const doPhotoMeasure = async () => {
    if (!photo) return;
    setError(""); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("photo", photo);
      fd.append("height_cm", heightCm);
      fd.append("method", "photo");
      const res = await axios.post(`${API}/api/measure`, fd);
      onNext({ measurements: res.data.measurements, heightCm });
    } catch (e) {
      setError(e.response?.data?.error || "Detection failed. Try manual entry.");
    }
    setLoading(false);
  };

  const doHW = async () => {
    setError(""); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("method","height_weight");
      fd.append("height_cm", heightCm);
      fd.append("weight_kg", weight);
      const res = await axios.post(`${API}/api/measure`, fd);
      onNext({ measurements: res.data.measurements, heightCm });
    } catch { setError("Estimation failed."); }
    setLoading(false);
  };

  const doManual = () => {
    if (Object.keys(manualM).length === 0) { setError("Please enter at least one measurement."); return; }
    onNext({ measurements: manualM, heightCm });
  };

  const icons = [
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="6" width="20" height="14" rx="2"/><circle cx="12" cy="13" r="3"/><path d="M8 6V4h8v2"/></svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 3v3M3.6 9h16.8M5 9l1.5 9h11L19 9"/><path d="M9 12h6"/></svg>,
  ];

  // Height input block (shared)
  const HeightBlock = () => (
    <div style={{ display:"flex", gap:8, marginBottom:16 }}>
      <div style={{ flex:1, direction:"ltr" }}>
        <label className="lbl" style={{ direction: lang==="ur"?"rtl":"ltr", textAlign: lang==="ur"?"right":"left", display:"block" }}>{t.heightLabel}</label>
        <input className="inp" type="number" value={heightVal}
          onChange={e=>setHeightVal(e.target.value)} dir="ltr"/>
      </div>
      <div style={{ width:90 }}>
        <label className="lbl">{t.heightUnit}</label>
        <select className="inp" value={heightUnit} onChange={e=>setHeightUnit(e.target.value)}
          style={{ padding:"13px 10px", cursor:"pointer" }}>
          <option value="cm">cm</option>
          <option value="in">inches</option>
          <option value="ft">feet</option>
        </select>
      </div>
    </div>
  );

  if (method === null) {
    setTimeout(() => setMethod(1), 0);
    return null;
  }

  // ── Method 0: Photo ─────────────────────────────────────────────────────────
  if (method === 0) return (
    <div className="fade-up" style={{ direction: isRTL?"rtl":"ltr" }}>
      <StepDots step={1} total={3}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontFamily:"'Libre Baskerville',serif", fontSize:20, fontWeight:700 }}>{t.photoTitle}</h2>
        <button className="btn-ghost" style={{ padding:"7px 14px", fontSize:12 }} onClick={onBack}>← {t.back}</button>
      </div>

      <div className="glass" style={{ padding:24 }}>
        <HeightBlock/>

        <div
          className={`drop-zone ${dragOver?"drag-over":""} ${photo?"has-file":""}`}
          onClick={() => fileRef.current.click()}
          onDragOver={e=>{e.preventDefault();setDragOver(true)}}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{ marginBottom:16 }}
        >
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }}
            onChange={e => handleFile(e.target.files[0])}/>
          {photo ? (
            <>
              <div style={{ fontSize:36, marginBottom:8 }}>✓</div>
              <p style={{ color:"#4ADE80", fontSize:13, fontWeight:500 }}>{photo.name}</p>
              <p style={{ color:"#6B7280", fontSize:12, marginTop:4 }}>Click to change</p>
            </>
          ) : (
            <>
              <div style={{ fontSize:36, marginBottom:10 }}>📸</div>
              <p style={{ fontSize:14, fontWeight:500, marginBottom:4 }}>{t.dragDrop}</p>
              <p style={{ fontSize:12, color:"#6B7280" }}>{t.orClick}</p>
              <p style={{ fontSize:11, color:"#4B5563", marginTop:8 }}>{t.photoHint}</p>
            </>
          )}
        </div>

        {error && <p className="fade-in" style={{ color:"#F87171", fontSize:13, marginBottom:12 }}>⚠ {error}</p>}

        <button className="btn-pakfit-primary" style={{ width:"100%" }}
          disabled={!photo||loading} onClick={doPhotoMeasure}>
          {loading ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><Spinner/> {t.detecting}</span> : t.detectBtn}
        </button>
      </div>
    </div>
  );

  // ── Method 1: Manual ────────────────────────────────────────────────────────
  if (method === 1) return (
    <div className="fade-up" style={{ direction: isRTL?"rtl":"ltr" }}>
      <StepDots step={1} total={3}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontFamily:"'Libre Baskerville',serif", fontSize:20, fontWeight:700 }}>{t.manualTitle}</h2>
        <button className="btn-ghost" style={{ padding:"7px 14px", fontSize:12 }} onClick={onBack}>← {t.back}</button>
      </div>

      <div className="glass" style={{ padding:24 }}>
        {FIELD_SECTIONS[ctx.garment] ? (
          <>
            <p style={{ fontSize:11, fontWeight:600, color:"#818CF8", textTransform:"uppercase", letterSpacing:.5, marginBottom:10 }}>
              {ctx.garment === "Shalwar Kameez" ? "Kameez (Upper)" : "Kurta (Upper)"}
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              {FIELD_SECTIONS[ctx.garment].kameez.map(f => (
                <div key={f} style={{ direction:"ltr" }}>
                  <label className="lbl" style={{ direction: lang==="ur"?"rtl":"ltr", textAlign: lang==="ur"?"right":"left", display:"block" }}>
                    {fieldLabel(f, ctx.garment, lang)} (in)
                  </label>
                  <input className="inp" type="number" step="0.25"
                    value={manualM[f]||""} placeholder="0.0" dir="ltr"
                    onChange={e => setManualM(m => ({...m,[f]:parseFloat(e.target.value)||undefined}))}/>
                </div>
              ))}
            </div>
            <p style={{ fontSize:11, fontWeight:600, color:"#818CF8", textTransform:"uppercase", letterSpacing:.5, marginBottom:10 }}>
              Shalwar Length
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              {FIELD_SECTIONS[ctx.garment].shalwar.map(f => (
                <div key={f} style={{ direction:"ltr" }}>
                  <label className="lbl" style={{ direction: lang==="ur"?"rtl":"ltr", textAlign: lang==="ur"?"right":"left", display:"block" }}>
                    {fieldLabel(f, ctx.garment, lang)} (in)
                  </label>
                  <input className="inp" type="number" step="0.25"
                    value={manualM[f]||""} placeholder="0.0" dir="ltr"
                    onChange={e => setManualM(m => ({...m,[f]:parseFloat(e.target.value)||undefined}))}/>
                </div>
              ))}
            </div>
          </>
        ) : (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {fields.map(f => (
            <div key={f} style={{ direction:"ltr" }}>
              <label className="lbl" style={{ direction: lang==="ur"?"rtl":"ltr", textAlign: lang==="ur"?"right":"left", display:"block" }}>
                {lang==="ur"?FIELD_LABELS_UR[f]:FIELD_LABELS[f]} (in)
              </label>
              <input className="inp" type="number" step="0.25"
                value={manualM[f]||""} placeholder="0.0" dir="ltr"
                onChange={e => setManualM(m => ({...m,[f]:parseFloat(e.target.value)||undefined}))}/>
            </div>
          ))}
        </div>
        )}

        {/* Measurement guide */}
        <button className="btn-ghost" style={{ width:"100%", marginBottom:16, marginTop:4, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
          onClick={() => setShowGuide(!showGuide)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          {t.howMeasure} {showGuide?"▲":"▼"}
        </button>

        {showGuide && (
          <div className="fade-in" style={{ marginBottom:16, direction:"ltr" }}>
            <div className="measure-guide">
              {guideFields.map((f, idx) => (
                <div key={f} className="measure-item">
                  <div style={{ flexShrink:0, width:26, height:26, borderRadius:"50%", background:"#4F46E5", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700 }}>{idx+1}</div>
                  <div>
                    <div style={{ fontSize:11.5, fontWeight:600, color:"#818CF8", marginBottom:2 }}>{fieldLabel(f, ctx.garment, lang)}</div>
                    <div style={{ fontSize:11, color:"#6B7280", lineHeight:1.5 }}>{fieldGuide(f, ctx.garment, lang)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:14, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize:11, fontWeight:600, color:"#818CF8", textTransform:"uppercase", letterSpacing:.5, marginBottom:8, textAlign:"center" }}>Visual Guide</p>
              <MeasureDiagram garment="all" />
            </div>
          </div>
        )}

        {error && <p className="fade-in" style={{ color:"#F87171", fontSize:13, marginBottom:12 }}>⚠ {error}</p>}

        <button className="btn-pakfit-primary" style={{ width:"100%" }}
          onClick={doManual}>{t.continue} →</button>
      </div>
    </div>
  );

  // ── Method 2: Height/Weight ─────────────────────────────────────────────────
  if (method === 2) return (
    <div className="fade-up" style={{ direction: isRTL?"rtl":"ltr" }}>
      <StepDots step={1} total={3}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontFamily:"'Libre Baskerville',serif", fontSize:20, fontWeight:700 }}>{t.hwTitle}</h2>
        <button className="btn-ghost" style={{ padding:"7px 14px", fontSize:12 }} onClick={onBack}>← {t.back}</button>
      </div>

      <div className="glass" style={{ padding:24 }}>
        <HeightBlock/>
        <div style={{ marginBottom:16 }}>
          <label className="lbl">{t.weightLabel}</label>
          <input className="inp" type="number" value={weight}
            onChange={e=>setWeight(e.target.value)} dir="ltr"/>
        </div>

        <div className="glass-sm" style={{ padding:12, marginBottom:16 }}>
          <p style={{ fontSize:12, color:"#6B7280" }}>⚠ {t.hwNote}</p>
        </div>

        {error && <p className="fade-in" style={{ color:"#F87171", fontSize:13, marginBottom:12 }}>⚠ {error}</p>}

        <button className="btn-pakfit-primary" style={{ width:"100%" }}
          disabled={loading} onClick={doHW}>
          {loading ? <span style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}><Spinner/> Working...</span> : t.estimateBtn+" →"}
        </button>
      </div>
    </div>
  );

  return null;
}

export default MeasureStep;

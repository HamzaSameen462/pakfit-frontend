import { useState } from "react";
import axios from "axios";
import { API } from "../../config.js";
import { GARMENTS } from "../../data/garments.js";
import Spinner from "../Spinner.jsx";

function UrlStep({ t, lang, isDark, onNext }) {
  const [url,       setUrl]      = useState("");
  const [garment,   setGarment]  = useState("Kameez");
  const [fitPref,   setFitPref]  = useState("regular");
  const [detecting, setDetecting]= useState(false);
  const [detected,  setDetected] = useState(null);
  const isRTL = lang==="ur";

  const handleUrlChange = async (val) => {
    setUrl(val);
    setDetected(null);
    if (val.includes(".")) {
      setDetecting(true);
      try {
        const res = await axios.post(`${API}/api/detect-brand`, { url: val });
        if (res.data.brand) setDetected(res.data.brand);
      } catch {}
      setDetecting(false);
    }
  };

  return (
    <div className="fade-up" style={{ direction: isRTL?"rtl":"ltr" }}>
      {/* Hero */}
      <div style={{ textAlign:"center", marginBottom:40 }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:7,
          background:"rgba(79,70,229,0.12)", border:"1px solid rgba(79,70,229,0.25)",
          borderRadius:20, padding:"5px 14px", marginBottom:18,
        }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#4F46E5", animation:"pulse 2s infinite" }}/>
          <span style={{ fontSize:11.5, color:"#818CF8", fontWeight:500 }}>AI-Powered Size Intelligence</span>
        </div>

        <h1 style={{
          fontFamily: lang==="ur" ? "'Noto Sans Arabic',sans-serif" : "'Libre Baskerville',serif",
          fontSize: lang==="ur" ? "clamp(26px,4vw,38px)" : "clamp(34px,6vw,54px)",
          fontWeight:700,
          lineHeight: lang==="ur" ? 1.5 : 1.1,
          letterSpacing: lang==="ur" ? 0 : "-1px",
          marginBottom:14,
          color:"#fff",
          direction: lang==="ur" ? "rtl" : "ltr",
          textAlign:"center",
          maxWidth: lang==="ur" ? 300 : "100%",
          margin: lang==="ur" ? "0 auto 14px" : "0 0 14px",
        }}>{t.tagline}</h1>

        <p style={{
          fontSize: lang==="ur" ? 13 : 15,
          color:"#6B7280",
          maxWidth: lang==="ur" ? 360 : 400,
          margin:"0 auto", lineHeight: lang==="ur" ? 1.7 : 1.65,
          fontFamily: lang==="ur" ? "'Noto Sans Arabic',sans-serif" : "'Poppins',sans-serif",
          direction: lang==="ur" ? "rtl" : "ltr",
          textAlign:"center",
        }}>{t.sub}</p>
      </div>

      <div className="glass" style={{ padding:28, marginBottom:14 }}>
        {/* URL */}
        <div style={{ marginBottom:20 }}>
          <label className="lbl">{t.urlLabel}</label>
          <div style={{ position:"relative" }}>
            <input className="inp" value={url} onChange={e=>handleUrlChange(e.target.value)}
              placeholder={t.urlPlaceholder} dir="ltr" style={{ paddingRight: detecting?44:16 }}/>
            {detecting && <div style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)" }}><Spinner size={16} color="#818CF8"/></div>}
          </div>
          {detected && (
            <div className="fade-in" style={{ marginTop:7, display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#4ADE80" }}/>
              <span style={{ fontSize:12, color:"#4ADE80", fontWeight:500 }}>Brand detected: <strong>{detected}</strong></span>
            </div>
          )}
        </div>

        {/* Garment type */}
        <div style={{ marginBottom:16 }}>
          <label className="lbl">{t.garmentLabel}</label>
          <select className="inp" value={garment} onChange={e=>setGarment(e.target.value)}
            style={{ appearance:"none", paddingRight:36, cursor:"pointer",
              backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236B7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E\")",
              backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center" }}>
            {GARMENTS.map(g => <option key={g.value} value={g.value}>{lang==="ur"?g.labelUr:g.label}</option>)}
          </select>
        </div>

        {/* Fit preference */}
        <div style={{ marginBottom:24 }}>
          <label className="lbl">{t.fitLabel}</label>
          <div style={{ display:"flex", gap:8 }}>
            {["regular","slim","loose"].map(f => (
              <button key={f} className={`fit-btn ${fitPref===f?"active":""}`}
                onClick={() => setFitPref(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
            ))}
          </div>
        </div>

        <button className="btn-pakfit-primary" style={{ width:"100%" }}
          onClick={() => onNext({ url, brand: detected||"", garment, fitPref })}>
          {t.continue} →
        </button>
      </div>
    </div>
  );
}

export default UrlStep;

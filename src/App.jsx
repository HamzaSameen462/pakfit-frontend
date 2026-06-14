import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import SizeTranslator from "./components/SizeTranslator";

const API = "https://ham-462-pakfit-backend.hf.space";

// ── Inject fonts + global styles ─────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("pakfit-styles")) return;
  const link = document.createElement("link");
  link.rel  = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Poppins:wght@300;400;500;600&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap";
  document.head.appendChild(link);

  const style = document.createElement("style");
  style.id = "pakfit-styles";
  style.textContent = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{font-family:'Poppins',sans-serif;overflow-x:hidden;transition:background 0.4s,color 0.4s}
    body.dark{background:#0D0D14;color:#F1F1F3}
    body.light{background:#F4F4F8;color:#111118}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:#4F46E5;border-radius:2px}

    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes gradMove{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
    @keyframes floatOrb{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.05)}66%{transform:translate(-20px,15px) scale(0.97)}}
    @keyframes shimmerLine{0%{transform:translateX(-100%)}100%{transform:translateX(100%)} }
    @keyframes scaleIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
    @keyframes stagger{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

    .fade-up{animation:fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both}
    .fade-in{animation:fadeIn 0.35s ease both}
    .scale-in{animation:scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both}

    .dark .glass{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:20px}
    .light .glass{background:rgba(255,255,255,0.7);border:1px solid rgba(0,0,0,0.08);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:20px;box-shadow:0 4px 24px rgba(0,0,0,0.06)}

    .dark .glass-sm{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:14px}
    .light .glass-sm{background:rgba(255,255,255,0.8);border:1px solid rgba(0,0,0,0.07);border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.04)}

    .dark .inp{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#F1F1F3}
    .light .inp{background:rgba(255,255,255,0.9);border:1px solid rgba(0,0,0,0.12);color:#111118;box-shadow:0 1px 4px rgba(0,0,0,0.05)}
    .inp{width:100%;padding:13px 16px;border-radius:12px;font-family:'Poppins',sans-serif;font-size:14px;outline:none;transition:border-color .25s,box-shadow .25s}
    .inp:focus{border-color:#4F46E5;box-shadow:0 0 0 3px rgba(79,70,229,0.18)}
    .inp::placeholder{color:#6B7280}
    .inp option{background:#1A1A2E;color:#fff}

    .btn-primary{background:#4F46E5;color:#fff;border:none;border-radius:12px;padding:14px 28px;font-family:'Poppins',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .3s cubic-bezier(0.34,1.56,0.64,1);position:relative;overflow:hidden;letter-spacing:0.2px}
    .btn-primary:hover:not(:disabled){background:#6366F1;transform:translateY(-2px);box-shadow:0 8px 24px rgba(79,70,229,0.4)}
    .btn-primary:active:not(:disabled){transform:translateY(0) scale(0.98)}
    .btn-primary:disabled{background:#2D2D3A;color:#6B7280;cursor:not-allowed}
    .btn-primary::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 60%);opacity:0;transition:opacity .3s}
    .btn-primary:hover::after{opacity:1}

    .btn-ghost{background:transparent;border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:9px 18px;font-family:'Poppins',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:all .25s ease;color:#9CA3AF}
    .light .btn-ghost{border-color:rgba(0,0,0,0.12);color:#6B7280}
    .btn-ghost:hover{border-color:#4F46E5;color:#818CF8;background:rgba(79,70,229,0.08)}

    .method-card{cursor:pointer;border-radius:16px;padding:20px;transition:all .3s cubic-bezier(0.34,1.56,0.64,1)}
    .dark .method-card{border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03)}
    .light .method-card{border:1px solid rgba(0,0,0,0.07);background:rgba(255,255,255,0.6)}
    .method-card:hover{border-color:rgba(79,70,229,0.5)!important;background:rgba(79,70,229,0.07)!important;transform:translateY(-3px);box-shadow:0 8px 24px rgba(79,70,229,0.15)}
    .method-card.active{border-color:#4F46E5!important;background:rgba(79,70,229,0.1)!important;box-shadow:0 0 0 1px #4F46E5,0 8px 24px rgba(79,70,229,0.2)}

    .size-pill{padding:10px 14px;border-radius:10px;text-align:center;transition:all .3s cubic-bezier(0.34,1.56,0.64,1);cursor:default}
    .size-pill:hover{transform:translateY(-4px) scale(1.06)}

    .drop-zone{border:2px dashed rgba(79,70,229,0.35);border-radius:16px;padding:32px;text-align:center;cursor:pointer;transition:all .3s ease}
    .drop-zone:hover,.drop-zone.drag-over{border-color:#4F46E5;background:rgba(79,70,229,0.06)}
    .drop-zone.has-file{border-color:#4F46E5;background:rgba(79,70,229,0.08)}

    .lbl{font-size:11px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:#6B7280;display:block;margin-bottom:6px}

    .tag{display:inline-flex;align-items:center;gap:5px;background:rgba(79,70,229,0.15);color:#818CF8;border:1px solid rgba(79,70,229,0.25);border-radius:20px;padding:3px 10px;font-size:11px;font-weight:500}

    .score-bar-track{height:6px;border-radius:3px;overflow:hidden;background:rgba(255,255,255,0.08)}
    .light .score-bar-track{background:rgba(0,0,0,0.08)}
    .score-bar-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#4F46E5,#818CF8);transition:width 1.4s cubic-bezier(0.16,1,0.3,1)}

    .steps{display:flex;gap:6px;justify-content:center;margin-bottom:28px}
    .step-dot{height:7px;border-radius:4px;transition:all .4s cubic-bezier(0.34,1.56,0.64,1)}

    /* Loading screen */
    .loading-stage{animation:stagger .4s ease both}

    /* Fit toggle */
    .fit-btn{flex:1;padding:10px 8px;border-radius:10px;font-family:'Poppins',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:all .25s ease;text-transform:capitalize;border:1px solid}
    .dark .fit-btn{border-color:rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);color:#6B7280}
    .light .fit-btn{border-color:rgba(0,0,0,0.08);background:rgba(255,255,255,0.5);color:#6B7280}
    .fit-btn.active{border-color:#4F46E5!important;background:rgba(79,70,229,0.15)!important;color:#818CF8!important}

    /* Mode toggle */
    .mode-toggle{width:44px;height:24px;border-radius:12px;border:none;cursor:pointer;position:relative;transition:background .3s;flex-shrink:0}
    .dark .mode-toggle{background:rgba(255,255,255,0.1)}
    .light .mode-toggle{background:rgba(0,0,0,0.1)}
    .mode-toggle-thumb{position:absolute;top:3px;width:18px;height:18px;border-radius:50%;transition:all .3s cubic-bezier(0.34,1.56,0.64,1)}
    .dark .mode-toggle-thumb{left:3px;background:#818CF8}
    .light .mode-toggle-thumb{left:23px;background:#4F46E5}

    /* Graphic measurement guide */
    .measure-guide{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
    .measure-item{padding:10px;border-radius:10px;display:flex;align-items:flex-start;gap:8px}
    .dark .measure-item{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)}
    .light .measure-item{background:rgba(255,255,255,0.6);border:1px solid rgba(0,0,0,0.07)}
    .measure-icon{width:28px;height:28px;border-radius:8px;background:rgba(79,70,229,0.15);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}

    .nav-link{position:relative;background:none;border:none;cursor:pointer;font-family:'Poppins',sans-serif;font-size:13px;font-weight:500;color:#6B7280;padding:4px 2px;transition:color 0.25s,letter-spacing 0.25s;letter-spacing:0px}
    .nav-link::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:1.5px;background:linear-gradient(90deg,#4F46E5,#818CF8);border-radius:2px;transition:width 0.3s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 0 8px rgba(79,70,229,0.6)}
    .nav-link:hover{color:#818CF8;letter-spacing:0.4px}
    .nav-link:hover::after{width:100%}
    .nav-link.active-nav{color:#818CF8}
    .nav-link.active-nav::after{width:100%}
  `;
  document.head.appendChild(style);
};

injectStyles();

// ── i18n strings ──────────────────────────────────────────────────────────────
const T = {
  en: {
    brand:"PakFit", tagline:"Find your perfect fit",
    sub:"AI-powered size intelligence for Pakistani Eastern wear",
    urlLabel:"Paste product URL", urlPlaceholder:"https://junaidjamshed.com/products/...",
    garmentLabel:"Garment type", fitLabel:"Fit preference",
    continue:"Continue", back:"Back", next:"Next",
    measureQ:"How would you like to get your measurements?",
    measureSub:"Choose the method that works best for you",
    methods:["Upload a photo","I know my measurements","Height & weight only"],
    methodSubs:["AI detects your measurements","Enter with our visual guide","We estimate from your body stats"],
    photoTitle:"Upload Photo", dragDrop:"Drag & drop your photo here",
    orClick:"or click to browse", photoHint:"Stand straight · Full body visible · Good lighting",
    detectBtn:"Detect Measurements", detecting:"Detecting...",
    heightLabel:"Your height", heightUnit:"Unit",
    manualTitle:"Enter Measurements", howMeasure:"Measurement guide",
    hwTitle:"Height & Weight", hwNote:"Lower accuracy — best used as a starting point.",
    weightLabel:"Weight (kg)", estimateBtn:"Estimate My Size",
    resultTitle:"Your Perfect Size", confidence:"confidence",
    allSizes:"All sizes ranked", whyThis:"Why this size",
    tryOnTitle:"See how it looks on you", tryOnSub:"Upload your photo to virtually try on this garment",
    uploadPerson:"Upload your photo", uploadGarment:"Upload garment image (optional)",
    generateTryOn:"Generate Try-On", generating:"Generating...",
    saveSizeCard:"Save your Size Card", yourName:"Your name",
    saveBtn:"Save", saved:"Saved!", shareUrl:"Share URL",
    source:"Source", tryAnother:"Try another brand",
    loading1:"Scanning size chart...", loading2:"Running PakFit Engine...", loading3:"Generating explanation...",
    unknown:"Unknown brand — using standard Pakistani size chart",
    urdu:"اردو", english:"English", darkMode:"Dark", lightMode:"Light",
    generic:"Standard Pakistani chart",
  },
  ur: {
    brand:"پاک فٹ", tagline:"اپنا صحیح سائز تلاش کریں",
    sub:"پاکستانی مشرقی لباس کے لیے AI سائز انٹیلیجنس",
    urlLabel:"پروڈکٹ URL ڈالیں", urlPlaceholder:"https://junaidjamshed.com/products/...",
    garmentLabel:"لباس کی قسم", fitLabel:"فٹ کی ترجیح",
    continue:"آگے بڑھیں", back:"واپس", next:"اگلا",
    measureQ:"پیمائش کیسے لینا چاہتے ہیں؟",
    measureSub:"اپنے لیے بہترین طریقہ منتخب کریں",
    methods:["تصویر اپلوڈ کریں","پیمائش خود ڈالیں","قد اور وزن"],
    methodSubs:["AI خود پیمائش لے گا","بصری گائیڈ کے ساتھ ڈالیں","جسمانی اعداد سے اندازہ"],
    photoTitle:"تصویر اپلوڈ", dragDrop:"تصویر یہاں گھسیٹیں",
    orClick:"یا کلک کریں", photoHint:"سیدھے کھڑے ہوں · پورا جسم دکھے",
    detectBtn:"پیمائش نکالیں", detecting:"نکال رہے ہیں...",
    heightLabel:"آپ کا قد", heightUnit:"اکائی",
    manualTitle:"پیمائش ڈالیں", howMeasure:"ناپنے کا طریقہ",
    hwTitle:"قد اور وزن", hwNote:"کم درستگی — ابتدائی اندازے کے لیے استعمال کریں۔",
    weightLabel:"وزن (کلو)", estimateBtn:"میرا سائز معلوم کریں",
    resultTitle:"آپ کا بہترین سائز", confidence:"اعتماد",
    allSizes:"تمام سائز درجہ بندی", whyThis:"یہ سائز کیوں",
    tryOnTitle:"دیکھیں کیسا لگے گا", tryOnSub:"اپنی تصویر سے لباس آزمائیں",
    uploadPerson:"اپنی تصویر", uploadGarment:"لباس کی تصویر (اختیاری)",
    generateTryOn:"ٹرائی آن بنائیں", generating:"بن رہا ہے...",
    saveSizeCard:"سائز کارڈ محفوظ کریں", yourName:"آپ کا نام",
    saveBtn:"محفوظ کریں", saved:"ہو گیا!", shareUrl:"شیئر لنک",
    source:"ذریعہ", tryAnother:"دوسرا برانڈ آزمائیں",
    loading1:"سائز چارٹ اسکین ہو رہا ہے...", loading2:"PakFit Engine چل رہا ہے...", loading3:"وضاحت تیار ہو رہی ہے...",
    unknown:"نامعلوم برانڈ — معیاری پاکستانی چارٹ استعمال",
    urdu:"اردو", english:"English", darkMode:"ڈارک", lightMode:"لائٹ",
    generic:"معیاری پاکستانی چارٹ",
  },
};

const GARMENTS = [
  { value:"Kameez",        label:"Kameez",         labelUr:"کمیز" },
  { value:"Shalwar Kameez",label:"Shalwar Kameez", labelUr:"شلوار قمیص" },
  { value:"Shalwar",       label:"Shalwar",         labelUr:"شلوار" },
  { value:"Kurta",         label:"Kurta Pajama",    labelUr:"کرتہ پاجامہ" },
  { value:"Waistcoat",     label:"Waistcoat",       labelUr:"واسکٹ" },
];

const MEASUREMENT_FIELDS = {
  "Kameez":         ["chest","shoulder","sleeve","collar","length"],
  "Shalwar Kameez": ["chest","shoulder","sleeve","collar","length","waist"],
  "Kurta":          ["chest","shoulder","sleeve","collar","length","waist"],
  "Waistcoat":      ["chest","shoulder","length"],
  "Shalwar":        ["waist","length"],
};

// Labels for combined garments
const FIELD_SECTIONS = {
  "Shalwar Kameez": { kameez:["chest","shoulder","sleeve","collar","length"], shalwar:["waist"] },
  "Kurta":          { kameez:["chest","shoulder","sleeve","collar","length"], shalwar:["waist"] },
};

const FIELD_LABELS = {
  chest:"Chest", shoulder:"Shoulder", sleeve:"Sleeve Length",
  collar:"Collar", length:"Front Length", waist:"Waist",
};
const FIELD_LABELS_UR = {
  chest:"سینہ", shoulder:"کندھا", sleeve:"آستین",
  collar:"کالر", length:"لمبائی", waist:"کمر",
};
const FIELD_ICONS = {
  chest:"C", shoulder:"S", sleeve:"SL", collar:"CO", length:"L", waist:"W",
};
const FIELD_GUIDE = {
  chest:  "Wrap tape around fullest part of chest. Keep snug but not tight.",
  shoulder:"Measure from one shoulder tip to the other across your back.",
  sleeve: "From shoulder tip down to your wrist bone. Arm slightly bent.",
  collar: "Around your neck at the base. Keep one finger gap.",
  length: "From top of shoulder down to where you want the garment to end.",
  waist:  "Around your natural waistline — the narrowest part of your torso.",
};
const FIELD_GUIDE_UR = {
  chest:    "سینے کے چوڑے حصے کے گرد فیتہ لپیٹیں۔ نہ بہت ڈھیلا نہ بہت تنگ۔",
  shoulder: "ایک کندھے کی نوک سے دوسرے تک پیٹھ کے پار ناپیں۔",
  sleeve:   "کندھے کی نوک سے کلائی تک۔ بازو تھوڑا موڑ کر رکھیں۔",
  collar:   "گردن کی بنیاد کے گرد ناپیں۔ ایک انگلی کا فاصلہ رکھیں۔",
  length:   "کندھے کے اوپر سے نیچے تک جہاں کمیز ختم ہو۔",
  waist:    "قدرتی کمر کے گرد — جسم کا سب سے تنگ حصہ۔",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const cm2in = v => +(v / 2.54).toFixed(1);
const ft2cm = v => +(v * 30.48).toFixed(1);
const in2cm = v => +(v * 2.54).toFixed(1);

function convertHeight(val, unit) {
  if (unit === "cm") return +val;
  if (unit === "in") return in2cm(val);
  if (unit === "ft") return ft2cm(val);
  return +val;
}

// ── BG animated gradient ──────────────────────────────────────────────────────
function AnimatedBg({ isDark }) {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden",
    }}>
      {/* moving gradient */}
      <div style={{
        position:"absolute", inset:0,
        background: "linear-gradient(135deg, #0D0D14 0%, #0f0f20 25%, #0D0D14 50%, #10101f 75%, #0D0D14 100%)",
        backgroundSize:"300% 300%",
        animation:"gradMove 12s ease infinite",
      }}/>
      {/* orbs */}
      <div style={{
        position:"absolute", top:"5%", left:"10%",
        width:"45vw", height:"45vw", borderRadius:"50%",
        background:"radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)",
        animation:"floatOrb 9s ease-in-out infinite",
        filter:"blur(2px)",
      }}/>
      <div style={{
        position:"absolute", bottom:"10%", right:"5%",
        width:"38vw", height:"38vw", borderRadius:"50%",
        background:"radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
        animation:"floatOrb 12s ease-in-out infinite reverse",
        filter:"blur(2px)",
      }}/>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ size=18, color="#fff" }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", border:`2px solid rgba(255,255,255,0.2)`, borderTopColor:color, animation:"spin .7s linear infinite", flexShrink:0 }}/>;
}

// ── Step dots ─────────────────────────────────────────────────────────────────
function StepDots({ step, total }) {
  return (
    <div className="steps">
      {Array.from({length:total}).map((_,i) => (
        <div key={i} className="step-dot" style={{
          width: i===step ? 22 : 7, background: i===step ? "#4F46E5" : "rgba(255,255,255,0.15)",
        }}/>
      ))}
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ lang, setLang, t, setPage, page }) {
  return (
    <header style={{
      position:"fixed", top:0, left:0, right:0, zIndex:200,
      height:60, display:"flex", alignItems:"center",
      justifyContent:"space-between", padding:"0 24px",
      borderBottom:"1px solid rgba(255,255,255,0.06)",
      background:"rgba(13,13,20,0.85)",
      backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
      direction:"ltr",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}
        onClick={() => setPage("home")}>
        <div style={{
          width:30, height:30, borderRadius:8, background:"#4F46E5",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"'Libre Baskerville',serif", fontSize:15, fontWeight:700, color:"#fff",
        }}>P</div>
        <span style={{ fontFamily:"'Libre Baskerville',serif", fontSize:17, fontWeight:700, letterSpacing:"-0.3px" }}>
          {t.brand}
        </span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:24 }}>
        <button className={`nav-link ${page==="translator" ? "active-nav" : ""}`}
          onClick={() => setPage("translator")}>
          🔄 Size Translator
        </button>
        <button className={`nav-link ${page==="seller" ? "active-nav" : ""}`}
          onClick={() => setPage("seller")}>
          Seller Integration
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:8, direction:"ltr" }}>
          <span style={{ fontSize:12, fontWeight: lang==="en" ? 600 : 400, color: lang==="en" ? "#818CF8" : "#6B7280", transition:"color 0.3s" }}>EN</span>
          <div onClick={() => setLang(lang==="en" ? "ur" : "en")} style={{
            width:44, height:24, borderRadius:12, cursor:"pointer", position:"relative",
            background: lang==="ur" ? "#4F46E5" : "rgba(255,255,255,0.12)",
            transition:"background 0.3s", flexShrink:0,
          }}>
            <div style={{
              position:"absolute", top:3, width:18, height:18, borderRadius:"50%",
              background:"#fff", transition:"left 0.3s cubic-bezier(0.34,1.56,0.64,1)",
              left: lang==="ur" ? 23 : 3, boxShadow:"0 1px 4px rgba(0,0,0,0.3)",
            }}/>
          </div>
          <span style={{ fontSize:12, fontWeight: lang==="ur" ? 600 : 400, color: lang==="ur" ? "#818CF8" : "#6B7280", fontFamily:"'Noto Sans Arabic',sans-serif", transition:"color 0.3s" }}>اردو</span>
        </div>
      </div>
    </header>
  );
}

// ── SCREEN 1 — URL + Garment ──────────────────────────────────────────────────
function S1_URL({ t, lang, isDark, onNext }) {
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

        <button className="btn-primary" style={{ width:"100%" }}
          onClick={() => onNext({ url, brand: detected||"", garment, fitPref })}>
          {t.continue} →
        </button>
      </div>
    </div>
  );
}

// ── SCREEN 2 — Measurement method ─────────────────────────────────────────────
function S2_Method({ t, lang, isDark, ctx, onNext, onBack }) {
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

  if (method === null) return (
    <div className="fade-up" style={{ direction: isRTL?"rtl":"ltr" }}>
      <StepDots step={1} total={3}/>
      <h2 style={{ fontFamily:"'Libre Baskerville',serif", fontSize:22, fontWeight:700, textAlign:"center", marginBottom:8 }}>
        {t.measureQ}
      </h2>
      <p style={{ textAlign:"center", color:"#6B7280", fontSize:14, marginBottom:24 }}>{t.measureSub}</p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:12 }}>
        {t.methods.map((m,i) => (
          <div key={i} className="method-card" onClick={() => setMethod(i)}>
            <div style={{ fontSize:26, marginBottom:10 }}>{icons[i]}</div>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>{m}</div>
            <div style={{ fontSize:11.5, color:"#6B7280", lineHeight:1.5 }}>{t.methodSubs[i]}</div>
          </div>
        ))}
      </div>

      <button className="btn-ghost" style={{ width:"100%", marginTop:4 }} onClick={onBack}>← {t.back}</button>
    </div>
  );

  // ── Method 0: Photo ─────────────────────────────────────────────────────────
  if (method === 0) return (
    <div className="fade-up" style={{ direction: isRTL?"rtl":"ltr" }}>
      <StepDots step={1} total={3}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontFamily:"'Libre Baskerville',serif", fontSize:20, fontWeight:700 }}>{t.photoTitle}</h2>
        <button className="btn-ghost" style={{ padding:"7px 14px", fontSize:12 }} onClick={() => {setMethod(null);setError("")}}>← {t.back}</button>
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

        <button className="btn-primary" style={{ width:"100%" }}
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
        <button className="btn-ghost" style={{ padding:"7px 14px", fontSize:12 }} onClick={() => {setMethod(null);setError("")}}>← {t.back}</button>
      </div>

      <div className="glass" style={{ padding:24 }}>
        <HeightBlock/>

                {FIELD_SECTIONS[ctx.garment] ? (
          <>
            <p style={{ fontSize:11, fontWeight:600, color:"#818CF8", textTransform:"uppercase", letterSpacing:.5, marginBottom:10 }}>
              {ctx.garment === "Shalwar Kameez" ? "Kameez (Upper)" : "Kurta (Upper)"}
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              {FIELD_SECTIONS[ctx.garment].kameez.map(f => (
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
            <p style={{ fontSize:11, fontWeight:600, color:"#818CF8", textTransform:"uppercase", letterSpacing:.5, marginBottom:10 }}>
              Shalwar (Lower)
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              {FIELD_SECTIONS[ctx.garment].shalwar.map(f => (
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
        <button className="btn-ghost" style={{ width:"100%", marginBottom: showGuide?12:0 }}
          onClick={() => setShowGuide(!showGuide)}>
          📐 {t.howMeasure} {showGuide?"▲":"▼"}
        </button>

        {showGuide && (
          <div className="fade-in measure-guide" style={{ marginBottom:16, direction:"ltr" }}>
            {fields.map(f => (
              <div key={f} className="measure-item">
                <div className="measure-icon" style={{ fontFamily:"'Libre Baskerville',serif", fontSize:11, fontWeight:700, color:"#818CF8" }}>{FIELD_ICONS[f]}</div>
                <div>
                  <div style={{ fontSize:11.5, fontWeight:600, color:"#818CF8", marginBottom:2 }}>{FIELD_LABELS[f]}</div>
                  <div style={{ fontSize:11, color:"#6B7280", lineHeight:1.5 }}>{lang==="ur" ? FIELD_GUIDE_UR[f] : FIELD_GUIDE[f]}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="fade-in" style={{ color:"#F87171", fontSize:13, marginBottom:12 }}>⚠ {error}</p>}

        <button className="btn-primary" style={{ width:"100%" }}
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
        <button className="btn-ghost" style={{ padding:"7px 14px", fontSize:12 }} onClick={() => {setMethod(null);setError("")}}>← {t.back}</button>
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

        <button className="btn-primary" style={{ width:"100%" }}
          disabled={loading} onClick={doHW}>
          {loading ? <span style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}><Spinner/> Working...</span> : t.estimateBtn+" →"}
        </button>
      </div>
    </div>
  );

  return null;
}

// ── SCREEN 3 — Results + Try-On ───────────────────────────────────────────────
function S3_Result({ t, lang, isDark, ctx, measurements, onReset, onBack }) {
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
    const isCombined = ["Shalwar Kameez","Kurta"].includes(ctx.garment);
    const kameezMeasurements = isCombined
      ? Object.fromEntries(Object.entries(measurements).filter(([k])=>k!=="waist"))
      : measurements;
    const shalwarMeasurements = { waist: measurements.waist, length: 0 };

    const mainCall = axios.post(`${API}/api/recommend-size`, {
      product_url:   ctx.url||"",
      brand:         ctx.brand||"",
      garment_type:  isCombined ? "Kameez" : ctx.garment,
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
        combined.shalwar_recommendation = {
          recommended_size: shalwarRes.data.recommended_size,
          confidence:       shalwarRes.data.confidence,
          fitscore:         shalwarRes.data.fitscore,
        };
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
      <button className="btn-primary" onClick={onReset}>Try Again</button>
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
          <p style={{ fontSize:12, color:"#F59E0B", marginTop:10, display:"flex", alignItems:"flex-start", gap:6 }}>
            <span>⚠</span>
            <span>{t.unknown}</span>
          </p>
        )}
      </div>

      {/* Try-On section */}
      <div className="glass" style={{ padding:22, marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: showTryOn?16:0 }}>
          <div>
            <p style={{ fontSize:14, fontWeight:600 }}>👕 {t.tryOnTitle}</p>
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
                <img src={tryOnResult} alt="Try-on result"
                  style={{ maxWidth:"100%", borderRadius:12, border:"1px solid rgba(79,70,229,0.3)" }}/>
              </div>
            ) : (
              <button className="btn-primary" style={{ width:"100%" }}
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
            <button className="btn-primary" onClick={handleSave}
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
                  <p style={{ fontSize:11, color:"#6B7280", marginBottom:3 }}>PakFit Size Card</p>
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
                  ctx.fillText("PakFit Size Card", 38, 40);

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
                  ctx.fillText("Generated by PakFit  •  pakfit.app", 24, 388);
                  ctx.textAlign = "right";
                  ctx.fillText(new Date().toLocaleDateString(), 656, 388);

                  canvas.toBlob(blob => {
                    const url = URL.createObjectURL(blob);
                    const a   = document.createElement("a");
                    a.href = url;
                    a.download = `PakFit-${name}-SizeCard.png`;
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
                  const text = `My PakFit Size Card 👕\n\nName: ${name}\nRecommended size at ${result.brand}: *${result.recommended_size}* (${result.confidence} confidence)\n\nMeasurements:\n${Object.entries(measurements).filter(([k])=>!["method","confidence","note","height_cm","weight_kg"].includes(k)).map(([k,v])=>`${k}: ${v} in`).join("\n")}\n\nFind your size at pakfit.app`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                }}>
                <span style={{ marginRight:6 }}>📱</span> Share on WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>

      <button className="btn-ghost" style={{ width:"100%" }} onClick={onReset}>← {t.tryAnother}</button>
    </div>
  );
}


// ── SELLER WIDGET PAGE ────────────────────────────────────────────────────────
function SellerPage({ t, lang, onBack }) {
  const [copied, setCopied] = useState(false);
  const scriptTag = `<script\n  src="https://YOUR-SPACE.hf.space/widget.js"\n  data-seller="YOUR_SELLER_ID"\n></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    { num:"01", title:"Create a Shopify Partners account", desc:"Go to partners.shopify.com and create a free account. Then create a development store to test the integration.", link:"https://partners.shopify.com", linkText:"Open Shopify Partners →" },
    { num:"02", title:"Open your theme code editor", desc:"In your Shopify admin go to Online Store → Themes → click the three dots next to your active theme → Edit code." },
    { num:"03", title:"Open theme.liquid", desc:"In the left file list find and click Layout → theme.liquid. This is the main template file that wraps every page on your store." },
    { num:"04", title:"Paste the script tag", desc:"Find the closing </body> tag near the bottom of theme.liquid. Paste the PakFit script tag immediately before it.", code:true },
    { num:"05", title:"Save and preview", desc:"Click Save in the top right. Then open any product page on your store — you will see the PakFit button appear below the Add to Cart button." },
    { num:"06", title:"Test the flow", desc:"Click the PakFit button on your product page. The size finder opens in a popup overlay. Test the full flow — URL detection, measurements, and size recommendation." },
  ];

  return (
    <div className="fade-up">
      {/* Hero */}
      <div style={{ textAlign:"center", marginBottom:40 }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:7,
          background:"rgba(79,70,229,0.12)", border:"1px solid rgba(79,70,229,0.25)",
          borderRadius:20, padding:"5px 14px", marginBottom:18,
        }}>
          <span style={{ fontSize:11.5, color:"#818CF8", fontWeight:500 }}>For Shopify Sellers</span>
        </div>
        <h1 style={{
          fontFamily:"'Libre Baskerville',serif",
          fontSize:"clamp(28px,5vw,42px)", fontWeight:700,
          lineHeight:1.15, letterSpacing:"-0.5px", marginBottom:14,
          background:"linear-gradient(135deg,#fff 30%,rgba(255,255,255,0.65) 100%)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        }}>Add PakFit to your Shopify store</h1>
        <p style={{ fontSize:15, color:"#6B7280", maxWidth:440, margin:"0 auto", lineHeight:1.65 }}>
          One script tag. No app store approval. No developer needed.
          Your customers find their perfect size — you sell more, get fewer returns.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:24 }}>
        {[
          ["↓ 40%", "Fewer returns"],
          ["↑ 28%", "Higher conversion"],
          ["< 2 min", "To install"],
        ].map(([num, label]) => (
          <div key={label} className="glass" style={{ padding:"18px 14px", textAlign:"center" }}>
            <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:22, fontWeight:700, color:"#818CF8", marginBottom:4 }}>{num}</div>
            <div style={{ fontSize:11.5, color:"#6B7280" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Script tag */}
      <div className="glass" style={{ padding:22, marginBottom:20 }}>
        <p style={{ fontSize:11, color:"#6B7280", fontWeight:600, textTransform:"uppercase", letterSpacing:.5, marginBottom:12 }}>Your embed code</p>
        <div style={{
          background:"rgba(0,0,0,0.3)", borderRadius:10, padding:16,
          fontFamily:"monospace", fontSize:13, color:"#A5B4FC",
          lineHeight:1.8, marginBottom:12, whiteSpace:"pre",
          border:"1px solid rgba(79,70,229,0.2)",
          overflowX:"auto",
        }}>{scriptTag}</div>
        <button className="btn-primary" onClick={handleCopy} style={{ width:"100%" }}>
          {copied ? "✓ Copied to clipboard" : "Copy script tag"}
        </button>
      </div>

      {/* Installation steps */}
      <div className="glass" style={{ padding:22, marginBottom:20 }}>
        <p style={{ fontSize:11, color:"#6B7280", fontWeight:600, textTransform:"uppercase", letterSpacing:.5, marginBottom:20 }}>
          Step by step installation
        </p>
        {steps.map((s, i) => (
          <div key={i} style={{
            display:"flex", gap:16, marginBottom: i<steps.length-1 ? 20 : 0,
            paddingBottom: i<steps.length-1 ? 20 : 0,
            borderBottom: i<steps.length-1 ? "1px solid rgba(255,255,255,0.05)" : "none",
            animation:`stagger 0.4s ease ${i*0.08}s both`,
          }}>
            <div style={{
              width:32, height:32, borderRadius:8, background:"rgba(79,70,229,0.15)",
              border:"1px solid rgba(79,70,229,0.25)", display:"flex", alignItems:"center",
              justifyContent:"center", fontFamily:"'Libre Baskerville',serif",
              fontSize:13, fontWeight:700, color:"#818CF8", flexShrink:0,
            }}>{s.num}</div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:14, fontWeight:600, color:"#fff", marginBottom:5 }}>{s.title}</p>
              <p style={{ fontSize:13, color:"#6B7280", lineHeight:1.6 }}>{s.desc}</p>
              {s.code && (
                <div style={{
                  background:"rgba(0,0,0,0.3)", borderRadius:8, padding:10, marginTop:8,
                  fontFamily:"monospace", fontSize:12, color:"#A5B4FC",
                  border:"1px solid rgba(79,70,229,0.15)",
                }}>{"<!-- Paste before </body> -->"}<br/>{`<script src="..." data-seller="ID"></script>`}</div>
              )}
              {s.link && (
                <a href={s.link} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize:12, color:"#4F46E5", textDecoration:"none", marginTop:6, display:"inline-block" }}>
                  {s.linkText}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* What sellers get */}
      <div className="glass" style={{ padding:22, marginBottom:20 }}>
        <p style={{ fontSize:11, color:"#6B7280", fontWeight:600, textTransform:"uppercase", letterSpacing:.5, marginBottom:16 }}>
          What your customers see
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[
            ["🔗", "URL auto-detected", "System reads your product URL and finds the size chart automatically"],
            ["📏", "Smart measurement", "Customers upload a photo or enter measurements manually"],
            ["✦", "AI size recommendation", "PakFit Engine recommends the correct size with confidence score"],
            ["👕", "Virtual try-on", "Customers see how the garment looks on them before buying"],
          ].map(([icon, title, desc]) => (
            <div key={title} className="glass-sm" style={{ padding:14 }}>
              <div style={{ fontSize:20, marginBottom:8 }}>{icon}</div>
              <div style={{ fontSize:13, fontWeight:600, color:"#fff", marginBottom:4 }}>{title}</div>
              <div style={{ fontSize:12, color:"#6B7280", lineHeight:1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-ghost" style={{ width:"100%" }} onClick={onBack}>← Back to PakFit</button>
    </div>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [lang,    setLang]    = useState("en");
  const [page,    setPage]    = useState("home");
  const isDark = true;
  const [step,    setStep]    = useState(0);
  const [ctx,     setCtx]     = useState({});
  const [measData,setMeasData]= useState({});
  const t = T[lang];

  // Apply dark/light class to body
  useEffect(() => { document.body.className = "dark"; }, []);

  const go = (n) => { setStep(n); window.scrollTo({ top:0, behavior:"smooth" }); };

  return (
    <div style={{ minHeight:"100vh", direction: lang==="ur"?"rtl":"ltr" }}>
      <AnimatedBg isDark={isDark}/>
      <Header lang={lang} setLang={setLang} t={t} setPage={setPage} page={page}/>

      <main style={{
        position:"relative", zIndex:1,
        maxWidth:540, margin:"0 auto",
        padding:"80px 20px 60px",
      }}>
        {page==="translator" && (
          <SizeTranslator />
        )}
        {page==="seller" && (
          <SellerPage t={t} lang={lang} onBack={() => setPage("home")}/>
        )}
        {page==="home" && step===0 && (
          <S1_URL t={t} lang={lang} isDark={isDark}
            onNext={c => { setCtx(c); go(1); }}/>
        )}
        {page==="home" && step===1 && (
          <S2_Method t={t} lang={lang} isDark={isDark} ctx={ctx}
            onNext={m => { setMeasData(m); go(2); }}
            onBack={() => go(0)}/>
        )}
        {page==="home" && step===2 && (
          <S3_Result t={t} lang={lang} isDark={isDark}
            ctx={{ ...ctx, heightCm: measData.heightCm }}
            measurements={measData.measurements}
            onReset={() => { setCtx({}); setMeasData({}); go(0); }}
            onBack={() => go(1)}/>
        )}
      </main>
    </div>
  );
}

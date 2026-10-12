function Header({ lang, setLang, t, setPage, page, onLogoClick }) {
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
        onClick={() => { if(onLogoClick) onLogoClick(); setPage("home"); }}>
        <div style={{
          width:30, height:30, borderRadius:8, background:"#4F46E5",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"'Libre Baskerville',serif", fontSize:15, fontWeight:700, color:"#fff",
        }}>N</div>
        <span style={{ fontFamily:"'Libre Baskerville',serif", fontSize:17, fontWeight:700, letterSpacing:"-0.3px" }}>
          {t.brand}
        </span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:24 }}>
        <button className={`nav-link ${page==="translator" ? "active-nav" : ""}`}
          onClick={() => setPage("translator")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"inline-block", marginRight:6, verticalAlign:"middle"}}><path d="M17 2.1l4 4-4 4"/><path d="M3 12.6v-2a4 4 0 0 1 4-4h12.4"/><path d="M7 21.9l-4-4 4-4"/><path d="M21 11.4v2a4 4 0 0 1-4 4H4.6"/></svg>Size Translator
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

export default Header;

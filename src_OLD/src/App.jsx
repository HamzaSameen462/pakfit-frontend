import { useState, useEffect } from "react";
import "./styles/globalStyles.js";
import { T } from "./i18n/translations.js";
import AnimatedBg from "./components/AnimatedBg.jsx";
import Header from "./components/Header.jsx";
import SizeTranslator from "./components/SizeTranslator.jsx";
import UrlStep from "./components/screens/UrlStep.jsx";
import MeasureStep from "./components/screens/MeasureStep.jsx";
import ResultStep from "./components/screens/ResultStep.jsx";

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
      <Header lang={lang} setLang={setLang} t={t} setPage={setPage} page={page}
        onLogoClick={() => { setStep(0); setCtx({}); setMeasData({}); }}/>

      <main style={{
        position:"relative", zIndex:1,
        maxWidth:540, margin:"0 auto",
        padding:"80px 20px 60px",
      }}>
        {page==="translator" && (
          <SizeTranslator lang={lang} onHome={() => { setStep(0); setCtx({}); setMeasData({}); setPage("home"); }} />
        )}
        
        {page==="home" && step===0 && (
          <UrlStep t={t} lang={lang} isDark={isDark}
            onNext={c => { setCtx(c); go(1); }}/>
        )}
        {page==="home" && step===1 && (
          <MeasureStep t={t} lang={lang} isDark={isDark} ctx={ctx}
            onNext={m => { setMeasData(m); go(2); }}
            onBack={() => go(0)}/>
        )}
        {page==="home" && step===2 && (
          <ResultStep t={t} lang={lang} isDark={isDark}
            ctx={{ ...ctx, heightCm: measData.heightCm }}
            measurements={measData.measurements}
            onReset={() => { setCtx({}); setMeasData({}); go(0); }}
            onBack={() => go(1)}/>
        )}
      </main>
    </div>
  );
}

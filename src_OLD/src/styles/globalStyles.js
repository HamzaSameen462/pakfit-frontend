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

    .btn-pakfit-primary{background:#4F46E5;color:#fff;border:none;border-radius:12px;padding:13px 24px;font-family:'Poppins',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .25s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 4px 14px rgba(79,70,229,0.3);display:flex;align-items:center;justify-content:center;gap:8px}
    .btn-pakfit-primary:hover:not(:disabled){background:#6366F1;transform:translateY(-2px);box-shadow:0 8px 24px rgba(79,70,229,0.5)}
    .btn-pakfit-primary:active:not(:disabled){transform:translateY(0) scale(0.98)}
    .btn-pakfit-primary:disabled{background:rgba(255,255,255,0.05);color:#4B5563;cursor:not-allowed;box-shadow:none}
    .btn-pakfit-whatsapp{background:#25D366;color:#fff;border:none;border-radius:12px;padding:13px 24px;font-family:'Poppins',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .25s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 4px 14px rgba(37,211,102,0.3);display:flex;align-items:center;justify-content:center;gap:8px}
    .btn-pakfit-whatsapp:hover{background:#1ebe5d;transform:translateY(-2px);box-shadow:0 8px 24px rgba(37,211,102,0.5)}
    .btn-pakfit-whatsapp:active{transform:translateY(0) scale(0.98)}

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
    .measure-guide{display:grid;grid-template-columns:1fr;gap:10px;margin-top:12px}
    .measure-item{padding:14px;border-radius:12px;display:flex;align-items:center;gap:14px}
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

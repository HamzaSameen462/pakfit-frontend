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

export default AnimatedBg;

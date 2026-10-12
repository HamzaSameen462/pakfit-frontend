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

export default StepDots;

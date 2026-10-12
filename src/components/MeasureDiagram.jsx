import guideImg from "../assets/measurement-guide.svg";

// Single unified measurement diagram shown for every garment type.
// Rendered on a white card so the labels stay readable on the dark UI.
function MeasureDiagram() {
  return (
    <div style={{ background:"#FFFFFF", borderRadius:14, padding:12, margin:"0 auto", maxWidth:300 }}>
      <img src={guideImg} alt="How to measure" style={{ width:"100%", display:"block" }} />
    </div>
  );
}

export default MeasureDiagram;

function Spinner({ size=18, color="#fff" }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", border:`2px solid rgba(255,255,255,0.2)`, borderTopColor:color, animation:"spin .7s linear infinite", flexShrink:0 }}/>;
}

export default Spinner;

const cm2in = v => +(v / 2.54).toFixed(1);
const ft2cm = v => +(v * 30.48).toFixed(1);
const in2cm = v => +(v * 2.54).toFixed(1);

function convertHeight(val, unit) {
  if (unit === "cm") return +val;
  if (unit === "in") return in2cm(val);
  if (unit === "ft") return ft2cm(val);
  return +val;
}

export { cm2in, ft2cm, in2cm, convertHeight };

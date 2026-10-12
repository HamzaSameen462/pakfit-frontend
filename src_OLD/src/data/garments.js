const GARMENTS = [
  { value:"Kameez", label:"Kameez / Kurta",           labelUr:"کمیز / کرتہ" },
  { value:"Shalwar Kameez", label:"Shalwar Kameez / Kurta Pajama", labelUr:"شلوار قمیص / کرتہ پاجامہ" },
  { value:"Shalwar", label:"Shalwar",                  labelUr:"شلوار" },
];

const MEASUREMENT_FIELDS = {
  "Kameez":         ["chest","shoulder","sleeve","collar","length"],
  "Shalwar Kameez": ["chest","shoulder","sleeve","collar","length"],
  "Shalwar":        ["length"],
};

// Labels for combined garments
const FIELD_SECTIONS = {
  "Shalwar Kameez": { kameez:["chest","shoulder","sleeve","collar","length"], shalwar:["shalwar_length"] },
};

const FIELD_LABELS = {
  chest:"Chest", shoulder:"Shoulder", sleeve:"Sleeve Length",
  collar:"Collar", length:"Front Length", waist:"Waist", shalwar_length:"Shalwar Length",
};
const FIELD_LABELS_UR = {
  chest:"سینہ", shoulder:"کندھا", sleeve:"آستین",
  collar:"کالر", length:"لمبائی", waist:"کمر", shalwar_length:"شلوار لمبائی",
};

const FIELD_GUIDE = {
  chest:  "Wrap tape around fullest part of chest. Keep snug but not tight.",
  shoulder:"Measure from one shoulder tip to the other across your back.",
  sleeve: "From shoulder tip down to your wrist bone. Arm slightly bent.",
  collar: "Around your neck at the base. Keep one finger gap.",
  length: "From top of shoulder down to where you want the garment to end.",
  waist:  "Around your natural waistline — the narrowest part of your torso.",
  shalwar_length: "Measure from where you tie the naara (waistband) straight down to where you want the shalwar to end.",
};
const FIELD_GUIDE_UR = {
  chest:    "سینے کے چوڑے حصے کے گرد فیتہ لپیٹیں۔ نہ بہت ڈھیلا نہ بہت تنگ۔",
  shoulder: "ایک کندھے کی نوک سے دوسرے تک پیٹھ کے پار ناپیں۔",
  sleeve:   "کندھے کی نوک سے کلائی تک۔ بازو تھوڑا موڑ کر رکھیں۔",
  collar:   "گردن کی بنیاد کے گرد ناپیں۔ ایک انگلی کا فاصلہ رکھیں۔",
  length:   "کندھے کے اوپر سے نیچے تک جہاں کمیز ختم ہو۔",
  waist:    "قدرتی کمر کے گرد — جسم کا سب سے تنگ حصہ۔",
  shalwar_length: "جہاں آپ نارہ (ازار بند) باندھتے ہیں وہاں سے سیدھا نیچے، جہاں آپ شلوار ختم کرنا چاہیں وہاں تک ناپیں۔",
};

// Garment-aware overrides — the standalone Shalwar uses the `length` key but
// must read as a shalwar length, not the Kameez front length.
const FIELD_LABEL_OVERRIDES = {
  "Shalwar": { length: { en:"Shalwar Length", ur:"شلوار لمبائی" } },
};
const FIELD_GUIDE_OVERRIDES = {
  "Shalwar": { length: {
    en:"Measure from where you tie the naara (waistband) straight down to where you want the shalwar to end.",
    ur:"جہاں آپ نارہ (ازار بند) باندھتے ہیں وہاں سے سیدھا نیچے، جہاں آپ شلوار ختم کرنا چاہیں وہاں تک ناپیں۔",
  } },
};

function fieldLabel(f, garment, lang){
  const ov = FIELD_LABEL_OVERRIDES[garment] && FIELD_LABEL_OVERRIDES[garment][f];
  if (ov) return lang==="ur" ? ov.ur : ov.en;
  return lang==="ur" ? FIELD_LABELS_UR[f] : FIELD_LABELS[f];
}
function fieldGuide(f, garment, lang){
  const ov = FIELD_GUIDE_OVERRIDES[garment] && FIELD_GUIDE_OVERRIDES[garment][f];
  if (ov) return lang==="ur" ? ov.ur : ov.en;
  return lang==="ur" ? FIELD_GUIDE_UR[f] : FIELD_GUIDE[f];
}

export {
  GARMENTS, MEASUREMENT_FIELDS, FIELD_SECTIONS,
  FIELD_LABELS, FIELD_LABELS_UR, FIELD_GUIDE, FIELD_GUIDE_UR,
  FIELD_LABEL_OVERRIDES, FIELD_GUIDE_OVERRIDES, fieldLabel, fieldGuide,
};

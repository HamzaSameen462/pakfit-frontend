# Naapify Frontend — Project Structure

The React application is organized by responsibility so each concern lives in
its own module rather than a single file.

```
src/
├── main.jsx                     React entry point
├── App.jsx                      Top-level router and application state
├── config.js                    Backend API base URL
│
├── styles/
│   └── globalStyles.js          Global CSS (fonts, theme, component classes)
│
├── i18n/
│   └── translations.js          English / Urdu interface strings (T)
│
├── data/
│   └── garments.js              Garment definitions, measurement fields,
│                                labels, guide text, and field helpers
│
├── utils/
│   └── units.js                 Unit conversion helpers (cm / in / ft)
│
└── components/
    ├── AnimatedBg.jsx           Animated background
    ├── Spinner.jsx              Loading spinner
    ├── StepDots.jsx             Step progress indicator
    ├── Header.jsx               Top navigation bar
    ├── MeasureDiagram.jsx       Labeled body-measurement diagram
    ├── SizeTranslator.jsx       Cross-brand size translator page
    └── screens/
        ├── UrlStep.jsx          Step 1 — brand, garment, fit preference
        ├── MeasureStep.jsx      Step 2 — body measurement entry
        └── ResultStep.jsx       Step 3 — size result, return risk, try-on
```

## Data flow

`App.jsx` holds the page and step state and passes data down to each screen
through props. Screens call the Flask backend (`config.js` → `API`) for size
recommendation, cross-brand translation, and virtual try-on, and report their
results back up to `App.jsx` via callbacks.

## Conventions

- Interface text is never hard-coded in components; it comes from `i18n/translations.js`.
- Garment-specific data (fields, labels, guidance) lives in `data/garments.js`.
- Each screen is a self-contained component under `components/screens/`.

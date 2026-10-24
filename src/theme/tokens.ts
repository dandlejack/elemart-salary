// Design tokens for code that cannot use CSS variables (chart.js canvas, inline semantic colours).
// Keep in sync with the `--ds-*` variables at the top of src/index.css (source: design/DESIGN.md).
export const tokens = {
    background: '#f6f8fb',
    onBackground: '#172033',
    surface: '#ffffff',
    surfaceSoft: '#eaf2ff',
    outline: '#dbe4f0',
    lineSoft: '#eef2f7',
    textMuted: '#5b6b82',
    primary: '#2563eb',
    primaryStrong: '#1d4ed8',
    primarySoft: '#eaf2ff',
    // Lighter bars for older months so the latest month stands out in charts.
    primaryMuted: '#93b4f5',
    success: '#16a34a',
    successSoft: '#e9f8ef',
    warning: '#c2410c',
    warningSoft: '#fff4e6',
    danger: '#dc2626',
    darkSurface: '#0f172a',
    darkPanel: '#111827',
    darkOnSurface: '#ffffff',
    darkOnSurfaceMuted: '#cbd5e1',
}

// Same stack as `html body` in index.css: Roboto for Latin/digits, Plex Thai for Thai glyphs.
export const fontFamily = "'Roboto', 'IBM Plex Sans Thai', -apple-system, 'Segoe UI', Tahoma, sans-serif"

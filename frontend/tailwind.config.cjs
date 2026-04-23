/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      "colors": {
          "outline-variant": "#4a4457",
          "inverse-surface": "#e1e2e7",
          "error": "#ffb4ab",
          "surface-variant": "#323538",
          "primary": "#d1bcff",
          "background": "#111417",
          "on-secondary-container": "#00566b",
          "on-primary-fixed": "#23005b",
          "on-tertiary-container": "#ffc5d1",
          "primary-fixed": "#e9ddff",
          "surface": "#111417",
          "on-error": "#690005",
          "on-secondary-fixed": "#001f28",
          "on-surface-variant": "#ccc3da",
          "surface-container-low": "#191c1f",
          "surface-container": "#1d2023",
          "on-primary": "#3c0090",
          "error-container": "#93000a",
          "surface-container-lowest": "#0b0e11",
          "primary-fixed-dim": "#d1bcff",
          "outline": "#958da3",
          "tertiary-fixed-dim": "#ffb1c3",
          "on-tertiary": "#66002c",
          "inverse-on-surface": "#2e3134",
          "on-secondary": "#003543",
          "secondary-fixed": "#b7eaff",
          "secondary-container": "#14d1ff",
          "surface-tint": "#d1bcff",
          "secondary": "#a6e6ff",
          "surface-dim": "#111417",
          "tertiary-fixed": "#ffd9e0",
          "tertiary": "#ffb1c3",
          "secondary-fixed-dim": "#4cd6ff",
          "on-tertiary-fixed": "#3f0019",
          "on-primary-container": "#ddcdff",
          "on-secondary-fixed-variant": "#004e60",
          "on-surface": "#e1e2e7",
          "primary-container": "#7000ff",
          "tertiary-container": "#b60055",
          "inverse-primary": "#7212ff",
          "surface-container-high": "#272a2e",
          "on-error-container": "#ffdad6",
          "on-background": "#e1e2e7",
          "surface-bright": "#37393d",
          "on-primary-fixed-variant": "#5700c9",
          "on-tertiary-fixed-variant": "#8f0041",
          "surface-container-highest": "#323538"
      },
      "borderRadius": {
          "DEFAULT": "0.25rem",
          "lg": "0.5rem",
          "xl": "0.75rem",
          "full": "9999px"
      },
      "spacing": {
          "lg": "48px",
          "margin": "32px",
          "base": "8px",
          "xs": "4px",
          "sm": "12px",
          "xl": "80px",
          "md": "24px",
          "gutter": "24px"
      },
      "fontFamily": {
          "h3": ["Inter", "sans-serif"],
          "body-lg": ["Inter", "sans-serif"],
          "body-md": ["Inter", "sans-serif"],
          "h2": ["Inter", "sans-serif"],
          "h1": ["Inter", "sans-serif"],
          "label-caps": ["Space Grotesk", "sans-serif"],
          "data-mono": ["Space Grotesk", "monospace"]
      },
      "fontSize": {
          "h3": ["24px", { "lineHeight": "1.3", "fontWeight": "700" }],
          "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
          "body-md": ["16px", { "lineHeight": "1.5", "fontWeight": "400" }],
          "h2": ["32px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700" }],
          "h1": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.04em", "fontWeight": "800" }],
          "label-caps": ["12px", { "lineHeight": "1.2", "letterSpacing": "0.1em", "fontWeight": "600" }],
          "data-mono": ["14px", { "lineHeight": "1.4", "fontWeight": "500" }]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}

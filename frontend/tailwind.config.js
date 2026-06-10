/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
              "surface-container-highest": "#32343d",
              "on-secondary-fixed": "#0b1c30",
              "background": "#11131b",
              "primary-fixed": "#dbe1ff",
              "primary-fixed-dim": "#b4c5ff",
              "on-error-container": "#ffdad6",
              "surface-variant": "#32343d",
              "inverse-surface": "#e1e2ed",
              "on-secondary-fixed-variant": "#38485d",
              "surface": "#11131b",
              "on-surface-variant": "#c3c6d7",
              "surface-dim": "#11131b",
              "on-primary-fixed-variant": "#003ea8",
              "surface-container-lowest": "#0c0e16",
              "secondary": "#b7c8e1",
              "error": "#ffb4ab",
              "on-error": "#690005",
              "on-tertiary-container": "#ffede6",
              "on-secondary": "#213145",
              "primary": "#b4c5ff",
              "on-surface": "#e1e2ed",
              "surface-bright": "#373942",
              "on-primary-fixed": "#00174b",
              "on-primary-container": "#eeefff",
              "surface-tint": "#b4c5ff",
              "inverse-primary": "#0053db",
              "error-container": "#93000a",
              "on-tertiary-fixed": "#360f00",
              "tertiary-container": "#bc4800",
              "tertiary": "#ffb596",
              "secondary-fixed-dim": "#b7c8e1",
              "outline": "#8d90a0",
              "tertiary-fixed-dim": "#ffb596",
              "on-secondary-container": "#a9bad3",
              "outline-variant": "#434655",
              "tertiary-fixed": "#ffdbcd",
              "surface-container-high": "#282a32",
              "on-tertiary-fixed-variant": "#7d2d00",
              "on-background": "#e1e2ed",
              "on-tertiary": "#581e00",
              "on-primary": "#002a78",
              "secondary-container": "#3a4a5f",
              "surface-container": "#1d1f27",
              "surface-container-low": "#191b23",
              "inverse-on-surface": "#2e3039",
              "secondary-fixed": "#d3e4fe",
              "primary-container": "#2563eb"
      },
      "borderRadius": {
              "DEFAULT": "0.125rem",
              "lg": "0.25rem",
              "xl": "0.5rem",
              "full": "0.75rem"
      },
      "spacing": {
              "xs": "4px",
              "lg": "24px",
              "xl": "32px",
              "gutter": "16px",
              "sm": "8px",
              "base": "4px",
              "md": "16px",
              "margin": "24px"
      },
      "fontFamily": {
              "headline-md": [
                      "Inter"
              ],
              "code-md": [
                      "JetBrains Mono"
              ],
              "body-sm": [
                      "Inter"
              ],
              "display-lg": [
                      "Inter"
              ],
              "body-md": [
                      "Inter"
              ],
              "title-sm": [
                      "Inter"
              ],
              "label-caps": [
                      "Inter"
              ]
      },
      "fontSize": {
              "headline-md": [
                      "24px",
                      {
                              "lineHeight": "32px",
                              "letterSpacing": "-0.01em",
                              "fontWeight": "600"
                      }
              ],
              "code-md": [
                      "13px",
                      {
                              "lineHeight": "20px",
                              "fontWeight": "400"
                      }
              ],
              "body-sm": [
                      "12px",
                      {
                              "lineHeight": "16px",
                              "fontWeight": "400"
                      }
              ],
              "display-lg": [
                      "32px",
                      {
                              "lineHeight": "40px",
                              "letterSpacing": "-0.02em",
                              "fontWeight": "700"
                      }
              ],
              "body-md": [
                      "14px",
                      {
                              "lineHeight": "20px",
                              "fontWeight": "400"
                      }
              ],
              "title-sm": [
                      "18px",
                      {
                              "lineHeight": "24px",
                              "fontWeight": "600"
                      }
              ],
              "label-caps": [
                      "11px",
                      {
                              "lineHeight": "16px",
                              "letterSpacing": "0.05em",
                              "fontWeight": "700"
                      }
              ]
      }
    },
  },
  plugins: [],
}

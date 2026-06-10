---
name: Systematic Observability
colors:
  surface: '#11131b'
  surface-dim: '#11131b'
  surface-bright: '#373942'
  surface-container-lowest: '#0c0e16'
  surface-container-low: '#191b23'
  surface-container: '#1d1f27'
  surface-container-high: '#282a32'
  surface-container-highest: '#32343d'
  on-surface: '#e1e2ed'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#e1e2ed'
  inverse-on-surface: '#2e3039'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#b7c8e1'
  on-secondary: '#213145'
  secondary-container: '#3a4a5f'
  on-secondary-container: '#a9bad3'
  tertiary: '#ffb596'
  on-tertiary: '#581e00'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#11131b'
  on-background: '#e1e2ed'
  surface-variant: '#32343d'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin: 24px
---

## Brand & Style
The design system is engineered for high-stakes enterprise network environments where clarity, speed, and technical precision are paramount. The aesthetic is strictly **Minimalist and Utility-Driven**, prioritizing data density and cognitive ease over decorative elements. 

The visual narrative avoids the "consumer-tech" fluff of gradients and soft shadows, opting instead for a "Command Center" feel. It evokes a sense of absolute control, reliability, and technical sophistication through a structured, low-contrast palette and rigorous geometric alignment. The target audience—network engineers and system administrators—requires a tool that feels like an extension of their terminal: powerful, unobtrusive, and professional.

## Colors
The palette is rooted in deep, cool charcoals to reduce eye strain during long monitoring sessions. 

- **Foundation:** The background uses a deep navy-charcoal (#0f172a) to establish a low-light environment.
- **Layering:** Surfaces and cards use a slightly lighter slate (#1e293b) to provide structural separation without relying on shadows.
- **Accents:** A singular Primary Accent (#2563eb) is used sparingly for primary actions and active states. 
- **Functional Colors:** Success, Warning, and Error states utilize industry-standard semantic colors, calibrated for high legibility against the dark background. 
- **Borders:** Structural integrity is maintained through a muted slate border (#334155), creating a clear "blueprint" feel for the interface layout.

## Typography
The typography system uses a dual-font approach to distinguish between UI navigation and technical data.

- **Primary UI (Inter):** A clean, geometric sans-serif used for all functional labels, headers, and standard body text. It ensures maximum readability at small sizes.
- **Technical Data (JetBrains Mono):** Applied to IP addresses, logs, throughput metrics, and code snippets. The monospaced nature allows for easy vertical scanning of tabular data and numeric values.
- **Scale:** Type sizes are kept relatively small (12px-14px for body) to facilitate high data density, which is critical for network monitoring dashboards.

## Layout & Spacing
This design system utilizes a **Fixed Grid** model for dashboard layouts to ensure consistency in complex data visualizations.

- **Grid:** A 12-column grid is standard for desktop views. Elements should align to an 8px baseline, but the base increment is 4px to allow for the extreme density required by log tables and small-scale status indicators.
- **Density:** Padding within cards and tables should be kept tight (12px or 16px) to maximize the amount of information visible "above the fold."
- **Breakpoints:**
  - **Mobile (<768px):** Single column, 16px side margins.
  - **Tablet (768px - 1280px):** 6-column sub-grid, 24px margins.
  - **Desktop (>1280px):** Full 12-column grid, max-width of 1600px.

## Elevation & Depth
Depth is communicated through **Tonal Layering** and **Low-Contrast Outlines** rather than physical shadows.

- **Surface 0 (Background):** #0f172a. Used for the global application background.
- **Surface 1 (Cards/Containers):** #1e293b. Used for the primary content areas, sidebars, and widgets.
- **Surface 2 (Popovers/Modals):** A slightly lighter tint of the surface color to indicate closer proximity to the user.
- **Borders:** Every container must have a 1px solid border (#334155). This creates a "monolithic" and structured appearance. 
- **Shadows:** Avoid drop shadows for standard UI elements. A very subtle, neutral-dark shadow may be used only for high-priority floating modals to separate them from the grid.

## Shapes
The shape language is strictly **Soft-Sharp**. All primary UI elements (buttons, inputs, cards) use a 4px corner radius. This provides a subtle nod to modern UI trends while maintaining the rigid, professional feel of enterprise hardware.

- **Small elements (Checkboxes):** 2px radius.
- **Standard elements (Buttons, Inputs, Cards):** 4px radius.
- **Large containers (Modals):** 4px radius.
- **Circular elements:** Only used for status indicators (LED style) or user avatars.

## Components
- **Buttons:** Solid #2563eb for primary actions with white text. Ghost buttons use #334155 borders. Interaction states (hover) should simply shift the background color 10% lighter.
- **Inputs:** Terminal-style fields with #0f172a backgrounds, #334155 borders, and Inter text. Active/Focus state is indicated by a 1px solid #2563eb border.
- **Data Tables:** High-density rows (32px-40px height). Zebra-striping is avoided; use 1px horizontal borders (#334155) instead. Headers should use `label-caps` typography.
- **Status Chips:** Small, rectangular badges with 2px radius. Use low-opacity backgrounds of the status color (e.g., 10% Green) with high-contrast text for status labels.
- **Graphs/Charts:** Use thin 1px lines and solid fills. Avoid "smooth" curved lines for network traffic; use stepped or jagged lines to represent raw data accuracy.
- **Navigation:** A vertical sidebar using Surface 1 (#1e293b). Active links are indicated by a 2px vertical "power bar" on the left edge using the Primary Accent color.
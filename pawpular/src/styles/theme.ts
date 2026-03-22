export const theme = {
  colors: {
    background: 'oklch(0.975 0.020 78)',
    backgroundGradient: 'radial-gradient(120% 80% at 50% -10%, oklch(0.97 0.045 70) 0%, oklch(0.975 0.018 78) 55%)',
    surface: 'oklch(0.995 0.008 85)',
    surfaceAlt: 'oklch(0.975 0.018 78)',
    text: 'oklch(0.28 0.030 50)',
    textMuted: 'oklch(0.46 0.028 52)',
    textSubtle: 'oklch(0.64 0.022 58)',
    border: 'oklch(0.90 0.020 72)',
    borderStrong: 'oklch(0.84 0.025 70)',
    primary: 'oklch(0.645 0.155 45)',
    primaryHover: 'oklch(0.585 0.155 44)',
    primarySoft: 'oklch(0.93 0.050 58)',
    accent: 'oklch(0.80 0.135 82)',
    accentSoft: 'oklch(0.93 0.050 58)',
    white: 'oklch(1 0 0)',
    whiteOverlay: 'oklch(1 0 0 / 0.88)',
    whiteOverlayMuted: 'oklch(1 0 0 / 0.14)',
    whiteOverlayHover: 'oklch(1 0 0 / 0.26)',
    darkOverlay: 'oklch(0.14 0.02 50 / 0.5)',
    darkOverlayHover: 'oklch(0.14 0.02 50 / 0.72)',
    selectionOverlay: 'oklch(0.2 0.02 50 / 0.3)',
    scrim: 'oklch(0.16 0.02 50 / 0.7)',
    favorite: 'oklch(0.62 0.21 18)',
    imageBackdrop: '#223039',
    shadow: 'oklch(0.45 0.08 50 / 0.18)',
    shadowStrong: 'oklch(0.45 0.08 50 / 0.32)',
    error: '#dc2626',
    errorBg: '#fef2f2',
    warning: 'oklch(0.50 0.14 55)',
    warningBg: 'oklch(0.95 0.045 75)',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '14px',
    lg: '20px',
    xl: '28px',
    xxl: '48px',
  },

  layout: {
    narrow: '900px',
    content: '1100px',
    wide: '1200px',
    full: '1320px',
  },

  /*
   * Named by role — use these instead of hardcoding px values in components.
   * xs  → tiny chips, badges, very compact elements
   * sm  → standard buttons, inputs, toolbar controls
   * md  → card overlay buttons (checkbox, heart)
   * lg  → card corners
   * xl  → modals, panels, dialogs
   */
  radii: {
    xs: '4px',
    sm: '8px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    pill: '999px',
    circle: '50%',
  },

  borders: {
    default: '1px',
    focus: '2px',
    strong: '2px',
    heavy: '3px',
  },

  /*
   * Control heights — all interactive elements pick from these three.
   * compact  → overlay icon buttons on cards, small utility buttons
   * base     → toolbar inputs/buttons, selection bar actions
   * large    → prominent CTAs (login submit, modal confirm)
   */
  controls: {
    compact: '28px',
    base: '36px',
    large: '44px',
  },

  /*
   * Icon sizes — always pick from here, never hardcode px.
   */
  icons: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '20px',
    xl: '22px',
    hero: '80px',
    burst: '90px',
  },

  shadows: {
    control: '0 2px 8px -3px',
    card: '0 4px 24px -6px oklch(0.45 0.08 50 / 0.13)',
    cardSelected: '0 0 0 3px',
    cardHover: '0 10px 36px -8px oklch(0.45 0.08 50 / 0.22)',
    panel: '0 8px 28px -12px',
    popover: '0 18px 44px -18px',
    modal: '0 24px 64px -16px oklch(0 0 0 / 0.6)',
  },

  focus: {
    width: '2px',
    offset: '2px',
    insetOffset: '-4px',
  },

  /*
   * Font sizes — xs through xl.
   * xs   → labels, species chips, meta text
   * sm   → secondary UI, button text, toolbar
   * md   → default body / card content
   * base → slightly larger body, descriptions
   * lg   → card titles, section labels
   * xl   → modal titles, page sub-headings
   */
  fontSizes: {
    micro: '0.68rem',
    xs: '0.72rem',
    sm: '0.82rem',
    md: '0.875rem',
    base: '1rem',
    lg: '1.1rem',
    xl: '1.35rem',
    title: '1.75rem',
    display: '2rem',
  },
} as const;

export type Theme = typeof theme;

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {
    readonly __themeBrand?: never;
  }
}

---
name: Midnight Tech
colors:
  surface: '#131318'
  surface-dim: '#131318'
  surface-bright: '#39383e'
  surface-container-lowest: '#0e0e13'
  surface-container-low: '#1b1b20'
  surface-container: '#1f1f25'
  surface-container-high: '#2a292f'
  surface-container-highest: '#35343a'
  on-surface: '#e4e1e9'
  on-surface-variant: '#ccc3d8'
  inverse-surface: '#e4e1e9'
  inverse-on-surface: '#303036'
  outline: '#958da1'
  outline-variant: '#4a4455'
  surface-tint: '#d2bbff'
  primary: '#d2bbff'
  on-primary: '#3f008e'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#732ee4'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#ffb784'
  on-tertiary: '#4f2500'
  tertiary-container: '#a15100'
  on-tertiary-container: '#ffe0cd'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb784'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#713700'
  background: '#131318'
  on-background: '#e4e1e9'
  surface-variant: '#35343a'
  surface-card: rgba(255, 255, 255, 0.05)
  surface-border: rgba(255, 255, 255, 0.1)
  text-muted: '#9CA3AF'
  status-success: '#10B981'
  status-error: '#EF4444'
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 80px
    letterSpacing: -0.04em
  display-stat:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  mono-stat:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 2rem
  gutter-bento: 1.25rem
  card-padding: 1.5rem
  stack-gap: 0.75rem
---

## Brand & Style

This design system is engineered for the high-stakes environment of JEE preparation, adopting a "Midnight Tech" aesthetic that prioritizes focus, clarity, and a sense of elite performance. Drawing inspiration from high-end developer tools like Linear and Vercel, the system utilizes a dark-first philosophy to reduce eye strain during long study sessions while maintaining a "command center" atmosphere.

The style is a blend of **Minimalism** and **Glassmorphism**. It relies on deep charcoal surfaces, 1px translucent borders, and subtle backdrop blurs to create a multi-layered interface. The emotional response is one of "calculated confidence"—serious, professional, and technologically advanced. Visual interest is driven not by heavy ornamentation, but by the precision of typography, the vibrancy of functional gradients, and the tactile quality of glass-like surfaces.

## Colors

The palette is anchored by the `neutral` base (#0A0A0F), a near-black that provides infinite depth. Interaction and progress are defined by a high-energy **Electric Violet to Cyan gradient**, used sparingly to highlight the user's journey and primary actions.

- **Primary Actions:** Use the linear gradient from Violet to Cyan.
- **Surfaces:** Utilize `surface-card` (5% white) for containers to create the glass effect against the dark background.
- **Borders:** All interactive containers must use `surface-border` (10% white) for a crisp, structural definition.
- **Feedback:** Use standard Success/Error tokens for data integrity and schedule tracking, but ensure they are vibrant enough to punch through the dark background.

## Typography

Typography is a primary data visualization tool in this design system. We use **Geist** for its technical, geometric precision in headings and stats, and **Inter** for its unparalleled legibility in functional UI labels and body text.

- **Numerals:** Stats and countdowns should use `display-stat` or `display-hero`. These are the "hero" elements of the dashboard.
- **Labels:** Use `label-caps` for section headers and metadata. The increased letter-spacing provides a refined, architectural feel.
- **Contrast:** Maintain high contrast between primary white text and muted grey secondary text to establish a clear information hierarchy.

## Layout & Spacing

The layout follows a **Bento Grid** philosophy, creating a dashboard that feels modular and organized. It is a fluid system that prioritizes functional asymmetry over rigid columns.

- **Grid:** Use a 12-column grid for desktop, but group elements into cards that act as independent containers. Use `gutter-bento` (20px) to separate these modules.
- **Responsive Flow:** On mobile (<768px), the bento grid must collapse into a single-column vertical stack. The sidebar navigation should transition to a sleek bottom-anchored tab bar.
- **Density:** Maintain "generous" internal padding within cards (`card-padding`) to ensure the high density of JEE syllabus data does not feel overwhelming.

## Elevation & Depth

Depth is achieved through **Glassmorphism** rather than traditional shadows. This creates a "heads-up display" (HUD) effect.

- **Stacking:** The base layer is `#0A0A0F`. Above this, cards use `surface-card` with a `backdrop-filter: blur(12px)`.
- **Glow Borders:** Interactive elements feature a 1px border. On hover, this border should transition from `surface-border` to a subtle glow using the primary gradient colors at 50% opacity.
- **Floating Elements:** High-priority widgets (like the Pomodoro timer) should have an additional `box-shadow` of `0 20px 40px rgba(0,0,0,0.4)` to signify their position at the top of the Z-index.

## Shapes

The shape language is modern and approachable yet disciplined. A consistent **20px radius (`rounded-xl`)** is applied to all primary bento cards and large buttons to soften the technical aesthetic. 

Small UI elements like input fields and tags should use a **8px radius (`rounded-md`)** to maintain a sense of precision. Avoid sharp corners entirely to keep the "premium SaaS" look consistent across the platform.

## Components

- **Buttons:** Primary buttons use the `brand-gradient` with white text. Secondary buttons are "ghost" style with a 1px `surface-border` and a subtle white hover state.
- **Progress Rings:** Use the primary gradient for the active stroke. The background stroke should be `surface-border`. Rings should animate on load.
- **Cards:** All cards must feature a `1px` border and `backdrop-filter`. Use a "Bento" layout where cards can span multiple rows or columns to indicate importance.
- **Input Fields:** Deep charcoal backgrounds (#12121A) with `surface-border`. On focus, the border should glow with the cyan primary color.
- **Chips/Badges:** Small, high-contrast labels for "Verified" or "In Progress." Use 1px borders and uppercase `label-caps` typography.
- **Heatmaps:** Use a monochromatic scale of the primary violet color to indicate study intensity (GitHub-style).
- **Micro-interactions:** Implement a 1.02x scale-up on card hover and a subtle "sparkle" or "confetti" effect using the primary colors when a major milestone (like a chapter completion) is reached.
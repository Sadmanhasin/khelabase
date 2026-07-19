---
name: Khelabase Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#3e4a3d'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#6e7b6c'
  outline-variant: '#bdcaba'
  surface-tint: '#006e2d'
  primary: '#006b2c'
  on-primary: '#ffffff'
  primary-container: '#00873a'
  on-primary-container: '#f7fff2'
  inverse-primary: '#62df7d'
  secondary: '#795900'
  on-secondary: '#ffffff'
  secondary-container: '#ffc329'
  on-secondary-container: '#6f5100'
  tertiary: '#0051d5'
  on-tertiary: '#ffffff'
  tertiary-container: '#316bf3'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#7ffc97'
  primary-fixed-dim: '#62df7d'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005320'
  secondary-fixed: '#ffdf9f'
  secondary-fixed-dim: '#f9bd22'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5c4300'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  title-lg:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Manrope
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 12px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style
The design system embodies a premium SaaS aesthetic tailored for a high-performance football ecosystem. It balances the energetic spirit of the sport with the precision of a modern productivity tool. The visual narrative is built on "Athletic Precision"—combining the lush emerald of the pitch with a clean, airy interface inspired by industry-leading platforms like Linear and Stripe.

The design style is **Modern Minimalist** with **Tactile Depth**. It prioritizes high-quality whitespace to reduce cognitive load while navigating complex sports data. Surfaces use subtle elevation and rounded geometry to feel approachable yet sophisticated. The interface should feel "live" and responsive, evoking the premium broadcast quality of FIFA+.

## Colors
The palette is anchored by "Emerald Pitch" (#16A34A), representing growth and the field of play. This primary green is used for key action drivers and brand moments. 

A specialized "Premium Gold" (#FBBF24) is reserved for high-value features, elite memberships, and "Player of the Match" accolades, creating a clear visual distinction between standard and tiered content. The background uses a "Cool Neutral" slate to keep the interface feeling fresh and expansive, while text hierarchy is maintained through deep slates and medium-gray sub-labels.

## Typography
Manrope is the sole typeface for this design system, chosen for its modern, geometric construction and exceptional legibility in data-dense environments. 

Headlines utilize a Bold (700) or ExtraBold (800) weight with slight negative letter-spacing to appear impactful and authoritative, reminiscent of sports journalism. Body text remains clean and spacious. Label styles should be used for metadata, player stats, and category tags, often employing semi-bold weights to ensure hierarchy even at small scales.

## Layout & Spacing
The design system employs a 12-column fluid grid for desktop and a single-column stack for mobile. A strict 4px/8px baseline grid ensures vertical rhythm. 

- **Desktop:** 1280px max-width container with 24px gutters.
- **Tablet:** 8-column grid with 20px margins.
- **Mobile:** Fluid 4-column grid with 16px safe-area margins.

Margins and paddings should favor "room to breathe"—use 24px (lg) for card internals and 48px (2xl) for section separation to maintain the premium SaaS feel.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Ambient Soft Shadows**. 

1.  **Level 0 (Background):** #F8FAFC - The base canvas.
2.  **Level 1 (Cards/Surfaces):** #FFFFFF - Uses a 1px border (#E5E7EB) and a very soft, diffused shadow: `0px 4px 20px rgba(31, 41, 55, 0.05)`.
3.  **Level 2 (Dropdowns/Modals):** #FFFFFF - Uses a more pronounced shadow to indicate focus: `0px 10px 30px rgba(31, 41, 55, 0.1)`.

Avoid heavy black shadows. Instead, use low-opacity Slate (#1F2937) tints to keep shadows looking natural and integrated with the background.

## Shapes
The shape language is defined by generous, friendly curves. The standard radius is **16px (rounded-xl)** for primary cards and large containers. 

Buttons and input fields utilize a **12px (rounded-lg)** radius to create a cohesive but slightly tighter aesthetic for interactive elements. Small tags or chips may use a fully rounded **Pill** shape to differentiate them from functional inputs.

## Components
### Buttons
- **Primary:** Background #16A34A, Text #FFFFFF. High-contrast, 12px radius, medium weight.
- **Premium:** Background #FBBF24, Text #1F2937. Uses a subtle gold-to-amber linear gradient (10%).
- **Secondary:** White background, 1px #E5E7EB border, #1F2937 text.

### Cards
Cards are the primary organizational unit. They feature 16px rounding, a #FFFFFF surface, and a 1px border. For "Featured" or "Premium" cards, use a 2px top-border in #FBBF24.

### Inputs & Selection
- **Fields:** 12px rounding, 1px #E5E7EB border. On focus, the border transitions to #16A34A with a 2px soft glow.
- **Checkboxes:** Rounded (4px) instead of sharp squares, using #16A34A for the active state.

### Lists & Tables
Data rows should have generous vertical padding (16px). Use a subtle #F8FAFC hover state to indicate interactivity. Use skeleton loaders with a pulse effect for data-heavy transitions.

### Premium Indicators
Any element associated with premium features (subscriptions, elite scouts, exclusive content) must utilize the Gold (#FBBF24) color, often accompanied by a "Sparkle" or "Crown" icon in the label-sm style.
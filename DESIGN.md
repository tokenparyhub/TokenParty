---
name: Editorial Intelligence
colors:
  surface: '#fbfaf2'
  surface-dim: '#dbdad3'
  surface-bright: '#fbfaf2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f4ec'
  surface-container: '#efeee6'
  surface-container-high: '#e9e8e1'
  surface-container-highest: '#e3e3db'
  on-surface: '#1b1c17'
  on-surface-variant: '#444748'
  inverse-surface: '#30312c'
  inverse-on-surface: '#f2f1e9'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#99462a'
  on-secondary: '#ffffff'
  secondary-container: '#fe9572'
  on-secondary-container: '#762c12'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1c1b1a'
  on-tertiary-container: '#868382'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#ffb59e'
  on-secondary-fixed: '#390b00'
  on-secondary-fixed-variant: '#7a2f15'
  tertiary-fixed: '#e6e2df'
  tertiary-fixed-dim: '#cac6c4'
  on-tertiary-fixed: '#1c1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#fbfaf2'
  on-background: '#1b1c17'
  surface-variant: '#e3e3db'
  canvas: '#F9F8F0'
  ink: '#191919'
  clay: '#D97757'
  marl: '#E6E1D1'
typography:
  display-lg:
    fontFamily: newsreader
    fontSize: 72px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: newsreader
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: newsreader
    fontSize: 36px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-md:
    fontFamily: newsreader
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
  body-lg:
    fontFamily: inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-mono:
    fontFamily: jetbrainsMono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-caps:
    fontFamily: inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
spacing:
  unit: 8px
  margin-mobile: 24px
  margin-desktop: 64px
  gutter: 32px
  container-max: 1280px
---

## Brand & Style
The brand personality is intellectual, safe, and transparent. It targets a sophisticated audience of researchers, developers, and policy-makers who value clarity over decoration. The UI evokes the feeling of a high-end printed journal or a scholarly archive—grounded and authoritative.

The design style is **Minimalist** with a strong **Editorial** influence. It prioritizes a high ratio of negative space, exceptional typographic hierarchy, and a restrained palette. The interface avoids unnecessary shadows or gradients, relying instead on structural alignment and purposeful color accents to guide the user.

## Colors
The palette is rooted in natural, paper-like tones. The primary "Ink" color provides high-contrast legibility for text, while the "Canvas" background creates a warm, non-stark environment for long-form reading. 

"Clay" is used sparingly for primary actions or to highlight critical data points, ensuring it remains impactful. "Marl" serves as a subtle secondary background for grouping related content or creating structural partitions without the use of harsh lines.

## Typography
This design system uses a tripartite typographic scale to signal different types of information. 

- **Serif (Newsreader):** Used for headlines and storytelling. It introduces a human, literary quality that contrasts with the machine intelligence it describes.
- **Sans (Inter):** Used for the core interface and body text to ensure maximum legibility and a modern, functional feel.
- **Mono (JetBrains Mono):** Used for technical metadata, labels, and code snippets, reinforcing the research-driven and transparent nature of the product.

## Layout & Spacing
The layout follows a **Fixed Grid** model on desktop, centered with generous margins to focus the eye. On mobile, it transitions to a fluid single-column layout.

Spacing is aggressive and rhythmic, using an 8px base unit. Headlines should be followed by significant "white space" to allow concepts to breathe. Sections are separated by large vertical gaps (typically 120px–160px on desktop) to define clear boundaries between distinct research topics or product features.

## Elevation & Depth
Depth is created through **Tonal Layers** rather than shadows. Surfaces remain flat.

The background (Canvas) is the base. High-priority sections or floating panels use the "Marl" color to create a subtle lift. For critical interactive states, thin 1px borders in a slightly darker shade of the background color are preferred over drop shadows. This maintains the "printed" aesthetic and avoids the artificiality of digital depth.

## Shapes
The shape language is **Sharp**. 0px border radii are used across all components, including buttons, input fields, and containers. This reinforces a precise, institutional, and technical aesthetic. In rare cases where a softer touch is needed for user accessibility (like touch targets), a maximum of 2px may be used, though 0px is the preferred standard for this design system.

## Components
- **Buttons:** Primary buttons are solid "Ink" with "Canvas" text. Secondary buttons are outlined with 1px "Ink" borders. High-priority "Clay" buttons are reserved for final conversion points. All buttons use sharp corners and Monospaced labels.
- **Input Fields:** Minimalist design featuring a 1px bottom border only. On focus, the border thickens to 2px. Labels use the `label-caps` style.
- **Chips:** Small, rectangular boxes with "Marl" backgrounds and "Ink" text. No rounded corners. Used for tags or categories.
- **Lists:** Clean, vertically stacked items separated by thin horizontal rules in the "Marl" color. Use Monospaced numerals for ordered lists.
- **Cards:** Cards are defined by background color changes (using "Marl") or simple 1px borders. Avoid any shadows.
- **Data Tables:** High-density, monospaced text. Headers are `label-caps`. Rows are separated by subtle horizontal lines to maintain the archival look.
# Readable – Project Spec
**Author:** JBieberEnthusiast
**Class:** AI Code Quest
**Project:** Readable Explorer – A color readability tool

---

## Overview

A single-page web app called **Readable** that lets users explore the readability of background color, text color, and text size combinations. The page has a sophisticated dark UI with rose/pink accents, and uses shuffling Justin Bieber lyrics as the sample text in the display area.

---

## Tech Stack

- Single HTML file with embedded CSS and JavaScript (no frameworks, no external dependencies except Google Fonts)
- Google Fonts: use a clean, modern font (e.g. **Inter** or **DM Sans**)

---

## Layout

The page is divided into two main zones:

1. **Text Display Area** – a large, prominent box at the top/center of the page showing the sample text rendered with the currently selected background color, text color, and font size
2. **Controls Panel** – below the display area, three control cards arranged in a row:
   - Background Color (left)
   - Text Size (center)
   - Text Color (right)
3. **Stats Row** – below the controls, three stat tiles side by side:
   - Luminosity (Background)
   - Luminosity (Text)
   - Contrast Ratio
4. **WCAG Compliance Indicator** – below the stats row, a card showing pass/fail status
5. **Footer** – simple footer at the bottom

---

## Visual Design

### Color Palette
- Page background: `#0f0f0f` (near black)
- Card/panel background: `#1a1a1a`
- Card border: `#2a2a2a`
- Primary accent: `#e8a0a8` (soft rose/pink)
- Secondary accent: `#c47b85` (muted rose)
- Text on UI: `#e0e0e0`
- Subtext/labels: `#888888`

### Typography
- Google Font: **Inter** (weights 300, 400, 600)
- UI labels: small, uppercase, letter-spaced
- Stat values: large, bold

### Slider Styling
- Custom styled range inputs
- The R slider track has a red tint, G slider has a green tint, B slider has a blue tint
- Thumb is white with a rose glow on focus/hover

### Cards
- Rounded corners (`border-radius: 12px`)
- Subtle `1px` border using card border color
- Slight inner shadow for depth

---

## Text Display Area

- Large box, full-width, minimum height `240px`
- Background color, text color, and font size all controlled by the sliders
- Surrounded by an **animated gradient border** that slowly cycles through rose/pink/purple tones (CSS `@keyframes` animation on a gradient pseudo-element)
- Contains shuffling **Justin Bieber lyrics** (see sample text section below)
- Smooth CSS `transition` on background-color and color changes (`transition: background-color 0.3s ease, color 0.3s ease`)

---

## Sample Text – Justin Bieber Lyrics

Shuffle through the following lyrics on page load (pick one at random each time the page loads). Display the lyric as the main sample text, and show the **song title and album** in small italicized text below it inside the display area.

Use these lyrics (clean versions from popular songs):

1. *"Is it too late now to say sorry? 'Cause I'm missing more than just your body."*
   – **Sorry**, *Purpose* (2015)

2. *"You give me a feeling that I never felt before. And I deserve it, I think I deserve it."*
   – **Deserve You**, *Justice* (2021)

3. *"I'll show you, show you, show you how to feel a real love."*
   – **What Do You Mean?**, *Purpose* (2015)

4. *"Thought I'd end up with you, I was wrong, I was wrong."*
   – **Ghost**, *Justice* (2021)

5. *"You know you love me, I know you care. Just shout whenever, and I'll be there."*
   – **Baby**, *My World 2.0* (2010)

6. *"Stuck in the middle, I was looking for a way out. Thinking 'bout you, no, I can't forget."*
   – **Peaches**, *Justice* (2021)

The lyric text should be italic and centered inside the display area. The song credit should be a smaller, lighter font below it.

---

## Controls

### Background Color Card
- Label: "Background Color"
- Three rows, one for each channel: **R**, **G**, **B**
- Each row contains:
  - A channel label (`R`, `G`, `B`)
  - A range slider (`min=0`, `max=255`, `step=1`)
  - An integer number input (`min=0`, `max=255`)
- Slider and number input are **fully synchronized** – changing one updates the other instantly
- Default starting color: `rgb(30, 30, 30)` (dark)

### Text Color Card
- Same structure as Background Color
- Default starting color: `rgb(232, 160, 168)` (rose accent)

### Text Size Card
- Label: "Text Size"
- One range slider (`min=10`, `max=72`, `step=1`)
- A synchronized number display showing the current value with `px` suffix
- Default: `18px`

---

## Synchronization Behavior

- When a slider moves – its corresponding number input updates immediately
- When a number input changes – its corresponding slider updates immediately
- All color/size changes – reflect instantly in the text display area
- Contrast ratio and luminosity values – recalculate automatically on every change

---

## Stats Row

Three tiles displayed side by side:

### Luminosity (Background)
- Label: "Luminosity (Background)"
- Shows the calculated relative luminance of the background color
- Format: decimal to 3 places (e.g. `0.454`)

### Luminosity (Text)
- Label: "Luminosity (Text)"
- Shows the calculated relative luminance of the text color
- Format: decimal to 3 places (e.g. `0.282`)

### Contrast Ratio
- Label: "Contrast Ratio"
- Shows the WCAG contrast ratio between background and text
- Format: `X.XX:1` (e.g. `4.52:1`)

---

## Contrast Ratio Calculation (WCAG)

1. For each RGB channel value `c` (0–255):
   - Normalize: `sRGB = c / 255`
   - If `sRGB <= 0.04045`: `linear = sRGB / 12.92`
   - Else: `linear = ((sRGB + 0.055) / 1.055) ^ 2.4`
2. Relative luminance: `L = 0.2126 * R_linear + 0.7152 * G_linear + 0.0722 * B_linear`
3. Contrast ratio: `(L_lighter + 0.05) / (L_darker + 0.05)` where L_lighter is the higher luminance value

---

## WCAG Compliance Indicator (Stretch Challenge)

A dedicated card below the stats row with the heading **"WCAG Compliance"**.

Display two indicators side by side:

| Indicator | Threshold | Pass Condition |
|---|---|---|
| Normal Text | 4.5:1 | contrast ratio ≥ 4.5 |
| Large Text | 3:1 | contrast ratio ≥ 3.0 |

Each indicator shows:
- A label ("Normal Text" or "Large Text")
- The threshold value
- A bold pill-shaped badge:
  - **PASS** in green (`#4caf73` background, white text) if threshold is met
  - **FAIL** in red (`#e05a5a` background, white text) if not met
- A short helper note: e.g. *"Normal text requires 4.5:1 for AA compliance"*

The badges update in real-time as colors change.

---

## Footer

Simple centered footer at the bottom of the page:

> *"Inspired by the greatest artist of all time."*

Small, muted text in the subtext color.

---

## Animations & Polish

- Animated gradient border on the text display area
- Smooth `transition: background-color 0.3s ease, color 0.3s ease` on the text display area
- Slider thumb has a soft rose `box-shadow` glow on `:hover` and `:focus`
- WCAG badge color transitions smoothly when toggling between pass/fail

---

## File Structure

```
Readable/
└── index.html
└── spec.md
```

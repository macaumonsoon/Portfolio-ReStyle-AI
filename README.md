# Portfolio ReStyle AI

Portfolio ReStyle AI is a web-based AI design tool that restyles Figma-exported SVG portfolio files. Users upload an SVG, choose style keywords, select one of three built-in palettes, preview the transformed result, and export a Figma-compatible SVG.

## Core Features

- Upload Figma-exported SVG files via drag-and-drop
- Multi-select style keywords (for example: Bold, Minimal, Futuristic, Narrative, Vintage)
- Apply one of three fixed palette series:
  - Red Series: `#FF3B5C`, `#FF8A65`, `#0D0D0D`, `#FFF4E8`
  - Blue Series: `#1E90FF`, `#00CED1`, `#0D0D0D`, `#F8FBFF`
  - Green Series: `#A3C447`, `#C8EE60`, `#0D0D0D`, `#F5FFF0`
- Automatic SVG color replacement:
  - `fill`, `stroke`, and gradient stops
- Automatic layout and grid redesign:
  - Typography hierarchy remap
  - Modular grid and spacing/composition adjustments
- Side-by-side real-time preview:
  - Color-only
  - Layout-only
  - Full transform
- One-click SVG export for Figma re-import

## Tech Stack

- Next.js 14
- React
- Tailwind CSS
- shadcn/ui
- svg.js
- SVGO
- chroma.js
- OpenAI API (keyword-to-style mapping)

## Typography Scale

Line-height target is 120% for all tiers:

- H1: `91/120`
- H2: `69/120`
- H3: `53/120`
- H4: `40/120`
- H5: `31/120`
- H6: `24/120`
- Body: `18/120`
- Body small: `14/120`
- Caption: `11/120`
- Button: `18/120`

## Repository Layout

- `docs/plan.md`: detailed implementation and team stream plan

## Color Palettes (Locked Tokens)

- Red Series (Bold/Passionate)
  - Primary `#FF3B5C`
  - Accent `#FF8A65`
  - Text `#0D0D0D`
  - Background `#FFF4E8`
- Blue Series (Minimal/Futuristic)
  - Primary `#1E90FF`
  - Accent `#00CED1`
  - Text `#0D0D0D`
  - Background `#F8FBFF`
- Green Series (Natural/Narrative)
  - Primary `#A3C447`
  - Accent `#C8EE60`
  - Text `#0D0D0D`
  - Background `#F5FFF0`

## Getting Started

1. Install dependencies:
   - `npm install`
2. Start local development:
   - `npm run dev`
3. Open:
   - `http://localhost:3000`

## Development Status

Project initialization and architecture planning completed. Implementation is split into two independent streams:
- Stream 1: Color Change Module
- Stream 2: Layout and Grid Redesign Module

## Planned API Surface

- `POST /api/transform/color`
- `POST /api/transform/layout`
- `POST /api/transform/full`


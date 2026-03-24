# Portfolio ReStyle AI - Detailed Development Plan

## 1) Product Goal

Build a web-based AI design tool that takes a Figma-exported SVG portfolio deck and generates redesigned variants while preserving original text strings and embedded images.

Outputs per uploaded source:
- `original.svg`
- `color-only.svg`
- `layout-only.svg`
- `full-restyled.svg` (color + layout)
- `transform-manifest.json` (all rules applied, versioning, reproducibility)

Primary UX promise:
- Fast upload
- Clear style controls (keywords + palette)
- Instant before/after preview for color-only, layout-only, and full
- One-click Figma-compatible export

## 2) Tech Stack and Runtime Boundaries

- UI: Next.js 14 App Router, React, Tailwind, shadcn/ui
- SVG engine: `svg.js` for mutation, `svgo` for sanitize/normalize/optimize
- Color engine: `chroma.js` for color distance + clustering + mapping
- AI mapping: OpenAI API (keyword -> style guidance), deterministic fallback map in code
- Contract-first modules: shared TypeScript types + JSON schema for artifacts

Suggested deployment split:
- Client: upload, controls, preview shell
- Server routes: parse/normalize SVG, run transforms, produce export artifacts

## 3) Locked Design Tokens (Non-Negotiable)

### 3.1 Color styles (exact sets)

1) Red Series (Bold/Passionate)
- Primary `#FF3B5C`
- Accent `#FF8A65`
- Text `#0D0D0D`
- Background `#FFF4E8`

2) Blue Series (Minimal/Futuristic)
- Primary `#1E90FF`
- Accent `#00CED1`
- Text `#0D0D0D`
- Background `#F8FBFF`

3) Green Series (Natural/Narrative)
- Primary `#A3C447`
- Accent `#C8EE60`
- Text `#0D0D0D`
- Background `#F5FFF0`

### 3.2 Typography scale (exact, line-height 120%)

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

Interpretation rule:
- The layout engine may remap element role assignment by keyword/style profile.
- Numeric scale values above remain fixed source tokens.

## 4) End-to-End Processing Pipeline

1) Upload and validation
- Accept `.svg` only
- Enforce file size and parse safety limits
- Reject scripts/unsafe foreign content

2) SVG normalization
- Run `svgo` sanitize/cleanup preset
- Preserve IDs and defs needed for gradients/masks
- Keep text nodes and image href references intact

3) Parse to shared model
- Convert DOM into a stable JSON object graph for both modules
- Separate node data into `colorProps` and `layoutProps`

4) Style intent resolution
- Input: keywords selected by user
- OpenAI route suggests style profile (energy, density, contrast, strictness)
- Local deterministic fallback for offline or API failure

5) Parallel transforms
- Stream 1 applies color only
- Stream 2 applies layout/typography/grid only

6) Compose full output
- Merge both transformed specs by node ID with field-level ownership rules
- Rebuild SVG DOM from merged spec

7) Preview and export
- Show side-by-side original vs selected mode
- Export SVGs + manifest for traceability

## 5) Project Structure (Recommended)

- `src/app/page.tsx` - main UI and control panel
- `src/components/upload-dropzone.tsx`
- `src/components/keyword-tag-selector.tsx`
- `src/components/palette-picker.tsx`
- `src/components/preview-panel.tsx`
- `src/components/export-actions.tsx`
- `src/app/api/transform/color/route.ts`
- `src/app/api/transform/layout/route.ts`
- `src/app/api/transform/full/route.ts`
- `src/modules/color/*`
- `src/modules/layout/*`
- `src/shared/spec/*`
- `src/shared/parser/*`
- `src/shared/composer/*`
- `tests/fixtures/*.svg`
- `tests/fixtures/*.json`

## 6) Shared Interface Contract (Critical Integration Point)

Both streams must compile against one shared model and one schema.

```ts
export type PaletteSeries = "red" | "blue" | "green";

export type StyleKeyword =
  | "bold"
  | "minimal"
  | "futuristic"
  | "narrative"
  | "vintage"
  | (string & {});

export type TypographyRole =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "body"
  | "bodySmall"
  | "caption"
  | "button";

export interface PaletteTokens {
  primary: string;
  accent: string;
  text: string;
  background: string;
}

export interface TypographyToken {
  role: TypographyRole;
  fontSize: number;   // px
  lineHeight: number; // px (always fontSize * 1.2 rounded policy documented)
}

export interface ColorProps {
  fill?: string;
  stroke?: string;
  gradientStops?: Array<{
    gradientId: string;
    offset: number; // 0..1
    color: string;
    opacity?: number;
  }>;
  opacity?: number;
}

export interface LayoutProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  fontSize?: number;
  lineHeight?: number;
  letterSpacing?: number;
  textRole?: TypographyRole;
  zIndex?: number;
}

export interface DesignNode {
  id: string;
  type: "text" | "shape" | "image" | "group" | "defs";
  parentId?: string;
  childIds?: string[];
  textContent?: string; // text nodes only; immutable by both streams
  imageHref?: string;   // image nodes only; immutable by both streams
  colorProps: ColorProps;
  layoutProps: LayoutProps;
  meta?: Record<string, unknown>;
}

export interface ParsedSVGDesignSpec {
  specVersion: "1.0.0";
  svgMeta: { width: number; height: number; viewBox?: string };
  keywords: StyleKeyword[];
  selectedPalette: PaletteSeries;
  styleProfile: {
    energy: number;         // 0..1
    density: number;        // 0..1
    contrast: number;       // 0..1
    gridStrictness: number; // 0..1
  };
  globalTokens: {
    palette: PaletteTokens;
    typographyScale: TypographyToken[];
  };
  nodes: DesignNode[];
}
```

### Ownership rules

- Color module can edit only:
  - `globalTokens.palette`
  - `nodes[].colorProps.*`
- Layout module can edit only:
  - `globalTokens.typographyScale`
  - `nodes[].layoutProps.*`
- Neither module can edit:
  - `nodes[].textContent`
  - `nodes[].imageHref`
  - Node hierarchy IDs

### Merge behavior

- `composeFullSpec(colorSpec, layoutSpec)`:
  - join by `node.id`
  - take `colorProps` from color output
  - take `layoutProps` from layout output
  - preserve immutable fields from base spec
- If IDs mismatch or forbidden-field mutation detected, fail build/CI.

## 7) Work Stream 1 - Color Change Module (Person A)

Scope: palette library, color replacement engine, AI palette suggestion, color-only preview/export.

### A.1 Deliverables

- `src/modules/color/palettes.ts` (exact 3 palette sets only)
- `src/modules/color/suggestPaletteFromKeywords.ts`
- `src/modules/color/extractColorUsage.ts`
- `src/modules/color/mapColorsToPalette.ts`
- `src/modules/color/applyColorTransform.ts`
- `src/modules/color/toColorPreviewSvg.ts`
- `src/app/api/transform/color/route.ts`
- `tests/color/*.spec.ts`

### A.2 Functional details

- Parse and replace:
  - `fill`, `stroke`, `stop-color`, and inline style color declarations
  - preserve alpha values and original opacity channels
- Use `chroma.js` distance strategy:
  - classify source colors into background/text/primary/accent candidates
  - map clusters to selected palette tokens
- Keep deterministic mapping for same `(source SVG, selected palette, keywords)`

### A.3 Acceptance criteria

- All visible colors map to the selected palette family intent
- Text and image content unchanged
- No geometry/typography properties changed
- Gradient stops retained and recolored
- Color-only export imports back into Figma without broken defs

## 8) Work Stream 2 - Layout & Grid Redesign Module (Person B)

Scope: keyword analysis, typography role remap, grid generation, repositioning engine, layout-only preview/export.

### B.1 Deliverables

- `src/modules/layout/typographyScale.ts` (exact fixed scale)
- `src/modules/layout/resolveLayoutStyleFromKeywords.ts`
- `src/modules/layout/generateGridSystem.ts`
- `src/modules/layout/assignTextRoles.ts`
- `src/modules/layout/applyLayoutTransform.ts`
- `src/modules/layout/toLayoutPreviewSvg.ts`
- `src/app/api/transform/layout/route.ts`
- `tests/layout/*.spec.ts`

### B.2 Functional details

- Keyword mapping to strategy examples:
  - bold: larger hero zones, stronger contrast spacing, asymmetry
  - minimal: larger whitespace, tighter palette of type roles, stricter grid
  - futuristic: angular composition, high modularity, stronger rhythm
  - narrative: clearer reading flow and section pacing
  - vintage: balanced proportions, softer hierarchy jumps
- Typography:
  - assign each text node to one role from fixed scale
  - recompute `fontSize` and `lineHeight` from role token
- Grid/composition:
  - generate columns, gutters, margins from canvas size + style profile
  - reposition blocks while preserving reading order and grouping

### B.3 Acceptance criteria

- All text nodes receive valid role mapping where applicable
- Layout visibly changes (when possible) without overlap regressions
- No fill/stroke/gradient color mutation
- Text strings and image href remain identical
- Layout-only export imports cleanly into Figma

## 9) Team Connection Points (Exact Handshake)

Connection points between Stream 1 and Stream 2:

1) Shared parser output
- Both streams consume `ParsedSVGDesignSpec` from `src/shared/parser`

2) Independent transform outputs
- Stream 1 returns `ColorTransformResult`
- Stream 2 returns `LayoutTransformResult`

3) Shared composer
- `src/shared/composer/composeFullSpec.ts` combines results by node ID

4) Shared preview and export contract
- All routes return a unified response envelope:

```ts
export interface TransformResponse {
  mode: "color" | "layout" | "full";
  svg: string;
  spec: ParsedSVGDesignSpec;
  warnings: string[];
  manifest: {
    sourceHash: string;
    keywordSet: string[];
    selectedPalette: PaletteSeries;
    timestampIso: string;
    engineVersion: string;
  };
}
```

5) Shared test fixtures
- `tests/fixtures/base/*.svg`
- `tests/fixtures/base/*.json` (parsed spec snapshots)
- Both streams must pass against same fixture set independently

## 10) UI/UX Plan (Next.js + shadcn)

Main screen sections:
- Left panel: upload, keyword tags, palette picker, transform controls
- Center/right: before/after split preview
- Footer actions: `Preview Color`, `Preview Layout`, `Preview Full`, `Export`

Required interactions:
- Drag-and-drop upload with file validation feedback
- Keyword multi-select chips
- Palette swatches showing all three fixed series with hex labels
- Preview toggle:
  - color-only
  - layout-only
  - full
- Export button returns selected output + manifest

## 11) API Design

- `POST /api/transform/color`
  - input: `svg`, `keywords`, `selectedPalette`
  - output: `TransformResponse` mode `color`

- `POST /api/transform/layout`
  - input: `svg`, `keywords`, `selectedPalette`
  - output: `TransformResponse` mode `layout`

- `POST /api/transform/full`
  - internally runs color + layout, then compose
  - output: `TransformResponse` mode `full`

- `POST /api/style-profile`
  - keyword list -> style profile (AI + fallback)

## 12) Parallel Execution Plan and Timeline

Phase 0 (shared, Day 1):
- create shared types, schema, parser, fixture pack
- lock token constants (palette + typography)

Phase 1 (parallel, Day 2-4):
- Person A implements Stream 1 end-to-end with tests
- Person B implements Stream 2 end-to-end with tests

Phase 2 (integration, Day 5-6):
- compose full mode
- wire unified preview panel and exports
- add CI checks for cross-scope mutation

Phase 3 (hardening, Day 7-8):
- real-world SVG QA (including Bold Studio sample)
- Figma round-trip validation
- performance optimization for larger SVGs

## 13) Testing Strategy (Independent First, Then Merge)

Unit tests:
- Color map clustering and token mapping
- Typography role assignment and scale remap
- Grid generation and non-overlap constraints

Contract tests:
- validate `ParsedSVGDesignSpec` with JSON schema
- verify module ownership (color cannot mutate layout fields, and vice versa)

Snapshot tests:
- input SVG -> color-only, layout-only, full SVG snapshots

Property tests:
- text strings unchanged
- image href unchanged
- node ID set unchanged

Integration tests:
- upload -> preview switch -> export
- AI style-profile fallback behavior when API unavailable

## 14) Risks and Mitigations

- Figma SVG variance:
  - mitigate with strict normalize layer + fallback parser branches
- Layout over-transforming content:
  - enforce min padding, no-overlap checks, and safe rollback on conflict
- Keyword ambiguity:
  - deterministic local style map + explicit UI override
- Merge drift between teams:
  - locked interface package + CI schema + fixture-based regression tests
- Performance on large decks:
  - cache parsed spec and only rerun changed transform pipeline segments

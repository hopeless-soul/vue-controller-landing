# Figma-synced landing page rewrite

## Context

The Figma file [Controller Landing (Copy)](https://www.figma.com/design/Im0gZGkh07hnKPnWqcziVu/Controller-Landing--Copy-) (`fileKey: Im0gZGkh07hnKPnWqcziVu`) has been rewritten section-by-section and is now ahead of the Vue implementation. This spec covers resyncing every visible section of `src/App.vue` and its child components to match Figma exactly — copy, spacing, and layout — and building the sections that exist in Figma but not yet in code.

Hidden Figma nodes (`hidden="true"` in metadata: the old `2001:36` Game Targets duplicate, and two decorative rectangles `2001:34`/`105:83`/`2001:35`) are ignored — only visible nodes are implemented.

## Section inventory (Figma page order → Vue component)

| Figma node | Component | Status |
|---|---|---|
| `4:6` Nav | `AppNav.vue` | resync |
| `4:13` Hero Section | `HeroSection.vue` | resync |
| `4:22` Card Section | `SectionHeading.vue` (new, shared) + `FeatureCard.vue` | resync + extract heading |
| `105:81` Invader Section | `InvaderSection.vue` (new) | new |
| `45:27` Preorder Section | `SectionHeading.vue` + `PreorderSection.vue` | resync |
| `57:26` Packaging Preview Section | `SectionHeading.vue` + `PackagingPreviewSection.vue` (new) | new |
| `2029:222` FAQ Section | `FaqSection.vue` + `FaqItem.vue` (new) | new |
| `57:37` Game Targets Section | `GameTargetsSection.vue` (new) | new |
| `22:6` Game Section | `GameSection.vue` (new, interactive) | new |
| Footer container | `AppFooter.vue` | resync |

## Cross-cutting requirement: exact spacing

For every section above, margins, padding, gaps, and widths must match the Figma node's own values (from `get_metadata`/`get_design_context`), not just color/typography/copy. Where Figma uses a fixed pixel width on a `1200px`-wide container (e.g. `693px` packaging image, `1116px` FAQ row), reproduce it directly or via an equivalent responsive Tailwind value that preserves the same proportions — don't approximate with `auto`/default spacing utilities.

## New shared component: `SectionHeading.vue`

Figma repeats a "Section Heading Container" instance (small mono uppercase label like `[ SPEC SHEET ]`, `[ PACKAGING ]`, optionally a large bold heading below it) across Card, Preorder, and Packaging sections. Extract this into one component:

```vue
<SectionHeading label="[ PACKAGING ]" />
<SectionHeading label="[ SPEC SHEET ]" heading="Built different" />
```

`App.vue`'s current inline features-heading markup (lines 29–38) is replaced by this component.

## New section components

- **`InvaderSection.vue`** — single centered `invader_icon` SVG (128×128), decorative, no logic.
- **`PackagingPreviewSection.vue`** — `SectionHeading` + packaging image (693×348) + centered subtle body text, mirroring `PreorderSection`'s layout shape.
- **`FaqSection.vue`** + **`FaqItem.vue`** — accordion. Per Figma, items vary: some have a body (first two), some are header-only with just a chevron (last two) — implement `FaqItem` to accept an optional `body` prop and render only the header + chevron toggle when absent. Chevron rotates 180° on expand via a local `ref` toggle; each item's open state is independent (Figma doesn't specify accordion-exclusivity), so multiple items may be open at once.

## Interactive section: `GameSection.vue` (tank) + `GameTargetsSection.vue` (targets)

- `GameTargetsSection.vue`: 5 static target images (`bokiagep`) laid out per Figma spacing (`gap-[98px]`, `pt-[120px]`), purely decorative, no logic, positioned above the Game Section so they sit in the tank's visual firing line.
- `GameSection.vue`: renders a track (`494px`-wide per Figma, or responsive equivalent) containing the tank sprite (`57×30`).
  - New composable `useTankControls(trackRef, tankWidth)`: tracks pointer/touch x position over the track, clamps tank x to `[0, trackWidth - tankWidth]`, exposes reactive `tankX`.
  - Firing: on `mousedown` (LMB only) or `touchstart`, spawn a projectile at the tank's current x/top; projectile animates upward (CSS transition or `requestAnimationFrame`) and is removed from the render list once it passes the top of the section's bounding box.
  - Firing is gated by section visibility: new composable `useInViewport(sectionRef)` (IntersectionObserver, mirrors the existing `useScrollReveal` pattern) — pointer/click handlers are no-ops when the section isn't intersecting.
  - No hit detection and no scoring — projectiles are purely visual, pass through `GameTargetsSection`'s targets without interaction between the two components.

## Assets

Figma MCP asset URLs (from `get_design_context`) expire after 7 days. During implementation, each new image/SVG (invader icon, packaging image, bokiagep target sprite, tank sprite) must be downloaded into `src/assets/` immediately (via `download_assets` or direct fetch) rather than referenced live, and imported normally in the components.

## Non-goals

- No Vitest tests for any new or resynced component in this pass (existing `App.spec.ts` is left as-is; may need a follow-up update if `App.vue`'s composition changes materially).
- No hit detection, scoring, or win/lose state for the tank game.
- No changes to `StarfieldBackground.vue`, `ProductSpinner.vue`, or the intro timeline/scroll-reveal composables beyond what a new `useInViewport` composable needs (added alongside, not modifying existing ones).

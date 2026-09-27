# Spinner reliability + loading stage — design

Date: 2026-09-27
Branch: `figma-landing-rewrite` (work directly on it)

## Problem

The hero product spinner (`ProductSpinner.vue` + `useSpinner.ts`) behaves correctly on the
first drag or two, then misbehaves. Observed symptoms: **jump on grab** and **lag / blank
frames**.

Root causes found in `src/composables/useSpinner.ts`:

1. **Animations are never cancelled.** `animateFrames()` discards the anime.js handle. Grabbing
   during the flick inertia (≤1.4 s) or the intro spin (2.6 s) leaves the animation writing
   `img.src` every tick while the drag writes it on every pointermove → the first move snaps back
   to the grab frame, then the two fight. This is the jump on grab.
2. **`onUpdate` reads the shared `spinProxy` variable**, not its own proxy, so an old animation
   follows a newer one's value.
3. **Drag teardown is fragile.** No pointer capture, only `pointerup` is handled (no
   `pointercancel` / `lostpointercapture`), any mouse button starts a drag. A missed `pointerup`
   leaks a `pointermove` listener; later drags then run several handlers with different
   `startX`/`startFrame`.
4. **`img.src` swapping gives no paint guarantee.** Preloaded `Image` objects are not retained,
   so decoded bitmaps (800×700 RGBA, ~2.2 MB each) can be evicted and re-decoded on a later swap
   (lag). Frames not yet fully downloaded paint top-down (half-drawn / blank).

Issues 1–3 are state bugs and must be fixed regardless of renderer. Issue 4 is the display
technique itself, so the renderer is replaced too.

## Solution overview

- Load and **decode all 16 frames up front** into `ImageBitmap`s, showing a percentage counter
  while doing so.
- Render with a **`<canvas>` + `drawImage`** from those bitmaps, driven by a single
  `requestAnimationFrame` loop. Only fully decoded bitmaps are ever drawn.
- Rewrite the spinner state so there is exactly one frame value and at most one active
  animation.
- The counter lives inside the existing `[ 360° INSPECT ]` badge, centred on the spinner while
  loading, then slides down to the badge's current position when loading finishes.

## Units

### `src/lib/loadFrames.ts` (new)

```ts
export function loadFrames(
  urls: string[],
  onProgress: (done: number, total: number) => void,
): Promise<ImageBitmap[]>
```

- For each URL, in parallel: `fetch` → `blob()` → `createImageBitmap(blob)`.
- Each frame is retried once on failure; a second failure rejects the whole promise.
- `onProgress(done, total)` fires each time a frame's bitmap is ready (done counts 1..16).
- Returns bitmaps in the same order as `urls`.
- No Vue dependency.

### `src/composables/useSpinner.ts` (rewritten)

```ts
export function useSpinner(
  canvasRef: Ref<HTMLCanvasElement | null>,
  options?: UseSpinnerOptions,
): {
  onPointerDown: (e: PointerEvent) => void
  setBitmaps: (bitmaps: ImageBitmap[]) => void  // enables drawing + dragging
  playIntroSpin: () => void
}
```

- `normalizeFrame`, `frameFromDrag`, `FRAME_COUNT`, `UseSpinnerOptions` are kept unchanged.
- State: one `frame: number`, one `activeAnimation` (anime.js handle) or `null`.
- `stopAnimation()` pauses and clears `activeAnimation`. It is called on pointerdown and at the
  start of every new animation. Each animation's `onUpdate` reads **its own** proxy.
- Drag: ignore `event.button !== 0` and ignore input until bitmaps are set. On pointerdown:
  `stopAnimation()`, `setPointerCapture(pointerId)`, record `startX`/`startFrame = frame`.
  Listeners go on the stage element, not `window`. A single `end()` handler is bound to
  `pointerup`, `pointercancel` and `lostpointercapture`. It removes all listeners, restores the
  cursor, and starts inertia exactly as today (`velocity * 14 * sensitivity`, same duration
  formula, `outQuart`).
- Rendering: input and animations only assign `frame` and call `requestDraw()`. `requestDraw()`
  schedules at most one rAF. The rAF callback draws `bitmaps[normalizeFrame(frame)]` only if
  that index differs from the last drawn index. `clearRect` runs before `drawImage` because the
  frames have alpha.
- `playIntroSpin()` animates `frame` → `frame + FRAME_COUNT`, 2600 ms, `inOutCubic` (same as
  today, but relative to the current frame and cancellable).
- The `preloadFrames` helper is removed.

### `src/components/ProductSpinner.vue` (rewritten)

It owns the loading state, the badge, the canvas, and the reveal handoff.

- State: `'loading' | 'ready' | 'failed'`, a raw `progress` (0–1 from `loadFrames`), and a
  tweened `displayed` value (0–100) used for both the number and the fill.
- On mount it calls `loadFrames(CONTROLLER_FRAMES, …)`. `displayed` is tweened toward
  `progress * 100` with anime.js, so the count rises smoothly even though real progress moves in
  6.25 % steps. Reaching 100 takes at least ~400 ms, so a cached load doesn't flash.
- Exposed API is unchanged: `defineExpose({ playIntroSpin })`. This now means "request the
  intro". The **handoff** runs once both conditions hold, in either order: frames ready (and
  `displayed` has reached 100) **and** the intro has been requested.
- Canvas: `width=800 height=700` (the native frame size), `class="pointer-events-none w-full"`,
  `role="img"`, `aria-label` = the current alt text. It sits inside the existing
  `[data-spin-stage]` square wrapper, which keeps its classes (`opacity-0`, `cursor-grab`,
  `touch-none`, …) and the `@pointerdown` binding.

### Badge / counter (inside `ProductSpinner.vue`)

The `[ 360° INSPECT ]` badge markup moves from `HeroSection.vue` into `ProductSpinner.vue`. It
keeps the same box and look: `#c5c5c5`, `h-[64px] w-[500px] max-w-[90%]`, text `font-mono
text-[15px] leading-7 uppercase tracking-[4px] text-black`, `font-variation-settings: 'BLED' 0,
'SCAN' 0`, and `z-10` so it stays above the canvas.

- **Final position** (after load): exactly as today, i.e. `absolute bottom-0 left-1/2
  -translate-x-1/2 -translate-y-[112px]` relative to the `relative w-full pt-[32px]` wrapper.
  That wrapper moves into `ProductSpinner.vue` together with the badge.
- **Loading position**: centred vertically on the spinner stage, expressed in plain CSS, so a
  resize during loading needs no special handling.
- **Counter**: text is `` `${Math.round(displayed)}%` ``, rendered twice, stacked:
  - base layer: black (current badge text colour);
  - fill layer: `#FFFFFF`, `clip-path: inset(${100 - displayed}% 0 0 0)`, so white fills the
    glyphs bottom → top.
- While loading, the badge has `role="progressbar"`, `aria-valuemin=0`, `aria-valuemax=100`, and
  `aria-valuenow` set to the rounded displayed value.

### Handoff (one anime.js timeline)

1. Hold `100%` for ~250 ms.
2. Slide the badge from the loading position to the final position (FLIP: measure both rects at
   this moment, apply the loading→final delta as `translateY`, animate to 0; ~700 ms,
   `outExpo`).
3. During the slide, crossfade the badge text from `100%` to `[ 360° INSPECT ]`.
4. At the same time, reveal `[data-spin-stage]`: `opacity [0,1]`, `scale [0.9,1]`, 900 ms,
   `outExpo`. These are the values the hero intro timeline uses today.
5. Call the spinner's intro spin.

### `src/composables/useIntroTimeline.ts`

Remove the `[data-spin-stage]` step, which is now owned by the handoff. Keep the
`setTimeout(onSpinIntro, 900)` call; it now only *requests* the intro.

### `src/components/HeroSection.vue`

Remove the badge markup and its `relative w-full pt-[32px]` wrapper. Render
`<ProductSpinner ref="spinner" class="w-full" />` in their place. `defineExpose` is unchanged.

## Failure handling

If `loadFrames` rejects:
- state becomes `'failed'`;
- the badge goes straight to its final position showing `[ 360° INSPECT ]`;
- the stage is revealed with a static `<img :src="CONTROLLER_FRAMES[0]">` in place of the canvas;
- dragging and the intro spin are no-ops.

The page never stays stuck on the loader.

## Console logging

`src/lib/spinnerLog.ts` (new) is a tiny wrapper that prefixes every message with `[spinner]`
and a timestamp in ms since page load (`performance.now()`, rounded). There is no existing
logging or ESLint `no-console` rule to follow. The logs stay on in production builds so issues
can be diagnosed on the deployed site.

- **Stages** use `console.info`:
  - `load:start` (frame count);
  - `load:frame` (index, ms taken, done/total);
  - `load:done` (total ms);
  - `intro:requested`;
  - `handoff:start` / `handoff:done`;
  - `intro-spin:start` / `intro-spin:done`.
- **Issues** use `console.warn`:
  - `load:retry` (index, url, error);
  - `draw:skipped`: frame index requested before its bitmap exists; should never happen;
  - `drag:ignored` (reason: `not-ready`, `non-primary-button`);
  - `animation:interrupted` (which animation, e.g. `inertia` / `intro`, and the frame it was
    stopped at). This is expected on a grab, but it's the old bug's trigger, so it's visible.
- **Failures** use `console.error`:
  - `load:failed` (index, url, error), followed by `fallback:static-image`;
  - `canvas:no-context`: `getContext('2d')` returned null, handled like a load failure.
- **Interaction detail** uses `console.debug`, which is hidden unless DevTools shows "Verbose":
  - `drag:start` (pointerId, startFrame);
  - `drag:end` (end reason `pointerup` / `pointercancel` / `lostpointercapture`, velocity,
    inertia frames);
  - `inertia:start`.
- Nothing is logged per pointermove or per draw, so there's no log spam during a drag.

## Testing (kept minimal)

- Keep the existing `normalizeFrame` / `frameFromDrag` tests unchanged.
- In `useIntroTimeline.spec.ts`, drop the now-unused `[data-spin-stage]` fixture node (the test
  otherwise passes as-is).
- No new unit tests.
- Manual check in Chrome with DevTools on "Fast 3G" and "Disable cache":
  - the counter fills bottom → top in the centred badge;
  - the badge slides down and the text switches to `[ 360° INSPECT ]`;
  - the spinner fades in and does one intro spin;
  - repeated fast flicks, including grabbing mid-inertia and mid-intro, never jump or show
    blank or half-drawn frames;
  - right-click on the stage does not start a drag;
  - a warm-cache reload shows a brief (≥400 ms) count, not a flash;
  - the console shows the stage sequence in order, and `animation:interrupted` appears when
    grabbing mid-spin.
- `npm run type-check`, `npm run lint` and `npx vitest run` pass.

## Out of scope

- Byte-level progress (Content-Length streaming).
- `prefers-reduced-motion` handling.
- Re-exporting frames (WebP, sprite sheet).

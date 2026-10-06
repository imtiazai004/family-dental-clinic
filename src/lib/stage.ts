// Scroll state shared between the DOM and the 3D scenes.
// Plain mutable object on purpose: it changes every frame and must not trigger React renders.

// Page-space pixel positions of a chapter, measured by the DOM (Chapter.tsx).
// start: where its scene is first pinned to the screen. pStart → end: the scroll range that drives progress.
export type ChapterBounds = { start: number; pStart: number; end: number };

export const stage = {
  chapters: {} as Record<string, ChapterBounds>,
  // Part labels live in the DOM (Stage.tsx); each scene moves its own every frame.
  labels: {} as Record<string, (HTMLElement | null)[]>,
  // The still image shown in a scene's place until the scene has drawn (Stage.tsx).
  posters: {} as Record<string, HTMLElement | null>,
  active: true, // the 3D stage is on screen
  dragging: false,
  dragYaw: 0,
};

// Width at which text moves beside the model. Matches Tailwind's `lg` breakpoint.
export const SIDE_BY_SIDE_WIDTH = 1024;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ramp = (a: number, b: number, x: number) => clamp01((x - a) / (b - a));
export const smoothstep = (a: number, b: number, x: number) => {
  const t = ramp(a, b, x);
  return t * t * (3 - 2 * t);
};

const view = { progress: 0, offset: 0, visible: false };

// Where a chapter is right now:
//   progress — 0 → 1 across the chapter
//   offset   — how far (px) its pinned scene is from its resting place: positive while it is
//              still arriving from below, negative once it is leaving upward, 0 while pinned
// Returns a shared object: read it straight away, don't keep it.
export function chapterView(id: string, scrollY: number, viewportHeight: number) {
  const c = stage.chapters[id];
  if (!c) {
    view.progress = 0;
    view.offset = 0;
    view.visible = false;
    return view;
  }
  const top = c.start - scrollY;
  const bottom = c.end - scrollY;
  view.offset = top > 0 ? top : bottom < viewportHeight ? bottom - viewportHeight : 0;
  view.visible = top < viewportHeight && bottom > 0;
  view.progress = clamp01((scrollY - c.pStart) / (c.end - c.pStart - viewportHeight));
  return view;
}

import { useSyncExternalStore } from "react";

// A page's 3D scroll chapters either run ("live") or are shown as still images with all of their text
// laid out ("still"). Still is what the HTML is built as, so it is what a visitor gets with JavaScript
// off, with "reduce motion" turned on, or on a device that cannot draw 3D.
//
// A script in app/layout.tsx runs before the page is first drawn and marks <html data-live>. The
// `live:` and `still:` variants in globals.css style against that mark.

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

let webgl: boolean | undefined;

// That script only checks that the browser knows what WebGL is. Whether it really starts is tested here,
// the first time a page with a 3D chapter asks, so pages without one never pay for the test.
function isLive() {
  const root = document.documentElement;
  if (!("live" in root.dataset)) return false;
  webgl ??= hasWebGL();
  if (!webgl) delete root.dataset.live;
  return webgl;
}

const never = () => () => {};

export const useLive = () => useSyncExternalStore(never, isLive, () => false);

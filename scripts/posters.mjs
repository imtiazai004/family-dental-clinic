// Makes the still images of the 3D chapters, into public/posters/. They stand in for a scene while it
// loads, and wherever 3D does not run. They are photographs of the built site, so the order is:
//
//   npm run build
//   npm run posters            every chapter (or: npm run posters -- crown)
//   npm run build              again, so the new images are in out/
//
// Run it after changing how a scene looks at the points listed below, and commit the images.

import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { open, scrollTo, sleep } from "./browser.mjs";

const POSTERS = resolve("public/posters");

// One line per chapter. `start` is the scene as the chapter opens and `parts` is it with its parts in
// view; `p` is the scroll point (0 → 1). `h` and `w` are those of the camera shot the scene's TRACK
// holds at that point. The image is cut to that shot, which is what lets the page lay the `start`
// image exactly over the live scene.
const CHAPTERS = [
  { id: "dental-implant", start: { p: 0, h: 5.2, w: 2.5 }, parts: { p: 0.32, h: 8.8, w: 2.5 } },
  { id: "crown", start: { p: 0, h: 5.2, w: 2.5 }, parts: { p: 0.3, h: 8.1, w: 2.5 } },
  { id: "root-canal-treatment", start: { p: 0, h: 5.2, w: 2.5 }, parts: { p: 0.28, h: 4.5, w: 2.5 } },
];

const SCREEN = { width: 1440, height: 1200, deviceScaleFactor: 1.5 };
// Where the camera puts a shot on a wide screen, as fractions of it: fitW, fitH, shiftX and shiftY in
// src/components/three/rig.ts. MARGIN is --margin of .poster in src/app/globals.css.
const FIT = { x: 0.7, y: 0.48, w: 0.46, h: 0.78 };
const MARGIN = 1.12;

// Everything but the canvas, and every background, so the model is photographed on nothing.
const ALONE = `
  html, body, .stage-bg { background: transparent !important; }
  header, footer, main > :not(#stage), #stage > :not(.stage-bg), .stage-bg > :not(:has(canvas)) {
    visibility: hidden !important;
  }
`;

mkdirSync(POSTERS, { recursive: true });

const filter = process.argv[2];
const { base, browser, close } = await open();

for (const chapter of CHAPTERS) {
  if (filter && !chapter.id.includes(filter)) continue;

  const page = await browser.newPage();
  await page.setViewport(SCREEN);
  await page.goto(`${base}/services/${chapter.id}/`, { waitUntil: "networkidle0" });
  await page.addStyleTag({ content: ALONE });
  await sleep(2500);

  for (const [view, { p, h, w }] of Object.entries({ start: chapter.start, parts: chapter.parts })) {
    await scrollTo(page, { chapter: chapter.id, p });
    const scale = Math.min((FIT.h * SCREEN.height) / h, (FIT.w * SCREEN.width) / w) * MARGIN;
    const file = join(POSTERS, `${chapter.id}${view === "parts" ? "-parts" : ""}.webp`);
    await page.screenshot({
      path: file,
      type: "webp",
      quality: 82,
      omitBackground: true,
      // Otherwise Chrome resizes the window to the clip while it takes the picture, and the scene,
      // seeing a narrow screen, moves the model to where it sits on a phone.
      captureBeyondViewport: false,
      // Measured from the top of the page, not of the screen.
      clip: {
        x: FIT.x * SCREEN.width - (w * scale) / 2,
        y: FIT.y * SCREEN.height - (h * scale) / 2 + (await page.evaluate(() => window.scrollY)),
        width: w * scale,
        height: h * scale,
      },
    });
    console.log(file);
  }
  await page.close();
}

await close();

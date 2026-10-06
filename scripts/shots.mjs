// Saves screenshots of set points on the built site, at desktop and phone sizes, into shots/.
// It serves out/ itself, so run `npm run build` first.
//
//   npm run shots              every shot
//   npm run shots -- crown     only shots whose name contains "crown"

import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { open, scrollTo, sleep } from "./browser.mjs";

const SHOTS = resolve("shots");

const SIZES = {
  desktop: { width: 1440, height: 900 },
  phone: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};

// A page's `still` opens it the way a visitor without the 3D gets it: "motion" turns on "reduce motion",
// "webgl" makes WebGL fail to start, "nojs" turns JavaScript off.
//
// `chapter` + `p` scrolls to that progress (0 → 1) through a 3D chapter. `to` scrolls an element to the
// top of the screen. `menu` opens the phone menu. `full` captures the whole page instead of one screen.
// `loading` shows the page as it is before the 3D has loaded: the still image in the scene's place.
const PAGES = [
  {
    path: "/",
    shots: [
      { name: "home-hero" },
      { name: "home-loading", loading: true },
      { name: "home-implant-parts", chapter: "dental-implant", p: 0.32 },
      { name: "home-implant-end", chapter: "dental-implant", p: 0.99 },
      { name: "home-crown-parts", chapter: "crown", p: 0.3 },
      { name: "home-crown-cap", chapter: "crown", p: 0.66 },
      { name: "home-rootcanal-inside", chapter: "root-canal-treatment", p: 0.28 },
      { name: "home-rootcanal-file", chapter: "root-canal-treatment", p: 0.5 },
      { name: "home-treatments", to: "#services" },
      { name: "home-footer", to: "#contact" },
      { name: "home-menu", menu: true, only: "phone" },
    ],
  },
  { path: "/", still: "motion", shots: [{ name: "home-still", full: true }] },
  { path: "/services/", shots: [{ name: "treatments", full: true }] },
  {
    path: "/services/dental-implant/",
    shots: [
      { name: "implant-page-top" },
      { name: "implant-page-parts", chapter: "dental-implant", p: 0.32 },
      { name: "implant-page-about", to: "#stage + section" },
    ],
  },
  {
    path: "/services/root-canal-treatment/",
    shots: [{ name: "rootcanal-page-top" }, { name: "rootcanal-page-file", chapter: "root-canal-treatment", p: 0.5 }],
  },
  { path: "/services/crown/", still: "webgl", shots: [{ name: "crown-page-still", full: true }] },
  { path: "/services/root-canal-treatment/", still: "nojs", shots: [{ name: "rootcanal-page-nojs", full: true }] },
  { path: "/services/dental-veneers/", shots: [{ name: "veneers-page", full: true }] },
  { path: "/contact/", shots: [{ name: "contact", full: true }] },
  { path: "/no-such-page/", shots: [{ name: "not-found" }] },
];

// The tallest picture this Chrome draws correctly, in screen pixels. Past it, the top of the page is
// drawn again in place of the rest.
const TALLEST = 7000;

// Saves the whole page: as one picture, or as several numbered ones when it is too tall for one.
async function wholePage(page, name, { width, deviceScaleFactor = 1 }) {
  // Images further down the page wait to be scrolled to, which this never does.
  const height = await page.evaluate(async () => {
    await Promise.all(
      [...document.images].map((img) => {
        img.loading = "eager";
        return img.decode().catch(() => {});
      }),
    );
    return document.documentElement.scrollHeight;
  });
  const pieces = Math.ceil((height * deviceScaleFactor) / TALLEST);
  const each = Math.ceil(height / pieces);
  for (let i = 0; i < pieces; i++) {
    const file = join(SHOTS, `${name}${pieces > 1 ? `-${i + 1}` : ""}.png`);
    const clip = { x: 0, y: i * each, width, height: Math.min(each, height - i * each) };
    await page.screenshot({ path: file, clip });
    console.log(file);
  }
}

mkdirSync(SHOTS, { recursive: true });

const filter = process.argv[2];
const { base, browser, close } = await open();

const problems = [];
for (const [size, viewport] of Object.entries(SIZES)) {
  for (const { path, shots, still } of PAGES) {
    const wanted = shots.filter((s) => (!s.only || s.only === size) && (!filter || s.name.includes(filter)));
    if (!wanted.length) continue;

    const page = await browser.newPage();
    await page.setViewport(viewport);
    if (still === "motion") await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    if (still === "webgl") await page.evaluateOnNewDocument("HTMLCanvasElement.prototype.getContext = () => null");
    if (still === "nojs") await page.setJavaScriptEnabled(false);
    page.on("pageerror", (e) => problems.push(`${size} ${path}: ${e.message}`));
    page.on("console", (m) => {
      // A file that fails to load is reported below, with its address.
      if (m.type() === "error" && !m.text().startsWith("Failed to load resource"))
        problems.push(`${size} ${path}: ${m.text()}`);
    });
    page.on("response", (r) => {
      const expected = r.url() === base + path && path === "/no-such-page/";
      if (r.status() >= 400 && !expected) problems.push(`${size} ${path}: ${r.status()} ${r.url()}`);
    });
    await page.goto(base + path, { waitUntil: "networkidle0" });
    await sleep(2500);
    if (still && (await page.$("canvas"))) problems.push(`${size} ${path}: the 3D started on a page opened as ${still}`);

    for (const shot of wanted) {
      if (shot.menu) await page.click("button[aria-controls=menu]");
      const loading =
        shot.loading && (await page.addStyleTag({ content: "canvas{visibility:hidden}.poster{opacity:1!important}" }));
      await scrollTo(page, shot);
      if (shot.full) await wholePage(page, `${shot.name}-${size}`, viewport);
      else {
        const file = join(SHOTS, `${shot.name}-${size}.png`);
        await page.screenshot({ path: file });
        console.log(file);
      }
      if (loading) await loading.evaluate((style) => style.remove());
    }
    await page.close();
  }
}

await close();

if (problems.length) {
  console.error(`\n${problems.length} problem(s) in the browser console:`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log("\nNo errors in the browser console.");

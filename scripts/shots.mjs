// Saves screenshots of set points on the built site, at desktop and phone sizes, into shots/.
// It serves out/ itself, so run `npm run build` first.
//
//   npm run shots              every shot
//   npm run shots -- crown     only shots whose name contains "crown"
//
// Uses the installed Chrome. Set CHROME_PATH if it is not in the usual place.

import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import puppeteer from "puppeteer-core";

const OUT = resolve("out");
const SHOTS = resolve("shots");
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

const SIZES = {
  desktop: { width: 1440, height: 900 },
  phone: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};

// `chapter` + `p` scrolls to that progress (0 → 1) through a 3D chapter. `to` scrolls an element to the
// top of the screen. `menu` opens the phone menu. `full` captures the whole page instead of one screen.
const PAGES = [
  {
    path: "/",
    shots: [
      { name: "home-hero" },
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
  { path: "/services/dental-veneers/", shots: [{ name: "veneers-page", full: true }] },
  { path: "/contact/", shots: [{ name: "contact", full: true }] },
  { path: "/no-such-page/", shots: [{ name: "not-found" }] },
];

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
};

function serve() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = join(OUT, path);
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    const found = existsSync(file);
    if (!found) file = join(OUT, "404.html");
    res.writeHead(found ? 200 : 404, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  });
  return new Promise((done) => server.listen(0, "127.0.0.1", () => done(server)));
}

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

async function scrollTo(page, shot) {
  await page.evaluate(({ chapter, p, to }) => {
    let y = 0;
    if (chapter) {
      const el = document.getElementById(chapter);
      y = el.getBoundingClientRect().top + window.scrollY + p * (el.offsetHeight - window.innerHeight);
    } else if (to) {
      y = document.querySelector(to).getBoundingClientRect().top + window.scrollY;
    }
    window.scrollTo(0, y);
  }, shot);
  // The scenes ease toward the scroll position; give them time to arrive.
  await sleep(1800);
}

if (!existsSync(join(OUT, "index.html"))) {
  console.error("out/ is missing. Run `npm run build` first.");
  process.exit(1);
}
mkdirSync(SHOTS, { recursive: true });

const filter = process.argv[2];
const server = await serve();
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await puppeteer.launch({
  executablePath: CHROME,
  // Software rendering, so WebGL works without a screen or a graphics card.
  args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--use-angle=swiftshader"],
});

const problems = [];
for (const [size, viewport] of Object.entries(SIZES)) {
  for (const { path, shots } of PAGES) {
    const wanted = shots.filter((s) => (!s.only || s.only === size) && (!filter || s.name.includes(filter)));
    if (!wanted.length) continue;

    const page = await browser.newPage();
    await page.setViewport(viewport);
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

    for (const shot of wanted) {
      if (shot.menu) await page.click("button[aria-controls=menu]");
      await scrollTo(page, shot);
      const file = join(SHOTS, `${shot.name}-${size}.png`);
      await page.screenshot({ path: file, fullPage: !!shot.full });
      console.log(file);
    }
    await page.close();
  }
}

await browser.close();
server.close();

if (problems.length) {
  console.error(`\n${problems.length} problem(s) in the browser console:`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log("\nNo errors in the browser console.");

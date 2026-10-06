// What the screenshot scripts share: a server for the built site and a headless Chrome to open it in.
// Uses the installed Chrome. Set CHROME_PATH if it is not in the usual place.

import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import puppeteer from "puppeteer-core";

const OUT = resolve("out");
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

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

export const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

// Serves out/ and opens a browser. Returns the site's address, the browser and a way to shut both down.
export async function open() {
  if (!existsSync(join(OUT, "index.html"))) {
    console.error("out/ is missing. Run `npm run build` first.");
    process.exit(1);
  }
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = join(OUT, path);
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    const found = existsSync(file);
    if (!found) file = join(OUT, "404.html");
    res.writeHead(found ? 200 : 404, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    // Software rendering, so WebGL works without a screen or a graphics card.
    args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--use-angle=swiftshader"],
  });
  return {
    base: `http://127.0.0.1:${server.address().port}`,
    browser,
    close: async () => {
      await browser.close();
      server.close();
    },
  };
}

// `chapter` + `p` scrolls to that progress (0 → 1) through a 3D chapter. `to` scrolls an element to the
// top of the screen. With neither, it scrolls to the top of the page.
export async function scrollTo(page, { chapter, p, to }) {
  await page.evaluate(
    ({ chapter, p, to }) => {
      let y = 0;
      if (chapter) {
        const el = document.getElementById(chapter);
        y = el.getBoundingClientRect().top + window.scrollY + p * (el.offsetHeight - window.innerHeight);
      } else if (to) {
        y = document.querySelector(to).getBoundingClientRect().top + window.scrollY;
      }
      window.scrollTo(0, y);
    },
    { chapter, p, to },
  );
  // The scenes ease toward the scroll position; give them time to arrive.
  await sleep(1800);
}

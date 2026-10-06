// Runs after `next build`. Works around a Next.js export fault on Windows.
//
// For every page, the export writes small files that let links load the next page without a full
// reload. The browser asks for them by a dotted name, such as
//   /services/crown/__next.services.$d$slug.__PAGE__.txt
// On Windows the export writes them as nested folders instead (__next.services/$d$slug/__PAGE__.txt),
// so every one of those requests gets a 404. This moves them to the name the browser asks for.
// A build made on Linux or macOS has no such folders, and this does nothing.

import { readdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
let moved = 0;

function flatten(dir, prefix, dest) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const name = `${prefix}.${entry.name}`;
    if (entry.isDirectory()) flatten(join(dir, entry.name), name, dest);
    else {
      renameSync(join(dir, entry.name), join(dest, name));
      moved++;
    }
  }
}

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = join(dir, entry.name);
    if (entry.name.startsWith("__next.")) {
      flatten(path, entry.name, dir);
      rmSync(path, { recursive: true });
    } else if (entry.name !== "_next") walk(path);
  }
}

walk(OUT);
if (moved) console.log(`fix-export: renamed ${moved} link-preload file(s) for Windows.`);

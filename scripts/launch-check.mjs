// Lists what the site's own files say is still unfinished, and fails if anything is.
//
//   npm run launch-check
//   npm run build:launch       this check, then the build. Make the copy that goes live with this one.
//
// It only knows what src/content/ records. PLAN.md section 10 has the full list of what the clinic owes.

import { clinic } from "../src/content/clinic.ts";
import { services } from "../src/content/services.ts";

const open = [];

if (!clinic.url) open.push("The site's address is not set: `url` in src/content/clinic.ts.");
if (!clinic.confirmed)
  open.push("The address and phone number are not confirmed: `confirmed` in src/content/clinic.ts.");
if (!clinic.hours.length) open.push("Opening hours are missing: `hours` in src/content/clinic.ts.");

const drafts = services.filter((s) => s.draft).map((s) => s.name);
if (drafts.length)
  open.push(
    `Stand-in text in place of the clinic's own, marked \`draft\` in src/content/services.ts: ${drafts.join(", ")}.`,
  );

if (open.length) {
  console.error(`Not ready to launch. ${open.length} thing(s) left:`);
  for (const line of open) console.error("  - " + line);
  process.exit(1);
}
console.log("Nothing in src/content/ is holding up the launch.");

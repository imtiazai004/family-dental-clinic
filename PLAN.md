# Family Dental Clinic website: plan

Last updated: 2026-10-06

This file is the handover for the next working session. It says what exists, what the finished
site looks like, the order to build it in, and what is still waiting on the clinic.

**Status: the structure in sections 2 to 4 is agreed. Building has not started. Get the owner's
go-ahead before starting section 7.**

## 1. Where things stand

The site is one page so far (`/`). It has:

- A hero with the clinic tagline.
- Three 3D scroll chapters: **Dental Implant**, **Crown**, **Root Canal Treatment**.
- A plain text list of all 10 services, each with a pre-filled WhatsApp link.
- A contact footer.

Nothing is deployed. There is no git repository yet. Nothing has been pushed anywhere.

### What has been checked

- `npx tsc --noEmit` passes (re-run 2026-10-06). `npm run build` passed in an earlier session.
- Screenshots in headless Chrome at 1440×900 and 390×844 for all three chapters and the
  transitions between them. No console errors.

### What has not been checked

- Frame rate on a real phone.
- Dragging the model to turn it (mouse and touch).
- Any browser other than Chrome.

## 2. Decisions already made

- **The 3D scroll style stays exactly as it is.** The owner is happy with it. New pages are
  built in the same style, not a simpler one.
- **The home page keeps three chapters, not ten.** Ten chapters would make the home page about
  50 screens long before a visitor reaches the service list or the contact details. The other
  seven chapters go on their own service pages.
- **Every service gets its own page**, with its 3D chapter at the top. The Implant, Crown and
  Root Canal scenes appear twice: on the home page and on their own page. Same code, no copy.
- **Booking is WhatsApp only.** No backend, no form that sends email, no shop, no blog.
- The structure follows a common clinic-site pattern (home as a hub, one page per service,
  About, Contact). `thedentalclinicbydrsaadia.com` was looked at for structure only. Do not
  copy its text, layout or images.

## 3. Site map

15 pages in total.

| Route | Page | 3D |
|---|---|---|
| `/` | Home | Hero + 3 chapters (as now) |
| `/services` | All 10 treatments as cards | None |
| `/services/dental-implant` | Dental Implant | Built |
| `/services/crown` | Crown | Built |
| `/services/root-canal-treatment` | Root Canal Treatment | Built |
| `/services/dental-veneers` | Dental Veneers | To build |
| `/services/dental-filling` | Dental Filling | To build |
| `/services/dental-bleaching` | Dental Bleaching | To build |
| `/services/braces` | Braces | To build |
| `/services/complete-denture` | Complete Denture | To build |
| `/services/removable-partial-denture` | Removable Partial Denture | To build |
| `/services/tooth-extraction` | Tooth Extraction | To build |
| `/about` | Doctor and clinic | None |
| `/contact` | Address, map, hours, WhatsApp | None |
| 404 | Not found | None |

Slugs come from `src/content/services.ts`. Do not invent new ones.

## 4. What goes on each page

### Home (`/`)

1. Hero with the implant model (as now).
2. Three chapters: Implant, Crown, Root Canal (as now). Each chapter's last step gains a second
   link to that service's page, next to the WhatsApp button.
3. Treatments: the 10 cards (as now), but each card links to its service page. The WhatsApp
   link stays on the card as a second action.
4. Doctor and clinic introduction, short, with a link to `/about`. *Needs clinic content.*
5. Reviews. *Needs verified reviews.*
6. Opening hours and a map link. *Needs clinic content.*
7. Questions and answers. *Needs answers approved by the dentist.*
8. Contact footer (as now), on every page.

Sections 4 to 7 are only shown once their content exists. Do not ship placeholder text, made-up
reviews or stock photos.

### Service page (`/services/<slug>`)

One template for all ten:

1. The service's 3D scroll chapter, pinned from the top of the page, in the same style as the
   home chapters. Until a service's chapter is built, the page opens with a plain dark header
   (name and one line) so the page can go live before its scene does.
2. The catalogue description from `services.ts`.
3. Questions and answers for that service. *Needs answers approved by the dentist.*
4. Links to the other treatments.
5. WhatsApp button with the service name pre-filled.

### Services list (`/services`)

The same 10 cards as the home page, with a short heading. Exists so service pages have a parent
and the header has one "Treatments" link.

### About (`/about`)

Doctor's name, qualifications and photo; clinic photos; a short introduction. *All of it needs
clinic content.* Build the page only when that content arrives.

### Contact (`/contact`)

Address, phone, WhatsApp button, call button, opening hours, a Google Maps directions link.
Optional: a short form (name, treatment, preferred day) that opens WhatsApp with the message
filled in. It sends nothing to a server.

### Header and footer (every page)

- Header links: Treatments (`/services`), About, Contact, plus the WhatsApp button. This
  replaces the per-chapter anchor links, which only work on the home page.
- A menu for phones. Today the links are hidden below 768px and nothing replaces them.

## 5. How to run it

```
npm run dev      # dev server (port 3000, or 3001 if 3000 is taken)
npm run build    # static export into out/
npm run preview  # serve out/
```

Stack: Next.js 16 (static export), React 19, three.js, React Three Fiber, drei, GSAP
ScrollTrigger, Lenis, Tailwind 4.

This Next.js version differs from older ones. Read the relevant guide in
`node_modules/next/dist/docs/` before adding routes, metadata or a sitemap.

## 6. How a chapter is built

Every service chapter has the same four pieces. To add one, copy the Crown chapter.

| Piece | File | What it holds |
|---|---|---|
| Text | `src/content/chapters.ts` | Steps (eyebrow, title, body, `until`), part labels, WhatsApp button |
| Shapes | `src/components/three/parts/*.ts` | Geometry, built in code |
| Scene | `src/components/three/scenes/*Scene.tsx` | Camera track, animation, label anchors |
| Registration | `SCENES` in `src/components/three/Experience.tsx` | Links the chapter id to its scene |

Rules that are easy to break:

- The chapter `id` must be the same in `chapters.ts` and in `SCENES`.
- Each step's `until` value must line up with the scene's camera `TRACK`. Change them together.
- The `labels` array in `chapters.ts` must be in the same order as the scene's `anchors`.
- Labels only show on screens 1024px and wider. Phones get the text panel only.
- No model files are downloaded. All shapes come from `geometry.ts` helpers (`revolve`,
  `surface`, `flat`, `tissue`). Keep it that way unless a shape cannot be built in code.

Shared helpers worth knowing:

- `rig.ts` → `useChapter()` runs scroll progress, the camera and the labels for a scene.
- `parts/tooth.ts` → a two-rooted molar (`buildTooth`), its cut-open view
  (`buildToothSection`), and gum and bone (`buildSocket`). Most remaining chapters reuse these.
- `materials.tsx` → shared looks for porcelain, titanium, root, gum and bone.

Service descriptions in `src/content/services.ts` are the clinic's own WhatsApp catalogue text.
Do not add clinical claims that are not in the catalogue or confirmed by the clinic.

### Changes needed so chapters work on more than one page

- `Stage.tsx` and `Experience.tsx` always mount every chapter. Both need to take a list of
  chapter ids, so the home page asks for three and a service page asks for one. The scene code
  must load only for the chapters a page uses.
- The hero is written inside `Stage.tsx`. Move it out so a service page can use the stage
  without the home hero.
- Chapter ids (`implant`, `root-canal`) do not match service slugs (`dental-implant`,
  `root-canal-treatment`). Make the chapter id the service slug, so a page can find its chapter.
- On a service page the chapter is the first thing on the page, so it uses `pinFromTop`.

## 7. Build order

Each step ends with `npx tsc --noEmit`, `npm run build` and screenshots at 1440×900 and 390×844.

**Step 1: safety net**

- `git init` and a first commit of what exists.
- Recreate the screenshot script (section 12) as `scripts/shots.mjs` and commit it.

**Step 2: structure (no new 3D)**

- The stage changes in section 6.
- `/services`, the ten `/services/<slug>` pages (three with their chapter, seven with the plain
  header), `/contact`, and a styled 404.
- New header with a phone menu. Home cards and chapter endings link to service pages.

**Step 3: make the 3D safe for every visitor**

- A still image shown while the 3D code loads (it is about 1 MB before compression), so the
  hero is never an empty gradient.
- No WebGL: show the still image and normal-height text sections instead of long empty scrolls.
- "Reduce motion" turned on: same treatment. Today only smooth scrolling is turned off.
- Screen readers can read every step of a chapter, not only the one on screen. Add a skip link
  and visible keyboard focus.
- Fix the defects in section 9.

**Step 4: search and sharing**

- A title and description for every page, a share image, a sitemap and `robots.txt`.
- Complete the clinic details that search engines read in `layout.tsx` (site address, hours,
  map location), once confirmed.
- A build check that fails while any service is still marked `draft: true`. Today the two
  stand-in descriptions are published like the rest.

**Step 5: the seven remaining 3D chapters**

One at a time, each on its own service page, in the order in section 8.

**Step 6: clinic content**

Home sections 4 to 7 and the About page, as the content in section 10 arrives. This step can
happen at any point after step 2.

**Step 7: launch**

- Test on real mid-range Android phones, and in Safari and Firefox.
- Choose hosting, connect the domain, add analytics.
- Every "confirm with the clinic" item in section 10 is closed.

## 8. Remaining 3D chapters (7)

Suggested order, easiest reuse first. Each idea is a starting storyboard, not a fixed design.

1. **Dental Veneers**: a thin shell lifts off the front face of a tooth, then returns.
   Needs a front (single-rooted) tooth shape, which Bleaching and Braces can reuse.
2. **Dental Filling**: cut-open molar with a cavity; filling material goes in layer by layer.
   Reuses `buildToothSection`. Catalogue text is incomplete (see section 10).
3. **Dental Bleaching**: no exploded view. A row of front teeth goes from a darker shade to a
   lighter one as the visitor scrolls. Catalogue text is incomplete (see section 10).
4. **Braces**: brackets and wire come away from a row of teeth, then the teeth straighten.
5. **Complete Denture**: the pink base and the set of teeth separate, then rejoin.
6. **Removable Partial Denture**: metal frame, clasps and teeth separate, then rejoin.
7. **Tooth Extraction**: the tooth lifts gently out of its socket. Keep it calm: no forceps,
   no blood, no decayed-looking tooth.

## 9. Known defects in what is built

- **Crown**: a small rounded lump is still visible between the two roots.
- **Root Canal**: a faint dotted line shows where the roots join the tooth on the cut face.
- **Phone layout**: in the Crown "Porcelain, metal, or both" step, the tooth sits behind the
  text. It is readable, but not clean.
- **Tooth shape** is stylised. If the clinic wants a more lifelike tooth, a licensed 3D model
  will be needed in place of the code-built one.

## 10. Waiting on the clinic

Ask for all of this now. The site cannot launch without the first group, whatever state the
code is in.

Needed to launch:

- **Phone number and address**: taken from an earlier planning PDF, not confirmed. Both live
  in `src/content/clinic.ts`.
- **Opening hours** and the clinic's **Google Maps link**.
- **Logo** (the header is text only for now).
- **Bleaching and Filling**: full catalogue text. The screenshots cut it off, so
  `services.ts` holds short stand-in lines marked `draft: true`.
- **Domain name** the site will live on.

Needed for specific pages or sections:

- **About page**: doctor's name, qualifications and photo; photos of the clinic.
- **Reviews**: an earlier plan quoted a 5.0 rating from 93 reviews. Not verified; do not
  publish it until checked.
- **Questions and answers**: the questions patients ask most, with the dentist's answers.

Needs a dentist to read:

- **Crown type**: the chapter shows porcelain over a gold-coloured metal layer. Confirm the
  clinic offers this, or say which type to show instead.
- **Wording written for the site, not from the catalogue**: the part descriptions in the
  Implant chapter, "The tooth is shaped so the crown can sit over it like a cap", and the
  pulp explanation in the Root Canal chapter.

Still open:

- **Look**: plum, taken from the clinic's own colours. An earlier plan suggested black and
  gold. Not yet confirmed either way.
- **Language**: English only so far. Ask whether an Urdu version is wanted.

## 11. Source material

Catalogue screenshots and the earlier plan PDF are in
`C:\Users\Imtiaz\Downloads\Family dental clicn` (the folder name is spelled that way).
The screenshots are the trusted source for service text. The PDF's clinical claims are not.

## 12. Checking work visually

Earlier sessions checked each chapter by driving the installed Chrome with `puppeteer-core`
(headless, with `--enable-unsafe-swiftshader --ignore-gpu-blocklist --use-angle=swiftshader`),
scrolling to set points in a chapter and saving a screenshot at desktop and phone sizes.
That script lived in a temporary folder and is gone. Step 1 recreates it inside the project.

# Family Dental Clinic website: plan

Last updated: 2026-10-06

This file is the handover for the next working session. It says what exists, what the finished
site looks like, the order to build it in, and what is still waiting on the clinic.

**Status: steps 1 to 3 of section 7 are done. The owner has given the go-ahead for step 4.**

## 1. Where things stand

The site has 13 pages:

- **Home** (`/`): hero, three 3D scroll chapters (**Dental Implant**, **Crown**, **Root Canal
  Treatment**), the ten treatment cards, contact footer.
- **Treatments** (`/services`): the ten cards.
- **Ten service pages** (`/services/<slug>`). Implant, Crown and Root Canal open with their 3D
  chapter. The other seven open with a plain dark header until their chapter is built.
- **Contact** (`/contact`): address, phone, WhatsApp, a directions link.
- A styled **404** page.

Every page has the new header (Treatments, Contact, WhatsApp, and a menu on phones) and the
footer. `/about` is not built; it waits for clinic content.

A 3D chapter now has two forms (section 6, "Live and still"). Where the 3D can run, it is the
scroll chapter as before, with a still image of the model in its place until the 3D has loaded.
Where it cannot run (no WebGL, "reduce motion" turned on, or JavaScript off), the page shows a
still image of the model beside all of the chapter's steps, at normal height.

There is a local git repository. Nothing is deployed and nothing has been pushed anywhere.
Steps 1 and 2 are on `main`. Step 3 is on the branch `step-3-safe-3d`, not yet merged.

### What has been checked

All on 2026-10-06, after step 3:

- `npx tsc --noEmit` and `npm run build` pass.
- `npm run shots`: screenshots in headless Chrome at 1440×900 and 390×844, covering the home
  chapters, two service pages with a chapter, one without, Treatments, Contact, 404 and the
  phone menu. No console errors and no failed requests.
- The same run opens the home page with "reduce motion" on, the Crown page with WebGL made to
  fail, and the Root Canal page with JavaScript off. All three show the still layout, and none
  of them starts the 3D.
- The still image shown while the 3D loads lines up with the live model, compared by eye
  (`home-loading` against `home-hero`, both sizes).
- Keyboard, in headless Chrome on the home page: Tab shows "Skip to content" first, Enter on
  it moves focus to the page content, every focused link shows the ring, and tabbing to the
  buttons in a chapter's last step scrolls the page to that step.
- The three defects fixed in this step, in close-up screenshots.

Checked after step 2 and not repeated: clicking through the header links, cards and phone menu,
and moving between pages without a full reload.

### What has not been checked

- Frame rate on a real phone.
- Dragging the model to turn it (mouse and touch).
- Any browser other than Chrome.
- The header and menu on a real phone.
- A real screen reader. The steps are no longer hidden from one, but none has been run.
- The still layout on a real device with "reduce motion" on, or one without WebGL.
- How long the still image stays up on a slow connection.

### Things added in step 3 that the owner did not see in advance

- **The still layout** is a new design: the model's picture with every step listed beside it
  (below it on a phone). Visitors with "reduce motion" on now get this in place of the scroll
  animation, on every device.
- **"Skip to content"** link, which shows only when a keyboard user presses Tab.
- **Focus ring**: a plum and cream outline around whichever link or button the keyboard is on.
- **The tooth has a new shape below the gum** in the Crown and Root Canal scenes. The two roots
  now part from one round neck, in place of a trunk that split. This is what removed the lump.
- **On phones, the band behind a chapter's text is darker**, so the model no longer shows
  through the words.
- Step titles in a chapter are now headings, so a screen reader can list them. They look the
  same.

### Things added in step 2 that the owner did not see in advance

- The last card in the treatments grid: "Not sure which treatment you need? Tell us what is
  troubling you and we will guide you." This wording is new, not from the catalogue. It fills
  the gap that ten cards leave in a three-column grid.
- The "Get directions" link on the contact page opens a Google Maps search for the address in
  `clinic.ts`. It is only as right as that address, which is still unconfirmed.
- Page addresses end in a slash (`/services/crown/`), set by `trailingSlash` in
  `next.config.ts`, so the site works on any static host.

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
npm run build    # static export into out/, then scripts/fix-export.mjs
npm run preview  # serve out/
npm run shots    # screenshots of out/ into shots/ (see section 12)
npm run posters  # still images of the 3D chapters into public/posters/ (see section 6)
```

`scripts/fix-export.mjs` works around a Next.js fault that only shows when building on Windows:
the small files that let links load the next page without a full reload are written under the
wrong names, and every one of them returns a 404. The script renames them. On Linux or macOS it
does nothing. Do not remove it from the build while builds are made on this machine.

Stack: Next.js 16 (static export), React 19, three.js, React Three Fiber, drei, GSAP
ScrollTrigger, Lenis, Tailwind 4.

This Next.js version differs from older ones. Read the relevant guide in
`node_modules/next/dist/docs/` before adding routes, metadata or a sitemap.

## 6. How a chapter is built

Every service chapter has the same five pieces. To add one, copy the Crown chapter.

| Piece | File | What it holds |
|---|---|---|
| Text | `src/content/chapters.ts` | Steps (eyebrow, title, body, `until`), part labels, WhatsApp button, length in `screens` |
| Shapes | `src/components/three/parts/*.ts` | Geometry, built in code |
| Scene | `src/components/three/scenes/*Scene.tsx` | Camera track, animation, label anchors |
| Registration | `SCENES` in `src/components/three/Experience.tsx` | Links the chapter id to its scene |
| Still images | `CHAPTERS` in `scripts/posters.mjs` | The two scroll points to photograph |

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
- For a cut-open view, split the shape with `halve()` in `geometry.ts` and give the half behind
  the cut `SUNK` from `materials.tsx` (`TissueMeshes` takes `sunk`). Without it, specks of the
  surfaces behind show through the flat cut face. That was the Root Canal dotted line.

Service descriptions in `src/content/services.ts` are the clinic's own WhatsApp catalogue text.
Do not add clinical claims that are not in the catalogue or confirmed by the clinic.

### How a chapter gets onto a page

- **A chapter's id is its service's slug.** A service page shows a 3D chapter when
  `chapters.ts` has a chapter with that slug, and the plain header when it does not. So adding
  a chapter to `chapters.ts` and `SCENES` is all it takes to put it on its service page.
- `<Stage ids={[...]}>` puts chapters on a page. The home page passes `homeChapterIds` (in
  `chapters.ts`) and the hero as its child. A service page passes its own slug and
  `standalone`, which makes the chapter's first step the page's main heading under the service
  name, and drops the "More about this treatment" link.
- Each scene in `SCENES` is loaded on demand, so a page only downloads the scenes it shows.
- `Shell.tsx` wraps every page: smooth scrolling, skip link, header, footer. `PageHeader.tsx`
  is the dark opening for pages with no chapter.

### Live and still

A chapter is **live** (the 3D scroll) or **still** (a picture and all the steps).

- The HTML is built as still. A one-line script in `app/layout.tsx` runs before the page is
  drawn and marks `<html data-live>` when the browser has WebGL and "reduce motion" is off.
  `useLive()` in `src/lib/live.ts` then tests that WebGL really starts, and removes the mark if
  it does not.
- Style the two forms with the `live:` and `still:` Tailwind variants (defined in
  `globals.css`). `Chapter.tsx` and `Stage.tsx` are where they are used.
- In still form nothing 3D is downloaded, and no step is hidden.

### Still images

Each chapter has two, in `public/posters/` (committed): `<id>.webp`, the scene as the chapter
opens, and `<id>-parts.webp`, the scene with its parts in view. The first covers the wait while
the 3D loads. The second is the picture in the still layout.

They are photographs of the built site, so the order is:

```
npm run build
npm run posters            # every chapter (or: npm run posters -- crown)
npm run build              # again, so the new images are in out/
```

- Run it again after changing how a scene looks at either of its two points.
- For a new chapter, add a line to `CHAPTERS` in `scripts/posters.mjs`: the two scroll points,
  with the `h` and `w` of the camera shot the scene's `TRACK` holds at each.
- The loading image is laid exactly over the live model. That depends on three sets of numbers
  agreeing: where the camera puts a shot (`fitW`, `fitH`, `shiftX`, `shiftY` in `rig.ts`), the
  `.poster` box in `globals.css`, and `FIT` and `MARGIN` in `scripts/posters.mjs`. Change one
  and the others must follow. `npm run shots -- loading` shows whether they still agree:
  compare `home-loading` with `home-hero`.

## 7. Build order

Each step ends with `npx tsc --noEmit`, `npm run build` and `npm run shots`.

**Step 1: safety net** (done)

- `git init` and a first commit of what existed.
- The screenshot script, `scripts/shots.mjs`.

**Step 2: structure, no new 3D** (done)

- Chapters can be put on any page (section 6).
- `/services`, the ten `/services/<slug>` pages (three with their chapter, seven with the plain
  header), `/contact`, and a styled 404.
- New header with a phone menu. Home cards and chapter endings link to service pages.
- Not done: the optional WhatsApp form on the contact page.

**Step 3: make the 3D safe for every visitor** (done)

- A still image is shown while the 3D code loads, so the hero is never an empty gradient.
- No WebGL, "reduce motion" on, or JavaScript off: a still image and normal-height text
  sections instead of long empty scrolls.
- Screen readers can read every step of a chapter. A skip link and a visible keyboard focus
  ring were added.
- The three defects then listed in section 9 were fixed: the lump between the Crown's roots,
  the dotted line on the Root Canal cut face, and the tooth behind the text on phones.

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

- **Tooth shape** is stylised. If the clinic wants a more lifelike tooth, a licensed 3D model
  will be needed in place of the code-built one.
- **Root Canal**: on the cut face, a sliver of gum shows between the two roots just under the
  pulp chamber. In a real tooth that spot is bone. It is a few pixels wide.
- **Phone layout**: in the Crown "Porcelain, metal, or both" step, the top of the prepared
  tooth still shows faintly behind the small "THE CAP" line. The title and text are clear.

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

```
npm run build
npm run shots              # every shot
npm run shots -- crown     # only shots whose name contains "crown"
```

`scripts/shots.mjs` serves `out/`, drives the installed Chrome with `puppeteer-core` (headless,
software rendering), scrolls to set points and saves a screenshot of each at 1440×900 and
390×844 into `shots/` (not committed). It exits with an error if the browser console reports
anything or any request fails.

The list of shots is `PAGES` at the top of the script. Add a line there for each new chapter:
`{ name, chapter: "<slug>", p: <0 to 1> }` scrolls to that point in the chapter.

Options worth knowing:

- On a page, `still: "motion" | "webgl" | "nojs"` opens it with "reduce motion" on, with WebGL
  made to fail, or with JavaScript off. The run fails if the 3D starts on such a page.
- On a shot, `loading: true` shows the page as it is before the 3D has loaded.
- On a shot, `full: true` saves the whole page. A page too tall for one picture is saved as
  numbered pieces (`home-still-phone-1.png`, `-2`, `-3`).

`scripts/browser.mjs` holds what `shots.mjs` and `posters.mjs` share: the server for `out/` and
the headless Chrome.

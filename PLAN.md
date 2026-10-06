# Family Dental Clinic website: plan

Last updated: 2026-10-06

This file is the handover for the next working session. It says what exists, what the finished
site looks like, the order to build it in, and what is still waiting on the clinic.

**Status: steps 1 to 5 of section 7 are done and on `main`. What is left is steps 6 and 7, and
both wait on the clinic (section 10).**

## 1. Where things stand

The site has 13 pages:

- **Home** (`/`): hero, three 3D scroll chapters (**Dental Implant**, **Crown**, **Root Canal
  Treatment**), the ten treatment cards, contact footer.
- **Treatments** (`/services`): the ten cards.
- **Ten service pages** (`/services/<slug>`). Every one opens with its own 3D chapter. The
  plain dark header is still in the template, for a service added later without a chapter.
- **Contact** (`/contact`): address, phone, WhatsApp, a directions link.
- A styled **404** page.

Every page has the new header (Treatments, Contact, WhatsApp, and a menu on phones) and the
footer. `/about` is not built; it waits for clinic content.

A 3D chapter now has two forms (section 6, "Live and still"). Where the 3D can run, it is the
scroll chapter as before, with a still image of the model in its place until the 3D has loaded.
Where it cannot run (no WebGL, "reduce motion" turned on, or JavaScript off), the page shows a
still image of the model beside all of the chapter's steps, at normal height.

Every page has its own title, description and share tags, and the build writes `sitemap.xml`
and `robots.txt`. The site does not know its own address yet, so for now `robots.txt` asks
search engines to stay away (section 6, "Search and sharing").

The code is in git and pushed to GitHub (`origin`). Nothing is deployed. Steps 1 to 5 are all
on `main`. The branches `step-3-safe-3d`, `step-4-search-sharing` and `step-5-chapters` mark
where those steps ended and are merged into `main`.

### What has been checked

After step 5, on 2026-10-06:

- `npx tsc --noEmit` and `npm run build` pass.
- `npm run shots`, all of it: 101 screenshots at 1440×900 and 390×844, now with every one of
  the seven new chapters at two to four scroll points. No console errors and no failed
  requests.
- Looked at, of those: every new chapter on the desktop at its "parts in view" point, most of
  their other desktop shots, three phone shots (Veneers, Braces, Partial Denture), and the
  Braces page opened with "reduce motion" on, which shows the still layout.
- Not looked at after the last changes: the home page and the three older chapters. Their
  screenshots were retaken without errors, and their own files were not changed, but two
  shared ones were: the gum's look moved into `materials.tsx`, and `buildSocket` gained a
  setting. Compare `home-crown-parts` and `home-rootcanal-inside` with how they looked before.

After step 4, and not repeated since:

- `npx tsc --noEmit` and `npm run build` pass.
- Read from the built files: every page has a title, a description, its own address as the
  canonical link, and share tags with the share image. The 404 page is marked "do not index".
  `sitemap.xml` lists all 13 pages.
- Built once with a trial address (`https://example.com`), then put back: `robots.txt` lets
  search engines in and names the sitemap, and the sitemap, canonical links, share tags and
  clinic details all carry that address.
- `npm run launch-check` fails and lists the four things still open.
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
- How a shared link really looks in WhatsApp, Facebook or X. That can only be seen once the
  site is online at its own address.

### Things added in step 5 that the owner did not see in advance

- **All seven chapters.** Section 8 says what each shows. The storyboards were followed, with
  these differences:
  - Braces: the braces go back on before the teeth move, and come off at the end.
  - Partial Denture: the jaw it sits on is shown too, with its remaining teeth, so the gaps
    and the clasps make sense.
  - Tooth Extraction: the tooth does not return. The chapter ends on the empty socket.
  - Veneers: the tooth under the shell is a darker shade, to show what the shell covers.
- **New wording in every chapter**, listed in section 10 for a dentist to read.
- **Bleaching has no part labels**, because nothing comes apart.

### Things added in step 4 that the owner did not see in advance

- **The share image** (`public/share.jpg`): the top of the home page with the clinic's name,
  "Smiles for every generation" and the implant model. Every page shares this one picture.
- **Search engines are kept out until the site has its address.** While `url` in
  `src/content/clinic.ts` is empty, `robots.txt` says "stay away", so a preview copy put online
  does not end up in Google.
- **The check for unfinished content is its own command, not part of every build.** The plan
  asked for a build that fails while a service is marked `draft`. Two are, so that would have
  stopped every build from now until the clinic sends its text. `npm run build` works as
  before. `npm run build:launch` runs the check first, and is the one to use for the copy that
  goes live.
- That check also fails while the site's address is empty, the address and phone number are
  not marked confirmed, or the opening hours are empty.

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
| `/services/dental-veneers` | Dental Veneers | Built |
| `/services/dental-filling` | Dental Filling | Built |
| `/services/dental-bleaching` | Dental Bleaching | Built |
| `/services/braces` | Braces | Built |
| `/services/complete-denture` | Complete Denture | Built |
| `/services/removable-partial-denture` | Removable Partial Denture | Built |
| `/services/tooth-extraction` | Tooth Extraction | Built |
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
npm run posters  # still images of the 3D chapters, and the share image (see section 6)
npm run launch-check   # lists what src/content/ says is unfinished, and fails if anything is
npm run build:launch   # that check, then the build. For the copy that goes live.
```

If a build stops with "Failed to type check" or "build worker exited" and names no fault in the
code, the machine was short of memory. Run it again. It happened several times on 2026-10-06
while other programs were holding most of the memory, and each time the next run passed.

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
  (`buildToothSection`), and gum and bone (`buildSocket`, which takes the width of the tooth
  at the gum line). Also the decay and cavity for the Filling chapter (`buildCavitySection`)
  and the empty socket for the Extraction chapter (`buildEmptySocket`).
- `parts/incisor.ts` → a front tooth with one root (`buildIncisor`), and the veneer shell that
  fits its front face (`buildVeneer`).
- `parts/arch.ts` → six front teeth in a curved strip of gum, as seen in a smile. Bleaching and
  Braces both stand on it. `parts/braces.ts` adds the brackets, the wire, and how far each
  tooth starts out of line.
- `parts/denture.ts` → a whole jaw of fourteen teeth on a horseshoe (`jawTeeth`,
  `buildJawRidge`), and the frame, clasps and bases of the partial denture (`buildPartial`).
- `geometry.ts` → `bar()` makes a rounded bar along any level line. The gum strips and the
  denture bases are all this.
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

### Search and sharing

- A page gets its title, description, canonical link and share tags from `pageMeta()` in
  `src/lib/meta.ts`. Every new page should export it as its `metadata`, and be added to the
  list in `src/app/sitemap.ts`. Service pages are covered already: both read `services.ts`.
- Do not set `openGraph` on a page by hand. It replaces the whole set from `pageMeta()`,
  share image included.
- The site's address is `url` in `src/content/clinic.ts`. Empty, it falls back to
  `http://localhost:3000` in the sitemap and tags, and `robots.txt` (from `src/app/robots.ts`)
  shuts search engines out. Set, everything carries the real address and `robots.txt` opens.
- The share image is `public/share.jpg`, made by `npm run posters` (or
  `npm run posters -- share`) from the top of the home page. Remake it if the hero changes.
- The clinic details that search engines read are `jsonLd` in `src/app/layout.tsx`. Opening
  hours and a map location are not in it yet.

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

**Step 4: search and sharing** (done, except what waits on the clinic)

- A title and description for every page, a share image, a sitemap and `robots.txt`.
- The clinic details that search engines read now take the site address from `clinic.ts`.
  Still to add once the clinic confirms them: opening hours and map location.
- `npm run build:launch` fails while any service is marked `draft: true`, among other things
  (section 1 says why this is not the everyday build).

**Step 5: the seven remaining 3D chapters** (done)

Each on its own service page. Section 8 says what each one shows.

**Step 6: clinic content**

Home sections 4 to 7 and the About page, as the content in section 10 arrives. This step can
happen at any point after step 2.

**Step 7: launch**

- Test on real mid-range Android phones, and in Safari and Firefox.
- Choose hosting, connect the domain, add analytics.
- Every "confirm with the clinic" item in section 10 is closed.
- Set `url`, `confirmed` and `hours` in `src/content/clinic.ts`, then build with
  `npm run build:launch`. Share a link in WhatsApp to see the preview.

## 8. The seven chapters built in step 5

What each one shows, as built. None of them is on the home page.

1. **Dental Veneers**: a front tooth in gum and bone. A thin shell comes off its front face,
   the camera moves round to show how thin it is, and the shell goes back on. The tooth under
   it is a shade darker than the shell.
2. **Dental Filling**: a molar cut open, with a dark patch of decay under the biting surface.
   The patch is cleared to a clean space, which fills in three layers. Catalogue text is
   incomplete (see section 10).
3. **Dental Bleaching**: no exploded view and no part labels. Six front teeth in a strip of
   gum go from a darker shade to a lighter one, one tooth after another across the row.
   Catalogue text is incomplete (see section 10).
4. **Braces**: six front teeth, out of line, with a bracket on each and a wire through them.
   The brackets and wire come away and go back, the teeth move into line with the wire bending
   as they go, and at the end the braces fade off.
5. **Complete Denture**: fourteen teeth on a pink horseshoe base. The set of teeth rises off
   the base and returns.
6. **Removable Partial Denture**: a jaw with the last three teeth missing on each side. The
   denture lifts off it and comes apart into a metal frame with two clasps, two pink bases and
   the six teeth, then goes back.
7. **Tooth Extraction**: a molar rises out of gum and bone, turning a little, and fades. It
   does not go back. What is left is the empty socket, drawn as a soft shadow. No instrument,
   no blood, and the tooth looks healthy.

## 9. Known defects in what is built

- **Tooth shape** is stylised. If the clinic wants a more lifelike tooth, a licensed 3D model
  will be needed in place of the code-built one.
- **Root Canal**: on the cut face, a sliver of gum shows between the two roots just under the
  pulp chamber. In a real tooth that spot is bone. It is a few pixels wide.
- **Phone layout**: in the Crown "Porcelain, metal, or both" step, the top of the prepared
  tooth still shows faintly behind the small "THE CAP" line. The title and text are clear.
- **Front teeth** (Veneers, Bleaching, Braces, both dentures) are one simple wedge shape at
  different sizes. The corner teeth are not pointed, and every front tooth has a flat edge.
- **Gum strips and denture bases** are plain rounded bars. They do not rise between the teeth
  the way real gum does.
- **Partial Denture**: the replacement teeth stand a little higher than the natural ones
  beside them, because their base sits on top of the gum.

## 10. Waiting on the clinic

Ask for all of this now. The site cannot launch without the first group, whatever state the
code is in.

Needed to launch:

- **Phone number and address**: taken from an earlier planning PDF, not confirmed. Both live
  in `src/content/clinic.ts`. Set `confirmed: true` there once they are.
- **Opening hours** and the clinic's **Google Maps link**.
- **Logo** (the header is text only for now).
- **Bleaching and Filling**: full catalogue text. The screenshots cut it off, so
  `services.ts` holds short stand-in lines marked `draft: true`.
- **Domain name** the site will live on. It goes in `url` in `src/content/clinic.ts`.

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
- **The same, from step 5.** Each of these describes what the 3D shows, in words the
  catalogue does not use:
  - Filling: "The damaged part is cleared away, and the space it leaves is filled", and the
    title "Filled, layer by layer".
  - Bleaching: "Whitening lightens the shade of the teeth."
  - Braces: "A bracket sits on each tooth, and one wire runs through them all", and "With the
    teeth in line, the braces come off."
  - Complete Denture: "The base holds the teeth together, as one piece."
  - Partial Denture: "a metal frame runs round the inside of the jaw, and a clasp holds on to
    the tooth beside each gap", and "The replacement teeth sit on a gum-coloured base".
- **What the step 5 models show.** Confirm each matches what the clinic offers: a partial
  denture with a metal frame and clasps (not an all-plastic one), metal braces, and a filling
  in a pale tooth colour.

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

// The 3D scroll chapters. A chapter's id is its service's slug (content/services.ts), and it pairs with a
// 3D scene of the same id (components/three/Experience.tsx). Its step timings must stay in step with
// that scene's camera track.

export type Step = {
  until: number; // shown until the chapter's scroll progress reaches this
  eyebrow: string;
  title: string;
  body: string;
};

export type ChapterContent = {
  id: string;
  screens: number; // how many screens of scrolling the chapter takes
  steps: Step[];
  labels: string[]; // part names; order matches the scene's anchors
  cta: { label: string; service: string };
};

export const chapters: ChapterContent[] = [
  {
    id: "dental-implant",
    screens: 5.2,
    labels: ["Crown", "Screw", "Abutment", "Titanium post", "Jawbone"],
    cta: { label: "Ask about implants", service: "a dental implant" },
    steps: [
      {
        until: 0.4,
        eyebrow: "01 — Dental Implant",
        title: "A new root for a missing tooth",
        body: "A titanium post is placed in the jawbone to replace a missing tooth root. Once healed, it supports a natural-looking crown.",
      },
      {
        until: 0.555,
        eyebrow: "Part one",
        title: "The crown",
        body: "The part you see when you smile. It is shaped and shaded to sit naturally beside your own teeth.",
      },
      {
        until: 0.705,
        eyebrow: "Part two",
        title: "The abutment",
        body: "A small connector, held in place by a screw, that joins the crown to the post beneath the gum.",
      },
      {
        until: 0.84,
        eyebrow: "Part three",
        title: "The titanium post",
        body: "Placed in the jawbone, it takes the place of the missing tooth root.",
      },
      {
        until: Infinity,
        eyebrow: "Healed",
        title: "Whole again",
        body: "Once the jaw has healed around the post, it supports a natural-looking crown.",
      },
    ],
  },
  {
    id: "crown",
    screens: 4.6,
    labels: ["Porcelain", "Metal", "Prepared tooth", "Root"],
    cta: { label: "Ask about crowns", service: "a crown" },
    steps: [
      {
        until: 0.39,
        eyebrow: "02 — Crown",
        title: "A cap that restores the whole tooth",
        body: "A dental crown is a tooth-shaped cap placed over a damaged or decayed tooth to restore its size, shape, strength, and appearance.",
      },
      {
        until: 0.57,
        eyebrow: "Underneath",
        title: "The prepared tooth",
        body: "The tooth is shaped so the crown can sit over it like a cap.",
      },
      {
        until: 0.76,
        eyebrow: "The cap",
        title: "Porcelain, metal, or both",
        body: "A crown can be made from porcelain, metal, or a combination of both. Here, porcelain sits over a thin layer of metal.",
      },
      {
        until: Infinity,
        eyebrow: "In place",
        title: "Strong again",
        body: "A crown gives protection and support to a tooth that is weak or cracked.",
      },
    ],
  },
  {
    id: "root-canal-treatment",
    screens: 5.6,
    labels: ["Enamel", "Dentin", "Pulp", "Root canal"],
    cta: { label: "Ask about root canals", service: "root canal treatment" },
    steps: [
      {
        until: 0.19,
        eyebrow: "03 — Root Canal Treatment",
        title: "Saving the natural tooth",
        body: "A root canal removes the infected or damaged pulp inside the tooth, then cleans and seals the root canals.",
      },
      {
        until: 0.37,
        eyebrow: "Inside the tooth",
        title: "Enamel, dentin, pulp",
        body: "Beneath the hard outer layers is the pulp, the soft tissue that runs down through the root canals.",
      },
      {
        until: 0.655,
        eyebrow: "Step one",
        title: "The infected pulp is removed",
        body: "The root canals are then thoroughly cleaned and disinfected.",
      },
      {
        until: 0.86,
        eyebrow: "Step two",
        title: "The canals are sealed",
        body: "Sealing them prevents further infection.",
      },
      {
        until: Infinity,
        eyebrow: "Done",
        title: "Your own tooth, kept",
        body: "The treatment saves the natural tooth and restores oral health.",
      },
    ],
  },
];

// The chapters shown on the home page, in order. Every chapter also opens its own service page.
export const homeChapterIds = ["dental-implant", "crown", "root-canal-treatment"];

export const chapterFor = (slug: string) => chapters.find((c) => c.id === slug);

// A chapter's still images, made by `npm run posters`: the scene as the chapter opens, and with its
// parts in view. They stand in for the scene while it loads and wherever 3D does not run.
export const poster = (id: string, view: "start" | "parts") =>
  `/posters/${id}${view === "parts" ? "-parts" : ""}.webp`;

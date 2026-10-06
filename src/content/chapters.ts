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
  {
    id: "dental-veneers",
    screens: 4.6,
    labels: ["Veneer", "Front surface", "Root"],
    cta: { label: "Ask about veneers", service: "dental veneers" },
    steps: [
      {
        until: 0.39,
        eyebrow: "04 — Dental Veneers",
        title: "A thin shell for the front of a tooth",
        body: "Dental veneers are thin, custom-made shells that cover the front surface of teeth to improve their appearance.",
      },
      {
        until: 0.57,
        eyebrow: "The shell",
        title: "Porcelain or composite resin",
        body: "Each veneer is custom-made, from porcelain or composite resin, to cover the front surface of its tooth.",
      },
      {
        until: 0.76,
        eyebrow: "Underneath",
        title: "What a veneer covers",
        body: "Veneers are used to fix imperfections such as discoloration, chips, or misalignment.",
      },
      {
        until: Infinity,
        eyebrow: "In place",
        title: "A new front surface",
        body: "Once in place, the veneer covers the front of the tooth and improves its appearance.",
      },
    ],
  },
  {
    id: "dental-filling",
    screens: 5,
    labels: ["Enamel", "Decay", "Dentin", "Pulp"],
    cta: { label: "Ask about fillings", service: "a dental filling" },
    steps: [
      {
        until: 0.3,
        eyebrow: "05 — Dental Filling",
        title: "Repairing a tooth damaged by decay",
        body: "Teeth fillings are a way to repair a tooth damaged by decay and restore its shape.",
      },
      {
        until: 0.5,
        eyebrow: "Inside the tooth",
        title: "The damaged part",
        body: "With the tooth cut open, the decay shows as a dark patch under the biting surface.",
      },
      {
        until: 0.82,
        eyebrow: "The filling",
        title: "Filled, layer by layer",
        body: "The damaged part is cleared away, and the space it leaves is filled.",
      },
      {
        until: Infinity,
        eyebrow: "Done",
        title: "Its shape restored",
        body: "The filling repairs the tooth and restores its shape.",
      },
    ],
  },
  {
    id: "dental-bleaching",
    screens: 4,
    labels: [],
    cta: { label: "Ask about whitening", service: "tooth whitening" },
    steps: [
      {
        until: 0.3,
        eyebrow: "06 — Dental Bleaching",
        title: "Professional tooth whitening",
        body: "Brighten your smile with professional tooth whitening.",
      },
      {
        until: 0.78,
        eyebrow: "Shade by shade",
        title: "From a darker shade to a lighter one",
        body: "Whitening lightens the shade of the teeth.",
      },
      {
        until: Infinity,
        eyebrow: "Done",
        title: "A brighter smile",
        body: "The same teeth, in a lighter shade.",
      },
    ],
  },
  {
    id: "braces",
    screens: 5.2,
    labels: ["Bracket", "Wire"],
    cta: { label: "Ask about braces", service: "braces" },
    steps: [
      {
        until: 0.36,
        eyebrow: "07 — Braces",
        title: "More than a smile transformation",
        body: "Braces are more than just a smile transformation – they are a journey towards better oral health and confidence.",
      },
      {
        until: 0.56,
        eyebrow: "The parts",
        title: "Brackets and a wire",
        body: "A bracket sits on each tooth, and one wire runs through them all.",
      },
      {
        until: 0.86,
        eyebrow: "One step at a time",
        title: "Bringing the teeth into line",
        body: "From correcting alignment issues to improving bite, braces help in shaping the perfect smile, one step at a time!",
      },
      {
        until: Infinity,
        eyebrow: "Done",
        title: "The smile, shaped",
        body: "With the teeth in line, the braces come off.",
      },
    ],
  },
  {
    id: "complete-denture",
    screens: 4.6,
    labels: ["Teeth", "Base"],
    cta: { label: "Ask about dentures", service: "a complete denture" },
    steps: [
      {
        until: 0.39,
        eyebrow: "08 — Complete Denture",
        title: "Replacing all the teeth in a jaw",
        body: "A complete denture is a removable dental appliance designed to replace all missing teeth in the upper or lower jaw.",
      },
      {
        until: 0.57,
        eyebrow: "The teeth",
        title: "A full row of teeth",
        body: "The teeth are set in a row that follows the curve of the jaw.",
      },
      {
        until: 0.76,
        eyebrow: "The base",
        title: "A gum-coloured base",
        body: "The base holds the teeth together, as one piece.",
      },
      {
        until: Infinity,
        eyebrow: "Together",
        title: "Function, looks and confidence",
        body: "It restores functionality, aesthetics, and confidence for individuals with total tooth loss.",
      },
    ],
  },
  {
    id: "removable-partial-denture",
    screens: 4.6,
    labels: ["Teeth", "Base", "Clasp", "Metal frame"],
    cta: { label: "Ask about partial dentures", service: "a removable partial denture" },
    steps: [
      {
        until: 0.39,
        eyebrow: "09 — Removable Partial Denture",
        title: "Replacing the teeth that are missing",
        body: "A removable partial denture (RPD) is a customized dental appliance designed to replace missing teeth.",
      },
      {
        until: 0.57,
        eyebrow: "The frame",
        title: "A frame with clasps",
        body: "In this one, a metal frame runs round the inside of the jaw, and a clasp holds on to the tooth beside each gap.",
      },
      {
        until: 0.76,
        eyebrow: "The teeth",
        title: "New teeth on a pink base",
        body: "The replacement teeth sit on a gum-coloured base, where the missing teeth were.",
      },
      {
        until: Infinity,
        eyebrow: "In place",
        title: "Easy to take out",
        body: "It restores function and aesthetics, and is easily removable for cleaning and maintenance.",
      },
    ],
  },
  {
    id: "tooth-extraction",
    screens: 4.6,
    labels: ["Tooth", "Socket", "Jawbone"],
    cta: { label: "Ask about extractions", service: "a tooth extraction" },
    steps: [
      {
        until: 0.3,
        eyebrow: "10 — Tooth Extraction",
        title: "Removing a tooth from its socket",
        body: "Tooth extraction is a dental procedure where a damaged or decayed tooth is removed from its socket in the jaw.",
      },
      {
        until: 0.5,
        eyebrow: "Why",
        title: "When a tooth is beyond repair",
        body: "It is often necessary when a tooth is beyond repair due to infection, crowding, or other oral health issues.",
      },
      {
        until: 0.8,
        eyebrow: "The procedure",
        title: "Out of its socket",
        body: "The tooth is removed from its socket in the jaw.",
      },
      {
        until: Infinity,
        eyebrow: "Afterwards",
        title: "Care while it heals",
        body: "After extraction, proper care is essential for healing and to avoid complications such as infection.",
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

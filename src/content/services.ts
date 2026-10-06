export type Service = {
  slug: string;
  name: string;
  description: string;
  // True while the description is a stand-in for catalogue text we don't have yet.
  draft?: boolean;
};

// Descriptions are the clinic's own WhatsApp catalogue copy.
export const services: Service[] = [
  {
    slug: "dental-implant",
    name: "Dental Implant",
    description:
      "It’s a procedure where a titanium post is placed in the jawbone to replace a missing tooth root. Once healed, it will support a natural-looking crown.",
  },
  {
    slug: "crown",
    name: "Crown",
    description:
      "A dental crown is a tooth-shaped cap placed over a damaged or decayed tooth to restore its size, shape, strength, and appearance. It provides protection and support for a tooth that is weak or cracked, and it can be made from various materials, including porcelain, metal, or a combination of both.",
  },
  {
    slug: "dental-veneers",
    name: "Dental Veneers",
    description:
      "Dental veneers are thin, custom-made shells that cover the front surface of teeth to improve their appearance. They are made of porcelain or composite resin and are used to fix imperfections such as discoloration, chips, or misalignment.",
  },
  {
    slug: "root-canal-treatment",
    name: "Root Canal Treatment",
    description:
      "It’s a dental procedure that involves removing the infected or damaged pulp inside the tooth, thoroughly cleaning and disinfecting the root canals, and sealing them to prevent further infection. It saves the natural tooth and restores oral health.",
  },
  {
    slug: "dental-filling",
    name: "Dental Filling",
    description:
      "Teeth fillings are a way to repair a tooth damaged by decay and restore its shape.",
    draft: true,
  },
  {
    slug: "braces",
    name: "Braces",
    description:
      "Braces are more than just a smile transformation – they are a journey towards better oral health and confidence. From correcting alignment issues to improving bite, braces help in shaping the perfect smile, one step at a time!",
  },
  {
    slug: "dental-bleaching",
    name: "Dental Bleaching",
    description: "Brighten your smile with professional tooth whitening.",
    draft: true,
  },
  {
    slug: "complete-denture",
    name: "Complete Denture",
    description:
      "A complete denture is a removable dental appliance designed to replace all missing teeth in the upper or lower jaw. It restores functionality, aesthetics, and confidence for individuals with total tooth loss.",
  },
  {
    slug: "removable-partial-denture",
    name: "Removable Partial Denture",
    description:
      "A removable partial denture (RPD) is a customized dental appliance designed to replace missing teeth. It restores function and aesthetics, easily removable for cleaning and maintenance. Ideal for patients seeking a non-permanent, cost-effective solution to improve their smile and oral health.",
  },
  {
    slug: "tooth-extraction",
    name: "Tooth Extraction",
    description:
      "Tooth extraction is a dental procedure where a damaged or decayed tooth is removed from its socket in the jaw. It is often necessary when a tooth is beyond repair due to infection, crowding, or other oral health issues. After extraction, proper care is essential for healing and to avoid complications such as infection.",
  },
];

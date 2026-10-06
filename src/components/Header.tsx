import { clinic, whatsappLink } from "@/content/clinic";

const links = [
  { href: "#implant", label: "Implant" },
  { href: "#crown", label: "Crown" },
  { href: "#root-canal", label: "Root canal" },
  { href: "#services", label: "Treatments" },
  { href: "#contact", label: "Visit us" },
];

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-plum-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="font-display text-lg tracking-tight">
          Family Dental <span className="text-plum-300">Clinic</span>
        </a>
        <nav className="hidden gap-8 text-sm text-cream/75 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition hover:text-cream">
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href={whatsappLink(`Hello ${clinic.name}, I would like to book an appointment.`)}
          className="rounded-full border border-cream/30 px-4 py-2 text-sm font-semibold transition hover:border-cream/70"
        >
          WhatsApp
        </a>
      </div>
    </header>
  );
}

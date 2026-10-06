"use client";

import dynamic from "next/dynamic";
import { stage } from "@/lib/stage";
import { chapters } from "@/content/chapters";
import { clinic, whatsappLink } from "@/content/clinic";
import Chapter from "./Chapter";

const Experience = dynamic(() => import("./three/Experience"), { ssr: false });

// The dark 3D part of the page: a fixed canvas behind the hero and every scroll chapter.
export default function Stage() {
  return (
    <div id="stage" className="relative">
      <div className="stage-bg fixed left-0 top-0 z-0 h-lvh w-full">
        <Experience />
        {/* Part labels. Each scene positions its own over the canvas. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {chapters.map((chapter) =>
            chapter.labels.map((text, i) => (
              <div
                key={`${chapter.id}-${text}`}
                ref={(el) => {
                  (stage.labels[chapter.id] ??= [])[i] = el;
                }}
                className="absolute left-0 top-0 flex items-center gap-3 whitespace-nowrap opacity-0"
              >
                <span className="relative h-px w-10 bg-cream/70 shadow-[0_1px_0_rgb(0_0_0/0.35)] before:absolute before:-left-[3px] before:-top-[2.5px] before:size-1.5 before:rounded-full before:bg-cream before:ring-1 before:ring-black/30" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cream/75">{text}</span>
              </div>
            )),
          )}
        </div>
      </div>

      <section
        id="top"
        className="relative z-10 mx-auto flex h-svh max-w-7xl items-end px-5 pb-14 sm:px-8 lg:items-center lg:pb-0"
      >
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-plum-300">
            {clinic.name} · {clinic.city}
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Smiles for every generation
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-cream/75 sm:text-lg">
            See your treatment before you sit in the chair. Scroll to look inside an implant, a crown and a root
            canal.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={whatsappLink(`Hello ${clinic.name}, I would like to book an appointment.`)}
              className="rounded-full bg-cream px-6 py-3 text-sm font-semibold text-plum-900 transition hover:bg-white"
            >
              Book on WhatsApp
            </a>
            <a
              href="#services"
              className="rounded-full border border-cream/30 px-6 py-3 text-sm font-semibold transition hover:border-cream/70"
            >
              Our treatments
            </a>
          </div>
        </div>
      </section>

      {chapters.map((chapter, i) => (
        <Chapter key={chapter.id} chapter={chapter} pinFromTop={i === 0} />
      ))}
    </div>
  );
}

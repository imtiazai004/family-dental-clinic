"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { stage } from "@/lib/stage";
import { clinic, whatsappLink } from "@/content/clinic";
import type { ChapterContent } from "@/content/chapters";

gsap.registerPlugin(ScrollTrigger);

// One scroll chapter: a tall section whose text stays pinned while its 3D scene plays.
// `pinFromTop` keeps the scene on screen from the very top of the page (the first chapter,
// whose model is also the hero image).
export default function Chapter({ chapter, pinFromTop = false }: { chapter: ChapterContent; pinFromTop?: boolean }) {
  const section = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const { id, steps, cta } = chapter;

  useEffect(() => {
    const el = section.current!;
    // Tell the 3D scene where this chapter sits in the page.
    const measure = () => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      stage.chapters[id] = { start: pinFromTop ? 0 : top, pStart: top, end: top + el.offsetHeight };
    };
    measure();
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onRefresh: measure,
      onUpdate: (self) => setStep(steps.findIndex((s) => self.progress < s.until)),
    });
    return () => {
      trigger.kill();
      delete stage.chapters[id];
    };
  }, [id, steps, pinFromTop]);

  return (
    <section id={id} ref={section} className={`relative z-10 ${chapter.height}`}>
      {/* On small screens the chapter above ends in a dark band behind its text; fade out of it. */}
      {!pinFromTop && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-linear-to-b from-plum-950 to-transparent lg:hidden" />
      )}
      <div className="sticky top-0 flex h-svh items-end lg:items-center">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-plum-950 via-plum-950/70 to-transparent lg:hidden" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-10 sm:px-8 lg:pb-0">
          <div className="grid max-w-md">
            {steps.map((s, i) => (
              <div
                key={s.title}
                aria-hidden={i !== step}
                className={`col-start-1 row-start-1 self-end transition duration-500 lg:self-center ${
                  i === step ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-plum-300">{s.eyebrow}</p>
                <h2 className="mt-3 font-display text-4xl leading-tight tracking-tight sm:text-5xl">{s.title}</h2>
                <p className="mt-4 text-base leading-relaxed text-cream/75 sm:text-lg">{s.body}</p>
                {i === steps.length - 1 && (
                  <a
                    href={whatsappLink(`Hello ${clinic.name}, I would like to ask about ${cta.service}.`)}
                    tabIndex={i === step ? 0 : -1}
                    className="mt-6 inline-block rounded-full bg-cream px-6 py-3 text-sm font-semibold text-plum-900 transition hover:bg-white"
                  >
                    {cta.label}
                  </a>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 flex gap-2" aria-hidden>
            {steps.map((s, i) => (
              <span
                key={s.title}
                className={`h-0.5 w-8 rounded-full transition-colors duration-500 ${
                  i <= step ? "bg-cream" : "bg-cream/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

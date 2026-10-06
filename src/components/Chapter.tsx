"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLive } from "@/lib/live";
import { stage } from "@/lib/stage";
import { clinic, whatsappLink } from "@/content/clinic";
import { poster, type ChapterContent } from "@/content/chapters";

gsap.registerPlugin(ScrollTrigger);

const EYEBROW = "text-xs font-semibold uppercase tracking-[0.28em] text-plum-300";
const TITLE = "mt-3 font-display text-4xl leading-tight tracking-tight sm:text-5xl";

// One scroll chapter: a tall section whose text stays pinned while its 3D scene plays.
// `pinFromTop` keeps the scene on screen from the very top of the page (the first chapter,
// whose model is also the hero image).
// `pageTitle` is set when the chapter opens a service page: the first step then becomes the page's
// main heading, under that name. `moreHref` adds a link to the service page after the last step.
//
// Where 3D does not run (lib/live.ts) the same steps are laid out one under another, at their natural
// height, beside a still image of the scene. That is what the `still:` and `live:` classes switch.
export default function Chapter({
  chapter,
  pinFromTop = false,
  pageTitle,
  moreHref,
}: {
  chapter: ChapterContent;
  pinFromTop?: boolean;
  pageTitle?: string;
  moreHref?: string;
}) {
  const live = useLive();
  const section = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const { id, steps, cta } = chapter;
  // The steps after the first sit one level under the chapter's own heading.
  const StepTitle = pageTitle ? "h2" : "h3";

  useEffect(() => {
    if (!live) return;
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
  }, [live, id, steps, pinFromTop]);

  // Every step can be read and tabbed to, on screen or not. When the keyboard lands on a step that
  // is not showing, scroll to where it does.
  const reveal = (i: number) => {
    if (!live || i === step) return;
    const el = section.current!;
    const progress = i === steps.length - 1 ? 1 : (i ? steps[i - 1].until : 0) + 0.02;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + progress * (el.offsetHeight - window.innerHeight));
  };

  return (
    <section
      id={id}
      ref={section}
      style={{ "--chapter-height": `${chapter.screens * 100}svh` } as CSSProperties}
      className="relative z-10 live:h-(--chapter-height)"
    >
      {/* On small screens the chapter above ends in a dark band behind its text; fade out of it. */}
      {!pinFromTop && (
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-56 bg-linear-to-b from-plum-950 to-transparent max-lg:live:block" />
      )}
      <div className="live:sticky live:top-0 live:flex live:h-svh max-lg:live:items-end lg:live:items-center">
        {/* On small screens the text sits under the model, on a band dark enough to hide what the
            camera leaves behind it. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[48%] bg-linear-to-t from-plum-950 from-55% via-plum-950/90 via-75% to-transparent max-lg:live:block" />
        <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 still:grid still:gap-10 still:pb-16 still:pt-28 lg:still:grid-cols-2 lg:still:items-start lg:still:gap-16 lg:still:pb-24 lg:still:pt-36 max-lg:live:pb-10">
          <img
            src={poster(id, "parts")}
            alt=""
            loading="lazy"
            className="mx-auto h-[56svh] w-auto max-w-full object-contain lg:sticky lg:top-24 lg:order-last lg:h-[72svh] live:hidden"
          />
          <div>
            <div className="grid max-w-md still:gap-12">
              {steps.map((s, i) => (
                <div
                  key={s.title}
                  onFocus={() => reveal(i)}
                  className={`live:col-start-1 live:row-start-1 live:transition live:duration-500 max-lg:live:self-end lg:live:self-center ${
                    i === step ? "" : "live:pointer-events-none live:translate-y-3 live:opacity-0"
                  }`}
                >
                  {i > 0 ? (
                    <>
                      <p className={EYEBROW}>{s.eyebrow}</p>
                      <StepTitle className={`${TITLE} still:text-2xl sm:still:text-3xl`}>{s.title}</StepTitle>
                    </>
                  ) : pageTitle ? (
                    <h1>
                      <span className={`block ${EYEBROW}`}>{pageTitle}</span>
                      <span className={`block ${TITLE}`}>{s.title}</span>
                    </h1>
                  ) : (
                    <>
                      <p className={EYEBROW}>{s.eyebrow}</p>
                      <h2 className={TITLE}>{s.title}</h2>
                    </>
                  )}
                  <p className="mt-4 text-base leading-relaxed text-cream/75 sm:text-lg">{s.body}</p>
                  {i === steps.length - 1 && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      <a
                        href={whatsappLink(`Hello ${clinic.name}, I would like to ask about ${cta.service}.`)}
                        className="rounded-full bg-cream px-6 py-3 text-sm font-semibold text-plum-900 transition hover:bg-white"
                      >
                        {cta.label}
                      </a>
                      {moreHref && (
                        <Link
                          href={moreHref}
                          className="rounded-full border border-cream/30 px-6 py-3 text-sm font-semibold transition hover:border-cream/70"
                        >
                          More about this treatment
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8 hidden gap-2 live:flex" aria-hidden>
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
      </div>
    </section>
  );
}

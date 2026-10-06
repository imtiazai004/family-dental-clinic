"use client";

import dynamic from "next/dynamic";
import { stage } from "@/lib/stage";
import { chapters } from "@/content/chapters";
import { services } from "@/content/services";
import Chapter from "./Chapter";

const Experience = dynamic(() => import("./three/Experience"), { ssr: false });

// The dark 3D part of a page: a fixed canvas behind a run of scroll chapters.
// `children` sit above the first chapter (the home hero). With `standalone` the chapter opens its own
// service page: its first step carries the page title, and it does not link to itself.
export default function Stage({
  ids,
  standalone = false,
  children,
}: {
  ids: string[];
  standalone?: boolean;
  children?: React.ReactNode;
}) {
  const shown = ids.flatMap((id) => chapters.find((c) => c.id === id) ?? []);

  return (
    <div id="stage" className="relative">
      <div className="stage-bg fixed left-0 top-0 z-0 h-lvh w-full">
        <Experience ids={ids} />
        {/* Part labels. Each scene positions its own over the canvas. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {shown.map((chapter) =>
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

      {children}

      {shown.map((chapter, i) => (
        <Chapter
          key={chapter.id}
          chapter={chapter}
          pinFromTop={i === 0}
          pageTitle={standalone ? services.find((s) => s.slug === chapter.id)?.name : undefined}
          moreHref={standalone ? undefined : `/services/${chapter.id}`}
        />
      ))}
    </div>
  );
}

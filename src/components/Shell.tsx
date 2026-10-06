import Contact from "./Contact";
import Header from "./Header";
import SmoothScroll from "./SmoothScroll";

// What every page is wrapped in: smooth scrolling, the header and the footer.
export default function Shell({ children, bareFooter }: { children: React.ReactNode; bareFooter?: boolean }) {
  return (
    <SmoothScroll>
      <div className="flex min-h-svh flex-col">
        {/* The first stop for the Tab key: a way past the header, shown only while it has focus. */}
        <a
          href="#main"
          className="fixed left-4 top-4 z-60 -translate-y-24 rounded-full bg-cream px-5 py-3 text-sm font-semibold text-plum-900 focus:translate-y-0"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="flex grow flex-col">
          {children}
        </main>
        <Contact bare={bareFooter} />
      </div>
    </SmoothScroll>
  );
}

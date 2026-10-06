import Contact from "./Contact";
import Header from "./Header";
import SmoothScroll from "./SmoothScroll";

// What every page is wrapped in: smooth scrolling, the header and the footer.
export default function Shell({ children, bareFooter }: { children: React.ReactNode; bareFooter?: boolean }) {
  return (
    <SmoothScroll>
      <div className="flex min-h-svh flex-col">
        <Header />
        <main className="flex grow flex-col">{children}</main>
        <Contact bare={bareFooter} />
      </div>
    </SmoothScroll>
  );
}

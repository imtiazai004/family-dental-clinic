import Contact from "@/components/Contact";
import Header from "@/components/Header";
import Services from "@/components/Services";
import SmoothScroll from "@/components/SmoothScroll";
import Stage from "@/components/Stage";

export default function Home() {
  return (
    <SmoothScroll>
      <Header />
      <main>
        <Stage />
        <Services />
        <Contact />
      </main>
    </SmoothScroll>
  );
}

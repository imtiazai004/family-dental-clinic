import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Shell from "@/components/Shell";
import Stage from "@/components/Stage";
import { homeChapterIds } from "@/content/chapters";
import { pageMeta, siteDescription } from "@/lib/meta";

export const metadata = pageMeta({ description: siteDescription, path: "/" });

export default function Home() {
  return (
    <Shell>
      <Stage ids={homeChapterIds}>
        <Hero />
      </Stage>
      <Services />
    </Shell>
  );
}

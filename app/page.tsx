import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Projects } from "@/components/Projects";
import { Capabilities } from "@/components/Capabilities";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { ContactModal } from "@/components/ContactModal";
import { BackgroundFX } from "@/components/BackgroundFX";
import { SmoothAnchors } from "@/components/SmoothAnchors";

export default function Home() {
  return (
    <>
      <BackgroundFX />
      <SmoothAnchors />
      <Nav />
      <main>
        <Hero />
        <About />
        <Projects />
        <Capabilities />
        <Faq />
      </main>
      <Footer />
      <ContactModal />
    </>
  );
}

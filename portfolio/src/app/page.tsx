import AboutMe from "@/components/AboutMe/AboutMe";
import ContactSection from "@/components/Contact/Contact";
import CounterSection from "@/components/CounterSeccion/CounterSection";
import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import Navbar from "@/components/Navbar/Navbar";
import ProjectsSection from "@/components/Projects/ProjectsSection";
import TechCarousel from "@/components/Technologies/TechCarousel";
import SkillsSection from "@/components/TechSkillSection/SkillSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <Header />
      <AboutMe />
      <CounterSection/>
      <SkillsSection />
      <TechCarousel />
      <ProjectsSection />
      <ContactSection/>
      <Footer />
    </>
  );
}

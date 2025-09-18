import AboutMe from "@/components/AboutMe/AboutMe";
import Header from "@/components/Header/Header";
import Navbar from "@/components/Navbar/Navbar";
import ProjectSection from "@/components/Projects/ProjectsSection";
import TechCarousel from "@/components/Technologies/TechCarousel";
import SkillsSection from "@/components/TechSkillSection/SkillSection";

export default function Home() {
  return (
   <>
      <Navbar />
      <Header/>
      <AboutMe/>
      <SkillsSection/>
      <TechCarousel/>
      <ProjectSection/>
    </>
  );
}

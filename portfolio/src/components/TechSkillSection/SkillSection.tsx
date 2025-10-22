// components/SkillsSection.tsx
"use client";
import React from "react";
import SkillCard from "./SkillCard";
import { skillsData } from "@/helpers/TechSkills";
import EffectsWrapper from "../EffectsWrapper";
import ScrollFloat from "../ScrollFloat";
import { useLanguage } from "@/context/LanguageContext";

const SkillsSection = () => {
  const mainSkill = skillsData[0];
  const otherSkills = skillsData.slice(1);
  const { t } = useLanguage();

  return (
    <section id="SkillSection" className="container px-4 py-8 mx-auto mt-12">
      {/* Tiutlo de Skill Section */}
      <ScrollFloat
        animationDuration={1.5}
        ease="power3.out"
        scrollStart="top bottom-=150"
      >
        <div className="flex flex-col items-center justify-center mt-40 mb-20 text-center md:mb-24">
          <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl text-whiteHeadline-500 font-lexend ">
            {t("Principales Tecnologias")}
          </h1>
          <h2 className="mt-4 font-sans text-xl text-greyParagraph-500">
            Full-stack skills
          </h2>
        </div>
      </ScrollFloat>

      {/* Main Skill (centrada) */}
      <div className="flex justify-center w-full mb-12">
        <ScrollFloat
          animationDuration={1.3}
          ease="power3.out"
          scrollStart="top bottom-=100"
        >
          <EffectsWrapper>
            <SkillCard
              title={t(mainSkill.title)}
              subTitle={t(mainSkill.subTitle)}
              description={t(mainSkill.description)}
              icon={mainSkill.icon}
              position="center"
            />
          </EffectsWrapper>
        </ScrollFloat>
      </div>

      {/* Otras Skills (izquierda/derecha) */}
      <div className="flex flex-col space-y-6 md:space-y-10">
        {otherSkills.map((skill, index) => (
          <ScrollFloat
            animationDuration={1.3}
            ease="power3.out"
            scrollStart="top bottom-=50"
            key={index}
          >
            <div className="flex justify-start w-full">
              <div
                className={`relative w-full max-w-2xl ${
                  index % 2 !== 0 ? "ml-auto" : ""
                }`}
              >
                <EffectsWrapper>
                  <SkillCard
                    title={t(skill.title)}
                    subTitle={t(skill.subTitle)}
                    description={t(skill.description)}
                    icon={skill.icon}
                    position={index % 2 === 0 ? "left" : "right"}
                  />
                </EffectsWrapper>
              </div>
            </div>
          </ScrollFloat>
        ))}
      </div>
    </section>
  );
};

export default SkillsSection;

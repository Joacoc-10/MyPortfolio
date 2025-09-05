import React from 'react';
import SkillCard from './SkillCard';
import { skillsData } from '@/helpers/TechSkills';

const SkillsSection = () => {
  const mainSkill = skillsData[0];
  const otherSkills = skillsData.slice(1);

  return (
    <section className="container px-4 py-16 mx-auto mt-12">
      <div className="flex flex-col items-center justify-center mb-12 text-center md:mb-24">
        <h2 className="text-5xl font-extrabold tracking-tight md:text-6xl text-whiteHeadline-500 font-lexend">
          Principales Tecnologias.
        </h2>
        <p className="mt-4 font-sans text-xl text-greyParagraph-500">
          Full-stack skills.
        </p>
      </div>

      <div className="flex justify-center w-full mb-12">
        <SkillCard
        title={mainSkill.title}
          subTitle={mainSkill.subTitle}
          description={mainSkill.description}
          icon={mainSkill.icon}
          position="center"
        />
      </div>

      <div className="flex flex-col space-y-12">
        {otherSkills.map((skill, index) => (
          <div key={index} className="flex justify-start w-full">
            <div className={`relative w-full max-w-2xl ${index % 2 !== 0 ? 'ml-auto' : ''}`}>
              <SkillCard
              title={skill.title}
                subTitle={skill.subTitle}
                description={skill.description}
                icon={skill.icon}
                position={index % 2 === 0 ? 'left' : 'right'}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SkillsSection;
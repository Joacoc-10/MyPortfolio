"use client";
import { FaLinkedin, FaEnvelope } from "react-icons/fa";
import EffectsWrapper from "@/components/EffectsWrapper";
import { useRef, useEffect, useState } from "react";

const ContactSection = () => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = cardRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (element) observer.unobserve(element);
        }
      },
      { threshold: 0.5 }
    );

    if (element) observer.observe(element);
    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  return (
    <section id="ContactSection" className="py-20">
      <div className="container flex justify-center px-4 mx-auto">
        <EffectsWrapper glowColor="127, 90, 240" particleCount={12}>
          <div
            ref={cardRef}
            className={`
              relative max-w-3xl w-full bg-secondaryBackground-300/80 border border-purpleButton-500
              rounded-2xl shadow-2xl p-10 flex flex-col items-center text-center space-y-6
              transition-transform duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
              hover:scale-105
            `}
          >
            <h2 className="text-4xl font-extrabold md:text-5xl text-whiteHeadline-500 font-lexend">
              ¿Tienes un proyecto en mente?
            </h2>
            <p className="max-w-xl font-sans text-lg text-greyParagraph-500">
              Me encantaría ayudarte a hacerlo realidad. Ponte en contacto conmigo y hablemos sobre tu idea.
            </p>

            <div className="flex flex-col gap-4 mt-4 sm:flex-row">
              <a
                href="https://www.linkedin.com/in/tu-usuario/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 font-sans font-semibold transition-transform shadow-md rounded-xl bg-purpleButton-400 text-whiteHeadline-500 hover:bg-purpleButton-300 hover:scale-105"
              >
                <FaLinkedin size={22} />
                <span>LinkedIn</span>
              </a>

              <a
                href="mailto:tu-correo@ejemplo.com"
                className="flex items-center gap-2 px-6 py-3 font-sans font-semibold transition-transform shadow-md rounded-xl bg-secondaryBackground-400 text-whiteHeadline-500 hover:bg-secondaryBackground-200 hover:scale-105"
              >
                <FaEnvelope size={22} />
                <span>Email</span>
              </a>
            </div>
          </div>
        </EffectsWrapper>
      </div>
    </section>
  );
};

export default ContactSection;






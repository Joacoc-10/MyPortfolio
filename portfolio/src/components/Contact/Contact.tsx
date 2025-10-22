"use client";
import { FaLinkedin, FaEnvelope } from "react-icons/fa";
import EffectsWrapper from "@/components/EffectsWrapper";
import { useRef, useEffect, useState } from "react";
import ScrollFloat from "../ScrollFloat";
import { useLanguage } from "@/context/LanguageContext";

const ContactSection = () => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

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
      <ScrollFloat
        animationDuration={1.5}
        ease="power3.out"
        scrollStart="top bottom-=230"
      >
        <div className="container flex justify-center px-4 mx-auto mt-32">
          <EffectsWrapper particleCount={12}>
            <div
              ref={cardRef}
              className={`
              relative max-w-3xl w-full bg-secondaryBackground-500 bg-opacity-90 border border-esmeraldButton-500
              rounded-2xl shadow-2xl p-10 flex flex-col items-center text-center space-y-6
              transition-transform duration-500  ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }
              hover:scale-105 
            `}
              style={{
                boxShadow:
                  "0 0 15px rgba(1, 130, 138, 0.5), 0 0 30px rgba(1, 170, 180, 0.4)",
              }}
            >
              <h2 className="text-4xl font-extrabold md:text-5xl text-whiteHeadline-500 font-lexend">
                {t("¿Tienes un proyecto en mente?")}
              </h2>
              <p className="max-w-xl font-sans text-lg text-greyParagraph-500">
               {t("Me encantaría ayudarte a hacerlo realidad. Ponte en contacto conmigo y hablemos sobre tu idea.")}
              </p>

              <div className="flex flex-col gap-4 mt-4 sm:flex-row">
                <a
                  href="https://www.linkedin.com/in/j-coding/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 font-sans font-semibold transition-transform shadow-md rounded-xl bg-esmeraldButton-400 text-whiteHeadline-500 hover:bg-esmeraldButton-300 hover:scale-105"
                >
                  <FaLinkedin size={22} />
                  <span>LinkedIn</span>
                </a>

                <a
                  href="mailto:joacoc-10@hotmail.com"
                  className="flex items-center gap-2 px-6 py-3 font-sans font-semibold transition-transform shadow-md rounded-xl bg-secondaryBackground-400 text-whiteHeadline-500 hover:bg-secondaryBackground-200 hover:scale-105"
                >
                  <FaEnvelope size={22} />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </EffectsWrapper>
        </div>
      </ScrollFloat>
    </section>
  );
};

export default ContactSection;

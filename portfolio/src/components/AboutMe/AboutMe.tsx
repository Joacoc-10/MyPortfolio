"use client";
import React from "react";
import Image from "next/image";
// import { FaEnvelope } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";

const AboutMe = () => {
  const { t } = useLanguage();

  return (
    <section id="AboutMe">
      <div className="container px-4 py-12 mx-auto md:px-0">
        <div className="flex flex-col items-center grid-cols-1 md:grid md:grid-cols-2 md:gap-12">
          {/* Mi foto */}
          <div className="flex items-center justify-center p-4 mb-8 md:p-8 md:mb-0">
            <div
              className="w-64 overflow-hidden border-4 rounded-full shadow-lg bg-blackPrimary-100/30 h-88 border-esmeraldButton-500"
              style={{
                boxShadow:
                  "0 0 15px rgba(1, 130, 138, 0.5), 0 0 30px rgba(1, 170, 180, 0.4)",
              }}
            >
              <Image
                src="https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/36507850-FEF9-4BB5-A425-3FE29636C98A%202-Photoroom.png?updatedAt=1759089604038"
                alt="Joaquín, Full-Stack Developer"
                width={256}
                height={256}
                className="object-cover w-full h-full "
              />
            </div>
          </div>

          {/* Seccion sobre mi  */}
          <div className="flex flex-col space-y-4 text-center md:pr-12 md:text-left">
            <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-6xl text-whiteHeadline-500 font-lexend">
              {t("Sobre mí")}
            </h2>
            <p className="font-sans text-lg leading-relaxed text-whiteHeadline-500 ">
              &quot;{t("Soy Joaquín, un")} <strong> {t("Desarrollador Full Stack")} </strong>
              {t("con un fuerte enfoque en Front-End y la creación de experiencias digitales intuitivas y funcionales. Comencé desde cero en el bootcamp intensivo de Henry, y desde entonces descubrí una pasión por aprender y dedicarme al código con curiosidad y entusiasmo.")}
            </p>
            <p className="font-sans text-lg leading-relaxed text-whiteHeadline-500">
             {t("Me considero empático, detallista, comprometido y con muchas ganas de crecer constantemente. Disfruto trabajar en equipos dinámicos, aportar ideas y seguir desarrollando mis habilidades. Puedo aportar soluciones concretas en proyectos a la vez que sigo aprendiendo de profesionales experimentados y colaborando activamente, mientras construyo mi carrera en tecnología.")}&quot;
            </p>

            {/* Call to action  */}
            <div className="flex flex-col items-center justify-center pt-10 space-y-2 font-sans md:space-x-4 md:space-y-0 text-greyParagraph-500">
              <h4>{t("¡Estoy listo para empezar un nuevo proyecto!")}</h4>
              <a
                href="mailto:joacoc-10@hotmail.com"
                className="flex items-center gap-2 pt-4 font-semibold hover:text-esmeraldButton-400 link-underline"
              >
                {t("Conectemos")}
                {/* <FaEnvelope /> */}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMe;

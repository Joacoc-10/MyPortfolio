import React from "react";
import Image from "next/image";
import { FaEnvelope } from "react-icons/fa";

const AboutMe = () => {
  return (
    <section id="AboutMe">
      <div className="container px-4 py-12 mx-auto md:px-0">
        <div className="flex flex-col items-center grid-cols-1 md:grid md:grid-cols-2 md:gap-12">
          
          {/* Mi foto */}
          <div className="flex items-center justify-center p-4 mb-8 md:p-8 md:mb-0">
            <div
              className="w-64 overflow-hidden border-4 rounded-full shadow-lg bg-blackPrimary-100/30 h-88 border-purpleButton-500"
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
              Sobre mí.
            </h2>
            <p className="font-sans text-lg leading-relaxed text-whiteHeadline-500 ">
              "Soy Joaquín, un <strong> Desarrollador Full Stack </strong> con
              un fuerte enfoque en
              <strong> Front-End </strong> y la creación de
              <strong> experiencias digitales intuitivas y funcionales</strong>.
              Comencé desde cero en el
              <strong> bootcamp intensivo de Henry</strong>, y desde entonces
              descubrí una pasión por <strong>aprender</strong> y dedicarme al
              <strong> código</strong> con <strong>curiosidad</strong> y
              <strong> entusiasmo</strong>.
            </p>
            <p className="font-sans text-lg leading-relaxed text-whiteHeadline-500">
              Me considero <strong>empático</strong> ,
              <strong> detallista</strong>, <strong>comprometido</strong> y con
              muchas <strong>ganas de crecer constantemente</strong>. Disfruto
              trabajar en <strong>equipos dinámicos</strong>,{" "}
              <strong>aportar ideas</strong> y seguir desarrollando mis{" "}
              <strong>habilidades</strong>. Puedo{" "}
              <strong>aportar soluciones concretas en proyectos</strong> a la
              vez que sigo{" "}
              <strong>aprendiendo de profesionales experimentados</strong> y
              colaborando activamente, mientras construyo{" "}
              <strong>mi carrera en tecnología</strong>."
            </p>

            {/* Call to action  */}
            <div className="flex flex-col items-center justify-center pt-12 space-y-2 font-sans md:flex-row md:space-x-4 md:space-y-0 text-greyParagraph-500">
              <h4>
              ¡Estoy listo para empezar un nuevo proyecto!
              </h4>
              <a
                href="mailto:joacoc-10@hotmail.com"
                className="flex items-center gap-2 hover:text-purpleButton-400 link-underline"
              >
                ¡Conectemos!
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

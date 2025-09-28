import React from "react";
import Image from "next/image";

const AboutMe = () => {
  return (
    <section id="AboutMe">
      <div className="container px-4 py-12 mx-auto md:px-0">
        <div className="grid items-center grid-cols-1 md:grid-cols-2 md:gap-12">
          <div className="items-center justify-center hidden p-8 md:flex">
            <div className="w-64 overflow-hidden border-4 rounded-full shadow-lg h-82 border-purpleButton-500">
              <Image
                src="https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/36507850-FEF9-4BB5-A425-3FE29636C98A%202.jpg?updatedAt=1759064561805"
                alt="Joaquín, Full-Stack Developer"
                width={256}
                height={256}
                className="object-cover w-full h-full "
              />
            </div>
          </div>

          <div className="flex flex-col space-y-4 text-center md:pr-12">
            <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-6xl text-whiteHeadline-500 font-lexend">
              Sobre mí.
            </h2>
            <p className="font-sans text-lg leading-relaxed text-whiteHeadline-500">
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
              trabajar en <strong>equipos dinámicos</strong>, <strong>aportar ideas</strong> y seguir
              desarrollando mis <strong>habilidades</strong>. Puedo <strong>aportar soluciones concretas
              en proyectos</strong> a la vez que sigo <strong>aprendiendo de profesionales
              experimentados</strong> y colaborando activamente, mientras construyo <strong>mi
              carrera en tecnología</strong>."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMe;

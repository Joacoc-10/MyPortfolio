import React from "react";
import Image from "next/image";

const AboutMe = () => {
  return (
    <section id="AboutMe">
    <div className="container px-4 py-12 mx-auto md:px-0">
      <div className="grid items-center grid-cols-1 md:grid-cols-2 md:gap-12">
        <div className="items-center justify-center hidden p-8 md:flex">
          <div className="w-64 overflow-hidden border-4 shadow-lg h-82 border-purpleButton-500">
            <Image
              src="https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/IMG_7124.jpg?updatedAt=1757089382845"
              alt="Joaquín, Full-Stack Developer"
              width={256}
              height={256}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        <div className="flex flex-col space-y-4 text-center md:pr-12">
          <h2 className="mb-4 text-2xl font-bold tracking-tight md:text-6xl text-whiteHeadline-500 font-lexend">
            Sobre mí.
          </h2>
          <p className="font-sans text-lg leading-relaxed text-whiteHeadline-500">
            "Soy Joaquín, un <strong>desarrollador Full-Stack</strong> con una
            gran pasión por el 
            <strong> Front-End</strong>. Mi camino en la tecnología comenzó en el
            Bootcamp de Henry, donde adquirí un sólido conocimiento en{" "}
            <strong>React</strong> y <strong>Next.js</strong>. Lo que más me
            motiva es convertir ideas en experiencias digitales que no solo
            funcionen a la perfección, sino que también sean intuitivas y
            visualmente atractivas.
          </p>
          <p className="font-sans text-lg leading-relaxed text-whiteHeadline-500">
            Más allá del código, mi experiencia como líder de equipo en mi
            proyecto final me enseñó el valor de la <strong>comunicación</strong> y
            el poder de la <strong>colaboración</strong>. Hoy, mi objetivo es seguir creciendo,
            aportando mi energía y dedicación para crear productos que marquen
            la diferencia."
          </p>
        </div>
      </div>
    </div>
    </section>
  );
};

export default AboutMe;

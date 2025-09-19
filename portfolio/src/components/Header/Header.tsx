import React from "react";
import DarkVeil from "./DarkVeil";

const Header = () => {
  return (
    <>
      <section id="Header">
        <div className="relative w-full h-[650px]">
          <DarkVeil />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1
              className="text-white text-xl font-bold  md:text-3xl font-lexend text-center max-w-[70%] leading-relaxed my-0"
              // className="mb-4 text-2xl font-bold tracking-tight md:text-6xl text-whiteHeadline-500 font-lexend"
            >
              “El futuro no se encuentra, se diseña. Somos arquitectos de <br />{" "}
              lo que elegimos hacer real.”
              {/* Desarrollador Full-Stack */}
            </h1>
          </div>
        </div>
      </section>
    </>
  );
};

export default Header;

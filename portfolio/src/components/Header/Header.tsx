import React from "react";
import DarkVeil from "./DarkVeil";


const Header = () => {

  return (
    <>
     <div className="relative w-full h-[650px]">
        <DarkVeil />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white text-xl md:text-3xl font-serif text-center max-w-[70%] leading-relaxed my-0">
            “El futuro no se encuentra, se diseña. Somos arquitectos de lo que imaginamos y de lo que elegimos hacer real.”
          </h1>
        </div>
      </div>
    </>
  )
}

export default Header;
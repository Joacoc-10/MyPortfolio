import React from "react";
import DarkVeil from "./DarkVeil";
import RotatingText from "../RotatingText";

const Header = () => {
  
  const professionalTexts = [
    "aplicaciones web modernas.",
    "plataformas digitales escalables.",
    "soluciones tecnológicas completas.",
    "experiencias web intuitivas.",
  ];

  return (
    <>
      <section id="Header">
        <div className="relative w-full h-[650px]">
          
          <DarkVeil hueShift={48} /> 
          <div className="absolute inset-0 flex items-center justify-center">
            
            {/* CONTENEDOR PRINCIPAL DEL TÍTULO */}
            <h1
              className="text-whiteHeadline-500 text-4xl font-extrabold md:text-6xl font-lexend text-center max-w-[90%] leading-tight flex flex-wrap justify-center mx-auto"
            >
              
              <span className="mr-3 shadow-reflector">Desarrollo</span>
              
              
              <div className="h-32 overflow-hidden md:h-24"> 
                <RotatingText
                  texts={professionalTexts}
                  rotationInterval={4500} // Lento: 4.5 segundos por frase
                  staggerDuration={0.03}
                  animatePresenceMode="wait"
                  mainClassName="text-purpleButton-500 font-lexend"
                  elementLevelClassName="shadow-reflector" 
                />
              </div>
              
            </h1>
          </div>
        </div>
      </section>
    </>
  );
};

export default Header;

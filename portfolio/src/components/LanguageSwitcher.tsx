"use client";

import { useLanguage } from "../context/LanguageContext";

const LanguageSwitcher = () => {
  const { isEnglish, toggleLanguage } = useLanguage();

  const activeClasses = "font-sans text-gray-800 font-semibold text-whiteHeadline-100 bg-gray-500"; // Clases para el lado activo (gris claro)
  const inactiveClasses = "font-sans font-semibold  text-whiteHeadline-500 hover:bg-gray-600"; // Clases para el lado inactivo (gris oscuro)

  return (
    <div className="fixed z-50 top-4 right-4"> {/* Contenedor para posicionamiento y z-index */}
      <div
        className="flex overflow-hidden border border-gray-400 rounded-lg" // Contenedor del switch
        style={{ width: '120px' }} // Ancho fijo para el switch
      >
        {/* Botón para Español */}
        <button
          onClick={() => isEnglish && toggleLanguage()} // Solo cambia si está en inglés
          className={`flex-1 flex items-center justify-center py-2 text-sm transition-colors duration-200 ease-in-out
                      ${!isEnglish ? activeClasses : inactiveClasses}`} // Si NO es inglés, es activo
          title="Cambiar a Español"
        >
          {/* Bandera de España */}
          <span role="img" aria-label="Bandera de España" className="mr-1 text-base">🇪🇸</span>
          <span className="hidden sm:inline">ES</span> {/* Mostrar "ES" en pantallas más grandes */}
        </button>

        {/* Botón para Inglés */}
        <button
          onClick={() => !isEnglish && toggleLanguage()} // Solo cambia si está en español
          className={`flex-1 flex items-center justify-center py-2 text-sm transition-colors duration-200 ease-in-out
                      ${isEnglish ? activeClasses : inactiveClasses}`} // Si es inglés, es activo
          title="Switch to English"
        >
          {/* Bandera de EE.UU. */}
          <span role="img" aria-label="Bandera de Estados Unidos" className="mr-1 text-base">🇺🇸</span>
          <span className="hidden sm:inline">EN</span> {/* Mostrar "EN" en pantallas más grandes */}
        </button>
      </div>
    </div>
  );
}

export default LanguageSwitcher;
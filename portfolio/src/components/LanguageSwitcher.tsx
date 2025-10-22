"use client";

import { useState, useRef, useEffect } from "react";
import { GrLanguage } from "react-icons/gr";
import { useLanguage } from "../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

const LanguageSwitcher = () => {
  const { isEnglish, toggleLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleLanguageChange = (lang: "en" | "es") => {
    if ((lang === "en" && !isEnglish) || (lang === "es" && isEnglish)) {
      toggleLanguage();
    }
    setIsClosing(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedInsideMenu =
        menuRef.current && menuRef.current.contains(event.target as Node);
      const clickedOnButton =
        buttonRef.current && buttonRef.current.contains(event.target as Node);

      if (open && !clickedInsideMenu && !clickedOnButton) {
        setIsClosing(true);
      }
    };

    const handleScroll = () => {
      if (open) {
        setIsClosing(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [open]); 

  useEffect(() => {
    if (!isClosing) return;

    const timer = setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [isClosing]); 

  const toggleMenu = () => {
    if (open) {
      setIsClosing(true);
    } else {
      setOpen(true);
    }
  };

  return (
    <div className="fixed z-50 top-4 right-4">
      <div className="relative">
        {/* Botón principal con el icono */}
        <button
          ref={buttonRef}
          onClick={toggleMenu}
          className="p-2 text-white transition rounded-full hover:text-esmeraldButton-300"
          title="Change language"
        >
          <GrLanguage className="text-xl" size={22} />
        </button>

        {/* Menú desplegable con animaciones */}
        <AnimatePresence>
          {(open || isClosing) && (
            <motion.div
              ref={menuRef}
              key="language-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{
                opacity: isClosing ? 0 : 1,
                y: isClosing ? -10 : 0,
                transition: { duration: 0.4, ease: "easeOut" },
              }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 overflow-hidden font-sans font-semibold text-white border border-gray-600 rounded-lg shadow-lg"
            >
              <button
                onClick={() => handleLanguageChange("es")}
                className={`w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-white/10 transition ${
                  !isEnglish ? "text-esmeraldButton-300" : ""
                }`}
              >
                🇪🇸 <span>ES</span>
              </button>
              <button
                onClick={() => handleLanguageChange("en")}
                className={`w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-white/10 transition ${
                  isEnglish ? "text-esmeraldButton-300" : ""
                }`}
              >
                🇺🇸 <span>EN</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LanguageSwitcher;





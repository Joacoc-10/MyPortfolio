"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import en from "../translations/en.json";

type Translations = Record<string, string>;

type LanguageContextType = {
  isEnglish: boolean;
  toggleLanguage: () => void;
  t: (spanishText: string) => string;
};

const englishTranslations = en as Translations;

const LanguageContext = createContext<LanguageContextType>({
  isEnglish: false,
  toggleLanguage: () => {},
  t: (text) => text,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [isEnglish, setIsEnglish] = useState(false);

  const toggleLanguage = () => setIsEnglish((prev) => !prev);

  const t = (spanishText: string) => {
    if (isEnglish && englishTranslations[spanishText])
      return englishTranslations[spanishText];
    return spanishText;
  };

  return (
    <LanguageContext.Provider value={{ isEnglish, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);


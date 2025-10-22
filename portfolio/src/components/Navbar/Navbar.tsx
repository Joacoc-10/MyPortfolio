"use client";
import React, { useState, useRef, useEffect } from "react";
import NavbarItem from "./NavbarItem";
import { NavbarLinks } from "@/constants/Navbar";
import Link from "next/link";
import Image from "next/image";
import SocialMedia from "../SocialMedia/SocialMedia";
import LanguageSwitcher from "../LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleScroll = () => {
      if (isMenuOpen) setIsMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b bg-black/60 backdrop-blur-md border-black/30">
      <div className="flex items-center justify-between max-w-screen-xl px-6 py-3 mx-auto">

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image
            src="https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/White%20logo%20-%20no%20background.png?updatedAt=1757084781230"
            alt="JCoding"
            width={160}
            height={80}
            className="w-[140px] lg:w-[160px] transition-all"
          />
        </Link>

        {/* Links solo pantallas grandes */}
        <div className="justify-center flex-grow hidden font-sans font-semibold xl:flex">
          <ul className="flex space-x-6 list-none">
            {NavbarLinks.map((item) => (
              <NavbarItem
                key={item.label}
                label={t(item.label)}
                href={item.href}
              />
            ))}
          </ul>
        </div>

        {/* Iconos sociales visibles ≥778px  */}
        <div className="items-center justify-center flex-grow hidden md:flex xl:hidden">
          <SocialMedia />
        </div>

        {/* Social + Idioma en xl */}
        <div className="items-center hidden space-x-4 xl:flex">
          <SocialMedia />
          <LanguageSwitcher />
        </div>

        {/* Botón hamburguesa hasta 1299px */}
        <button
          ref={buttonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white bg-transparent xl:hidden focus:outline-none hover:text-esmeraldButton-500 focus:text-esmeraldButton-500"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>
      </div>

      {/* Menú hamburguesa hasta 1299px */}
      <div
        ref={menuRef}
        className={`xl:hidden ${isMenuOpen ? "max-h-96" : "max-h-0"} w-full bg-black/60 backdrop-blur-md overflow-hidden transition-all duration-500 ease-in-out`}
      >
        {/* Links dentro del menú */}
        <ul className="flex flex-col items-center py-4 space-y-4 font-sans list-none">
          {NavbarLinks.map((item) => (
            <NavbarItem
              key={item.label}
              label={t(item.label)}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
            />
          ))}
        </ul>

        {/* Social + Language solo <778px */}
        <div className="flex flex-col items-center justify-center pb-4 space-y-4 text-white sm:hidden">
          <SocialMedia />
          <LanguageSwitcher />
        </div>

        <div className="flex-col items-center justify-center hidden pb-4 text-white sm:flex md:flex xl:hidden">
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;





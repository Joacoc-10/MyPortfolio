// src/components/Footer.tsx
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";
import { TbFileCv } from "react-icons/tb";
import { socialLinks } from "@/helpers/SocialMedia";

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "LinkedIn":
      return FaLinkedin;
    case "GitHub":
    case "Email":
      return FaEnvelope;
    case "CV":
      return TbFileCv;
    default:
      return null;
  }
};

const Footer = () => {
  return (
    <>
      <footer className="relative m-4 font-sans rounded-lg bg-whiteHeadline-400">
        <div className="absolute inset-0 rounded-lg bg-white/80"></div>
        <div className="w-full max-w-screen-xl p-4 mx-auto md:py-8">
          {/* Add 'justify-center' for mobile alignment */}
          <div className="flex flex-col items-center justify-between sm:flex-row">
            {/* Logo a la izquierda */}
            {/* Remove 'w-full' from this Link */}
            <Link
              href="/"
              className="flex items-center justify-center space-x-3 invert rtl:space-x-reverse sm:w-auto sm:justify-start"
            >
              <Image
                src="https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/White%20logo%20-%20no%20background.png?updatedAt=1757084781230"
                alt="JCoding"
                width={160}
                height={80}
              />
            </Link>
            {/* Lista de enlaces centrada */}
            <ul className="flex flex-wrap items-center mt-4 text-sm font-medium text-greySecondary-500 sm:mb-0 sm:mt-0">
              <li>
                <a href="#AboutMe" className="relative transition-colors duration-300 link-underline me-4 md:me-6 hover:text-greySecondary-600">
                  Sobre mí
                </a>
              </li>
              <li>
                <a href="#SkillSection" className="relative transition-colors duration-300 link-underline me-4 md:me-6 hover:text-greySecondary-600">
                  Habilidades
                </a>
              </li>
              <li>
                <a href="#ProjectsSection" className="relative transition-colors duration-300 link-underline me-4 md:me-6 hover:text-greySecondary-600">
                  Proyectos
                </a>
              </li>
              <li>
                <a href="#" className="relative transition-colors duration-300 link-underline hover:text-greySecondary-600">
                  Contacto
                </a>
              </li>
            </ul>
            {/* Íconos de redes sociales a la derecha */}
            {/* Remove 'w-full' from this div */}
            <div className="relative flex items-center justify-center mt-4 space-x-4 sm:w-auto sm:justify-end sm:mt-0">
              {socialLinks
                .filter((item) => !item.subLinks)
                .map((item) => {
                  const IconComponent = getIcon(item.name);
                  return (
                    <Link
                      key={item.name}
                      href={item.href || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors duration-300 text-blackPrimary-400 hover:text-blackPrimary-600"
                    >
                      {IconComponent && <IconComponent size={24} />}
                    </Link>
                  );
                })}
            </div>
          </div>
          <hr className="my-4 border-greySecondary-400 sm:mx-auto lg:my-2" />
          <span className="relative block text-center text-greySecondary-500 text-md sm:text-center ">
            © 2025
            <Link href="/" className="link-underline">
              JCoding
            </Link>
            . Todos los derechos reservados.
          </span>
        </div>
      </footer>
    </>
  );
};

export default Footer;

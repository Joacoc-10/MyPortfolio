// src/components/Footer.tsx
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  FaLinkedin,
  FaGithub,
  FaEnvelope,
} from "react-icons/fa";
import { TbFileCv } from "react-icons/tb";
import { socialLinks } from "@/helpers/SocialMedia";

// Función para obtener el componente de ícono
const getIcon = (iconName: string) => {
  switch (iconName) {
    case "LinkedIn":
      return FaLinkedin;
    case "GitHub":
      return FaGithub;
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
      <footer className="m-4 font-sans rounded-lg bg-whiteHeadline-600">
        <div className="w-full max-w-screen-xl p-4 mx-auto md:py-8">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            {/* Logo a la izquierda */}
            <Link
              href="/"
              className="flex items-center justify-center w-full space-x-3 invert rtl:space-x-reverse sm:w-auto sm:justify-start"
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
            <div className="flex items-center justify-center w-full mt-4 space-x-4 sm:w-auto sm:justify-end sm:mt-0">
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
          <hr className="my-6 border-greySecondary-400 sm:mx-auto lg:my-8" />
          <span className="block text-greySecondary-500 text-md sm:text-center ">
            © 2025
            <Link href="/" className=" link-underline">
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

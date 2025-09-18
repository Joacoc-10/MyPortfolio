// src/components/SocialMedia/SocialMedia.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";
import { socialLinks } from "@/helpers/SocialMedia";
import { IoDocumentText } from "react-icons/io5";

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "LinkedIn":
      return FaLinkedin;
    case "GitHub":
      return FaGithub;
    case "CV":
      return IoDocumentText;
    case "Email":
      return FaEnvelope;
    default:
      return null;
  }
};

const SocialMedia = () => {
  const [isCvMenuOpen, setIsCvMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsCvMenuOpen(false);
      }
    };
    
    const handleScroll = () => {
      setIsCvMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [menuRef]);

  return (
    <div className="items-center hidden space-x-5 md:flex">
      {socialLinks.map((item) => {
        const IconComponent = getIcon(item.name);
        return (
          <div key={item.name} className="relative">
            {item.subLinks ? (
              <div ref={menuRef}>
                <span
                  onClick={() => setIsCvMenuOpen(!isCvMenuOpen)}
                  className="text-white cursor-pointer hover:text-purpleButton-300"
                >
                  {IconComponent && <IconComponent size={30} />}
                </span>
                
                <div
                  className={`absolute left-1/2 -translate-x-1/2 z-50 p-2 mt-2 w-56 rounded-lg ${
                    isCvMenuOpen ? 'block' : 'hidden'
                  }`}
                >
                  {isCvMenuOpen && (
                    <div className="flex justify-around gap-2">
                      <Link
                        key={item.subLinks[0].label}
                        href={item.subLinks[0].href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10"
                        style={{
                          animation: "slideInFromLeft 0.6s ease-out forwards",
                        }}
                      >
                        <IoDocumentText size={25} className="text-white" />
                        <span className="mt-1 font-sans text-xs font-medium text-center text-white whitespace-nowrap">
                          {item.subLinks[0].label}
                        </span>
                      </Link>

                      <Link
                        key={item.subLinks[1].label}
                        href={item.subLinks[1].href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10"
                        style={{
                          animation: "slideInFromRight 0.6s ease-out forwards",
                        }}
                      >
                        <IoDocumentText size={25} className="text-white" />
                        <span className="mt-1 font-sans text-xs font-medium text-center text-white whitespace-nowrap">
                          {item.subLinks[1].label}
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href={item.href || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-purpleButton-300"
              >
                {IconComponent && <IconComponent size={24} />}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SocialMedia;
import React from "react";
import NavbarItem from "./NavbarItem";
import { NavbarLinks } from "@/constants/Navbar";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  return (
    <>
      <nav className="fixed top-0 left-0 z-50 w-full border-b bg-black/60 backdrop-blur-md border-black/30">
        <div className="flex items-center justify-between max-w-screen-xl px-6 py-3 mx-auto">
          {/* Logo a la izquierda */}
          <Link
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            {/* <Image
              src="https://ik.imagekit.io/i1pxujmp5t/My%20Portfolio/ChatGPT%20Image%204%20sept%202025,%2008_47_58%20p.m..png?updatedAt=1757011993978"
              alt="Joacode"
              width={80}
              height={30}
            /> */}
            <span className="text-2xl font-semibold text-white">Joacode</span>
          </Link>

          {/* Links a la derecha */}
          <ul className="flex ml-auto space-x-6 list-none">
            {NavbarLinks.map((item) => (
              <NavbarItem
                key={item.label}
                label={item.label}
                href={item.href}
              />
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;

import { NavbarItemProps } from "@/components/Navbar/NavbarItem";
import { Routes } from "@/routes";

export const NavbarLinks: NavbarItemProps[] = [
  {
    label: "Inicio",
    href: Routes.Header,
  },
  {
    label: "Sobre mí",
    href: Routes.AboutMe,
  },
  {
    label: "Habilidades",
    href: Routes.SkillSection,
  },
  {
    label: "Contacto",
    href: Routes.Contact,
  },
];

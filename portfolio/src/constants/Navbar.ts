import { NavbarItemProps } from "@/components/Navbar/NavbarItem";
import { Routes } from "@/routes";

export const NavbarLinks: NavbarItemProps[] = [
  {
    label: "Sobre mí",
    href: Routes.AboutMe,
  },
  {
    label: "Habilidades",
    href: Routes.SkillSection,
  },
  {
    label: "Proyectos",
    href: Routes.Projects,
  },
   {
    label: "Contacto",
    href: Routes.Contact,
  },
];

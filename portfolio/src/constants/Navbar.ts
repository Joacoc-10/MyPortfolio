import { NavbarItemProps } from "@/components/Navbar/NavbarItem";
import { Routes } from "@/routes";


export const NavbarLinks: NavbarItemProps[] = [
  {
    label: "Inicio",
    href: Routes.home,
  },
  {
    label: "Perfil",
    href: Routes.profile,
  },
  {
    label: "Contacto",
    href: Routes.contact,
  },
]
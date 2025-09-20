"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { FC } from "react";
import cs from "classnames";

export interface NavbarItemProps {
  label: string;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavbarItem: FC<NavbarItemProps> = ({
  label,
  href = "#",
  isActive = false,
}) => {
  const pathname = usePathname();
  const isCurrentPage = pathname === href;

  return (
    <>
      <li>
        <Link
          href={href}
          className={cs(
            "relative link-underline transition-colors duration-300",
            " font-sans block py-1 px-3 text-white rounded-sm",
            (isActive || isCurrentPage)
              ? "text-purpleButton-400"
              : "hover:text-purpleButton-400"
          )}
        >
          {label}
        </Link>
      </li>
    </>
  );
};

export default NavbarItem;

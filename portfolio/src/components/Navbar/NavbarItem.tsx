"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { FC } from "react";
import cs from "classnames";

export interface NavbarItemProps {
  label: string;
  href?: string;
  isActive?: boolean;
}

const NavbarItem: FC<NavbarItemProps> = ({
  label,
  href = "#",
  isActive = false,
}) => {
  const pathname = usePathname();
  const isCurrentPage= pathname === href;

  return (
    <>
    <li>
        <Link
          href={href}
          className={cs(
            "block py-2 px-3 text-white rounded-sm ",
            (isActive || isCurrentPage) &&
              "block py-2 px-3 text-black rounded-sm"
          )}
        >
          {label}
        </Link>
      </li>
    </>
  )
}

export default NavbarItem;
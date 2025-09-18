// src/components/TechHover.tsx
"use client";
import React, { useState } from 'react';
import Image from 'next/image';

interface ITechHoverProps {
  title: string;
  src: string;
}

const TechHover: React.FC<ITechHoverProps> = ({ title, src }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center justify-center p-2 transition-transform ease-in-out duration-600"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={src}
        alt={title}
        width={48}
        height={48}
        className={`transition-all duration-300 ease-in-out ${
          isHovered ? 'grayscale-0' : 'grayscale invert'
        }`}
      />
      <span
        // La opacidad del texto cambia según el estado 'isHovered'
        className={`absolute bottom-[-1.5rem] text-sm text-gray-200 font-medium font-sans whitespace-nowrap transition-opacity duration-300 ease-in-out ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {title}
      </span>
    </div>
  );
};

export default TechHover;

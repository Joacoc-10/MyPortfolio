// src/components/AnimatedNumber.tsx
"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Define the interface for the component's props
interface AnimatedNumberProps {
  value: number;
  className: string;
  label: string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, className, label }) => {
  return (
    <div className="flex flex-col items-center">
      <AnimatePresence mode="wait"> 
        <motion.span
          key={value}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={className}
        >
          {value}
        </motion.span>
      </AnimatePresence>
      <span className="mt-2 text-sm font-normal text-gray-400">{label}</span>
    </div>
  );
};

export default AnimatedNumber;

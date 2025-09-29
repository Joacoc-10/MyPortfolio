"use client";
import React, { useEffect, useRef, ReactNode, RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollFloatProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement>;
  containerClassName?: string;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
}

const ScrollFloat: React.FC<ScrollFloatProps> = ({
  children,
  scrollContainerRef,
  containerClassName = "",
  animationDuration = 1.5, 
  ease = "power3.out", 
  scrollStart = "top bottom-=100",
  scrollEnd = "center center",
}) => {
  const containerRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller =
      scrollContainerRef && scrollContainerRef.current
        ? scrollContainerRef.current
        : window; 

    const anim = gsap.fromTo(
      el,
      {
        willChange: "opacity, transform",
        opacity: 0,
        y: 100, 
        scale: 0.95, 
      },
      {
        duration: animationDuration,
        ease: ease,
        opacity: 1,
        y: 0,
        scale: 1,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: scrollStart,
          end: scrollEnd,
          scrub: true, 
        },
      }
    ); 

    return () => {
      anim.kill();
    };
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd]);

  return (
    
    <div ref={containerRef} className={`${containerClassName}`}>
            {children}   {" "}
    </div>
  );
};

export default ScrollFloat;

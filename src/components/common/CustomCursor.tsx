import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth spring movement
  const mouseX = useSpring(0, { damping: 30, stiffness: 350, mass: 0.4 });
  const mouseY = useSpring(0, { damping: 30, stiffness: 350, mass: 0.4 });

  useEffect(() => {
    // Hide completely on touch devices or reduced motion
    if (
      window.matchMedia('(hover: none) and (pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('a, button, input, textarea, select, [role="button"], [data-cursor-interactive]');
      setIsHovered(!!interactive);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="custom-cursor">
      {/* 32px Outer Ring with 1px Navy / 40% Border, scales ~1.6 on interactive */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border border-[#0B2A4A]/40"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
          width: 32,
          height: 32,
        }}
        animate={{
          scale: isHovered ? 1.6 : 1,
          borderColor: isHovered ? '#1D4ED8' : 'rgba(11, 42, 74, 0.4)',
          backgroundColor: isHovered ? 'rgba(29, 78, 216, 0.05)' : 'transparent',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      />

      {/* 6px Navy Center Dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000] rounded-full bg-[#0B2A4A]"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
          width: 6,
          height: 6,
        }}
        animate={{
          scale: isHovered ? 0.75 : 1,
          backgroundColor: isHovered ? '#1D4ED8' : '#0B2A4A',
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 450 }}
      />
    </div>
  );
};

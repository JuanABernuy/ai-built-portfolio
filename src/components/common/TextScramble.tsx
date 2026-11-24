import React, { useEffect, useState, useRef } from 'react';

interface TextScrambleProps {
  text: string;
  className?: string;
  duration?: number;
  trigger?: any;
}

const GLYPHS = '01#%&*+=-~<>_[]{}0101XYZ';

export const TextScramble: React.FC<TextScrambleProps> = ({
  text,
  className = '',
  duration = 800,
  trigger,
}) => {
  const [displayText, setDisplayText] = useState(text);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    // If user prefers reduced motion, skip scramble
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayText(text);
      return;
    }

    let startTime = performance.now();
    const length = text.length;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Number of resolved characters from the left
      const resolvedCount = Math.floor(progress * length);

      let scrambled = '';
      for (let i = 0; i < length; i++) {
        if (text[i] === ' ') {
          scrambled += ' ';
        } else if (i < resolvedCount) {
          scrambled += text[i];
        } else {
          scrambled += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }

      setDisplayText(scrambled);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [text, duration, trigger]);

  return <span className={className}>{displayText}</span>;
};

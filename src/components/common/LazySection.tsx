import React, { Suspense, useEffect, useRef, useState } from 'react';
import { LOAD_ALL_EVENT } from '../../lib/askAI';

/**
 * Renders a lazily-loaded section only when it gets close to the viewport
 * (or when its anchor is targeted), reserving space to avoid layout shift.
 */
export const LazySection: React.FC<{
  id: string;
  minHeight: number;
  children: React.ReactNode;
  rootMargin?: string;
  /** Extra hash prefixes that should load this section immediately (deep links). */
  hashPrefixes?: string[];
}> = ({ id, minHeight, children, rootMargin = '800px 0px', hashPrefixes = [] }) => {
  const ref = useRef<HTMLElement>(null);
  const targeted = () =>
    window.location.hash === `#${id}` || hashPrefixes.some(p => window.location.hash.startsWith(`#${p}`));
  const [show, setShow] = useState(() => typeof window !== 'undefined' && targeted());

  useEffect(() => {
    if (show || !ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(ref.current);
    const onHash = () => targeted() && setShow(true);
    const onLoadAll = () => setShow(true);
    window.addEventListener('hashchange', onHash);
    window.addEventListener(LOAD_ALL_EVENT, onLoadAll);
    return () => {
      io.disconnect();
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener(LOAD_ALL_EVENT, onLoadAll);
    };
  }, [show, id, rootMargin]);

  const placeholder = <section id={id} ref={ref} style={{ minHeight }} aria-busy="true" />;
  return show ? <Suspense fallback={<section id={id} style={{ minHeight }} aria-busy="true" />}>{children}</Suspense> : placeholder;
};

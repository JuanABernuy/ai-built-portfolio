import React, { useEffect, useRef } from 'react';

/**
 * Quiet "data network" background for the hero, drawn with Canvas 2D.
 * Same look as the former Three.js version (~40 drifting nodes, faint links,
 * subtle 3D parallax with the mouse) at a fraction of the weight.
 * - Pauses when the hero is off-screen or the tab is hidden.
 * - Disabled on small screens and with prefers-reduced-motion.
 */

type Node = { x: number; y: number; z: number; r: number; color: string; speed: number; phase: number };

const NODE_COUNT = 40;
const LINK_DIST = 3.4; // in "world" units, same as the 3D version
const COLORS = ['11, 42, 74', '29, 78, 216']; // navy, steel blue (rgb)

export const HeroNetwork3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.style.display = 'none';
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Build the graph once (world space roughly 14 x 8.5 x 5, like before)
    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
      x: (Math.random() - 0.5) * 14,
      y: (Math.random() - 0.5) * 8.5,
      z: (Math.random() - 0.5) * 5,
      r: Math.random() * 0.08 + 0.04,
      color: COLORS[Math.random() > 0.5 ? 1 : 0],
      speed: Math.random() * 0.2 + 0.1,
      phase: Math.random() * Math.PI * 2,
    }));
    const links: [number, number][] = [];
    for (let i = 0; i < NODE_COUNT; i++)
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const a = nodes[i], b = nodes[j];
        if (Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < LINK_DIST) links.push([i, j]);
      }

    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const mouse = { x: 0, y: 0 };
    const rot = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    // Perspective projection matching the old camera (z = 16, fov 32°)
    const CAM_Z = 16;
    const FOV = (32 * Math.PI) / 180;
    const projected = new Float32Array(NODE_COUNT * 3);

    let raf = 0;
    let running = false;
    const start = performance.now();

    const frame = (now: number) => {
      const t = (now - start) / 1000;
      rot.y += (mouse.x * 0.12 - rot.y) * 0.03;
      rot.x += (-mouse.y * 0.08 - rot.x) * 0.03;
      const cy = Math.cos(rot.y), sy = Math.sin(rot.y), cx = Math.cos(rot.x), sx = Math.sin(rot.x);
      const scale = h / 2 / Math.tan(FOV / 2);

      for (let i = 0; i < NODE_COUNT; i++) {
        const n = nodes[i];
        const px = n.x + Math.sin(t * n.speed + n.phase) * 0.15;
        const py = n.y + Math.cos(t * n.speed + n.phase) * 0.15;
        // rotate Y then X
        const x1 = px * cy + n.z * sy;
        const z1 = -px * sy + n.z * cy;
        const y2 = py * cx - z1 * sx;
        const z2 = py * sx + z1 * cx;
        const k = scale / (CAM_Z - z2);
        projected[i * 3] = w / 2 + x1 * k;
        projected[i * 3 + 1] = h / 2 - y2 * k;
        projected[i * 3 + 2] = k;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.beginPath();
      for (const [a, b] of links) {
        ctx.moveTo(projected[a * 3], projected[a * 3 + 1]);
        ctx.lineTo(projected[b * 3], projected[b * 3 + 1]);
      }
      ctx.stroke();

      for (let i = 0; i < NODE_COUNT; i++) {
        ctx.fillStyle = `rgba(${nodes[i].color}, 0.3)`;
        ctx.beginPath();
        ctx.arc(projected[i * 3], projected[i * 3 + 1], Math.max(1, nodes[i].r * projected[i * 3 + 2]), 0, Math.PI * 2);
        ctx.fill();
      }

      if (running) raf = requestAnimationFrame(frame);
    };

    const play = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Only animate while visible on screen and the tab is active
    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      onScreen && !document.hidden ? play() : pause();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden || !onScreen ? pause() : play());
    document.addEventListener('visibilitychange', onVis);

    return () => {
      pause();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <div id="hero-3d-canvas" className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import { MapPin, Plane, RotateCcw, Globe2, CalendarRange, Warehouse } from 'lucide-react';
import { AskAIButton } from '../common/AskAIButton';
import { readHash, setHash } from '../../lib/askAI';
import { useLanguage } from '../../context/LanguageContext';
import mapData from '../../data/europe-map.json';

type LocId = 'madrid' | 'tallinn';
const HIGHLIGHT: Record<string, LocId> = { Spain: 'madrid', Estonia: 'tallinn' };
const DISTANCE_KM = 2893;

export const InternationalSection: React.FC = () => {
  const { t, lang } = useLanguage();
  const c = t.international;
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<LocId | null>(null);
  const [hovered, setHovered] = useState<LocId | null>(null);
  const [showOps, setShowOps] = useState(false);

  // Deep link: #city-madrid / #city-tallinn
  useEffect(() => {
    const id = readHash('city-');
    if (id === 'madrid' || id === 'tallinn') {
      setSelected(id);
      setTimeout(() => document.getElementById('international')?.scrollIntoView({ behavior: 'smooth' }), 200);
    }
  }, []);
  useEffect(() => {
    if (selected) setHash(`city-${selected}`);
    else if (window.location.hash.startsWith('#city-')) setHash(null);
  }, [selected]);
  const mapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(mapRef, { once: true, margin: '-80px' });
  // Continuous animations (pulses, travelling dot) only run while the map is visible
  const visible = useInView(mapRef, { margin: '0px' });
  const animate = visible && !reduce;

  const { width: W, height: H, points, arc, countries, ops, opsArcs } = mapData as {
    width: number;
    height: number;
    points: Record<LocId, [number, number]>;
    arc: string;
    countries: { id: string; name: string; d: string }[];
    ops: Record<'nl' | 'uk', [number, number]>;
    opsArcs: Record<'nl' | 'uk', string>;
  };

  const active = hovered ?? selected;
  const locations = c.locations as Array<(typeof c.locations)[number] & { id: LocId }>;

  // Zoom toward the selected city
  const zoom = useMemo(() => {
    if (!selected) return { scale: 1, x: 0, y: 0 };
    const [px, py] = points[selected];
    const s = 1.7;
    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
    return {
      scale: s,
      x: clamp(W / 2 - px * s, W - W * s, 0),
      y: clamp(H / 2 - py * s, H - H * s, 0),
    };
  }, [selected, points, W, H]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selected) setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const toggle = (id: LocId) => setSelected(prev => (prev === id ? null : id));

  const stats = [
    { icon: <Plane className="w-4 h-4" />, value: `${DISTANCE_KM.toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB')} km`, label: c.distanceLabel },
    { icon: <Globe2 className="w-4 h-4" />, value: '2', label: c.countriesLabel },
    { icon: <CalendarRange className="w-4 h-4" />, value: '6', label: c.monthsLabel },
  ];

  return (
    <section id="international" className="py-14 sm:py-16 bg-white border-b border-slate-200">
      <div className="site-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-left space-y-2 mb-8"
        >
          <div className="text-xs font-semibold text-blue-700 tracking-wider uppercase">{c.badge}</div>
          <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-[#0B2A4A] tracking-tight leading-tight">{c.title}</h2>
          <p className="text-base text-slate-600 max-w-[65ch] leading-relaxed">{c.intro}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Map */}
          <div className="lg:col-span-7">
            <div
              ref={mapRef}
              className="relative rounded-xl border border-slate-200 bg-[#F1F5F9] overflow-hidden shadow-sm"
              style={{ aspectRatio: `${W} / ${H}` }}
            >
              <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" role="img" aria-label={c.title}>
                <motion.g
                  animate={{ x: zoom.x, y: zoom.y, scale: zoom.scale }}
                  transition={{ duration: reduce ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
                  style={{ originX: 0, originY: 0 }}
                >
                  {countries.map(ct => {
                    const loc = HIGHLIGHT[ct.name];
                    const isActive = loc && active === loc;
                    const isOps = showOps && (ct.name === 'Netherlands' || ct.name === 'United Kingdom');
                    return (
                      <path
                        key={ct.id}
                        d={ct.d}
                        onMouseEnter={loc ? () => setHovered(loc) : undefined}
                        onMouseLeave={loc ? () => setHovered(null) : undefined}
                        onClick={loc ? () => toggle(loc) : undefined}
                        className={
                          loc
                            ? `cursor-pointer transition-colors duration-300 ${isActive ? 'fill-[#1D4ED8]' : 'fill-[#93B4F5] hover:fill-[#1D4ED8]'}`
                            : isOps
                            ? 'fill-[#C7D7F5] transition-colors duration-300'
                            : 'fill-[#DCE3EC] transition-colors duration-300'
                        }
                        stroke="#FFFFFF"
                        strokeWidth={0.7}
                        vectorEffect="non-scaling-stroke"
                      />
                    );
                  })}

                  {/* Animated flight arc */}
                  <motion.path
                    d={arc}
                    fill="none"
                    stroke="#0B2A4A"
                    strokeWidth={2}
                    strokeDasharray="1 0"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={inView ? { pathLength: 1, opacity: 0.55 } : {}}
                    transition={{ duration: reduce ? 0 : 1.6, ease: 'easeInOut', delay: 0.3 }}
                  />
                  {animate && (
                    <circle r={4} fill="#1D4ED8">
                      <animateMotion dur="4s" repeatCount="indefinite" path={arc} keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear" />
                    </circle>
                  )}

                  {/* Remote operations: NL & UK partner warehouses */}
                  <AnimatePresence>
                    {showOps &&
                      (['nl', 'uk'] as const).map((k, i) => (
                        <motion.g key={k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }}>
                          <motion.path
                            d={opsArcs[k]}
                            fill="none"
                            stroke="#1D4ED8"
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            vectorEffect="non-scaling-stroke"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: reduce ? 0 : 0.8, delay: i * 0.15 }}
                          />
                          <g transform={`translate(${ops[k][0]} ${ops[k][1]}) scale(${1 / zoom.scale})`}>
                            <rect x={-6} y={-6} width={12} height={12} rx={2} transform="rotate(45)" fill="#FFFFFF" stroke="#1D4ED8" strokeWidth={2} />
                            <text
                              x={k === 'uk' ? -12 : 12}
                              y={4}
                              textAnchor={k === 'uk' ? 'end' : 'start'}
                              fontSize={11}
                              fontWeight={600}
                              fill="#1D4ED8"
                              fontFamily="Inter Variable, Inter, sans-serif"
                              paintOrder="stroke"
                              stroke="#F1F5F9"
                              strokeWidth={3}
                            >
                              {k === 'nl' ? c.nl : c.uk}
                            </text>
                          </g>
                        </motion.g>
                      ))}
                  </AnimatePresence>

                  {/* City markers */}
                  {locations.map((loc, i) => {
                    const [x, y] = points[loc.id];
                    const isActive = active === loc.id;
                    const inv = 1 / zoom.scale;
                    return (
                      <g
                        key={loc.id}
                        transform={`translate(${x} ${y})`}
                        role="button"
                        tabIndex={0}
                        aria-label={`${loc.city}, ${loc.country}`}
                        aria-pressed={selected === loc.id}
                        onClick={() => toggle(loc.id)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggle(loc.id);
                          }
                        }}
                        onMouseEnter={() => setHovered(loc.id)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(loc.id)}
                        onBlur={() => setHovered(null)}
                        className="cursor-pointer outline-none"
                        data-cursor-interactive
                      >
                        <g transform={`scale(${inv})`}>
                          {animate && (
                            <motion.circle
                              r={10}
                              fill="#1D4ED8"
                              initial={{ opacity: 0.45, scale: 1 }}
                              animate={{ opacity: 0, scale: 2.6 }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: i * 0.6 }}
                            />
                          )}
                          <motion.circle
                            r={isActive ? 10 : 8}
                            fill="#0B2A4A"
                            stroke="#FFFFFF"
                            strokeWidth={3}
                            initial={{ scale: 0 }}
                            animate={inView ? { scale: 1 } : {}}
                            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.2 + i * 0.25 }}
                          />
                          <g transform="translate(14 -14)">
                            <rect
                              x={0}
                              y={-14}
                              rx={6}
                              width={loc.city.length * 8.2 + 20}
                              height={26}
                              fill={isActive ? '#0B2A4A' : '#FFFFFF'}
                              stroke={isActive ? '#0B2A4A' : '#E2E8F0'}
                            />
                            <text x={10} y={4} fontSize={13} fontWeight={600} fill={isActive ? '#FFFFFF' : '#0F172A'} fontFamily="Inter Variable, Inter, sans-serif">
                              {loc.city}
                            </text>
                          </g>
                        </g>
                      </g>
                    );
                  })}
                </motion.g>
              </svg>

              {/* Remote operations toggle */}
              <div className="absolute top-3 left-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={showOps}
                  onClick={() => setShowOps(v => !v)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium shadow-sm transition-colors cursor-pointer ${
                    showOps ? 'bg-[#0B2A4A] border-[#0B2A4A] text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Warehouse className="w-3.5 h-3.5" />
                  {c.opsToggle}
                  <span className={`ml-1 w-7 h-4 rounded-full relative transition-colors ${showOps ? 'bg-blue-500' : 'bg-slate-300'}`}>
                    <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${showOps ? 'left-3.5' : 'left-0.5'}`} />
                  </span>
                </button>
                <AnimatePresence>
                  {showOps && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-1.5 text-[11px] text-slate-600 bg-white/90 border border-slate-200 rounded-md px-2 py-1 inline-block"
                    >
                      {c.opsLabel}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Map controls */}
              <div className="absolute left-3 bottom-3 right-3 flex items-end justify-between gap-3 pointer-events-none">
                <span className="hidden sm:inline text-[11px] text-slate-500 bg-white/90 border border-slate-200 rounded-md px-2 py-1">{c.hint}</span>
                <AnimatePresence>
                  {selected && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      onClick={() => setSelected(null)}
                      className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {c.showAll}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {stats.map(s => (
                <div key={s.label} className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center gap-1.5 text-blue-700 mb-1">{s.icon}</div>
                  <div className="text-lg sm:text-xl font-semibold text-slate-900 tabular-nums whitespace-nowrap">{s.value}</div>
                  <div className="text-xs text-slate-500 leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Location cards */}
          <div className="lg:col-span-5 space-y-4">
            {locations.map((loc, i) => {
              const isActive = active === loc.id;
              return (
                <motion.div
                  key={loc.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.target !== e.currentTarget) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggle(loc.id);
                    }
                  }}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.08 }}
                  onClick={() => toggle(loc.id)}
                  onMouseEnter={() => setHovered(loc.id)}
                  onMouseLeave={() => setHovered(null)}
                  aria-pressed={selected === loc.id}
                  className={`w-full text-left p-6 rounded-xl border bg-white transition-all cursor-pointer ${
                    isActive ? 'border-blue-700 ring-2 ring-blue-700/15 shadow-md' : 'border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          isActive ? 'bg-[#0B2A4A] text-white' : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        <MapPin className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 leading-tight">
                          {loc.city}, {loc.country} <span aria-hidden="true">{loc.flag}</span>
                        </h3>
                        <p className="text-sm text-blue-700 font-medium">{loc.role}</p>
                      </div>
                    </div>
                    <span className="text-[12px] font-mono px-2 py-1 rounded-md bg-slate-100 text-slate-700 whitespace-nowrap">{loc.period}</span>
                  </div>

                  <AnimatePresence initial={false}>
                    {(!selected || selected === loc.id) && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden space-y-1.5"
                      >
                        {loc.items.map(item => (
                          <li key={item} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-700 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                  <div className="mt-4">
                    <AskAIButton question={c.askQ.replace('{city}', loc.city)} label={c.ask} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

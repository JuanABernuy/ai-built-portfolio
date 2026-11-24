import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cable, GraduationCap, Database, FileBarChart, Package, Globe2, ShoppingCart, Server, BarChart3,
  Workflow, Warehouse, Bot, ShieldCheck, Award, Languages, BookOpen, Rocket, Download, Sparkles, ChevronRight,
} from 'lucide-react';
import type { PortfolioContent } from '../../context/LanguageContext';
import { IntroVideoFrame } from '../hero/IntroVideoFrame';

type V = PortfolioContent['story']['visuals'];
const ease = [0.22, 1, 0.36, 1] as const;

const LinkedinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const pop = (i: number, base = 0.25) => ({
  initial: { opacity: 0, y: 12, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.45, ease, delay: base + i * 0.12 },
});

const Card: React.FC<{ icon: React.ReactNode; title: string; sub?: string; i: number; dark?: boolean; base?: number }> = ({ icon, title, sub, i, dark, base }) => (
  <motion.div
    {...pop(i, base)}
    className={`flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl border shadow-sm ${
      dark ? 'bg-[#0B2A4A] border-[#0B2A4A] text-white' : 'bg-white border-slate-200 text-slate-900'
    }`}
  >
    <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${dark ? 'bg-white/10' : 'bg-blue-50 text-blue-700'}`}>{icon}</span>
    <span className="min-w-0">
      <span className="block text-sm font-semibold leading-tight">{title}</span>
      {sub && <span className={`block text-xs ${dark ? 'text-blue-200' : 'text-slate-500'}`}>{sub}</span>}
    </span>
  </motion.div>
);

/** Vertical connector with a travelling dot */
const Flow: React.FC<{ delay?: number; h?: number }> = ({ delay = 0, h = 28 }) => (
  <div className="relative mx-auto w-px bg-slate-300" style={{ height: h }}>
    <motion.span
      className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-700"
      initial={{ top: 0, opacity: 0 }}
      animate={{ top: [0, h - 6], opacity: [0, 1, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  </div>
);

export const IntroVisual: React.FC<{
  active: boolean;
  onEnded: () => void;
  onFailed: () => void;
  onVideoElement: (el: HTMLVideoElement | null) => void;
}> = props => (
  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="w-full flex justify-center">
    <IntroVideoFrame {...props} />
  </motion.div>
);

export const CableVisual: React.FC<{ v: V }> = ({ v }) => (
  <div className="w-full max-w-sm mx-auto space-y-3">
    <Card i={0} icon={<GraduationCap className="w-4 h-4" />} title={v.esic} sub={`2022 · ${v.esicSub}`} />
    <Flow delay={0.6} />
    <Card i={1} dark icon={<Cable className="w-4 h-4" />} title={v.tech} sub={`2023 – 2024 · ${v.techSub}`} />
    <motion.div className="flex flex-wrap justify-center gap-1.5 pt-2">
      {v.cableTags.map((tag, i) => (
        <motion.span key={tag} {...pop(i, 0.7)} className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-700">
          {tag}
        </motion.span>
      ))}
    </motion.div>
  </div>
);

export const ZamoraVisual: React.FC<{ v: V }> = ({ v }) => {
  const inIcons = [<Package className="w-4 h-4" />, <Globe2 className="w-4 h-4" />, <ShoppingCart className="w-4 h-4" />];
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="grid grid-cols-3 gap-2">
        {v.zamoraIn.map((x, i) => (
          <motion.div key={x} {...pop(i)} className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm text-center">
            <span className="mx-auto mb-1 w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">{inIcons[i]}</span>
            <span className="block text-[11px] sm:text-xs font-medium text-slate-700 leading-tight">{x}</span>
          </motion.div>
        ))}
      </div>
      <Flow delay={0.8} />
      <motion.div {...pop(3)} className="mx-auto w-fit px-6 py-3 rounded-xl bg-[#0B2A4A] text-white flex items-center gap-2 shadow-md">
        <Database className="w-4 h-4" />
        <span className="text-sm font-semibold">{v.zamoraHub}</span>
      </motion.div>
      <Flow delay={1.1} />
      <div className="grid grid-cols-3 gap-2">
        {v.zamoraOut.map((x, i) => (
          <motion.div key={x} {...pop(i, 0.9)} className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
            <FileBarChart className="mx-auto mb-1 w-4 h-4 text-blue-700" />
            <span className="block text-[11px] sm:text-xs font-medium text-slate-800 leading-tight">{x}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

type MapData = { width: number; height: number; points: Record<'madrid' | 'tallinn', [number, number]>; arc: string; countries: { id: string; name: string; d: string }[] };
let mapPromise: Promise<MapData> | null = null;
export const preloadMap = () => (mapPromise ??= import('../../data/europe-map.json').then(m => m.default as unknown as MapData));

export const EuropeVisual: React.FC<{ v: V }> = ({ v }) => {
  const [map, setMap] = useState<MapData | null>(null);
  useEffect(() => {
    let alive = true;
    preloadMap().then(m => alive && setMap(m));
    return () => {
      alive = false;
    };
  }, []);
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative rounded-xl border border-slate-200 bg-[#F1F5F9] overflow-hidden shadow-sm" style={{ aspectRatio: '800 / 620' }}>
        {map && (
          <svg viewBox={`0 0 ${map.width} ${map.height}`} className="absolute inset-0 w-full h-full" aria-hidden="true">
            {map.countries.map(c => (
              <path
                key={c.id}
                d={c.d}
                fill={c.name === 'Spain' || c.name === 'Estonia' ? '#1D4ED8' : '#DCE3EC'}
                fillOpacity={c.name === 'Spain' || c.name === 'Estonia' ? 0.55 : 1}
                stroke="#fff"
                strokeWidth={0.7}
              />
            ))}
            <motion.path
              d={map.arc}
              fill="none"
              stroke="#0B2A4A"
              strokeWidth={3}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: 'easeInOut', delay: 0.4 }}
            />
            {(['madrid', 'tallinn'] as const).map((k, i) => (
              <motion.circle
                key={k}
                cx={map.points[k][0]}
                cy={map.points[k][1]}
                r={10}
                fill="#0B2A4A"
                stroke="#fff"
                strokeWidth={4}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.3 + i * 2 }}
                style={{ transformOrigin: `${map.points[k][0]}px ${map.points[k][1]}px` }}
              />
            ))}
          </svg>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[v.km, v.months].map((x, i) => (
          <motion.div key={x} {...pop(i, 1.6)} className="p-3 rounded-xl bg-white border border-slate-200 text-center text-lg font-semibold text-[#0B2A4A] tabular-nums">
            {x}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const BullboatVisual: React.FC<{ v: V }> = ({ v }) => {
  const icons = [<Database className="w-4 h-4" />, <Package className="w-4 h-4" />, <Workflow className="w-4 h-4" />, <Server className="w-4 h-4" />, <BarChart3 className="w-4 h-4" />];
  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div {...pop(0, 0.1)} className="flex items-center justify-center gap-2 mb-4 text-xs">
        <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600">{v.bullboatStart}</span>
        <motion.span initial={{ width: 0 }} animate={{ width: 28 }} transition={{ delay: 0.5, duration: 0.5 }} className="h-px bg-blue-700" />
        <span className="px-2.5 py-1 rounded-md bg-[#0B2A4A] text-white font-semibold">{v.bullboatNow}</span>
      </motion.div>
      {/* Compact pipeline for small screens */}
      <div className="sm:hidden flex flex-wrap items-center justify-center gap-1.5">
        {v.pipeline.map((step, i) => (
          <React.Fragment key={step}>
            <motion.span
              {...pop(i, 0.4)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
                i === 3 ? 'bg-[#0B2A4A] text-white border-[#0B2A4A]' : 'bg-white text-slate-800 border-slate-200'
              }`}
            >
              {step}
            </motion.span>
            {i < v.pipeline.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-blue-700" />}
          </React.Fragment>
        ))}
      </div>
      <div className="hidden sm:block space-y-0">
        {v.pipeline.map((step, i) => (
          <React.Fragment key={step}>
            <Card i={i} base={0.6} dark={i === 3} icon={icons[i]} title={step} />
            {i < v.pipeline.length - 1 && <Flow delay={0.9 + i * 0.25} h={16} />}
          </React.Fragment>
        ))}
      </div>
      <motion.div {...pop(6, 0.6)} className="mt-3 mx-auto w-fit flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-medium text-blue-900">
        <Warehouse className="w-3.5 h-3.5" />
        {v.warehouses}
      </motion.div>
    </div>
  );
};

export const AIVisual: React.FC<{ v: V }> = ({ v }) => {
  const icons = [<Bot className="w-4 h-4" />, <Server className="w-4 h-4" />, <Database className="w-4 h-4" />];
  return (
    <div className="w-full max-w-sm mx-auto">
      {v.aiNodes.map((n, i) => (
        <React.Fragment key={n}>
          <Card i={i} dark={i === 1} icon={icons[i]} title={n} />
          {i < v.aiNodes.length - 1 && <Flow delay={0.6 + i * 0.3} />}
        </React.Fragment>
      ))}
      <motion.div {...pop(3, 0.5)} className="mt-4 flex flex-wrap justify-center gap-1.5">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#0B2A4A] text-white text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          {v.readOnly}
        </span>
        {v.aiData.map(d => (
          <span key={d} className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-700">
            {d}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export const ProfileVisual: React.FC<{ v: V }> = ({ v }) => {
  const icons = [<Award className="w-4 h-4" />, <ShieldCheck className="w-4 h-4" />, <BookOpen className="w-4 h-4" />, <Languages className="w-4 h-4" />, <Rocket className="w-4 h-4" />];
  return (
    <div className="w-full max-w-sm mx-auto space-y-2.5">
      {v.badges.map((b, i) => (
        <Card key={b} i={i} dark={i === 0} icon={icons[i]} title={b} />
      ))}
    </div>
  );
};

export const ContactVisual: React.FC<{ v: V; onAsk: () => void; linkedin: string }> = ({ v, onAsk, linkedin }) => (
  <div className="w-full max-w-sm mx-auto space-y-3">
    <motion.button
      {...pop(0, 0.1)}
      type="button"
      onClick={onAsk}
      className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-[#0B2A4A] hover:bg-[#133D69] text-white text-base font-semibold shadow-md cursor-pointer"
    >
      <Sparkles className="w-5 h-5" />
      {v.ask}
    </motion.button>
    <motion.a
      {...pop(1, 0.1)}
      href="/cv.pdf"
      download="CV_Juan_Andres_Bernuy.pdf"
      className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-semibold"
    >
      <Download className="w-4 h-4" />
      {v.cv}
    </motion.a>
    <motion.a
      {...pop(2, 0.1)}
      href={linkedin}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-semibold"
    >
      <LinkedinIcon className="w-4 h-4 text-[#0A66C2]" />
      {v.linkedin}
    </motion.a>
  </div>
);

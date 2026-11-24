import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Pause, Video } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// Remembers, for the whole visit, that the visitor has allowed sound
let soundUnlocked = false;

interface IntroVideoFrameProps {
  /** Controlled playback (e.g. paused when the story is paused). Defaults to playing. */
  active?: boolean;
  loop?: boolean;
  onEnded?: () => void;
  onFailed?: () => void;
  /** Gives the parent access to the <video> element (to read progress). */
  onVideoElement?: (el: HTMLVideoElement | null) => void;
}

/**
 * Intro video that starts as soon as the page loads.
 * Tries to play with sound; if the browser blocks it (autoplay policy),
 * it plays muted and switches the sound on at the visitor's first click or key press.
 */
export const IntroVideoFrame: React.FC<IntroVideoFrameProps> = ({ active = true, loop = false, onEnded, onFailed, onVideoElement }) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(!soundUnlocked);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const autoMuted = useRef(false);

  useEffect(() => {
    onVideoElement?.(videoRef.current);
    return () => onVideoElement?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start immediately: with sound if allowed, otherwise muted
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !active) return;
    v.muted = false;
    v.play()
      .then(() => {
        soundUnlocked = true;
        setMuted(false);
      })
      .catch(() => {
        autoMuted.current = true;
        v.muted = true;
        setMuted(true);
        v.play().catch(() => undefined);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Controlled pause / resume
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active && !v.ended) v.play().catch(() => undefined);
    else if (!active) v.pause();
  }, [active]);

  // First interaction anywhere turns the sound on (and restarts if we're past the start)
  useEffect(() => {
    if (soundUnlocked) return;
    const unlock = (e: Event) => {
      const v = videoRef.current;
      if (!v || !autoMuted.current || soundUnlocked) return;
      if ((e.target as HTMLElement | null)?.closest('[data-video-control]')) return;
      soundUnlocked = true;
      autoMuted.current = false;
      v.muted = false;
      setMuted(false);
      if (!v.ended && v.currentTime > 1.5) v.currentTime = 0;
      if (!v.ended) v.play().catch(() => undefined);
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener('pointerdown', unlock, true);
      window.removeEventListener('keydown', unlock, true);
    };
    window.addEventListener('pointerdown', unlock, true);
    window.addEventListener('keydown', unlock, true);
    return cleanup;
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => undefined);
    else v.pause();
  };

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    setMuted(next);
    autoMuted.current = false;
    if (!next) {
      soundUnlocked = true;
      if (v.currentTime > 1.5 && !v.ended) v.currentTime = 0;
      v.play().catch(() => undefined);
    }
  };

  return (
    <div className="relative w-full mx-auto aspect-video rounded-2xl overflow-hidden bg-slate-200 shadow-lg ring-1 ring-slate-900/5">
      {!failed ? (
        <>
          <video
            ref={videoRef}
            src={`${import.meta.env.BASE_URL}video/intro.mp4`}
            poster={`${import.meta.env.BASE_URL}video/poster.jpg`}
            preload="auto"
            autoPlay
            muted={muted}
            loop={loop}
            playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => {
              setPlaying(false);
              onEnded?.();
            }}
            onError={() => {
              setFailed(true);
              onFailed?.();
            }}
            className="w-full h-full object-cover"
          />

          {/* Big, obvious "sound on" pill while muted */}
          {muted && (
            <button
              type="button"
              data-video-control
              onClick={toggleSound}
              className="absolute left-3 bottom-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B2A4A] hover:bg-[#133D69] text-white text-sm font-semibold shadow-lg ring-4 ring-white/40 cursor-pointer"
            >
              <VolumeX className="w-4 h-4" />
              {t.hero.videoUnmute}
            </button>
          )}

          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button
              type="button"
              data-video-control
              onClick={togglePlay}
              aria-label={playing ? 'Pause video' : 'Play video'}
              className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-sm flex items-center justify-center cursor-pointer"
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            {!muted && (
              <button
                type="button"
                data-video-control
                onClick={toggleSound}
                aria-label={t.hero.videoMute}
                title={t.hero.videoMute}
                className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-sm flex items-center justify-center cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-blue-700" />
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center w-full h-full bg-slate-50">
          <Video className="w-6 h-6 text-blue-700 mb-2" />
          <p className="text-sm font-semibold text-slate-900">{t.hero.videoFallbackMsg}</p>
          <p className="text-xs text-slate-500">{t.hero.videoFallbackHint}</p>
        </div>
      )}
    </div>
  );
};

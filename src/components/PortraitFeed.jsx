import { useEffect, useRef, useState } from 'react';
import portrait from '../assets/castiel-portrait.webp';
import compactPortrait from '../assets/castiel-portrait-480.webp';

// Reload anomaly occurs ~4.75s..6.25s; loop seam occurs ~12.5s..12.97s -> 0.0s..0.25s
const RELOAD_GLITCH_START = 4.65;
const RELOAD_GLITCH_END = 6.45;
const LOOP_GLITCH_TAIL = 0.55;
const LOOP_GLITCH_HEAD = 0.28;

export default function PortraitFeed() {
  const videoRef = useRef(null);
  const imgRef = useRef(null);
  const boxRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [cmsOverridden, setCmsOverridden] = useState(false);

  // Detect if CMS replaces .char-img with a custom asset
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const initialSrc = img.getAttribute('src');
    const check = () => {
      const current = img.getAttribute('src');
      setCmsOverridden(Boolean(current && current !== initialSrc));
    };
    const obs = new MutationObserver(check);
    obs.observe(img, { attributes: true, attributeFilter: ['src'] });
    return () => obs.disconnect();
  }, []);

  // Playback, sound unlock, tab visibility sync, and frame-accurate glitch bursts
  useEffect(() => {
    const video = videoRef.current;
    const box = boxRef.current;
    if (!video || !box || cmsOverridden) return;

    video.volume = 0.58;

    const tryPlay = (wantSound) => {
      video.muted = !wantSound;
      const p = video.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          setIsMuted(video.muted);
        }).catch(() => {
          // Autoplay with audio blocked before user gesture: fall back to muted until first gesture
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      }
    };

    tryPlay(soundEnabled);

    // Unlock audio on first user interaction if sound is desired
    const unlockAudio = () => {
      if (!soundEnabled || !video.muted) return;
      const bioTab = document.getElementById('tab-bio');
      if (bioTab && !bioTab.classList.contains('active')) return;
      video.muted = false;
      video.volume = 0.58;
      video.play().then(() => setIsMuted(false)).catch(() => {});
    };

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });

    // Pause when switching away from Biometrics tab, resume when returning
    const bioTab = document.getElementById('tab-bio');
    let tabObs = null;
    if (bioTab) {
      tabObs = new MutationObserver(() => {
        if (bioTab.classList.contains('active')) {
          tryPlay(soundEnabled);
        } else {
          video.pause();
        }
      });
      tabObs.observe(bioTab, { attributes: true, attributeFilter: ['class'] });
    }

    // Frame-accurate glitch masking on reload anomaly and loop seam
    let rafId = 0;
    const tick = () => {
      const t = video.currentTime || 0;
      const dur = video.duration && Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 12.97;
      const inReloadGlitch = t >= RELOAD_GLITCH_START && t <= RELOAD_GLITCH_END;
      const inLoopGlitch = t >= dur - LOOP_GLITCH_TAIL || t <= LOOP_GLITCH_HEAD;

      box.classList.toggle('pict-glitch-reload', inReloadGlitch);
      box.classList.toggle('pict-glitch-seam', inLoopGlitch && !inReloadGlitch);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      if (tabObs) tabObs.disconnect();
    };
  }, [soundEnabled, cmsOverridden]);

  const toggleSound = () => {
    const video = videoRef.current;
    const next = isMuted;
    setSoundEnabled(next);
    if (video) {
      video.muted = !next;
      video.volume = 0.58;
      if (next) {
        video.play().catch(() => {});
      }
      setIsMuted(video.muted);
    }
  };

  return (
    <div ref={boxRef} className="avatar-box portrait-feed">
      <img
        ref={imgRef}
        className="char-img"
        src={portrait}
        srcSet={`${compactPortrait} 480w, ${portrait} 960w`}
        sizes="(max-width: 474px) calc(100vw - 24px), 450px"
        width={960}
        height={1216}
        alt="Кастиил — Сангвис Цензор"
        fetchPriority="high"
        draggable={false}
      />
      {!cmsOverridden && (
        <>
          <video
            ref={videoRef}
            className="char-video"
            src="/media/castiel-portrait.mp4"
            poster={portrait}
            autoPlay
            loop
            playsInline
            preload="auto"
          />
          <div className="pict-crt-overlay" aria-hidden="true" />
          <div className="pict-glitch-layer" aria-hidden="true">
            <span className="pict-glitch-tag">PICT-FEED // SIGNAL DESYNC</span>
          </div>
          <button
            type="button"
            className="pict-sound-btn"
            onClick={toggleSound}
            aria-label={isMuted ? 'Включить звук пикт-канала' : 'Выключить звук пикт-канала'}
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? 'VOX: OFF' : 'VOX: ON'}
          </button>
        </>
      )}
    </div>
  );
}

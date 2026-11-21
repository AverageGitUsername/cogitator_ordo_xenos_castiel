import { useEffect, useRef } from 'react';
import scanPoster from '../assets/anatomy-scan.webp';

const IMPLANTS = [
  {
    id: 0,
    x: 18,
    y: 9,
    bx: 180,
    by: 75,
    elbowX: 300,
    label: 'Мозг',
    track: (theta) => [500 + 8 * Math.sin(theta), 52 + 2 * Math.cos(theta)],
  },
  {
    id: 1,
    x: 82,
    y: 15,
    bx: 820,
    by: 125,
    elbowX: 695,
    label: 'Оптика',
    track: (theta) => [500 + 24 * Math.cos(theta - 0.35), 84 + 3 * Math.sin(theta)],
  },
  {
    id: 2,
    x: 15,
    y: 29,
    bx: 150,
    by: 242,
    elbowX: 290,
    label: 'Горнило',
    track: (theta) => [500 + 20 * Math.sin(theta), 196 + 5 * Math.cos(theta)],
  },
  {
    id: 3,
    x: 85,
    y: 39,
    bx: 850,
    by: 325,
    elbowX: 705,
    label: 'Сердца',
    track: (theta) => [500 + 36 * Math.cos(theta - 0.5), 258 + 6 * Math.sin(theta)],
  },
  {
    id: 4,
    x: 14,
    y: 52,
    bx: 140,
    by: 434,
    elbowX: 255,
    label: 'Катушки',
    track: (theta) => [500 - 142 * Math.cos(theta), 316 + 14 * Math.sin(theta)],
  },
];

export default function AnatomyScan() {
  const videoRef = useRef(null);
  const lineRefs = useRef([]);
  const dotRefs = useRef([]);
  const ringRefs = useRef([]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.play().catch(() => {});

    let rafId = 0;
    const updateLeaders = () => {
      const dur = video.duration && Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 7.936;
      const t = video.currentTime || 0;
      const theta = (t / dur) * Math.PI * 2;

      for (let i = 0; i < IMPLANTS.length; i += 1) {
        const imp = IMPLANTS[i];
        const [tx, ty] = imp.track(theta);
        const rx = Math.round(tx * 10) / 10;
        const ry = Math.round(ty * 10) / 10;

        const poly = lineRefs.current[i];
        if (poly) {
          poly.setAttribute('points', `${imp.bx},${imp.by} ${imp.elbowX},${imp.by} ${rx},${ry}`);
        }
        const dot = dotRefs.current[i];
        if (dot) {
          dot.setAttribute('cx', rx);
          dot.setAttribute('cy', ry);
        }
        const ring = ringRefs.current[i];
        if (ring) {
          ring.setAttribute('cx', rx);
          ring.setAttribute('cy', ry);
        }
      }

      rafId = requestAnimationFrame(updateLeaders);
    };

    rafId = requestAnimationFrame(updateLeaders);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="anatomy-scan">
      <video
        ref={videoRef}
        className="anatomy-plate anatomy-video"
        src="/media/anatomy-scan.mp4"
        poster={scanPoster}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <svg className="anatomy-leaders" viewBox="0 0 1000 834" aria-hidden="true">
        <defs>
          <marker
            id="anatomy-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="currentColor" />
          </marker>
        </defs>
        {IMPLANTS.map((imp, index) => {
          const [tx, ty] = imp.track(0);
          return (
            <g key={imp.label} className="anatomy-leader-group">
              <polyline
                ref={(el) => { lineRefs.current[index] = el; }}
                points={`${imp.bx},${imp.by} ${imp.elbowX},${imp.by} ${tx},${ty}`}
                vectorEffect="non-scaling-stroke"
                markerEnd="url(#anatomy-arrow)"
              />
              <circle
                ref={(el) => { ringRefs.current[index] = el; }}
                className="anatomy-target-ring"
                cx={tx}
                cy={ty}
                r="11"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                ref={(el) => { dotRefs.current[index] = el; }}
                className="anatomy-target-dot"
                cx={tx}
                cy={ty}
                r="4"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}
      </svg>
      <div className="scan-pass" aria-hidden="true" />
      {IMPLANTS.map(({ x, y, label }, index) => (
        <button
          key={label}
          type="button"
          id={`bnode-${index}`}
          className={index === 0 ? 'bio-node active' : 'bio-node'}
          style={{ '--x': `${x}%`, '--y': `${y}%` }}
          aria-label={label}
          aria-controls="bxi-desc"
          aria-pressed={index === 0}
          onClick={() => window.selectBioNode(index)}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
}

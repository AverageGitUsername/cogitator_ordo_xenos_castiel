import { useEffect, useRef } from 'react';

const RUNG_COUNT = 24;
const X_START = 16;
const X_END = 404;
const MID_Y = 46;
const AMP = 25;
const CYCLES = 2.5;
const DEFECT_X1 = 262;
const DEFECT_X2 = 330;
const SAMPLES = 64;

function getGlitchOffset(x, elapsed, seed) {
  if (x < DEFECT_X1 || x > DEFECT_X2) return 0;
  return Math.sin(elapsed * 29 + seed * 3) > 0.88
    ? Math.sin(elapsed * 71 + seed) * 2.2
    : 0;
}

function appendSegment(state, x0, y0, x1, y1) {
  const x0s = x0.toFixed(1);
  const y0s = y0.toFixed(1);
  const x1s = x1.toFixed(1);
  const y1s = y1.toFixed(1);
  if (!state.active) {
    state.d += `M${x0s} ${y0s} L${x1s} ${y1s} `;
    state.active = true;
  } else {
    state.d += `L${x1s} ${y1s} `;
  }
}

export default function DnaHelix() {
  const wrapRef = useRef(null);
  const strandABackRef = useRef(null);
  const strandBBackRef = useRef(null);
  const strandAFrontRef = useRef(null);
  const strandBFrontRef = useRef(null);
  const rungRefs = useRef([]);
  const dotARefs = useRef([]);
  const dotBRefs = useRef([]);
  const scanRef = useRef(null);
  const defectBoxRef = useRef(null);
  const defectTextRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let visible = true;
    let tabActive = true;
    let rafId = 0;
    const t0 = performance.now();

    const io = wrap && typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver((entries) => {
          visible = Boolean(entries[0]?.isIntersecting);
        }, { threshold: 0.05 })
      : null;
    if (io && wrap) io.observe(wrap);

    const bioTab = document.getElementById('tab-bio');
    const checkTab = () => {
      tabActive = !bioTab || bioTab.classList.contains('active');
    };
    const tabObs = bioTab ? new MutationObserver(checkTab) : null;
    if (tabObs && bioTab) tabObs.observe(bioTab, { attributes: true, attributeFilter: ['class'] });
    checkTab();

    // Native 60fps updates, paused whenever off-screen or tab hidden
    const drawFrame = (now) => {
      if (!reduced) rafId = requestAnimationFrame(drawFrame);
      if (!reduced && (!visible || !tabActive || document.hidden)) return;

      const elapsed = reduced ? 0 : (now - t0) / 1000;
      const phase = elapsed * 2.1;

      const scanNorm = 0.5 - 0.5 * Math.cos(elapsed * 0.85);
      const scanX = X_START + scanNorm * (X_END - X_START);

      if (scanRef.current) {
        scanRef.current.setAttribute('transform', `translate(${scanX.toFixed(1)}, 0)`);
      }

      const pathAFront = { d: '', active: false };
      const pathABack = { d: '', active: false };
      const pathBFront = { d: '', active: false };
      const pathBBack = { d: '', active: false };

      let prevX = 0;
      let prevYA = 0;
      let prevYB = 0;
      let prevAngle = 0;

      for (let i = 0; i <= SAMPLES; i += 1) {
        const u = i / SAMPLES;
        const x = X_START + u * (X_END - X_START);
        const angle = u * Math.PI * 2 * CYCLES - phase;
        const glitch = getGlitchOffset(x, elapsed, u * 48);
        const sinA = Math.sin(angle);
        const yA = MID_Y - sinA * AMP + glitch;
        const yB = MID_Y + sinA * AMP - glitch * 0.6;

        if (i > 0) {
          const midCos = Math.cos((prevAngle + angle) * 0.5);
          if (midCos >= 0) {
            appendSegment(pathAFront, prevX, prevYA, x, yA);
            pathABack.active = false;
            appendSegment(pathBBack, prevX, prevYB, x, yB);
            pathBFront.active = false;
          } else {
            appendSegment(pathABack, prevX, prevYA, x, yA);
            pathAFront.active = false;
            appendSegment(pathBFront, prevX, prevYB, x, yB);
            pathBBack.active = false;
          }
        }

        prevX = x;
        prevYA = yA;
        prevYB = yB;
        prevAngle = angle;
      }

      if (strandABackRef.current) strandABackRef.current.setAttribute('d', pathABack.d);
      if (strandBBackRef.current) strandBBackRef.current.setAttribute('d', pathBBack.d);
      if (strandAFrontRef.current) strandAFrontRef.current.setAttribute('d', pathAFront.d);
      if (strandBFrontRef.current) strandBFrontRef.current.setAttribute('d', pathBFront.d);

      for (let i = 0; i < RUNG_COUNT; i += 1) {
        const u = (i + 0.5) / RUNG_COUNT;
        const x = X_START + u * (X_END - X_START);
        const angle = u * Math.PI * 2 * CYCLES - phase;
        const sinA = Math.sin(angle);
        const cosA = Math.cos(angle);
        const depthA = (cosA + 1) * 0.5;
        const depthB = (-cosA + 1) * 0.5;
        const rungDepth = Math.abs(sinA);
        const inDefect = x >= DEFECT_X1 && x <= DEFECT_X2;
        const nearScan = Math.abs(x - scanX) < 16;

        const glitch = getGlitchOffset(x, elapsed, u * 48);
        const yA = MID_Y - sinA * AMP + glitch;
        const yB = MID_Y + sinA * AMP - glitch * 0.6;

        const line = rungRefs.current[i];
        if (line) {
          line.setAttribute('x1', x.toFixed(1));
          line.setAttribute('x2', x.toFixed(1));
          line.setAttribute('y1', yA.toFixed(1));
          line.setAttribute('y2', yB.toFixed(1));
          line.setAttribute('opacity', (nearScan ? 0.95 : 0.22 + rungDepth * 0.55).toFixed(2));
          line.setAttribute('stroke', inDefect ? '#d41212' : nearScan ? '#e8c480' : '#6e4e18');
          line.setAttribute('stroke-width', (inDefect || nearScan ? 1.7 : 1.05).toFixed(2));
        }

        const dotA = dotARefs.current[i];
        if (dotA) {
          dotA.setAttribute('cx', x.toFixed(1));
          dotA.setAttribute('cy', yA.toFixed(1));
          dotA.setAttribute('r', (nearScan ? 2.55 : 1.05 + depthA * 1.15).toFixed(2));
          dotA.setAttribute('opacity', (nearScan ? 1 : 0.34 + depthA * 0.66).toFixed(2));
        }

        const dotB = dotBRefs.current[i];
        if (dotB) {
          dotB.setAttribute('cx', x.toFixed(1));
          dotB.setAttribute('cy', yB.toFixed(1));
          dotB.setAttribute('r', (nearScan ? 2.55 : 1.05 + depthB * 1.15).toFixed(2));
          dotB.setAttribute('opacity', (nearScan ? 1 : 0.34 + depthB * 0.66).toFixed(2));
        }
      }

      const scanInDefect = scanX >= DEFECT_X1 - 8 && scanX <= DEFECT_X2 + 8;
      if (defectBoxRef.current) {
        const pulse = scanInDefect ? 0.26 : 0.1 + 0.06 * Math.sin(elapsed * 4.5);
        defectBoxRef.current.setAttribute('fill', `rgba(180, 14, 14, ${pulse.toFixed(2)})`);
      }
      if (defectTextRef.current) {
        const flicker = scanInDefect && Math.sin(elapsed * 32) > 0.3 ? 0.45 : 1;
        defectTextRef.current.setAttribute('opacity', String(flicker));
      }
    };

    rafId = requestAnimationFrame(drawFrame);
    return () => {
      cancelAnimationFrame(rafId);
      if (io) io.disconnect();
      if (tabObs) tabObs.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="dna-svg-wrap">
      <svg className="dna-svg" viewBox="0 0 420 92" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="dna-scan-beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d9b06a" stopOpacity="0" />
            <stop offset="30%" stopColor="#c81616" stopOpacity="0.09" />
            <stop offset="50%" stopColor="#e8c480" stopOpacity="0.22" />
            <stop offset="70%" stopColor="#c81616" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#d9b06a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1={MID_Y}
          x2="420"
          y2={MID_Y}
          stroke="rgba(181,140,74,0.16)"
          strokeWidth="0.8"
          strokeDasharray="3 3"
        />
        <path ref={strandABackRef} d="" fill="none" stroke="#cfa45a" strokeWidth="1.5" opacity="0.38" strokeLinecap="round" />
        <path ref={strandBBackRef} d="" fill="none" stroke="#c81616" strokeWidth="1.5" opacity="0.38" strokeLinecap="round" />
        <g>
          {Array.from({ length: RUNG_COUNT }, (_, i) => (
            <line
              key={i}
              ref={(el) => { rungRefs.current[i] = el; }}
              x1={X_START}
              y1={MID_Y}
              x2={X_START}
              y2={MID_Y}
              stroke="#6e4e18"
              strokeWidth="1.2"
            />
          ))}
        </g>
        <path ref={strandAFrontRef} d="" fill="none" stroke="#cfa45a" strokeWidth="2.25" strokeLinecap="round" />
        <path ref={strandBFrontRef} d="" fill="none" stroke="#c81616" strokeWidth="2.25" strokeLinecap="round" />
        <g>
          {Array.from({ length: RUNG_COUNT }, (_, i) => (
            <circle
              key={`a-${i}`}
              ref={(el) => { dotARefs.current[i] = el; }}
              cx={X_START}
              cy={MID_Y}
              r="1.6"
              fill="#e8c382"
            />
          ))}
          {Array.from({ length: RUNG_COUNT }, (_, i) => (
            <circle
              key={`b-${i}`}
              ref={(el) => { dotBRefs.current[i] = el; }}
              cx={X_START}
              cy={MID_Y}
              r="1.6"
              fill="#e01e1e"
            />
          ))}
        </g>
        <rect
          ref={defectBoxRef}
          x={DEFECT_X1}
          y="10"
          width={DEFECT_X2 - DEFECT_X1}
          height="72"
          fill="rgba(180,14,14,0.14)"
          stroke="#cc1414"
          strokeWidth="1.2"
          strokeDasharray="4 2"
        />
        <path
          d="M258 14 L258 6 L270 6 M334 14 L334 6 L322 6 M258 78 L258 86 L270 86 M334 78 L334 86 L322 86"
          fill="none"
          stroke="#d9b06a"
          strokeWidth="1.5"
        />
        <rect x="263" y="75.5" width="66" height="9.5" rx="1" fill="rgba(6, 2, 2, 0.86)" />
        <text ref={defectTextRef} x="265" y="82.5" fill="#d91818" fontFamily="IBM Plex Mono, monospace" fontSize="6.8">
          DEFECT: RED THIRST
        </text>
        <text x="18" y="14" fill="#b58c4a" fontFamily="IBM Plex Mono, monospace" fontSize="6.8">
          MARS STASIS · 99.8%
        </text>
        <g ref={scanRef} className="dna-scan-carriage" transform={`translate(${X_START}, 0)`}>
          <rect x="-12" y="0" width="24" height="92" fill="url(#dna-scan-beam)" />
          <line x1="0" y1="0" x2="0" y2="92" stroke="#d9b06a" strokeWidth="1.4" opacity="0.88" />
          <rect x="-6" y="2" width="12" height="5" fill="#d9b06a" />
        </g>
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ORDO XENOS · COGITATOR AUDIO ENGINE (WARHAMMER 40,000 PROCEDURAL SFX)
   Pure Web Audio API synthesis: analog saturation, metallic chamber
   impulse response, Mechanicus binary cant, Stalker bolt ballistics,
   apothecarium bio-alarms, and astropathic warp transmission.
══════════════════════════════════════════════════════════════ */

export function createCogitatorAudioEngine() {
  var ctx = null;
  var masterGain = null;
  var compressor = null;
  var shaper = null;
  var reverbNode = null;
  var reverbSend = null;
  var droneMaster = null;
  var droneFilter = null;
  var droneStarted = false;

  var BG_MUSIC_SRC = '/media/claimed_by_the_void_loop.mp3';
  var BG_VOL_KEY = 'cogitator_bgm_vol';
  var DEFAULT_BG_PCT = 30;
  var MAX_BG_LINEAR = 0.5;
  var bgVolumePct = (function () {
    try {
      var raw = localStorage.getItem(BG_VOL_KEY);
      if (raw === null) return DEFAULT_BG_PCT;
      var parsed = parseInt(raw, 10);
      return Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : DEFAULT_BG_PCT;
    } catch (e) {
      return DEFAULT_BG_PCT;
    }
  })();
  var bgAudio = null;
  var bgMusicWanted = false;
  var bgFadeTimer = 0;

  var whiteNoiseBuf = null;
  var pinkNoiseBuf = null;
  var crackleBuf = null;

  var muted = localStorage.getItem('cogitator_muted') === '1';
  var lastHoverAt = 0;
  var lastSliderAt = 0;
  var lastKeyAt = 0;
  var lastVibrateAt = 0;

  function vibrate(pattern, minGapMs) {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
    var nowMs = performance.now();
    var gap = typeof minGapMs === 'number' ? minGapMs : 18;
    if (nowMs - lastVibrateAt < gap) return;
    lastVibrateAt = nowMs;
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }

  /* ── DISTORTION CURVE (WARM TUBE / MAGNETIC TAPE SATURATION) ── */
  function makeWarmDriveCurve(amount) {
    var k = typeof amount === 'number' ? amount : 18;
    var n = 2048;
    var curve = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      var x = (i * 2) / n - 1;
      // Subtle asymmetric saturation for odd + even harmonics
      curve[i] = Math.tanh(x * (1 + k * 0.08) + 0.04 * x * x);
    }
    return curve;
  }

  /* ── NOISE & IMPULSE RESPONSE GENERATORS ── */
  function buildBuffers() {
    if (!ctx) return;
    var sr = ctx.sampleRate;
    var len = Math.floor(sr * 2.0);

    // 1. White noise
    whiteNoiseBuf = ctx.createBuffer(1, len, sr);
    var wData = whiteNoiseBuf.getChannelData(0);
    for (var i = 0; i < len; i++) {
      wData[i] = Math.random() * 2 - 1;
    }

    // 2. Pink noise (Paul Kellet's refined method)
    pinkNoiseBuf = ctx.createBuffer(1, len, sr);
    var pData = pinkNoiseBuf.getChannelData(0);
    var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (var j = 0; j < len; j++) {
      var white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      pData[j] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    // 3. Sparse electrical crackle / phosphor / warp static
    crackleBuf = ctx.createBuffer(1, len, sr);
    var cData = crackleBuf.getChannelData(0);
    for (var k = 0; k < len; k++) {
      cData[k] = Math.random() < 0.014 ? (Math.random() * 2 - 1) : 0;
    }
  }

  function buildIronChamberIR() {
    var sr = ctx.sampleRate;
    var dur = 0.44;
    var len = Math.floor(sr * dur);
    var ir = ctx.createBuffer(2, len, sr);
    for (var ch = 0; ch < 2; ch++) {
      var data = ir.getChannelData(ch);
      var lp = 0;
      for (var i = 0; i < len; i++) {
        var t = i / len;
        // Dense early reflections + dark metallic tail
        var env = Math.pow(1 - t, 2.8);
        var early = (i < sr * 0.035 && i % Math.floor(sr * 0.004 + ch * 17) < 4) ? 0.45 : 0;
        var raw = ((Math.random() * 2 - 1) * 0.75 + early) * env;
        // One-pole lowpass damping (~2.4 kHz) for heavy iron/stone character
        lp = lp + 0.28 * (raw - lp);
        data[i] = lp;
      }
    }
    return ir;
  }

  function startAmbientDrone() {
    if (!ctx || droneStarted) return;
    droneStarted = true;

    var now = ctx.currentTime;
    droneMaster = ctx.createGain();
    droneMaster.gain.setValueAtTime(muted ? 0 : 1, now);
    droneMaster.connect(compressor);

    droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(108, now);
    droneFilter.Q.setValueAtTime(2.4, now);
    droneFilter.connect(droneMaster);

    // Slow breathing LFO on reactor filter
    var filterLfo = ctx.createOscillator();
    var filterLfoGain = ctx.createGain();
    filterLfo.type = 'sine';
    filterLfo.frequency.setValueAtTime(0.075, now);
    filterLfoGain.gain.setValueAtTime(26, now);
    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(droneFilter.frequency);
    filterLfo.start(now);

    // Sub-harmonic machine-spirit reactor hum (E1 beating + B1 fifth)
    var subSpecs = [
      { type: 'sawtooth', freq: 41.20, gain: 0.015 },
      { type: 'sawtooth', freq: 41.58, gain: 0.014 },
      { type: 'triangle', freq: 61.74, gain: 0.011 },
      { type: 'sine',     freq: 123.47, gain: 0.0045 }
    ];
    subSpecs.forEach(function (spec) {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = spec.type;
      osc.frequency.setValueAtTime(spec.freq, now);
      g.gain.setValueAtTime(spec.gain, now);
      osc.connect(g);
      g.connect(droneFilter);
      osc.start(now);
    });

    // Cathode / cooling-fan vox tube air (filtered pink noise)
    if (pinkNoiseBuf) {
      var airSrc = ctx.createBufferSource();
      airSrc.buffer = pinkNoiseBuf;
      airSrc.loop = true;

      var airBp = ctx.createBiquadFilter();
      airBp.type = 'bandpass';
      airBp.frequency.setValueAtTime(260, now);
      airBp.Q.setValueAtTime(2.6, now);

      var airGain = ctx.createGain();
      airGain.gain.setValueAtTime(0.022, now);

      var airLfo = ctx.createOscillator();
      var airLfoG = ctx.createGain();
      airLfo.frequency.setValueAtTime(0.11, now);
      airLfoG.gain.setValueAtTime(0.007, now);
      airLfo.connect(airLfoG);
      airLfoG.connect(airGain.gain);

      airSrc.connect(airBp);
      airBp.connect(airGain);
      airGain.connect(droneMaster);

      airSrc.start(now);
      airLfo.start(now);
    }
  }

  function ensureContext() {
    if (!ctx) {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      ctx = new AudioCtx();

      shaper = ctx.createWaveShaper();
      shaper.curve = makeWarmDriveCurve(14);
      shaper.oversample = '2x';

      compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 12;
      compressor.ratio.value = 4.5;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.16;

      masterGain = ctx.createGain();
      masterGain.gain.value = muted ? 0 : 0.85;

      shaper.connect(compressor);
      compressor.connect(masterGain);
      masterGain.connect(ctx.destination);

      buildBuffers();

      reverbNode = ctx.createConvolver();
      reverbNode.buffer = buildIronChamberIR();
      reverbSend = ctx.createGain();
      reverbSend.gain.value = 0.34;
      reverbNode.connect(reverbSend);
      reverbSend.connect(compressor);
    }

    if (ctx.state === 'suspended') {
      ctx.resume().catch(function () {});
    }
    if (!droneStarted) {
      startAmbientDrone();
    }
    return true;
  }

  function canPlay() {
    if (muted || !ctx) return false;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(function () {});
    }
    return true;
  }

  /* ── LOW-LEVEL SYNTHESIS PRIMITIVES ── */
  function routeNode(node, wetAmount) {
    node.connect(shaper);
    if (wetAmount && wetAmount > 0 && reverbNode) {
      var wet = ctx.createGain();
      wet.gain.value = wetAmount;
      node.connect(wet);
      wet.connect(reverbNode);
    }
  }

  function playTone(opts) {
    if (!canPlay()) return;
    var now = ctx.currentTime + (opts.delay || 0);
    var dur = Math.max(0.01, opts.dur || 0.08);
    var osc = ctx.createOscillator();
    var g = ctx.createGain();

    osc.type = opts.type || 'triangle';
    var f0 = Math.max(20, opts.freq || 220);
    osc.frequency.setValueAtTime(f0, now);
    if (opts.freqEnd) {
      var f1 = Math.max(20, opts.freqEnd);
      if (opts.expFreq) {
        osc.frequency.exponentialRampToValueAtTime(f1, now + dur);
      } else {
        osc.frequency.linearRampToValueAtTime(f1, now + dur);
      }
    }

    var gainVal = opts.gain || 0.1;
    var atk = opts.attack || 0.003;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(gainVal, now + atk);
    if (opts.hold) {
      g.gain.setValueAtTime(gainVal, now + Math.min(dur * 0.7, atk + opts.hold));
    }
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    var tail = osc;
    if (opts.filterFreq) {
      var flt = ctx.createBiquadFilter();
      flt.type = opts.filterType || 'lowpass';
      flt.frequency.setValueAtTime(opts.filterFreq, now);
      if (opts.filterEnd) {
        flt.frequency.exponentialRampToValueAtTime(Math.max(30, opts.filterEnd), now + dur);
      }
      if (opts.filterQ) flt.Q.setValueAtTime(opts.filterQ, now);
      osc.connect(flt);
      tail = flt;
    }

    tail.connect(g);
    routeNode(g, opts.wet || 0);

    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  function playNoise(opts) {
    if (!canPlay()) return;
    var buf = opts.buf === 'pink' ? pinkNoiseBuf : (opts.buf === 'crackle' ? crackleBuf : whiteNoiseBuf);
    if (!buf) return;

    var now = ctx.currentTime + (opts.delay || 0);
    var dur = Math.max(0.008, opts.dur || 0.05);
    var src = ctx.createBufferSource();
    src.buffer = buf;
    // Start at random offset so consecutive hits never phase identically
    var offset = Math.random() * Math.max(0.1, buf.duration - dur - 0.05);

    var flt = ctx.createBiquadFilter();
    flt.type = opts.filterType || 'bandpass';
    flt.frequency.setValueAtTime(opts.freq || 1200, now);
    if (opts.freqEnd) {
      flt.frequency.exponentialRampToValueAtTime(Math.max(40, opts.freqEnd), now + dur);
    }
    flt.Q.setValueAtTime(opts.q || 1.8, now);

    var g = ctx.createGain();
    var gainVal = opts.gain || 0.08;
    var atk = opts.attack || 0.002;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(gainVal, now + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    src.connect(flt);
    flt.connect(g);
    routeNode(g, opts.wet || 0);

    src.start(now, offset, dur + 0.02);
  }

  function playFM(opts) {
    if (!canPlay()) return;
    var now = ctx.currentTime + (opts.delay || 0);
    var dur = Math.max(0.012, opts.dur || 0.05);

    var carrier = ctx.createOscillator();
    var mod = ctx.createOscillator();
    var modGain = ctx.createGain();
    var outGain = ctx.createGain();

    carrier.type = opts.carrierType || 'square';
    carrier.frequency.setValueAtTime(opts.freq || 640, now);
    if (opts.freqEnd) {
      carrier.frequency.exponentialRampToValueAtTime(Math.max(30, opts.freqEnd), now + dur);
    }

    mod.type = opts.modType || 'sine';
    mod.frequency.setValueAtTime(opts.modFreq || 140, now);
    modGain.gain.setValueAtTime(opts.modDepth || 180, now);

    outGain.gain.setValueAtTime(0.0001, now);
    outGain.gain.linearRampToValueAtTime(opts.gain || 0.05, now + 0.002);
    outGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    mod.connect(modGain);
    modGain.connect(carrier.frequency);

    var tail = carrier;
    if (opts.filterFreq) {
      var flt = ctx.createBiquadFilter();
      flt.type = opts.filterType || 'bandpass';
      flt.frequency.setValueAtTime(opts.filterFreq, now);
      flt.Q.setValueAtTime(opts.filterQ || 2.8, now);
      carrier.connect(flt);
      tail = flt;
    }

    tail.connect(outGain);
    routeNode(outGain, opts.wet || 0.14);

    carrier.start(now);
    mod.start(now);
    carrier.stop(now + dur + 0.015);
    mod.stop(now + dur + 0.015);
  }

  function playMechSnap(freq, gain, delay, wet) {
    playNoise({
      delay: delay || 0,
      dur: 0.014,
      freq: freq || 1900,
      freqEnd: (freq || 1900) * 0.55,
      q: 2.4,
      gain: gain || 0.06,
      wet: wet || 0.08
    });
    playTone({
      delay: delay || 0,
      dur: 0.024,
      type: 'triangle',
      freq: 185,
      freqEnd: 68,
      expFreq: true,
      gain: (gain || 0.06) * 0.85,
      filterFreq: 520,
      wet: wet || 0.06
    });
  }

  /* ── BACKGROUND AMBIENT LOOP (MP3) ── */
  function getBgTargetVol() {
    return (bgVolumePct / 100) * MAX_BG_LINEAR;
  }

  function emitAudioChange() {
    if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
    try {
      window.dispatchEvent(new CustomEvent('cogitator:audiochange', {
        detail: { muted: muted, bgVolume: bgVolumePct }
      }));
    } catch (e) {}
  }

  function ensureBgAudio() {
    if (bgAudio || typeof Audio === 'undefined') return bgAudio;
    bgAudio = new Audio(BG_MUSIC_SRC);
    bgAudio.loop = true;
    bgAudio.preload = 'auto';
    bgAudio.volume = 0;
    bgAudio.addEventListener('ended', function () {
      if (!bgMusicWanted || muted || bgVolumePct <= 0) return;
      bgAudio.currentTime = 0;
      bgAudio.play().catch(function () {});
    });
    return bgAudio;
  }

  function fadeBgVolume(targetVol, durationMs, onDone) {
    if (!bgAudio) {
      if (onDone) onDone();
      return;
    }
    if (bgFadeTimer) {
      clearInterval(bgFadeTimer);
      bgFadeTimer = 0;
    }
    var clampedTarget = Math.max(0, Math.min(1, targetVol));
    var startVol = bgAudio.volume;
    var delta = clampedTarget - startVol;
    if (Math.abs(delta) < 0.002 || durationMs <= 0) {
      bgAudio.volume = clampedTarget;
      if (onDone) onDone();
      return;
    }
    var startedAt = performance.now();
    bgFadeTimer = setInterval(function () {
      if (!bgAudio) {
        clearInterval(bgFadeTimer);
        bgFadeTimer = 0;
        return;
      }
      var t = Math.min(1, (performance.now() - startedAt) / durationMs);
      var eased = 1 - Math.pow(1 - t, 2);
      bgAudio.volume = Math.max(0, Math.min(1, startVol + delta * eased));
      if (t >= 1) {
        clearInterval(bgFadeTimer);
        bgFadeTimer = 0;
        if (onDone) onDone();
      }
    }, 30);
  }

  function tryPlayBgMusic(fadeMs) {
    if (!bgMusicWanted || muted || bgVolumePct <= 0) return;
    var audio = ensureBgAudio();
    if (!audio) return;
    var dur = typeof fadeMs === 'number' ? fadeMs : 1200;
    var target = getBgTargetVol();
    if (!audio.paused) {
      fadeBgVolume(target, dur);
      return;
    }
    try {
      var p = audio.play();
      if (p && typeof p.then === 'function') {
        p.then(function () {
          if (bgMusicWanted && !muted && bgVolumePct > 0) {
            fadeBgVolume(getBgTargetVol(), dur);
          } else {
            audio.pause();
          }
        }).catch(function () {});
      } else {
        fadeBgVolume(target, dur);
      }
    } catch (e) {}
  }

  /* ══════════════════════════════════════════════
     PUBLIC SOUND DESIGN VOCABULARY
  ══════════════════════════════════════════════ */
  var api = {
    isMuted: function () {
      return muted;
    },

    getBgVolume: function () {
      return bgVolumePct;
    },

    setBgVolume: function (pct) {
      var num = Math.round(Number(pct));
      if (!Number.isFinite(num)) return bgVolumePct;
      bgVolumePct = Math.max(0, Math.min(100, num));
      try {
        localStorage.setItem(BG_VOL_KEY, String(bgVolumePct));
      } catch (e) {}
      if (bgFadeTimer) {
        clearInterval(bgFadeTimer);
        bgFadeTimer = 0;
      }
      var target = getBgTargetVol();
      if (bgVolumePct <= 0) {
        if (bgAudio) {
          bgAudio.volume = 0;
          bgAudio.pause();
        }
      } else {
        var audio = bgAudio;
        if (!audio && bgMusicWanted && !muted) {
          audio = ensureBgAudio();
        }
        if (audio) {
          audio.volume = target;
          if (bgMusicWanted && !muted && audio.paused) {
            audio.play().catch(function () {});
          }
        }
      }
      emitAudioChange();
      return bgVolumePct;
    },

    init: function () {
      var ok = ensureContext();
      if (bgMusicWanted && !muted && bgVolumePct > 0 && (!bgAudio || bgAudio.paused)) {
        tryPlayBgMusic(900);
      }
      return ok;
    },

    startBgMusic: function () {
      bgMusicWanted = true;
      ensureBgAudio();
      tryPlayBgMusic(1500);
    },

    stopBgMusic: function () {
      bgMusicWanted = false;
      if (!bgAudio) return;
      fadeBgVolume(0, 260, function () {
        if (!bgMusicWanted && bgAudio) {
          bgAudio.pause();
          try { bgAudio.currentTime = 0; } catch (e) {}
        }
      });
    },

    haptic: function (kind) {
      if (kind === 'heavy') vibrate([18, 26, 22], 35);
      else if (kind === 'shot') vibrate([26, 28, 16], 40);
      else if (kind === 'impact') vibrate([16, 18, 12], 25);
      else if (kind === 'alert') vibrate([30, 32, 30], 45);
      else if (kind === 'lock') vibrate([10, 20, 14], 25);
      else if (kind === 'latch') vibrate(14, 20);
      else if (kind === 'tick') vibrate(6, 45);
      else vibrate(9, 18);
    },

    toggleMute: function () {
      ensureContext();
      api.haptic('tap');
      muted = !muted;
      localStorage.setItem('cogitator_muted', muted ? '1' : '0');
      var now = ctx ? ctx.currentTime : 0;
      if (masterGain && ctx) {
        masterGain.gain.setTargetAtTime(muted ? 0 : 0.85, now, 0.04);
      }
      if (droneMaster && ctx) {
        droneMaster.gain.setTargetAtTime(muted ? 0 : 1, now, 0.16);
      }
      if (muted) {
        if (bgAudio) {
          fadeBgVolume(0, 180, function () {
            if (muted && bgAudio) bgAudio.pause();
          });
        }
      } else {
        if (bgMusicWanted) {
          tryPlayBgMusic(650);
        }
        api.auspexSelect(0);
      }
      emitAudioChange();
      return muted;
    },

    /* 1. Micro brass-relay hover tick (no shrill sine beeps) */
    hoverTick: function () {
      if (!canPlay()) return;
      var nowMs = performance.now();
      if (nowMs - lastHoverAt < 42) return;
      lastHoverAt = nowMs;

      playNoise({
        dur: 0.009,
        freq: 1750 + Math.random() * 260,
        q: 3.2,
        gain: 0.022,
        wet: 0.04
      });
      playTone({
        dur: 0.016,
        type: 'triangle',
        freq: 155,
        freqEnd: 72,
        expFreq: true,
        gain: 0.024,
        filterFreq: 380
      });
    },

    /* 2. Heavy armored cogitator tab switch (breaker clunk + CRT degauss settle) */
    tabSwitch: function () {
      api.haptic('latch');
      if (!canPlay()) return;
      // Solenoid contact snap
      playMechSnap(1450, 0.095, 0, 0.16);
      // Heavy chassis thump
      playTone({
        dur: 0.10,
        type: 'sawtooth',
        freq: 132,
        freqEnd: 38,
        expFreq: true,
        gain: 0.14,
        filterFreq: 360,
        filterEnd: 95,
        wet: 0.24
      });
      // Secondary relay settle click
      playNoise({
        delay: 0.036,
        dur: 0.024,
        freq: 920,
        freqEnd: 420,
        q: 2.0,
        gain: 0.045,
        wet: 0.22
      });
      // Subtle cathode harmonic settle
      playTone({
        delay: 0.02,
        dur: 0.13,
        type: 'triangle',
        freq: 310,
        freqEnd: 148,
        expFreq: true,
        gain: 0.04,
        filterFreq: 680,
        wet: 0.28
      });
    },

    /* 3. Hydraulic shutter / accordion latch */
    accordion: function (isOpen) {
      api.haptic('latch');
      if (!canPlay()) return;
      if (isOpen === false) {
        // Heavy bolt lock-shut
        playMechSnap(1200, 0.075, 0, 0.14);
        playTone({
          dur: 0.075,
          type: 'triangle',
          freq: 260,
          freqEnd: 88,
          expFreq: true,
          gain: 0.08,
          filterFreq: 550,
          wet: 0.18
        });
      } else {
        // Hydraulic unseal + pneumatic hiss
        playMechSnap(1850, 0.07, 0, 0.15);
        playNoise({
          delay: 0.012,
          dur: 0.055,
          freq: 2400,
          freqEnd: 1100,
          q: 2.2,
          gain: 0.04,
          wet: 0.18
        });
        playTone({
          delay: 0.01,
          dur: 0.07,
          type: 'triangle',
          freq: 195,
          freqEnd: 340,
          expFreq: true,
          gain: 0.06,
          filterFreq: 720,
          wet: 0.2
        });
      }
    },

    /* 4. Mechanicus Auspex binary data-cant chirp */
    auspexSelect: function (variant) {
      api.haptic('tap');
      if (!canPlay()) return;
      var base = 660 + ((variant || 0) % 4) * 55;
      playMechSnap(2600, 0.045, 0, 0.08);
      playFM({
        delay: 0.008,
        dur: 0.026,
        freq: base,
        modFreq: 165,
        modDepth: 130,
        filterFreq: 1650,
        filterQ: 2.6,
        gain: 0.052,
        wet: 0.20
      });
      playFM({
        delay: 0.042,
        dur: 0.036,
        freq: base * 1.26,
        modFreq: 210,
        modDepth: 110,
        filterFreq: 1950,
        filterQ: 2.8,
        gain: 0.044,
        wet: 0.26
      });
    },

    /* 5. Inquisitorial Rosetta Seal / Gothic Organ-Vox Swell */
    rosettaSeal: function () {
      api.haptic('heavy');
      if (!canPlay()) return;
      // Heavy iron stamp slam
      playTone({
        dur: 0.24,
        type: 'sine',
        freq: 94,
        freqEnd: 29,
        expFreq: true,
        gain: 0.24,
        wet: 0.35
      });
      playNoise({
        dur: 0.08,
        freq: 860,
        freqEnd: 240,
        q: 1.5,
        gain: 0.11,
        wet: 0.40
      });

      // Dark D-minor Cathedral Brass/Organ Fifths
      var chord = [
        { f: 73.42, g: 0.075, type: 'sawtooth', d: 0.02 },
        { f: 110.00, g: 0.062, type: 'sawtooth', d: 0.05 },
        { f: 146.83, g: 0.052, type: 'triangle', d: 0.08 },
        { f: 174.61, g: 0.038, type: 'triangle', d: 0.11 }
      ];
      chord.forEach(function (voice) {
        playTone({
          delay: voice.d,
          dur: 0.92,
          attack: 0.07,
          type: voice.type,
          freq: voice.f,
          freqEnd: voice.f * 0.994,
          gain: voice.g,
          filterFreq: 860,
          filterEnd: 190,
          filterQ: 1.8,
          wet: 0.55
        });
      });
    },

    /* 6. Boot sequence teletype & warp glitch */
    bootLine: function (cls) {
      if (!canPlay()) return;
      var c = cls || '';
      if (c.indexOf('bt-crit') !== -1 || c.indexOf('bt-warn') !== -1) {
        playTone({
          dur: 0.085,
          type: 'sawtooth',
          freq: 138,
          freqEnd: 108,
          gain: 0.065,
          filterFreq: 520,
          wet: 0.22
        });
        playNoise({ dur: 0.04, freq: 1400, q: 2.0, gain: 0.05, wet: 0.18 });
        return;
      }
      if (c.indexOf('bt-ok') !== -1 || c.indexOf('bt-gold') !== -1) {
        playMechSnap(2200, 0.04, 0, 0.10);
        playFM({
          delay: 0.012,
          dur: 0.035,
          freq: 740,
          modFreq: 185,
          modDepth: 95,
          filterFreq: 1600,
          gain: 0.042,
          wet: 0.22
        });
        return;
      }
      // Crisp dot-matrix cogitator log print
      playNoise({
        dur: 0.015,
        freq: 2100 + Math.random() * 400,
        q: 3.0,
        gain: 0.028,
        wet: 0.06
      });
      playFM({
        dur: 0.018,
        freq: 460 + Math.random() * 140,
        modFreq: 120,
        modDepth: 90,
        filterFreq: 1200,
        gain: 0.022,
        wet: 0.08
      });
    },

    bootGlitch: function () {
      if (!canPlay()) return;
      playNoise({
        buf: 'crackle',
        dur: 0.30,
        freq: 620,
        freqEnd: 2400,
        q: 1.4,
        gain: 0.15,
        wet: 0.36
      });
      playNoise({
        dur: 0.26,
        freq: 1900,
        freqEnd: 380,
        q: 2.6,
        gain: 0.09,
        wet: 0.30
      });
      // Tritone warp screech
      playFM({
        dur: 0.24,
        freq: 185,
        freqEnd: 130,
        modFreq: 47,
        modDepth: 260,
        filterFreq: 980,
        filterQ: 2.2,
        gain: 0.09,
        wet: 0.42
      });
    },

    /* 7. Tab preloader telemetry ticks & unlock */
    preloaderLine: function (cls) {
      if (!canPlay()) return;
      var isWarn = cls && (cls.indexOf('pl-warn') !== -1 || cls.indexOf('pl-crit') !== -1);
      playNoise({
        dur: 0.012,
        freq: isWarn ? 1100 : 2300,
        q: 3.2,
        gain: 0.024,
        wet: 0.06
      });
      playFM({
        dur: 0.02,
        freq: isWarn ? 360 : 620 + Math.random() * 120,
        modFreq: 140,
        modDepth: 85,
        filterFreq: isWarn ? 900 : 1700,
        gain: 0.02,
        wet: 0.12
      });
    },

    preloaderUnlock: function () {
      if (!canPlay()) return;
      playMechSnap(1600, 0.065, 0, 0.18);
      playTone({
        delay: 0.015,
        dur: 0.16,
        type: 'triangle',
        freq: 180,
        freqEnd: 360,
        expFreq: true,
        gain: 0.065,
        filterFreq: 780,
        wet: 0.32
      });
    },

    /* 8. Redacted matrix decryption rattle */
    matrixDecrypt: function () {
      api.haptic('lock');
      if (!canPlay()) return;
      [1120, 920, 760, 580].forEach(function (f, i) {
        playFM({
          delay: i * 0.018,
          dur: 0.02,
          freq: f,
          modFreq: 190,
          modDepth: 140,
          filterFreq: 1800,
          gain: 0.036,
          wet: 0.16
        });
      });
      playMechSnap(2100, 0.055, 0.074, 0.22);
    },

    /* 9. Ballistic Visor: Target Lock, Modes, Slider Dial, & 3-Stage Shot */
    visorLock: function () {
      api.haptic('lock');
      if (!canPlay()) return;
      [540, 720, 960].forEach(function (f, i) {
        playFM({
          delay: i * 0.036,
          dur: 0.026,
          freq: f,
          modFreq: 120,
          modDepth: 75,
          filterFreq: 1800,
          gain: 0.048,
          wet: 0.18
        });
      });
      playTone({
        delay: 0.115,
        dur: 0.09,
        type: 'triangle',
        freq: 165,
        freqEnd: 58,
        expFreq: true,
        gain: 0.11,
        filterFreq: 420,
        wet: 0.24
      });
      playMechSnap(1750, 0.065, 0.115, 0.15);
    },

    visorMode: function (modeIdx) {
      api.haptic('latch');
      if (!canPlay()) return;
      playMechSnap(2200, 0.07, 0, 0.15);
      if (modeIdx === 1) {
        // Auspex sonar pulse
        playTone({ delay: 0.015, dur: 0.18, type: 'sine', freq: 520, freqEnd: 880, expFreq: true, gain: 0.055, wet: 0.35 });
      } else if (modeIdx === 2) {
        // Night-IR high-voltage tube charge
        playTone({ delay: 0.01, dur: 0.16, type: 'triangle', freq: 280, freqEnd: 1180, expFreq: true, gain: 0.04, filterFreq: 1400, wet: 0.25 });
      } else {
        // Thermal spectrum shift
        playTone({ delay: 0.01, dur: 0.13, type: 'sawtooth', freq: 240, freqEnd: 125, expFreq: true, gain: 0.055, filterFreq: 520, wet: 0.22 });
      }
    },

    visorRangeTick: function (dist) {
      api.haptic('tick');
      if (!canPlay()) return;
      var nowMs = performance.now();
      if (nowMs - lastSliderAt < 44) return;
      lastSliderAt = nowMs;

      var norm = Math.max(0, Math.min(1, ((Number(dist) || 1840) - 500) / 2000));
      var freq = 240 + norm * 220;
      playNoise({ dur: 0.009, freq: 1800 + norm * 800, q: 3.4, gain: 0.028, wet: 0.05 });
      playTone({ dur: 0.018, type: 'triangle', freq: freq, freqEnd: freq * 0.65, expFreq: true, gain: 0.032, filterFreq: 680 });
    },

    visorShotFire: function (ammoIdx) {
      api.haptic('shot');
      if (!canPlay()) return;
      // 1. Sharp supersonic muzzle crack + chamber transient
      playNoise({
        dur: 0.042,
        freq: ammoIdx === 1 ? 3400 : 2650,
        freqEnd: 620,
        q: 1.1,
        gain: 0.24,
        wet: 0.28
      });
      // 2. Heavy bolt-sniper chest-thump & propellant pressure wave
      playTone({
        dur: 0.16,
        type: 'sine',
        freq: ammoIdx === 2 ? 105 : 148,
        freqEnd: 24,
        expFreq: true,
        gain: 0.30,
        wet: 0.26
      });
      // 3. Suppressor baffle gas tail
      playNoise({
        delay: 0.015,
        dur: 0.11,
        buf: 'pink',
        freq: ammoIdx === 1 ? 1900 : 1400,
        freqEnd: 320,
        q: 1.3,
        gain: 0.15,
        wet: 0.36
      });
      // 4. Crisp bolt carrier cycling & shell-casing clink
      playMechSnap(2350, 0.075, 0.075, 0.16);
      playMechSnap(1620, 0.06, 0.11, 0.16);

      if (ammoIdx === 0) {
        // Executioner micro-thruster ignition hiss
        playFM({ delay: 0.02, dur: 0.08, freq: 920, freqEnd: 1240, modFreq: 210, modDepth: 110, filterFreq: 2100, gain: 0.032, wet: 0.22 });
      } else if (ammoIdx === 1) {
        // Mortis hyper-velocity rail snap
        playTone({ dur: 0.10, type: 'sawtooth', freq: 420, freqEnd: 88, expFreq: true, gain: 0.10, filterFreq: 1600, wet: 0.26 });
      } else {
        // Infernus incendiary hollow thoomp
        playTone({ dur: 0.19, type: 'triangle', freq: 175, freqEnd: 46, expFreq: true, gain: 0.16, filterFreq: 420, wet: 0.34 });
      }
    },

    visorShotImpact: function (ammoIdx, ev) {
      var type = (ev && typeof ev === 'object') ? ev.type : (ev ? 'collapse' : 'hit');
      var strength = (ev && typeof ev === 'object' && ev.strength) ? ev.strength : 1;
      if (type !== 'debris' && type !== 'fall' && type !== 'topple') {
        api.haptic('impact');
      }
      if (!canPlay()) return;

      if (type === 'miss') {
        // Supersonic ricochet whine off steel deck
        playNoise({ buf: 'crackle', dur: 0.07, freq: 3400, freqEnd: 950, q: 1.6, gain: 0.14, wet: 0.22 });
        playTone({ dur: 0.16, type: 'sine', freq: 2400 + Math.random() * 500, freqEnd: 780, expFreq: true, gain: 0.065, wet: 0.30 });
        return;
      }

      if (type === 'debris') {
        var g = Math.min(0.14, 0.035 + strength * 0.025);
        playMechSnap(780 + Math.random() * 750, g, 0, 0.18);
        return;
      }

      if (type === 'fall' || type === 'topple') {
        playTone({ dur: 0.18, type: 'triangle', freq: 86, freqEnd: 28, expFreq: true, gain: 0.20 * Math.min(1.4, strength), wet: 0.22 });
        playNoise({ buf: 'pink', dur: 0.12, freq: 460, freqEnd: 160, q: 1.2, gain: 0.12, wet: 0.18 });
        return;
      }

      // Direct ballistic impact on mannequin armor/flesh
      playTone({ dur: 0.13, type: 'triangle', freq: 142 + 16 * ammoIdx, freqEnd: 32, expFreq: true, gain: 0.28, wet: 0.18 });
      playNoise({ buf: 'crackle', dur: 0.095, freq: 3200, freqEnd: 520, q: 1.4, gain: 0.24, wet: 0.22 });
      playMechSnap(1450 + Math.random() * 450, 0.09, 0.012, 0.14);

      if (type === 'head') {
        // Helmet crack + high-speed spin whistle
        playTone({ dur: 0.18, type: 'sine', freq: 1650, freqEnd: 620, expFreq: true, gain: 0.09, wet: 0.26 });
        playNoise({ buf: 'crackle', delay: 0.025, dur: 0.11, freq: 2600, freqEnd: 880, q: 1.5, gain: 0.16, wet: 0.24 });
      } else if (type === 'kill' || type === 'collapse') {
        // Shattering armor & structural rupture
        playNoise({ buf: 'crackle', delay: 0.04, dur: 0.18, freq: 2100, freqEnd: 480, q: 1.1, gain: 0.18, wet: 0.24 });
        playTone({ delay: 0.03, dur: 0.19, type: 'sawtooth', freq: 112, freqEnd: 34, expFreq: true, gain: 0.14, filterFreq: 380, wet: 0.22 });
      }
    },

    /* 10. Biometrics: Apothecarium Red Thirst Stress Alarm + Racing Dual Heartbeat */
    bioStressTest: function () {
      api.haptic('alert');
      if (!canPlay()) return;
      // 3 deep imperial bio-hazard klaxon pulses
      [0, 0.78, 1.56].forEach(function (t) {
        playTone({
          delay: t,
          dur: 0.44,
          attack: 0.025,
          type: 'sawtooth',
          freq: 146.8,
          freqEnd: 116.5,
          gain: 0.095,
          filterFreq: 340,
          filterEnd: 780,
          filterQ: 2.5,
          wet: 0.42
        });
        playTone({
          delay: t,
          dur: 0.44,
          attack: 0.025,
          type: 'sawtooth',
          freq: 150.2,
          freqEnd: 119.0,
          gain: 0.085,
          filterFreq: 340,
          filterEnd: 780,
          filterQ: 2.5,
          wet: 0.42
        });
      });

      // Elevated Astartes tachycardia lub-dub pulses
      [0.08, 0.46, 0.84, 1.22, 1.60, 1.98, 2.36, 2.74].forEach(function (t) {
        playTone({ delay: t, dur: 0.09, type: 'sine', freq: 62, freqEnd: 34, expFreq: true, gain: 0.16, wet: 0.16 });
        playTone({ delay: t + 0.11, dur: 0.08, type: 'sine', freq: 52, freqEnd: 30, expFreq: true, gain: 0.12, wet: 0.16 });
      });
    },

    /* 11. Cortical Link neural synchronization */
    corticalPhase: function (idx) {
      if (!canPlay()) return;
      var base = 92 + idx * 34;
      playTone({
        dur: 0.26,
        attack: 0.03,
        type: 'triangle',
        freq: base,
        freqEnd: base * 1.18,
        expFreq: true,
        gain: 0.075,
        filterFreq: 680,
        wet: 0.40
      });
      playFM({
        delay: 0.02,
        dur: 0.035,
        freq: 520 + idx * 140,
        modFreq: 160,
        modDepth: 110,
        filterFreq: 1800,
        gain: 0.04,
        wet: 0.25
      });
    },

    corticalComplete: function () {
      api.haptic('heavy');
      if (!canPlay()) return;
      playMechSnap(1600, 0.08, 0, 0.22);
      [110, 165, 220, 261.63].forEach(function (f, i) {
        playTone({
          delay: i * 0.03,
          dur: 0.72,
          attack: 0.04,
          type: i === 0 ? 'sawtooth' : 'triangle',
          freq: f,
          gain: i === 0 ? 0.07 : 0.048,
          filterFreq: 760,
          filterEnd: 220,
          wet: 0.48
        });
      });
    },

    /* 12. Sublimation barrel parchments (calm ritual chime + dry parchment rustle) */
    sublimScroll: function () {
      api.haptic('tap');
      if (!canPlay()) return;
      // Soft dry parchment friction
      playNoise({
        buf: 'pink',
        dur: 0.11,
        attack: 0.025,
        freq: 1550,
        freqEnd: 950,
        q: 1.3,
        gain: 0.05,
        wet: 0.22
      });
      // Meditative pulse-slowing brass/bell fifth
      playTone({
        delay: 0.02,
        dur: 0.55,
        attack: 0.03,
        type: 'triangle',
        freq: 196.0,
        gain: 0.055,
        filterFreq: 520,
        wet: 0.46
      });
      playTone({
        delay: 0.05,
        dur: 0.50,
        attack: 0.03,
        type: 'sine',
        freq: 293.66,
        gain: 0.036,
        wet: 0.46
      });
    },

    sublimEncrypt: function () {
      api.haptic('latch');
      if (!canPlay()) return;
      playMechSnap(1750, 0.065, 0, 0.15);
      playTone({ dur: 0.09, type: 'triangle', freq: 440, freqEnd: 165, expFreq: true, gain: 0.065, filterFreq: 750, wet: 0.25 });
    },

    /* 13. Astrography: System Hub <-> Caelis-9 Hololith */
    astroEnterPlanet: function () {
      api.haptic('lock');
      if (!canPlay()) return;
      playMechSnap(1500, 0.08, 0, 0.20);
      playTone({
        dur: 0.36,
        attack: 0.03,
        type: 'sawtooth',
        freq: 68,
        freqEnd: 185,
        expFreq: true,
        gain: 0.095,
        filterFreq: 420,
        filterEnd: 920,
        wet: 0.42
      });
      playFM({
        delay: 0.14,
        dur: 0.08,
        freq: 820,
        modFreq: 195,
        modDepth: 85,
        filterFreq: 1900,
        gain: 0.04,
        wet: 0.36
      });
    },

    astroExitPlanet: function () {
      api.haptic('latch');
      if (!canPlay()) return;
      playMechSnap(1350, 0.075, 0, 0.18);
      playTone({
        dur: 0.26,
        type: 'triangle',
        freq: 190,
        freqEnd: 62,
        expFreq: true,
        gain: 0.09,
        filterFreq: 680,
        filterEnd: 180,
        wet: 0.34
      });
    },

    /* 14. Communications: Clearance, Relay, Keystroke, Warp Transmission & Denial */
    commClearance: function (clrCode) {
      api.haptic(clrCode === 'BLACK' ? 'lock' : 'tap');
      if (!canPlay()) return;
      if (clrCode === 'BLACK') {
        playMechSnap(1200, 0.08, 0, 0.18);
        playTone({ dur: 0.22, type: 'sawtooth', freq: 98, freqEnd: 82, gain: 0.09, filterFreq: 380, wet: 0.34 });
        playTone({ delay: 0.02, dur: 0.20, type: 'triangle', freq: 138.6, freqEnd: 116, gain: 0.055, filterFreq: 460, wet: 0.34 });
        return;
      }
      var pitchMap = { OMICRON: 560, CYAN: 640, MAGENTA: 740, VERMILION: 840 };
      var f = pitchMap[clrCode] || 680;
      playMechSnap(1900, 0.055, 0, 0.12);
      playFM({ delay: 0.01, dur: 0.04, freq: f, modFreq: 150, modDepth: 90, filterFreq: 1600, gain: 0.045, wet: 0.22 });
    },

    commRelay: function (idx) {
      api.haptic('latch');
      if (!canPlay()) return;
      playMechSnap(1650, 0.06, 0, 0.12);
      // Brief astropathic tuning static -> carrier lock
      playNoise({ delay: 0.01, dur: 0.085, freq: 1400 - (idx || 0) * 260, freqEnd: 700, q: 2.8, gain: 0.055, wet: 0.28 });
      playTone({
        delay: 0.06,
        dur: 0.11,
        type: 'triangle',
        freq: 440 - (idx || 0) * 85,
        freqEnd: 390 - (idx || 0) * 75,
        gain: 0.048,
        filterFreq: 950,
        wet: 0.32
      });
    },

    commKeyTick: function () {
      api.haptic('tick');
      if (!canPlay()) return;
      var nowMs = performance.now();
      if (nowMs - lastKeyAt < 34) return;
      lastKeyAt = nowMs;

      var jitter = 0.92 + Math.random() * 0.16;
      playNoise({ dur: 0.01, freq: 2200 * jitter, q: 2.6, gain: 0.025, wet: 0.06 });
      playTone({ dur: 0.015, type: 'triangle', freq: 190 * jitter, freqEnd: 85, expFreq: true, gain: 0.028, filterFreq: 540 });
    },

    commTransmit: function () {
      api.haptic('heavy');
      if (!canPlay()) return;
      // 1. Sub-harmonic warp beacon power surge
      playTone({
        dur: 0.56,
        attack: 0.05,
        type: 'sawtooth',
        freq: 55,
        freqEnd: 165,
        expFreq: true,
        gain: 0.11,
        filterFreq: 260,
        filterEnd: 880,
        wet: 0.48
      });
      // 2. Astropathic choir swell
      [146.83, 220.0, 293.66].forEach(function (f, i) {
        playTone({
          delay: 0.06 + i * 0.04,
          dur: 0.65,
          attack: 0.08,
          type: 'triangle',
          freq: f,
          freqEnd: f * 1.015,
          gain: 0.042,
          filterFreq: 950,
          filterEnd: 320,
          wet: 0.56
        });
      });
      // 3. Encrypted data-packet burst
      [0.08, 0.14, 0.20, 0.26, 0.32].forEach(function (t, i) {
        playFM({
          delay: t,
          dur: 0.032,
          freq: 640 + ((i * 190) % 420),
          modFreq: 220,
          modDepth: 150,
          filterFreq: 1850,
          gain: 0.038,
          wet: 0.24
        });
      });
      // 4. Warp static crackle tail
      playNoise({ buf: 'crackle', delay: 0.10, dur: 0.42, freq: 1600, freqEnd: 650, q: 1.5, gain: 0.075, wet: 0.42 });
    },

    commError: function () {
      api.haptic('alert');
      if (!canPlay()) return;
      // Harsh imperial terminal rejection buzz
      [0, 0.16].forEach(function (t) {
        playMechSnap(1100, 0.06, t, 0.10);
        playTone({
          delay: t,
          dur: 0.12,
          type: 'sawtooth',
          freq: 92,
          freqEnd: 78,
          gain: 0.11,
          filterFreq: 420,
          wet: 0.22
        });
        playTone({
          delay: t,
          dur: 0.12,
          type: 'sawtooth',
          freq: 130,
          freqEnd: 112,
          gain: 0.08,
          filterFreq: 480,
          wet: 0.22
        });
      });
    },

    /* 15. Modal & Reboot */
    modalOpen: function () {
      api.haptic('latch');
      if (!canPlay()) return;
      playMechSnap(1650, 0.07, 0, 0.18);
      playTone({ dur: 0.13, type: 'triangle', freq: 150, freqEnd: 290, expFreq: true, gain: 0.06, filterFreq: 680, wet: 0.28 });
    },

    modalClose: function () {
      api.haptic('tap');
      if (!canPlay()) return;
      playMechSnap(1350, 0.065, 0, 0.16);
      playTone({ dur: 0.10, type: 'triangle', freq: 240, freqEnd: 92, expFreq: true, gain: 0.065, filterFreq: 520, wet: 0.22 });
    },

    rebootTerminal: function () {
      api.haptic('heavy');
      if (!canPlay()) return;
      playMechSnap(1150, 0.10, 0, 0.25);
      // Main reactor / CRT spin-down
      playTone({
        dur: 0.48,
        type: 'sawtooth',
        freq: 320,
        freqEnd: 34,
        expFreq: true,
        gain: 0.13,
        filterFreq: 720,
        filterEnd: 90,
        wet: 0.42
      });
      playNoise({
        delay: 0.03,
        dur: 0.34,
        freq: 900,
        freqEnd: 140,
        q: 1.5,
        gain: 0.07,
        wet: 0.32
      });
    }
  };

  return api;
}

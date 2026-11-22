import { useEffect, useRef, useState } from 'react';
import seal from '../assets/castiel-emblem.webp';

function readInitialBgmVol() {
  if (typeof window !== 'undefined' && typeof window.getCogitatorBgmVolume === 'function') {
    return window.getCogitatorBgmVolume();
  }
  try {
    const raw = localStorage.getItem('cogitator_bgm_vol');
    if (raw !== null) {
      const parsed = parseInt(raw, 10);
      if (Number.isFinite(parsed)) return Math.max(0, Math.min(100, parsed));
    }
  } catch {}
  return 30;
}

function readInitialMuted() {
  if (typeof window !== 'undefined' && typeof window.isCogitatorMuted === 'function') {
    return window.isCogitatorMuted();
  }
  try {
    return localStorage.getItem('cogitator_muted') === '1';
  } catch {
    return false;
  }
}

export default function Sidebar({
  collapsed,
  mobile,
  drawerOpen,
  toggleButton,
  onCloseDrawer
}) {
  const expanded = mobile ? drawerOpen : !collapsed;
  const [bgmVol, setBgmVol] = useState(readInitialBgmVol);
  const [voxMuted, setVoxMuted] = useState(readInitialMuted);
  const lastNonZeroRef = useRef(bgmVol > 0 ? bgmVol : 30);

  useEffect(() => {
    setBgmVol(readInitialBgmVol());
    setVoxMuted(readInitialMuted());
    function onAudioChange(event) {
      const detail = event?.detail;
      if (detail && typeof detail.bgVolume === 'number') {
        setBgmVol(detail.bgVolume);
        if (detail.bgVolume > 0) lastNonZeroRef.current = detail.bgVolume;
      } else {
        setBgmVol(readInitialBgmVol());
      }
      if (detail && typeof detail.muted === 'boolean') {
        setVoxMuted(detail.muted);
      } else {
        setVoxMuted(readInitialMuted());
      }
    }
    window.addEventListener('cogitator:audiochange', onAudioChange);
    return () => window.removeEventListener('cogitator:audiochange', onAudioChange);
  }, []);

  function onBgmInput(event) {
    const next = Math.max(0, Math.min(100, Math.round(Number(event.target.value))));
    if (!Number.isFinite(next)) return;
    if (next > 0) lastNonZeroRef.current = next;
    setBgmVol(next);
    if (typeof window.setCogitatorBgmVolume === 'function') {
      window.setCogitatorBgmVolume(next);
    } else {
      try { localStorage.setItem('cogitator_bgm_vol', String(next)); } catch {}
    }
  }

  function toggleBgmMute() {
    const next = bgmVol > 0 ? 0 : (lastNonZeroRef.current || 30);
    if (next > 0) lastNonZeroRef.current = next;
    setBgmVol(next);
    if (typeof window.setCogitatorBgmVolume === 'function') {
      window.setCogitatorBgmVolume(next);
    } else {
      try { localStorage.setItem('cogitator_bgm_vol', String(next)); } catch {}
    }
  }

  useEffect(() => {
    if (!mobile || !drawerOpen) return;
    const content = document.querySelector('main.content');
    if (content) content.inert = true;
    function onEscape(event) {
      if (event.key !== 'Escape') return;
      onCloseDrawer();
      requestAnimationFrame(() => {
        document.querySelector('.sidebar-toggle')?.focus({ preventScroll: true });
      });
    }
    window.addEventListener('keydown', onEscape);
    return () => {
      window.removeEventListener('keydown', onEscape);
      if (content) content.inert = false;
    };
  }, [mobile, drawerOpen, onCloseDrawer]);

  function navigate(event) {
    const item = event.target.closest('.nav-item');
    if (!item || !event.currentTarget.contains(item)) return;
    if (item.getAttribute('aria-current') !== 'page') window.switchTab(item.dataset.tab, item);
    if (mobile) {
      onCloseDrawer();
      requestAnimationFrame(() => {
        document.querySelector('.sidebar-toggle')?.focus({ preventScroll: true });
      });
    }
  }

  return (
    <>
      <div className="sidebar-scrim" data-open={mobile && drawerOpen}
        aria-hidden="true" onClick={onCloseDrawer} />
      <nav className="sidebar" id="terminal-sidebar" data-collapsed={!expanded}
        inert={mobile && !drawerOpen}>
      <div className="sb-head">
        <img className="insignia" src={seal} alt="" />
        {(!mobile || drawerOpen) && toggleButton}
        <span className="sb-chapter">Кровавые Ангелы</span>
        <span className="sb-legion">LEGIONES IX · ORDO XENOS</span>
      </div>
      <div className="sb-nav" id="sidebar-sections" onClick={navigate}>
        <button type="button" className="nav-item active" data-tab="tab-bio" aria-current="page">
          <svg className="ni" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
          <span className="nav-label">Биометрия</span>
        </button>
        <button type="button" className="nav-item" data-tab="tab-dossier">
          <svg className="ni" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
          <span className="nav-label">Досье</span>
        </button>
        <button type="button" className="nav-item" data-tab="tab-armory">
          <svg className="ni" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v4h4v2h-4v4h-2v-4H7v-2h4V7z" /></svg>
          <span className="nav-label">Арсенал</span>
        </button>
        <button type="button" className="nav-item" data-tab="tab-logs">
          <svg className="ni" viewBox="0 0 24 24"><path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" /></svg>
          <span className="nav-label">Личные Логи</span>
          <span className="nav-badge">11</span>
        </button>
        <button type="button" className="nav-item" data-tab="tab-astro">
          <svg className="ni" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
          <span className="nav-label">Астрография</span>
        </button>
        <button type="button" className="nav-item" data-tab="tab-squad">
          <svg className="ni" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
          <span className="nav-label">Боевые Братья</span>
        </button>
        <button type="button" className="nav-item hidden-item" data-tab="tab-sublim" title="ДОСТУП ОГРАНИЧЕН">
          <svg className="ni" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" /></svg>
          <span className="nav-label"><span className="hi-scramble">Закрытый раздел</span><span className="hi-real">Сублимация</span></span>
        </button>
        <button type="button" className="nav-item" data-tab="tab-comm">
          <svg className="ni" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
          <span className="nav-label">Связь</span>
        </button>
      </div>
      <div className="sb-foot" id="sidebar-settings">
        <span id="sb-codex-ref">CODEX REF: IX-884-КАСТИИЛ</span>
        <span className="access-badge" id="sb-access-badge">▪ ДОСТУП: ИНКВИЗИТОР / СМОТРЯЩИЙ-В-ТЬМУ</span>
        <button className="reboot-btn" id="lang-toggle-btn" onClick={() => window.toggleSiteLanguage()} style={{ color: "var(--gold)", borderColor: "var(--gold-dark)" }}>[ ЯЗЫК / LANG: RU ]</button>
        <button className="reboot-btn" id="sfx-toggle-btn" onClick={() => window.toggleCogitatorAudio()}>[ ВОКС-АУДИО: ВКЛ ]</button>
        <div
          className={`bgm-control${voxMuted || bgmVol === 0 ? ' is-off' : ''}`}
          data-vox-muted={voxMuted ? 'true' : 'false'}
        >
          <button
            type="button"
            className="bgm-mute-btn"
            id="bgm-mute-btn"
            onClick={toggleBgmMute}
            aria-label={bgmVol === 0 ? 'Включить фоновую музыку' : 'Отключить фоновую музыку'}
            title={bgmVol === 0 ? 'Включить фоновую музыку' : 'Приглушить фоновую музыку'}
          >
            <svg className="bgm-ico" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M1.8 6h2.9l3.6-3v10L4.7 10H1.8z" fill="currentColor" />
              {bgmVol > 0 && !voxMuted ? (
                <>
                  <path d="M10.4 5.4a3.5 3.5 0 0 1 0 5.2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  {bgmVol >= 45 && (
                    <path d="M12.6 3.5a6.1 6.1 0 0 1 0 9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  )}
                </>
              ) : (
                <path d="M10.4 5.6l3.4 4.8m0-4.8l-3.4 4.8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              )}
            </svg>
            <span className="bgm-tag">
              <span className="localized-copy" lang="ru">ФОН</span>
              <span className="localized-copy" lang="en">BGM</span>
            </span>
          </button>
          <input
            id="bgm-volume-slider"
            className="bgm-slider"
            type="range"
            min={0}
            max={100}
            step={1}
            value={bgmVol}
            onChange={onBgmInput}
            aria-label="Громкость фоновой музыки"
            style={{ '--bgm-pct': `${bgmVol}%` }}
          />
          <span className="bgm-pct" id="bgm-volume-val">
            {voxMuted ? (
              <>
                <span className="localized-copy" lang="ru">ВЫКЛ</span>
                <span className="localized-copy" lang="en">MUTE</span>
              </>
            ) : `${bgmVol}%`}
          </span>
        </div>
        <button className="reboot-btn" id="hotkeys-btn" onClick={() => window.openHotkeysModal()}>
          <span className="localized-copy" lang="ru">[ ? · КЛАВИШИ ]</span>
          <span className="localized-copy" lang="en">[ ? · HOTKEYS ]</span>
        </button>
        <button className="reboot-btn" id="reboot-btn" onClick={() => window.rebootTerminal()}>[ ПЕРЕЗАПУСК КОГИТАТОРА ]</button>
      </div>
      </nav>
    </>
  );
}

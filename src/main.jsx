import { useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import BootScreen from './components/BootScreen.jsx';
import Sidebar from './components/Sidebar.jsx';
import Biometrics from './components/Biometrics.jsx';
import Dossier from './components/Dossier.jsx';
import Armory from './components/Armory.jsx';
import MissionLogs from './components/MissionLogs.jsx';
import Astrography from './components/Astrography.jsx';
import Squad from './components/Squad.jsx';
import Sublimation from './components/Sublimation.jsx';
import Communications from './components/Communications.jsx';
import SquadDialog from './components/SquadDialog.jsx';
import HotkeysDialog from './components/HotkeysDialog.jsx';
import initializeTerminal from '../js/app.js';
import '../css/style.css';
import '../css/refinements.css';

const mobileNavigation = '(max-width: 980px)';

function App() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('cogitator_sidebar') === 'collapsed');
  const [mobile, setMobile] = useState(() => matchMedia(mobileNavigation).matches);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    if (mobile) {
      setDrawerOpen(open => !open);
      return;
    }
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('cogitator_sidebar', next ? 'collapsed' : 'expanded');
      return next;
    });
  }, [mobile]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  useEffect(() => {
    const query = matchMedia(mobileNavigation);
    function resize(event) {
      setMobile(event.matches);
      setDrawerOpen(false);
    }
    query.addEventListener('change', resize);
    return () => query.removeEventListener('change', resize);
  }, []);

  const expanded = mobile ? drawerOpen : !collapsed;
  const toggleButton = (
    <button
      className="sidebar-toggle"
      type="button"
      aria-expanded={expanded}
      aria-controls="terminal-sidebar"
      onClick={toggleSidebar}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="1" />
        <path d="M9 4v16" />
      </svg>
      <span className="visually-hidden localized-copy" lang="ru">{expanded ? 'Свернуть меню' : 'Развернуть меню'}</span>
      <span className="visually-hidden localized-copy" lang="en">{expanded ? 'Collapse navigation' : 'Expand navigation'}</span>
    </button>
  );

  return (
    <>
      <BootScreen />
      {mobile && !drawerOpen && toggleButton}
      <Sidebar
        collapsed={collapsed}
        mobile={mobile}
        drawerOpen={drawerOpen}
        toggleButton={toggleButton}
        onCloseDrawer={closeDrawer}
      />
      <main className="content">
        <div className="content-inner">
          <nav className="breadcrumbs" id="terminal-breadcrumbs" aria-label="Навигация" hidden></nav>
          <Biometrics />
          <Dossier />
          <Armory />
          <MissionLogs />
          <Astrography />
          <Squad />
          <Sublimation />
          <Communications />
        </div>
      </main>
      <SquadDialog />
      <HotkeysDialog />
    </>
  );
}

const root = createRoot(document.getElementById('root'));
// The terminal controller binds interactions to the mounted panels and canvases.
flushSync(() => root.render(<App />));
initializeTerminal();

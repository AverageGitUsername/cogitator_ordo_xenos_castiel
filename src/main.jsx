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
import ArchiveDialog from './components/ArchiveDialog.jsx';
import SquadDialog from './components/SquadDialog.jsx';
import initializeTerminal from '../js/app.js';
import '../css/style.css';
import '../css/refinements.css';

function App() {
  return (
    <>
      <BootScreen />
      <Sidebar />
      <main className="content">
        <div className="content-inner">
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
      <ArchiveDialog />
      <SquadDialog />
    </>
  );
}

const root = createRoot(document.getElementById('root'));
// The terminal controller binds interactions to the mounted panels and canvases.
flushSync(() => root.render(<App />));
initializeTerminal();

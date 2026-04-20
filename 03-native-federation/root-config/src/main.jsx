import { registerApplication, start } from 'single-spa';
import { createRoot } from 'react-dom/client';
import './App.css';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Ayuda from './pages/Ayuda';

// --- Render Root-Config Chrome ---
const headerRoot = createRoot(document.getElementById('root-config-header'));
headerRoot.render(<Header />);

const navRoot = createRoot(document.getElementById('root-config-navbar'));
navRoot.render(<BottomNav />);

// --- Helper: mount local React component as single-spa app ---
function localApp(Component) {
  let root;
  return {
    bootstrap: () => Promise.resolve(),
    mount: () => {
      const container = document.getElementById('mf-container');
      root = createRoot(container);
      root.render(<Component />);
      return Promise.resolve();
    },
    unmount: () => {
      root.unmount();
      return Promise.resolve();
    },
  };
}

// --- Register Applications ---
registerApplication({
  name: '@company/dashboard',
  app: () => Promise.resolve(localApp(Dashboard)),
  activeWhen: ['/dashboard'],
});

registerApplication({
  name: '@company/catalog',
  app: () => import('@company/catalog'),
  activeWhen: ['/productos-contratar'],
});

registerApplication({
  name: '@company/settings',
  app: () => import('@company/settings'),
  activeWhen: ['/productos-contratados'],
});

registerApplication({
  name: '@company/ayuda',
  app: () => Promise.resolve(localApp(Ayuda)),
  activeWhen: ['/ayuda'],
});

// Default route
if (location.pathname === '/') {
  history.replaceState(null, '', '/dashboard');
}

start({ urlRerouteOnly: true });

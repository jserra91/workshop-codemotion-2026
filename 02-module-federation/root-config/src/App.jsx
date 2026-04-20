import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Ayuda from './pages/Ayuda';

const CatalogRemote = lazy(() => import('catalog/Catalog'));
const SettingsRemote = lazy(() => import('settings/Settings'));

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#aaa', fontSize: 14 }}>Cargando microfrontend...</div>}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/productos-contratados" element={<SettingsRemote />} />
              <Route path="/productos-contratar" element={<CatalogRemote />} />
              <Route path="/ayuda" element={<Ayuda />} />
            </Routes>
          </Suspense>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

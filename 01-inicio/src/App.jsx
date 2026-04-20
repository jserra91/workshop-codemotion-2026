import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import ProductosContratados from './pages/ProductosContratados';
import ProductosContratar from './pages/ProductosContratar';
import Ayuda from './pages/Ayuda';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/productos-contratados" element={<ProductosContratados />} />
            <Route path="/productos-contratar" element={<ProductosContratar />} />
            <Route path="/ayuda" element={<Ayuda />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

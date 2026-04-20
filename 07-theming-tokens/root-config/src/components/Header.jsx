import { useEffect, useState } from 'react';

export default function Header() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const stores = window.__MF_STORES__;
    if (stores?.solicitudes?.$solicitudesCount) {
      setCount(stores.solicitudes.$solicitudesCount.get());
      const unsub = stores.solicitudes.$solicitudesCount.subscribe((v) => setCount(v));
      return unsub;
    }
  }, []);

  return (
    <header className="app-header">
      <div className="header-avatar">JS</div>
      <div className="header-info">
        <div className="header-greeting">Buenos días</div>
        <div className="header-name">Jordi Serra</div>
      </div>
      <div className="header-actions">
        <button className="header-btn" aria-label="Notificaciones" style={{ position: 'relative' }}>
          🔔
          {count > 0 && <span className="badge">{count}</span>}
        </button>
        <button className="header-btn" aria-label="Configuración">⚙️</button>
      </div>
    </header>
  );
}

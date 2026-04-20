export default function Header() {
  return (
    <header className="app-header">
      <div className="header-avatar">JS</div>
      <div className="header-info">
        <div className="header-greeting">Buenos días</div>
        <div className="header-name">Jordi Serra</div>
      </div>
      <div className="header-actions">
        <button className="header-btn" aria-label="Notificaciones">🔔</button>
        <button className="header-btn" aria-label="Configuración">⚙️</button>
      </div>
    </header>
  );
}

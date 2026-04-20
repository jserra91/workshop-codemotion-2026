import { navigateToUrl } from 'single-spa';

const tabs = [
  { path: '/dashboard', label: 'Inicio', icon: '🏠' },
  { path: '/productos-contratados', label: 'Productos', icon: '💼' },
  { path: '/productos-contratar', label: 'Contratar', icon: '🛍️' },
  { path: '/ayuda', label: 'Ayuda', icon: '❓' },
];

export default function BottomNav() {
  const current = location.pathname;
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <a
          key={tab.path}
          href={tab.path}
          onClick={navigateToUrl}
          className={`nav-item ${current === tab.path ? 'active' : ''}`}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </a>
      ))}
    </nav>
  );
}

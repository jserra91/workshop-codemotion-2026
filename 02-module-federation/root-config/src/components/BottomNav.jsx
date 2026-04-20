import { NavLink } from 'react-router-dom';

const tabs = [
  { path: '/dashboard', label: 'Inicio', icon: '🏠' },
  { path: '/productos-contratados', label: 'Productos', icon: '💼' },
  { path: '/productos-contratar', label: 'Contratar', icon: '🛍️' },
  { path: '/ayuda', label: 'Ayuda', icon: '❓' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

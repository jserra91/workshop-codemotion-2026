import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="logo">🏪 MF Shop</NavLink>
      <nav>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/catalog">Catálogo</NavLink>
        <NavLink to="/settings">Configuración</NavLink>
      </nav>
    </header>
  );
}

import { useState } from 'react';

export default function Settings() {
  const [theme, setTheme] = useState('light');
  const [locale, setLocale] = useState('es');

  return (
    <div>
      <h1 className="page-title">Configuración</h1>
      <div className="settings-form">
        <div className="form-group">
          <label htmlFor="theme">Tema</label>
          <select id="theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="locale">Idioma</label>
          <select id="locale" value={locale} onChange={(e) => setLocale(e.target.value)}>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Nota: En el monolito, estos ajustes solo afectan a este componente.
          En la arquitectura de microfrontends, se propagarán a toda la aplicación.
        </p>
      </div>
    </div>
  );
}

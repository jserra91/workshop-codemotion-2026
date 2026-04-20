import React, { useState, useEffect } from "react";
import { navigateToUrl } from "single-spa";
import "./styles.css";

const tabs = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    path: "/productos-contratados",
    label: "Contratados",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    path: "/productos-contratar",
    label: "Contratar",
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    path: "/ayuda",
    label: "Ayuda",
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const [activePath, setActivePath] = useState(window.location.pathname);

  useEffect(() => {
    const handler = () => setActivePath(window.location.pathname);
    window.addEventListener("single-spa:routing-event", handler);
    return () =>
      window.removeEventListener("single-spa:routing-event", handler);
  }, []);

  const handleClick = (e, path) => {
    e.preventDefault();
    navigateToUrl(path);
  };

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <a
          key={tab.path}
          href={tab.path}
          className={activePath === tab.path ? "active" : ""}
          onClick={(e) => handleClick(e, tab.path)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </a>
      ))}
    </nav>
  );
}
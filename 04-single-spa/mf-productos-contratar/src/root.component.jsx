import React from "react";
import "./styles.css";

const catalogo = [
  {
    nombre: "Cuenta Joven",
    descripcion: "Sin comisiones hasta los 30 años. Transferencias gratuitas y tarjeta de débito incluida.",
    precio: "Gratis",
    icono: "🎓",
    destacado: true,
    features: ["Sin comisiones", "Tarjeta gratis", "App móvil"],
  },
  {
    nombre: "Depósito a Plazo Fijo",
    descripcion: "Rentabilidad garantizada del 2,5% TAE a 12 meses.",
    precio: "Desde € 1.000",
    icono: "🔒",
    destacado: false,
    features: ["2,5% TAE", "Capital garantizado", "12 meses"],
  },
  {
    nombre: "Seguro de Vida",
    descripcion: "Protección completa para ti y tu familia con cobertura mundial.",
    precio: "Desde € 15/mes",
    icono: "🛡️",
    destacado: false,
    features: ["Cobertura mundial", "Sin carencias", "Asistencia 24h"],
  },
  {
    nombre: "Fondo de Inversión Verde",
    descripcion: "Invierte en empresas sostenibles con impacto positivo.",
    precio: "Desde € 500",
    icono: "🌱",
    destacado: true,
    features: ["Inversión ESG", "Diversificado", "Gestión activa"],
  },
  {
    nombre: "Hipoteca Online",
    descripcion: "Las mejores condiciones del mercado con tramitación 100% digital.",
    precio: "Euríbor + 0,9%",
    icono: "🏡",
    destacado: false,
    features: ["100% online", "Sin comisión apertura", "Hasta 30 años"],
  },
];

export default function ProductosContratar() {
  return (
    <div className="productos-contratar">
      <h2 className="page-title">Catálogo de Productos</h2>
      <p className="page-subtitle">Encuentra el producto perfecto para ti</p>

      <div className="catalogo-list">
        {catalogo.map((p, i) => (
          <div className={`catalogo-card ${p.destacado ? "destacado" : ""}`} key={i}>
            {p.destacado && <div className="badge-destacado">⭐ Destacado</div>}
            <div className="catalogo-header">
              <div className="catalogo-icon">{p.icono}</div>
              <div className="catalogo-precio">{p.precio}</div>
            </div>
            <div className="catalogo-nombre">{p.nombre}</div>
            <div className="catalogo-desc">{p.descripcion}</div>
            <div className="catalogo-features">
              {p.features.map((f, j) => (
                <span className="feature-tag" key={j}>{f}</span>
              ))}
            </div>
            <button className="btn-contratar">Contratar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
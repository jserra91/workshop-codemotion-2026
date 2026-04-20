import React, { useState } from "react";
import "./styles.css";

// ── Nombre del evento que comparte el contrato entre microfrontends ──
const EVENTO_CARRITO = "mf:carrito-actualizado";

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
  // Lista de nombres de productos seleccionados
  const [seleccionados, setSeleccionados] = useState([]);

  const toggleProducto = (nombre) => {
    const nuevaLista = seleccionados.includes(nombre)
      ? seleccionados.filter((n) => n !== nombre)
      : [...seleccionados, nombre];

    setSeleccionados(nuevaLista);

    // ── Emitir Custom Event nativo del navegador ──
    // Cualquier otro microfrontend puede escuchar este evento en window.
    // El contrato es: detail.productos contiene el array de nombres seleccionados.
    window.dispatchEvent(
      new CustomEvent(EVENTO_CARRITO, {
        detail: { productos: nuevaLista },
      })
    );
  };

  return (
    <div className="productos-contratar">
      <h2 className="page-title">Catálogo de Productos</h2>
      <p className="page-subtitle">Encuentra el producto perfecto para ti</p>

      <div className="catalogo-list">
        {catalogo.map((p, i) => {
          const estaSeleccionado = seleccionados.includes(p.nombre);
          return (
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
              <button
                className={`btn-contratar ${estaSeleccionado ? "btn-contratar--seleccionado" : ""}`}
                onClick={() => toggleProducto(p.nombre)}
              >
                {estaSeleccionado ? "✓ Añadido" : "Contratar"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

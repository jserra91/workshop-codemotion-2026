import React, { useState } from "react";
// Importar desde el nombre del Import Map — Vite lo excluye del bundle (external)
// En el navegador, el Import Map resuelve '@mobile-app/ui-kit' → http://localhost:9007/ui-kit.js
import { Button, Card, Badge } from "@mobile-app/ui-kit";
import "./styles.css";

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
  const [seleccionados, setSeleccionados] = useState([]);

  const toggleProducto = (nombre) => {
    const nuevaLista = seleccionados.includes(nombre)
      ? seleccionados.filter((n) => n !== nombre)
      : [...seleccionados, nombre];

    setSeleccionados(nuevaLista);

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
            // Card del ui-kit — reemplaza al <div className="catalogo-card">
            <Card key={i} highlighted={p.destacado}>
              {p.destacado && (
                <div className="badge-destacado">
                  {/* Badge del ui-kit para la etiqueta "Destacado" */}
                  <Badge variant="primary">⭐ Destacado</Badge>
                </div>
              )}
              <div className="catalogo-header">
                <div className="catalogo-icon">{p.icono}</div>
                <Badge variant="primary">{p.precio}</Badge>
              </div>
              <div className="catalogo-nombre">{p.nombre}</div>
              <div className="catalogo-desc">{p.descripcion}</div>
              <div className="catalogo-features">
                {p.features.map((f, j) => (
                  // Badge del ui-kit para cada feature tag
                  <Badge key={j}>{f}</Badge>
                ))}
              </div>
              {/* Button del ui-kit — reemplaza al <button className="btn-contratar"> */}
              <Button
                variant={estaSeleccionado ? "success" : "primary"}
                onClick={() => toggleProducto(p.nombre)}
              >
                {estaSeleccionado ? "✓ Añadido" : "Contratar"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

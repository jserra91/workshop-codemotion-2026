import React from "react";
// Importar desde el nombre del Import Map — Vite lo excluye del bundle (external)
// En el navegador, el Import Map resuelve '@mobile-app/ui-kit' → http://localhost:9007/ui-kit.js
import { Card, Badge } from "@mobile-app/ui-kit";
import "./styles.css";

const productos = [
  {
    nombre: "Cuenta Corriente",
    numero: "ES12 3456 7890 1234 5678",
    estado: "Activa",
    icono: "🏦",
    detalle: "Saldo: € 12.458,32",
    estadoVariant: "success",
  },
  {
    nombre: "Tarjeta Visa Platinum",
    numero: "**** **** **** 4532",
    estado: "Activa",
    icono: "💳",
    detalle: "Límite: € 5.000,00",
    estadoVariant: "success",
  },
  {
    nombre: "Seguro de Hogar Plus",
    numero: "POL-2024-78432",
    estado: "Vigente",
    icono: "🏠",
    detalle: "Vence: 15/03/2027",
    estadoVariant: "success",
  },
  {
    nombre: "Plan de Ahorro Premium",
    numero: "AH-2023-11290",
    estado: "Activo",
    icono: "📈",
    detalle: "Rentabilidad: +3,2%",
    estadoVariant: "success",
  },
  {
    nombre: "Préstamo Personal",
    numero: "PR-2024-55612",
    estado: "En curso",
    icono: "📋",
    detalle: "Pendiente: € 8.750,00",
    estadoVariant: "warning",
  },
];

export default function ProductosContratados() {
  return (
    <div className="productos-contratados">
      <h2 className="page-title">Mis Productos</h2>
      <p className="page-subtitle">{productos.length} productos contratados</p>

      <div className="productos-list">
        {productos.map((p, i) => (
          // Card del ui-kit — reemplaza al <div className="producto-card">
          <Card key={i} padding="16px">
            <div className="producto-inner">
              <div className="producto-icon">{p.icono}</div>
              <div className="producto-info">
                <div className="producto-nombre">{p.nombre}</div>
                <div className="producto-numero">{p.numero}</div>
                <div className="producto-detalle">{p.detalle}</div>
              </div>
              {/* Badge del ui-kit — reemplaza al <div className="producto-estado"> */}
              <Badge variant={p.estadoVariant}>{p.estado}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

const productos = [
  {
    nombre: 'Cuenta Corriente',
    numero: 'ES12 3456 7890 1234 5678',
    estado: 'Activa',
    icono: '💳',
    detalle: 'Saldo: € 12.458,32',
  },
  {
    nombre: 'Tarjeta Visa Platinum',
    numero: '**** **** **** 4532',
    estado: 'Activa',
    icono: '💳',
    detalle: 'Límite: € 5.000,00',
  },
  {
    nombre: 'Seguro de Hogar Plus',
    numero: 'POL-2024-78432',
    estado: 'Vigente',
    icono: '🏠',
    detalle: 'Vence: 15/03/2027',
  },
  {
    nombre: 'Plan de Ahorro Premium',
    numero: 'AH-2023-11290',
    estado: 'Activo',
    icono: '💰',
    detalle: 'Rentabilidad: +3,2%',
  },
  {
    nombre: 'Préstamo Personal',
    numero: 'PR-2024-55612',
    estado: 'En curso',
    icono: '📊',
    detalle: 'Pendiente: € 8.750,00',
  },
];

export default function Settings() {
  return (
    <div>
      <h2 className="page-title">Mis Productos</h2>
      <p className="page-subtitle">{productos.length} productos contratados</p>

      <div className="productos-list">
        {productos.map((p, i) => (
          <div className="producto-card" key={i}>
            <div className="producto-icon">{p.icono}</div>
            <div className="producto-info">
              <div className="producto-nombre">{p.nombre}</div>
              <div className="producto-numero">{p.numero}</div>
              <div className="producto-detalle">{p.detalle}</div>
            </div>
            <div className={`producto-estado estado-${p.estado.toLowerCase().replace(/ /g, '-')}`}>
              {p.estado}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


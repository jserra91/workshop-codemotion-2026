const movimientos = [
  { nombre: 'Supermercado Día', monto: '-€ 47,82', fecha: 'Hoy', icono: '🛒' },
  { nombre: 'Nómina Empresa', monto: '+€ 2.150,00', fecha: '12 Abr', icono: '💰', positivo: true },
  { nombre: 'Netflix', monto: '-€ 15,99', fecha: '10 Abr', icono: '📺' },
  { nombre: 'Gasolinera Shell', monto: '-€ 62,30', fecha: '9 Abr', icono: '⛽' },
  { nombre: 'Transferencia recibida', monto: '+€ 150,00', fecha: '8 Abr', icono: '📤', positivo: true },
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="balance-card">
        <div className="balance-label">Saldo disponible</div>
        <div className="balance-amount">€ 12.458,32</div>
        <div className="balance-account">ES12 3456 7890 1234 5678</div>
      </div>

      <div className="quick-actions">
        <button className="quick-action">
          <div className="qa-icon">📤</div>
          <span>Enviar</span>
        </button>
        <button className="quick-action">
          <div className="qa-icon">📥</div>
          <span>Solicitar</span>
        </button>
        <button className="quick-action">
          <div className="qa-icon">💳</div>
          <span>Tarjetas</span>
        </button>
        <button className="quick-action">
          <div className="qa-icon">📊</div>
          <span>Informes</span>
        </button>
      </div>

      <h3 className="section-title">Últimos movimientos</h3>
      <div className="transactions">
        {movimientos.map((tx, i) => (
          <div className="transaction-item" key={i}>
            <div className="tx-icon">{tx.icono}</div>
            <div className="tx-info">
              <div className="tx-name">{tx.nombre}</div>
              <div className="tx-date">{tx.fecha}</div>
            </div>
            <div className={`tx-amount ${tx.positivo ? 'positive' : ''}`}>
              {tx.monto}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

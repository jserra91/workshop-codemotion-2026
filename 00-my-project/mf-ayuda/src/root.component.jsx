import React, { useState } from "react";
import "./styles.css";

const faqs = [
  {
    pregunta: "¿Cómo puedo cambiar mi contraseña?",
    respuesta: "Ve a Configuración > Seguridad > Cambiar contraseña. Necesitarás tu contraseña actual y recibirás un código de verificación por SMS.",
  },
  {
    pregunta: "¿Cuánto tarda una transferencia?",
    respuesta: "Las transferencias nacionales (SEPA) se procesan en 24 horas laborables. Las transferencias internacionales pueden tardar entre 2 y 5 días laborables.",
  },
  {
    pregunta: "¿Cómo solicitar una nueva tarjeta?",
    respuesta: "Puedes solicitar una nueva tarjeta desde la sección 'Productos para Contratar' o visitando cualquiera de nuestras oficinas con tu DNI.",
  },
  {
    pregunta: "¿Qué hago si pierdo mi tarjeta?",
    respuesta: "Bloquea inmediatamente tu tarjeta desde la app en Tarjetas > Bloquear. También puedes llamarnos al 900 123 456 las 24 horas.",
  },
  {
    pregunta: "¿Cómo activo las notificaciones push?",
    respuesta: "Ve a Configuración > Notificaciones y activa las alertas que desees recibir: movimientos, promociones, seguridad, etc.",
  },
];

export default function Ayuda() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="ayuda">
      <h2 className="page-title">Centro de Ayuda</h2>
      <p className="page-subtitle">¿En qué podemos ayudarte?</p>

      <div className="contact-cards">
        <div className="contact-card">
          <div className="contact-icon">📞</div>
          <div className="contact-title">Llámanos</div>
          <div className="contact-detail">900 123 456</div>
        </div>
        <div className="contact-card">
          <div className="contact-icon">💬</div>
          <div className="contact-title">Chat</div>
          <div className="contact-detail">En línea</div>
        </div>
        <div className="contact-card">
          <div className="contact-icon">✉️</div>
          <div className="contact-title">Email</div>
          <div className="contact-detail">soporte@app.es</div>
        </div>
      </div>

      <h3 className="section-title">Preguntas frecuentes</h3>
      <div className="faq-list">
        {faqs.map((faq, i) => (
          <div className={`faq-item ${openIndex === i ? "open" : ""}`} key={i}>
            <button
              className="faq-question"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span>{faq.pregunta}</span>
              <span className="faq-arrow">{openIndex === i ? "−" : "+"}</span>
            </button>
            {openIndex === i && (
              <div className="faq-answer">{faq.respuesta}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
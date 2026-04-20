import React from 'react';

export function Card({ children, highlighted = false, padding = '20px', style, ...props }) {
  const base = {
    background: 'white',
    borderRadius: '16px',
    padding,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    position: 'relative',
    overflow: 'hidden',
    ...(highlighted ? { border: '2px solid #667eea' } : {}),
    ...style,
  };

  return (
    <div style={base} {...props}>
      {children}
    </div>
  );
}

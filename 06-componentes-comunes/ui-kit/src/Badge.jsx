import React from 'react';

const VARIANTS = {
  default: { background: '#f5f5f5', color: '#555' },
  primary: { background: '#f0f0ff', color: '#667eea' },
  success: { background: '#e8f5e9', color: '#2e7d32' },
  warning: { background: '#fff3e0', color: '#e65100' },
  danger:  { background: '#fdecea', color: '#c62828' },
};

export function Badge({ children, variant = 'default', style, ...props }) {
  const base = {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: '12px',
    whiteSpace: 'nowrap',
    ...VARIANTS[variant],
    ...style,
  };

  return (
    <span style={base} {...props}>
      {children}
    </span>
  );
}

import React from 'react';

const VARIANTS = {
  primary: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
  },
  secondary: {
    background: '#f0f2f5',
    color: '#333',
    border: '1px solid #e0e0e0',
  },
  success: {
    background: 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)',
    color: 'white',
    border: 'none',
  },
  danger: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
  },
};

export function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  fullWidth = true,
  style,
  ...props
}) {
  const base = {
    display: 'block',
    width: fullWidth ? '100%' : 'auto',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'opacity 0.2s',
    fontFamily: 'inherit',
    opacity: disabled ? 0.55 : 1,
    textAlign: 'center',
    ...VARIANTS[variant],
    ...style,
  };

  return (
    <button style={base} onClick={disabled ? undefined : onClick} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

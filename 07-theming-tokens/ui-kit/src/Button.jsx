export function Button({ children, variant = 'primary', onClick, style, ...props }) {
  const baseStyle = {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    fontFamily: 'inherit',
    ...style,
  };

  const variants = {
    primary: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' },
    secondary: { background: '#f0f2f5', color: '#333', border: '1px solid #e0e0e0' },
    danger: { background: '#ef4444', color: 'white' },
  };

  return (
    <button style={{ ...baseStyle, ...variants[variant] }} onClick={onClick} {...props}>
      {children}
    </button>
  );
}

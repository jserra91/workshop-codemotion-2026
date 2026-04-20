export function Card({ children, highlighted, style, ...props }) {
  const baseStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    position: 'relative',
    overflow: 'hidden',
    ...(highlighted ? { border: '2px solid #667eea' } : {}),
    ...style,
  };

  return <div style={baseStyle} {...props}>{children}</div>;
}

export default function ProductCard({ product, onAddToCart }) {
  return (
    <article className="product-card">
      <div className="emoji">{product.image}</div>
      <h3>{product.name}</h3>
      <p className="price">{product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
      <p className="description">{product.description}</p>
      {onAddToCart && (
        <button className="btn btn-primary" onClick={() => onAddToCart(product)}>
          🛒 Añadir al carrito
        </button>
      )}
    </article>
  );
}

import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        <img src={product.image_url} alt={product.name} className="product-image" />
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">${product.price.toFixed(2)}</p>
          <p className="product-stock">
            {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
          </p>
        </div>
      </Link>
      <button
        className="btn btn-primary btn-full"
        onClick={() => addItem(product)}
        disabled={product.stock === 0}
      >
        Agregar al carrito
      </button>
    </div>
  );
}

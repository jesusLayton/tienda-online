import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../services/productService';
import { useCart } from '../context/CartContext';
import Spinner from '../components/Spinner';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProduct(id)
      .then((res) => setProduct(res.data.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <Spinner />;
  if (!product) return null;

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="btn btn-outline back-btn">← Volver</button>
      <div className="product-detail">
        <img src={product.image_url} alt={product.name} className="product-detail-image" />
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <p className="product-detail-price">${product.price.toFixed(2)}</p>
          <p className="product-detail-description">{product.description}</p>
          <p className="product-detail-stock">
            {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
          </p>
          <div className="quantity-selector">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="qty-btn">-</button>
            <span className="qty-value">{quantity}</span>
            <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="qty-btn">+</button>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { addItem(product, quantity); navigate('/cart'); }}
            disabled={product.stock === 0}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}

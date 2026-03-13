import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="page-container empty-cart">
        <h1>Carrito de Compras</h1>
        <p>Tu carrito está vacío.</p>
        <Link to="/products" className="btn btn-primary">Ver Productos</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Carrito de Compras</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image_url} alt={item.name} className="cart-item-image" />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p>${item.price.toFixed(2)}</p>
              </div>
              <div className="cart-item-controls">
                <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <span className="qty-value">{item.quantity}</span>
                <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
              <p className="cart-item-subtotal">${(item.price * item.quantity).toFixed(2)}</p>
              <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.id)}>Quitar</button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h2>Resumen</h2>
          <div className="summary-row">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <button className="btn btn-primary btn-full" onClick={handleCheckout}>
            Proceder al Pago
          </button>
          <button className="btn btn-outline btn-full" onClick={clearCart}>
            Vaciar Carrito
          </button>
        </div>
      </div>
    </div>
  );
}

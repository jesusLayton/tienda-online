import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const orderData = {
        shipping_address: address,
        items: items.map((i) => ({
          product_id: i.id,
          quantity: i.quantity,
          unit_price: i.price,
        })),
      };
      await createOrder(orderData);
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Finalizar Compra</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Dirección de Envío</h2>
          <div className="form-group">
            <label htmlFor="address">Dirección completa</label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={3}
              placeholder="Calle, número, ciudad, país..."
            />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading || items.length === 0}>
            {loading ? 'Procesando...' : 'Confirmar Pedido'}
          </button>
        </form>
        <div className="checkout-summary">
          <h2>Tu Pedido</h2>
          {items.map((item) => (
            <div key={item.id} className="checkout-item">
              <span>{item.name} x{item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row total-row">
            <strong>Total</strong>
            <strong>${total.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

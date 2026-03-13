import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../services/orderService';
import Spinner from '../components/Spinner';

const STATUS_LABELS = {
  pending: 'Pendiente',
  processing: 'En proceso',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrders()
      .then((res) => setOrders(res.data.data))
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar pedidos'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="page-container">
      <h1>Mis Pedidos</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {orders.length === 0 ? (
        <div className="empty-state">
          <p>No tienes pedidos aún.</p>
          <Link to="/products" className="btn btn-primary">Ir a comprar</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link to={`/orders/${order.id}`} key={order.id} className="order-card">
              <div className="order-header">
                <span>Pedido #{order.id}</span>
                <span className={`status-badge status-${order.status}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              <div className="order-meta">
                <span>Total: ${Number(order.total).toFixed(2)}</span>
                <span>{new Date(order.created_at).toLocaleDateString('es-ES')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

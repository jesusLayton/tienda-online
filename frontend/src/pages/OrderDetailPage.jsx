import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder } from '../services/orderService';
import Spinner from '../components/Spinner';

const STATUS_LABELS = {
  pending: 'Pendiente',
  processing: 'En proceso',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id)
      .then((res) => setOrder(res.data.data))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <Spinner />;
  if (!order) return null;

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="btn btn-outline back-btn">← Volver</button>
      <h1>Pedido #{order.id}</h1>
      <div className="order-detail">
        <div className="order-info-grid">
          <div>
            <strong>Estado:</strong>
            <span className={`status-badge status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
          </div>
          <div><strong>Fecha:</strong> {new Date(order.created_at).toLocaleDateString('es-ES')}</div>
          <div><strong>Dirección:</strong> {order.shipping_address}</div>
          <div><strong>Total:</strong> ${Number(order.total).toFixed(2)}</div>
        </div>
        <h2>Productos</h2>
        <table className="order-items-table">
          <thead>
            <tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            {order.order_items?.map((item) => (
              <tr key={item.id}>
                <td>{item.product?.name || `Producto #${item.product_id}`}</td>
                <td>{item.quantity}</td>
                <td>${Number(item.unit_price).toFixed(2)}</td>
                <td>${(item.quantity * item.unit_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

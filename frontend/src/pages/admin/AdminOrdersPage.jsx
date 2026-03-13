import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import Spinner from '../../components/Spinner';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_LABELS = { pending: 'Pendiente', processing: 'En proceso', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado' };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = () => {
    setLoading(true);
    getOrders().then((res) => setOrders(res.data.data)).catch((err) => setError(err.response?.data?.error || 'Error')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar estado');
    }
  };

  return (
    <div className="page-container">
      <h1>Gestión de Pedidos</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <Spinner /> : (
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Usuario</th><th>Total</th><th>Fecha</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.user?.name || o.user_id}</td>
                <td>${Number(o.total).toFixed(2)}</td>
                <td>{new Date(o.created_at).toLocaleDateString('es-ES')}</td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className={`status-select status-${o.status}`}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

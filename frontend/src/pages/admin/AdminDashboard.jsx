import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="page-container">
      <h1>Panel de Administración</h1>
      <div className="admin-grid">
        <Link to="/admin/products" className="admin-card">
          <h2>Productos</h2>
          <p>Gestionar catálogo de productos</p>
        </Link>
        <Link to="/admin/categories" className="admin-card">
          <h2>Categorías</h2>
          <p>Gestionar categorías</p>
        </Link>
        <Link to="/admin/orders" className="admin-card">
          <h2>Pedidos</h2>
          <p>Ver y gestionar pedidos</p>
        </Link>
        <Link to="/admin/users" className="admin-card">
          <h2>Usuarios</h2>
          <p>Crear, editar y eliminar usuarios</p>
        </Link>
      </div>
    </div>
  );
}

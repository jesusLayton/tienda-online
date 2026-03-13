import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">{import.meta.env.VITE_APP_NAME || 'Mi Tienda'}</Link>
      </div>
      <div className="navbar-links">
        <Link to="/products">Productos</Link>
        {user ? (
          <>
            <Link to="/orders">Mis Pedidos</Link>
            {isAdmin && <Link to="/admin">Admin</Link>}
            <Link to="/cart" className="cart-link">
              Carrito <span className="cart-badge">{count}</span>
            </Link>
            <button onClick={handleLogout} className="btn btn-outline">
              Salir ({user.name})
            </button>
          </>
        ) : (
          <>
            <Link to="/cart" className="cart-link">
              Carrito <span className="cart-badge">{count}</span>
            </Link>
            <Link to="/login" className="btn btn-outline">Iniciar Sesión</Link>
            <Link to="/register" className="btn btn-primary">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}

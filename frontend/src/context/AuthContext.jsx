import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, register as registerService, logout as logoutService, getMe } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // El token está en HttpOnly cookie — simplemente intentamos obtener el perfil
    getMe()
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const res = await loginService(credentials);
    const { user: userData } = res.data.data;
    // El token se guarda automáticamente en HttpOnly cookie por el servidor
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await registerService(data);
    const { user: userData } = res.data.data;
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await logoutService().catch(() => {});
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

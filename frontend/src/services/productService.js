import api from './api';

// Mock data mientras el backend no está listo
const MOCK_PRODUCTS = [
  { id: 1, name: 'Laptop Pro 15', slug: 'laptop-pro-15', description: 'Potente laptop para profesionales', price: 1299.99, stock: 10, image_url: 'https://placehold.co/400x300?text=Laptop', category_id: 1, is_active: true },
  { id: 2, name: 'Mouse Inalámbrico', slug: 'mouse-inalambrico', description: 'Mouse ergonómico sin cables', price: 39.99, stock: 50, image_url: 'https://placehold.co/400x300?text=Mouse', category_id: 1, is_active: true },
  { id: 3, name: 'Camiseta Básica', slug: 'camiseta-basica', description: 'Camiseta de algodón 100%', price: 19.99, stock: 100, image_url: 'https://placehold.co/400x300?text=Camiseta', category_id: 2, is_active: true },
  { id: 4, name: 'Auriculares BT', slug: 'auriculares-bt', description: 'Sonido de alta fidelidad', price: 89.99, stock: 25, image_url: 'https://placehold.co/400x300?text=Auriculares', category_id: 1, is_active: true },
  { id: 5, name: 'Libro JavaScript', slug: 'libro-javascript', description: 'Aprende JS desde cero', price: 29.99, stock: 30, image_url: 'https://placehold.co/400x300?text=Libro', category_id: 3, is_active: true },
];

const USE_MOCK = true; // Cambiar a false cuando el backend esté listo

export const getProducts = async (params) => {
  if (USE_MOCK) {
    return { data: { success: true, data: MOCK_PRODUCTS, pagination: { page: 1, limit: 10, total: MOCK_PRODUCTS.length } } };
  }
  return api.get('/products', { params });
};

export const getProduct = async (id) => {
  if (USE_MOCK) {
    const product = MOCK_PRODUCTS.find((p) => p.id === Number(id));
    return { data: { success: true, data: product } };
  }
  return api.get(`/products/${id}`);
};

export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

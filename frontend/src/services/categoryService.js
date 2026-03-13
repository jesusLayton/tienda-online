import api from './api';

const MOCK_CATEGORIES = [
  { id: 1, name: 'Electrónica', slug: 'electronica', description: 'Gadgets y tecnología' },
  { id: 2, name: 'Ropa', slug: 'ropa', description: 'Moda y accesorios' },
  { id: 3, name: 'Libros', slug: 'libros', description: 'Literatura y educación' },
  { id: 4, name: 'Hogar', slug: 'hogar', description: 'Para tu casa' },
  { id: 5, name: 'Deportes', slug: 'deportes', description: 'Equipamiento deportivo' },
];

const USE_MOCK = true;

export const getCategories = async () => {
  if (USE_MOCK) {
    return { data: { success: true, data: MOCK_CATEGORIES } };
  }
  return api.get('/categories');
};

export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

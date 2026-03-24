const BASE_URL = 'http://localhost:5000';

const request = async (url, options = {}) => {
    const res = await fetch(`${BASE_URL}${url}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
};

// Categories
export const getCategories = () => request('/categories');
export const getCategoryById = (id) => request(`/categories/${id}`);
export const createCategory = (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) });
export const updateCategory = (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCategory = (id) => request(`/categories/${id}`, { method: 'DELETE' });

// Products
export const getProducts = (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && v !== '' && query.append(k, v));
    return request(`/products?${query.toString()}`);
};
export const getProductById = (id) => request(`/products/${id}`);
export const createProduct = (data) => request('/products', { method: 'POST', body: JSON.stringify(data) });
export const updateProduct = (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProduct = (id) => request(`/products/${id}`, { method: 'DELETE' });

// Reviews
export const getReviews = (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/reviews?${query.toString()}`);
};
export const createReview = (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) });
export const updateReview = (id, data) => request(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteReview = (id) => request(`/reviews/${id}`, { method: 'DELETE' });

// Orders
export const getOrders = (params = {}) => {
    const query = new URLSearchParams(params);
    return request(`/orders?${query.toString()}`);
};
export const getOrderById = (id) => request(`/orders/${id}`);
export const createOrder = (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) });
export const updateOrder = (id, data) => request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteOrder = (id) => request(`/orders/${id}`, { method: 'DELETE' });

// Users
export const getUsers = () => request('/users');
export const getUserById = (id) => request(`/users/${id}`);
export const getUserByEmail = (email) => request(`/users?email=${encodeURIComponent(email)}`);
export const createUser = (data) => request('/users', { method: 'POST', body: JSON.stringify(data) });
export const updateUser = (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });

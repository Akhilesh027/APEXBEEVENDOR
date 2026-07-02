import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://server.apexbee.in/api';

const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

export const productService = {
  getAll: async () => {
    const res = await axios.get(`${API_URL}/products`, {
      headers: authHeaders(),
    });
    return res.data.products;
  },

  getMyProducts: async (sellerId?: string) => {
    const res = await axios.get(`${API_URL}/products/my-products`, {
      headers: authHeaders(),
      params: sellerId ? { sellerId } : {},
    });
    return res.data.products;
  },

  getById: async (id: string) => {
    const res = await axios.get(`${API_URL}/products/${id}`, {
      headers: authHeaders(),
    });
    return res.data.product;
  },

  create: async (formData: any) => {
    const res = await axios.post(`${API_URL}/products`, formData, {
      headers: authHeaders(),
    });
    return res.data.product;
  },

  update: async (id: string, formData: any) => {
    const res = await axios.put(`${API_URL}/products/${id}`, formData, {
      headers: authHeaders(),
    });
    return res.data.product;
  },

  delete: async (id: string) => {
    const res = await axios.delete(`${API_URL}/products/${id}`, {
      headers: authHeaders(),
    });
    return res.data;
  },

  sellerAcceptPricing: async (id: string) => {
    const res = await axios.patch(
      `${API_URL}/products/${id}/seller-accept-pricing`,
      {},
      { headers: authHeaders() }
    );
    return res.data.product;
  },

  sellerNegotiatePricing: async (id: string, payload: any) => {
    const res = await axios.patch(
      `${API_URL}/products/${id}/seller-negotiate-pricing`,
      payload,
      { headers: authHeaders() }
    );
    return res.data.product;
  },

  bulkUpdate: async (payload: any) => {
    const res = await axios.post(`${API_URL}/products/bulk-update`, payload, {
      headers: authHeaders(),
    });
    return res.data;
  },
};
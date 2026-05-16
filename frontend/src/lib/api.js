import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  timeout: 20000,
});

export const fetchCollections = async () => {
  const { data } = await api.get(`/store/collections`);
  return data; // { data_source, collections }
};

export const fetchProducts = async (collectionHandle) => {
  const params = collectionHandle ? { collection: collectionHandle } : {};
  const { data } = await api.get(`/store/products`, { params });
  return data; // { data_source, products }
};

export const startCheckout = async (lines) => {
  // lines: [{ merchandiseId, quantity }]
  const { data } = await api.post(`/store/checkout`, { lines });
  return data; // { data_source, checkoutUrl?, message? }
};

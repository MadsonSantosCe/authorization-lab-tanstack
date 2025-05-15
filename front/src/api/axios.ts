import axios from 'axios';
import { getAccessToken, saveAccessToken } from '../auth/auth';

const api = axios.create({
  baseURL: 'http://localhost:3000', // ajuste conforme sua API
  withCredentials: true, // necessário para enviar o cookie com o refresh token
});

// Adiciona o access token no header de cada requisição
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta para lidar com refresh token automático
api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    // Garante que só tentamos 1 vez o refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/login') &&
      !originalRequest.url.includes('/refresh-token')
    ) {
      originalRequest._retry = true;

      try {
        const res = await api.post('/refresh-token');
        const newAccessToken = res.data.accessToken;
        saveAccessToken(newAccessToken);

        // Atualiza o header da requisição original com o novo token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Reexecuta a requisição original com novo token
        return api(originalRequest);
      } catch (refreshError) {
        // Falhou o refresh: redireciona para login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

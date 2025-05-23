import axios from 'axios';
import { clearToken, getAccessToken, setToken } from '../utils/authStorage';

// Crie a instância do Axios
const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // Substitua pela URL base da sua API
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador de Requisição: Injeta o Token de Acesso
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptador de Resposta: Lida com Erros 401 e Refresh de Token
let isRefreshing = false;
interface FailedQueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

let failedQueue: FailedQueueItem[] = [];

interface ProcessQueueError {
  message?: string;
}

type Token = string | null;

interface FailedQueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

const processQueue = (error: ProcessQueueError | null, token: Token = null): void => {
  failedQueue.forEach((prom: FailedQueueItem) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // Qualquer código de status dentro do range 2xx faz essa função disparar
    return response;
  },
  async (error) => {
    // Qualquer código de status fora do range 2xx faz essa função disparar
    const originalRequest = error.config;

    // Verifica se o erro é 401 e não é a própria requisição de refresh
    if (error.response?.status === 401 && originalRequest.url !== '/refresh-token') { // Ajuste '/auth/refresh' para seu endpoint
      if (isRefreshing) {
        // Se o token já está sendo atualizado, enfileira a requisição original
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest); // Tenta novamente com o novo token
        }).catch(err => {
          return Promise.reject(err); // Propaga o erro do refresh
        });
      }

      originalRequest._retry = true; // Marca a requisição para evitar loop infinito
      isRefreshing = true;      

      try {
        // Faça a chamada para sua API de refresh
        const response = await axios.post(
          `${apiClient.defaults.baseURL}/refresh-token`,
          {},
          { withCredentials: true }
        );

        // Extraia os novos tokens da resposta da sua API
        const { accessToken: accessToken } = response.data; // Ajuste baseado na estrutura da sua resposta

        setToken(accessToken);

        // Atualiza o header padrão para requisições futuras
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        // Atualiza o header da requisição original que falhou
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        processQueue(null, accessToken); // Processa a fila de requisições com o novo token
        return apiClient(originalRequest); // Tenta novamente a requisição original

      } catch (refreshError) {
        console.error('Falha ao atualizar o token:', refreshError);
        clearToken();
        // Redireciona para login ou trata o logout
        window.location.href = '/login'; // Ajuste conforme necessário
        processQueue(refreshError as ProcessQueueError, null); // Rejeita as requisições na fila
        return Promise.reject(refreshError); // Rejeita a promise da requisição original
      } finally {
        isRefreshing = false;
      }
    }

    // Para erros diferentes de 401, apenas rejeita a promise
    return Promise.reject(error);
  }
);

export default apiClient;
import axios from 'axios';

import {
  useAuthStore,
} from '../features/auth/store/authStore';

const API_URL="https://localhost:7073/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

let isRefreshing = false;
let pendingRequests = [];

function processQueue(error, token = null) {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  pendingRequests = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken =
          useAuthStore.getState().refreshToken;

        if (!refreshToken) {
          throw new Error('Refresh token is missing.');
        }

        const response = await axios.post(
          'https://localhost:7001/api/auth/refresh',
          {
            refreshToken,
          }
        );

        const {
          accessToken,
          refreshToken: newRefreshToken,
          userId,
          userName,
          email,
          firstName,
          lastName,
        } = response.data;

        useAuthStore.getState().setAuth({
          accessToken,
          refreshToken: newRefreshToken,
          user: {
            userId,
            userName,
            email,
            firstName,
            lastName,
          },
        });

        processQueue(null, accessToken);

        originalRequest.headers.Authorization =
          `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        useAuthStore.getState().logout();

        window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
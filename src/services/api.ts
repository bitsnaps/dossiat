import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

const TOKEN_KEY = 'dossiat_access_token'
const REFRESH_TOKEN_KEY = 'dossiat_refresh_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach Authorization header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor — handle 401 with token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

      if (!refreshToken) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken },
        )

        const { accessToken, refreshToken: newRefreshToken } = response.data.data
        localStorage.setItem(TOKEN_KEY, accessToken)
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

export function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return api.get(url, config).then((res) => res.data)
}

export function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return api.post(url, data, config).then((res) => res.data)
}

export function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return api.put(url, data, config).then((res) => res.data)
}

export function patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  return api.patch(url, data, config).then((res) => res.data)
}

export function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return api.delete(url, config).then((res) => res.data)
}

export default api

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth-store'

export type ApiResponse<T> = {
  finalizado: boolean
  mensaje: string
  datos: T
}

export type ApiList<T> = {
  total: number
  filas: T[]
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState().auth
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

let refreshing: Promise<string> | null = null

async function refreshAccessToken() {
  const { auth } = useAuthStore.getState()
  const { data } = await axios.post<ApiResponse<{ access_token: string }>>(
    `${api.defaults.baseURL}/token`,
    { token: auth.accessToken },
    { withCredentials: true }
  )
  auth.setAccessToken(data.datos.access_token)
  return data.datos.access_token
}

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config as
    | (InternalAxiosRequestConfig & { _retry?: boolean })
    | undefined
  const { accessToken } = useAuthStore.getState().auth

  if (
    error.response?.status !== 401 ||
    !original ||
    original._retry ||
    original.url === '/auth' ||
    !accessToken
  ) {
    throw error
  }

  original._retry = true
  try {
    refreshing ??= refreshAccessToken().finally(() => (refreshing = null))
    const token = await refreshing
    original.headers.Authorization = `Bearer ${token}`
    return api(original)
  } catch {
    useAuthStore.getState().auth.reset()
    throw error
  }
})

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error inesperado.'
) {
  if (error instanceof AxiosError) {
    const mensaje = error.response?.data?.mensaje
    if (typeof mensaje === 'string' && mensaje.length > 0) return mensaje
    if (!error.response) return 'No se pudo conectar con el servidor.'
  }
  return fallback
}

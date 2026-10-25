import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type ApiResponse } from '@/api/client'
import { type AuthUser, useAuthStore } from '@/stores/auth-store'

type LoginInput = {
  correoElectronico: string
  contrasena: string
}

type LoginResponse = AuthUser & { access_token: string }

type ChangePasswordInput = {
  contrasenaActual: string
  contrasenaNueva: string
}

// El backend decodifica las contraseñas con atob + decodeURI
const encodePassword = (value: string) => btoa(encodeURI(value))

export function useLogin() {
  const { auth } = useAuthStore()

  return useMutation({
    mutationFn: async ({ correoElectronico, contrasena }: LoginInput) => {
      const { data } = await api.post<ApiResponse<LoginResponse>>('/auth', {
        correoElectronico,
        contrasena: encodePassword(contrasena),
      })
      return data.datos
    },
    onSuccess: ({ access_token, ...user }) => {
      auth.setAccessToken(access_token)
      auth.setUser(user)
    },
  })
}

export function useChangePassword() {
  const { auth } = useAuthStore()

  return useMutation({
    mutationFn: async ({
      contrasenaActual,
      contrasenaNueva,
    }: ChangePasswordInput) => {
      const { data } = await api.patch<
        ApiResponse<{ requiereCambioContrasena: boolean }>
      >('/usuarios/cuenta/contrasena', {
        contrasenaActual: encodePassword(contrasenaActual),
        contrasenaNueva: encodePassword(contrasenaNueva),
      })
      return data.datos
    },
    onSuccess: ({ requiereCambioContrasena }) => {
      if (auth.user) auth.setUser({ ...auth.user, requiereCambioContrasena })
    },
  })
}

export function useLogout() {
  const { auth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.get('/logout'),
    onSettled: () => {
      auth.reset()
      queryClient.clear()
    },
  })
}

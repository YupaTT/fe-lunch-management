import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { api, type ApiList, type ApiResponse } from '@/api/client'
import {
  type ContrasenaTemporal,
  type Rol,
  type Usuario,
  type UsuarioPayload,
  type UsuariosParams,
} from './data/schema'

const usuariosKey = ['usuarios'] as const

export function useUsuarios(params: UsuariosParams) {
  return useQuery({
    queryKey: [...usuariosKey, params],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiResponse<ApiList<Usuario>>>(
        '/usuarios',
        { params, signal }
      )
      return data.datos
    },
    placeholderData: keepPreviousData,
  })
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiResponse<Rol[]>>(
        '/autorizacion/roles',
        { signal }
      )
      return data.datos
    },
    staleTime: Infinity,
  })
}

function useUsuarioMutation<TVars, TData>(
  mutationFn: (vars: TVars) => Promise<TData>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usuariosKey }),
  })
}

export function useCrearUsuario() {
  return useUsuarioMutation(async (payload: UsuarioPayload) => {
    const { data } = await api.post<ApiResponse<ContrasenaTemporal>>(
      '/usuarios',
      payload
    )
    return data.datos
  })
}

export function useActualizarUsuario() {
  return useUsuarioMutation(
    async ({ id, payload }: { id: string; payload: UsuarioPayload }) => {
      await api.patch(`/usuarios/${id}`, payload)
    }
  )
}

export function useCambiarEstadoUsuario() {
  return useUsuarioMutation(
    async ({ id, activar }: { id: string; activar: boolean }) => {
      await api.patch(
        `/usuarios/${id}/${activar ? 'activacion' : 'inactivacion'}`
      )
    }
  )
}

export function useRestaurarContrasena() {
  return useUsuarioMutation(async (id: string) => {
    const { data } = await api.patch<ApiResponse<ContrasenaTemporal>>(
      `/usuarios/${id}/restauracion`,
      {}
    )
    return data.datos
  })
}

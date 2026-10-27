import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { api, type ApiResponse } from '@/api/client'
import {
  type DetallePension,
  type FilaPensionado,
  type PensionHogar,
} from './schema'

// reservas/api.ts y menu/api.ts invalidan este mismo literal
const pensionKey = ['pension'] as const

// Pensión del hogar de un titular; sin titular, el backend usa al empleado autenticado
export function usePensionHogar(
  mes: string,
  idUsuarioTitular?: string,
  enabled = true
) {
  return useQuery({
    queryKey: [...pensionKey, 'hogar', mes, idUsuarioTitular],
    enabled,
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiResponse<PensionHogar>>('/pensiones', {
        params: { mes, idUsuarioTitular },
        signal,
      })
      return data.datos
    },
    placeholderData: keepPreviousData,
  })
}

export function usePensionados(mes: string) {
  return useQuery({
    queryKey: [...pensionKey, 'pensionados', mes],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiResponse<FilaPensionado[]>>(
        '/pensiones/pensionados',
        { params: { mes }, signal }
      )
      return data.datos
    },
    placeholderData: keepPreviousData,
  })
}

export function useDetallePension(id: string, mes: string) {
  return useQuery({
    queryKey: [...pensionKey, 'suscripcion', id, mes],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiResponse<DetallePension>>(
        `/pensiones/suscripciones/${id}`,
        { params: { mes }, signal }
      )
      return data.datos
    },
    placeholderData: keepPreviousData,
  })
}

function usePensionMutation<TVars, TData>(
  mutationFn: (vars: TVars) => Promise<TData>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pensionKey })
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
    },
  })
}

export function useActivarPension() {
  return usePensionMutation(
    (body: { idPersona: string; idUsuarioTitular?: string }) =>
      api.post<ApiResponse<{ mesInicio: string }>>(
        '/pensiones/suscripciones',
        body
      )
  )
}

export function useCancelarPension() {
  return usePensionMutation((id: string) =>
    api.patch(`/pensiones/suscripciones/${id}/cancelacion`)
  )
}

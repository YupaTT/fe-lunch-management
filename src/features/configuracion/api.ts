import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiResponse } from '@/api/client'

export type Configuracion = {
  horaLimite: string
  minimoPension: number
  precioPension: number
}

const configuracionKey = ['configuracion'] as const

export function useConfiguracion() {
  return useQuery({
    queryKey: configuracionKey,
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiResponse<Configuracion>>(
        '/parametros/configuracion',
        { signal }
      )
      return data.datos
    },
  })
}

export function useActualizarConfiguracion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (
      payload: Pick<Configuracion, 'horaLimite' | 'minimoPension'>
    ) => {
      const { data } = await api.patch<ApiResponse<Configuracion>>(
        '/parametros/configuracion',
        payload
      )
      return data.datos
    },
    onSuccess: (data) => queryClient.setQueryData(configuracionKey, data),
  })
}

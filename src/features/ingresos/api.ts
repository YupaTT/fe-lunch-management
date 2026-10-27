import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiResponse } from '@/api/client'
import { type ListaIngreso } from './schema'

export function useListaIngreso(fecha: string) {
  return useQuery({
    queryKey: ['ingresos', fecha],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiResponse<ListaIngreso>>('/ingresos', {
        params: { fecha },
        signal,
      })
      return data.datos
    },
  })
}

function useCambiarIngreso(accion: 'registro' | 'anulacion') {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/ingresos/${id}/${accion}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingresos'] }),
  })
}

export function useRegistrarIngreso() {
  return useCambiarIngreso('registro')
}

export function useAnularIngreso() {
  return useCambiarIngreso('anulacion')
}

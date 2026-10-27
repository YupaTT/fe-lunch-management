import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiList, type ApiResponse } from '@/api/client'
import { type Beneficiario, type Reserva } from './schema'

// El backend acepta como máximo 50 filas por página
const LIMITE_RESERVAS = 50

// Reservas del titular y de sus familiares en el rango, recorriendo páginas
export function useReservas(desde: string, hasta: string) {
  return useQuery({
    queryKey: ['reservas', desde, hasta],
    queryFn: async ({ signal }) => {
      const reservas = new Map<string, Reserva>()
      let total = 0
      for (let pagina = 1; pagina === 1 || reservas.size < total; pagina++) {
        const { data } = await api.get<ApiResponse<ApiList<Reserva>>>(
          '/reservas',
          {
            params: { desde, hasta, limite: LIMITE_RESERVAS, pagina },
            signal,
          }
        )
        total = data.datos.total
        if (data.datos.filas.length === 0) break
        data.datos.filas.forEach((reserva) => reservas.set(reserva.id, reserva))
      }
      return [...reservas.values()]
    },
  })
}

export function useBeneficiarios() {
  return useQuery({
    queryKey: ['beneficiarios'],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiResponse<Beneficiario[]>>(
        '/reservas/beneficiarios',
        { signal }
      )
      return data.datos
    },
  })
}

export function useCrearReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ fecha, idPersona }: { fecha: string; idPersona: string }) =>
      api.post('/reservas', { fecha, idPersona }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservas'] }),
  })
}

export function useCancelarReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/reservas/${id}/cancelacion`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      // Cancelar un día de pensión también actualiza la pensión
      queryClient.invalidateQueries({ queryKey: ['pension'] })
    },
  })
}

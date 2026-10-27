import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiList, type ApiResponse } from '@/api/client'

export type EstadoMenu =
  | 'DISPONIBLE'
  | 'SIN_SERVICIO'
  | 'PENDIENTE'
  | 'FUERA_DE_ATENCION'

export type MenuDia = {
  fecha: string
  estado: EstadoMenu
  id?: string
  descripcion?: string
  reservable?: boolean
  motivoSinServicio?: string
  detalleMotivo?: string | null
}

export type EstadoReserva = 'RESERVADO' | 'CANCELADO' | 'ASISTIO' | 'NO_ASISTIO'

export type Reserva = {
  id: string
  fecha: string
  parentesco: string | null
  estado: EstadoReserva
}

type Ingresos = {
  fecha: string
  totalRaciones: number
  ingresaron: { total: number }
  faltan: { total: number }
}

// El backend acepta como máximo 50 filas por página
const LIMITE_RESERVAS = 50

export function useMenus(desde: string, hasta: string) {
  return useQuery({
    queryKey: ['menus', desde, hasta],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiResponse<MenuDia[]>>('/menus', {
        params: { desde, hasta },
        signal,
      })
      return data.datos
    },
  })
}

// Reservas propias del titular (sin familiares) en el rango, recorriendo páginas
export function useMisReservas(desde: string, hasta: string) {
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
      return [...reservas.values()].filter(
        (reserva) => reserva.parentesco === null
      )
    },
  })
}

export function useCrearReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (fecha: string) => api.post('/reservas', { fecha }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservas'] }),
  })
}

export function useCancelarReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/reservas/${id}/cancelacion`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservas'] }),
  })
}

export function useIngresos(fecha: string) {
  return useQuery({
    queryKey: ['ingresos', fecha],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiResponse<Ingresos>>('/ingresos', {
        params: { fecha },
        signal,
      })
      return data.datos
    },
  })
}

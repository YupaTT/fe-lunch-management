import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiResponse } from '@/api/client'
import { type MenuDia, type MotivoSinServicio } from './schema'

export type DiaPublicar =
  | { fecha: string; estado: 'DISPONIBLE'; descripcion: string }
  | {
      fecha: string
      estado: 'SIN_SERVICIO'
      motivoSinServicio: MotivoSinServicio
      detalleMotivo?: string
    }

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

export function usePublicarMenu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dias: DiaPublicar[]) => api.post('/menus', { dias }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
      // Publicar un día sin servicio cancela sus reservas y días de pensión
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      queryClient.invalidateQueries({ queryKey: ['pension'] })
    },
  })
}

export function useActualizarDescripcion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, descripcion }: { id: string; descripcion: string }) =>
      api.patch(`/menus/${id}`, { descripcion }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['menus'] }),
  })
}

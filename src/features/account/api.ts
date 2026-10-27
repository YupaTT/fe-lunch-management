import { useQuery } from '@tanstack/react-query'
import { api, type ApiResponse } from '@/api/client'
import { type Persona } from '@/lib/persona'

export type Perfil = {
  id: string
  correoElectronico: string
  estado: 'ACTIVO' | 'INACTIVO' | 'PENDIENTE'
  requiereCambioContrasena: boolean
  roles: { idRol: string; rol: string; nombre: string }[]
  persona: Persona
}

export function usePerfil() {
  return useQuery({
    queryKey: ['perfil'],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiResponse<Perfil>>(
        '/usuarios/cuenta/perfil',
        { signal }
      )
      return data.datos
    },
  })
}

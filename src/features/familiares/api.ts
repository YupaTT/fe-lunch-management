import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiList, type ApiResponse } from '@/api/client'
import { type PersonaPayload } from '@/lib/persona'
import { type Familiar } from './schema'

const familiaresKey = ['familiares'] as const

type FamiliarPayload = {
  parentesco: string
  persona: PersonaPayload
}

export function useFamiliares(idUsuarioTitular: string) {
  return useQuery({
    queryKey: [...familiaresKey, idUsuarioTitular],
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiResponse<ApiList<Familiar>>>(
        '/familiares',
        { params: { idUsuarioTitular, limite: 50 }, signal }
      )
      return data.datos
    },
  })
}

function useFamiliarMutation<TVars>(
  mutationFn: (vars: TVars) => Promise<unknown>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familiaresKey })
      // La cantidad de familiares se muestra en el listado de empleados
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
  })
}

export function useCrearFamiliar() {
  return useFamiliarMutation(
    (payload: FamiliarPayload & { idUsuarioTitular: string }) =>
      api.post('/familiares', payload)
  )
}

export function useActualizarFamiliar() {
  return useFamiliarMutation(
    ({ id, payload }: { id: string; payload: FamiliarPayload }) =>
      api.patch(`/familiares/${id}`, payload)
  )
}

export function useCambiarEstadoFamiliar() {
  return useFamiliarMutation(
    ({ id, activar }: { id: string; activar: boolean }) =>
      api.patch(`/familiares/${id}/${activar ? 'activacion' : 'inactivacion'}`)
  )
}

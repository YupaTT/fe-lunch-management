import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { api, type ApiResponse } from '@/api/client'
import {
  type FiltrosReporte,
  type ReporteAsistencia,
  type ReportePlanilla,
} from './schema'

export type TipoReporte = 'asistencia' | 'planilla'

function useReporte<T>(
  tipo: TipoReporte,
  filtros: FiltrosReporte,
  enabled: boolean
) {
  return useQuery({
    queryKey: ['reportes', tipo, filtros],
    enabled,
    queryFn: async ({ signal }) => {
      const { data } = await api.get<ApiResponse<T>>(`/reportes/${tipo}`, {
        params: filtros,
        signal,
      })
      return data.datos
    },
    placeholderData: keepPreviousData,
  })
}

export function useReporteAsistencia(filtros: FiltrosReporte, enabled = true) {
  return useReporte<ReporteAsistencia>('asistencia', filtros, enabled)
}

export function useReportePlanilla(filtros: FiltrosReporte, enabled = true) {
  return useReporte<ReportePlanilla>('planilla', filtros, enabled)
}

// El PDF requiere el token, así que se descarga con axios y se abre como blob
export function useAbrirPdf() {
  return useMutation({
    mutationFn: async ({
      tipo,
      filtros,
    }: {
      tipo: TipoReporte
      filtros: FiltrosReporte
    }) => {
      const { data } = await api.get<Blob>(`/reportes/${tipo}/pdf`, {
        params: filtros,
        responseType: 'blob',
      })
      const url = URL.createObjectURL(data)
      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = `${tipo}-${filtros.desde}-${filtros.hasta}.pdf`
      enlace.click()
      URL.revokeObjectURL(url)
    },
  })
}

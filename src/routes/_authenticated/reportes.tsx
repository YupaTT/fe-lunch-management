import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Rol, requireRoles } from '@/features/auth/roles'
import { Reportes } from '@/features/reportes'

// El rango vive en la URL para poder compartir o recargar el reporte
const reportesSearchSchema = z.object({
  tipo: z.enum(['asistencia', 'planilla']).optional().catch('asistencia'),
  desde: z.string().optional().catch(undefined),
  hasta: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/reportes')({
  validateSearch: reportesSearchSchema,
  beforeLoad: requireRoles(Rol.ADMINISTRADOR, Rol.ENCARGADO),
  component: Reportes,
})

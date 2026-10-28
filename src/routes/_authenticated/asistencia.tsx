import { createFileRoute } from '@tanstack/react-router'
import { MisAsistencias } from '@/features/asistencia'
import { Rol, requireRoles } from '@/features/auth/roles'

export const Route = createFileRoute('/_authenticated/asistencia')({
  beforeLoad: requireRoles(Rol.EMPLEADO),
  component: MisAsistencias,
})

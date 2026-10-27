import { createFileRoute } from '@tanstack/react-router'
import { Rol, requireRoles } from '@/features/auth/roles'
import { PaginaPension } from '@/features/pension'

export const Route = createFileRoute('/_authenticated/pension')({
  beforeLoad: requireRoles(Rol.EMPLEADO, Rol.ADMINISTRADOR, Rol.ENCARGADO),
  component: PaginaPension,
})

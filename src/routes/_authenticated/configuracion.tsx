import { createFileRoute } from '@tanstack/react-router'
import { Rol, requireRoles } from '@/features/auth/roles'
import { Configuracion } from '@/features/configuracion'

export const Route = createFileRoute('/_authenticated/configuracion')({
  beforeLoad: requireRoles(Rol.ADMINISTRADOR),
  component: Configuracion,
})

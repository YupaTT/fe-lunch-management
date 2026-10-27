import { createFileRoute } from '@tanstack/react-router'
import { Rol, requireRoles } from '@/features/auth/roles'
import { MenuDelDia } from '@/features/menu'

export const Route = createFileRoute('/_authenticated/menu')({
  beforeLoad: requireRoles(Rol.ADMINISTRADOR),
  component: MenuDelDia,
})

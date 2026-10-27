import { createFileRoute } from '@tanstack/react-router'
import { Rol, requireRoles } from '@/features/auth/roles'
import { ListaIngreso } from '@/features/ingresos'

export const Route = createFileRoute('/_authenticated/ingresos')({
  beforeLoad: requireRoles(Rol.ADMINISTRADOR, Rol.ENCARGADO),
  component: ListaIngreso,
})

import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Rol, requireRoles } from '@/features/auth/roles'
import { Users } from '@/features/users'

const usersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filtro: z.string().optional().catch(''),
  rol: z.array(z.string()).optional().catch([]),
  estado: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/users/')({
  validateSearch: usersSearchSchema,
  beforeLoad: requireRoles(Rol.ADMINISTRADOR, Rol.ENCARGADO),
  component: Users,
})

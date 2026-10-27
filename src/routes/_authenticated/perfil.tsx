import { createFileRoute } from '@tanstack/react-router'
import { Perfil } from '@/features/account/perfil'

export const Route = createFileRoute('/_authenticated/perfil')({
  component: Perfil,
})

import { createFileRoute } from '@tanstack/react-router'
import { ChangePassword } from '@/features/account/change-password'

export const Route = createFileRoute('/_authenticated/cuenta/contrasena')({
  component: ChangePassword,
})

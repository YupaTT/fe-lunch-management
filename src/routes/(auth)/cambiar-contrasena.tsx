import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { ForcedChangePassword } from '@/features/account/forced-change-password'

// Fuera del layout autenticado: no tiene menú ni navegación
export const Route = createFileRoute('/(auth)/cambiar-contrasena')({
  beforeLoad: () => {
    const { accessToken, user } = useAuthStore.getState().auth
    if (!accessToken) throw redirect({ to: '/sign-in' })
    if (!user?.requiereCambioContrasena) throw redirect({ to: '/' })
  },
  component: ForcedChangePassword,
})

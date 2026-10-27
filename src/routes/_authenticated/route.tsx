import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const { accessToken, user } = useAuthStore.getState().auth
    if (!accessToken) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }
    // El backend bloquea la API hasta que se cambie la contraseña temporal
    if (user?.requiereCambioContrasena) {
      throw redirect({ to: '/cambiar-contrasena' })
    }
  },
  component: AuthenticatedLayout,
})

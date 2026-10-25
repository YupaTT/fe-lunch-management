import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

const CHANGE_PASSWORD_PATH = '/cuenta/contrasena'

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
    if (
      user?.requiereCambioContrasena &&
      location.pathname !== CHANGE_PASSWORD_PATH
    ) {
      throw redirect({ to: CHANGE_PASSWORD_PATH })
    }
  },
  component: AuthenticatedLayout,
})

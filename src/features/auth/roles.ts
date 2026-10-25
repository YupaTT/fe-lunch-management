import { redirect } from '@tanstack/react-router'
import { type AuthUser, useAuthStore } from '@/stores/auth-store'

export const Rol = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  ENCARGADO: 'ENCARGADO',
  EMPLEADO: 'EMPLEADO',
} as const

export type RolNombre = (typeof Rol)[keyof typeof Rol]

export function hasRole(user: AuthUser | null, roles?: readonly RolNombre[]) {
  if (!roles?.length) return true
  return !!user && roles.includes(user.rol as RolNombre)
}

export function useHasRole(...roles: RolNombre[]) {
  const user = useAuthStore((state) => state.auth.user)
  return hasRole(user, roles)
}

// Para usar en beforeLoad de rutas restringidas por rol
export function requireRoles(...roles: RolNombre[]) {
  return () => {
    if (!hasRole(useAuthStore.getState().auth.user, roles)) {
      throw redirect({ to: '/403' })
    }
  }
}

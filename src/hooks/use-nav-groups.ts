import { useAuthStore } from '@/stores/auth-store'
import { sidebarData } from '@/components/layout/data/sidebar-data'
import { type NavGroup } from '@/components/layout/types'
import { hasRole } from '@/features/auth/roles'

// Navegación visible para el rol del usuario autenticado
export function useNavGroups(): NavGroup[] {
  const user = useAuthStore((state) => state.auth.user)

  return sidebarData.navGroups
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => hasRole(user, item.roles))
        .map((item) =>
          item.items
            ? {
                ...item,
                items: item.items.filter((sub) => hasRole(user, sub.roles)),
              }
            : item
        ),
    }))
    .filter((group) => group.items.length > 0)
}

import { Link } from '@tanstack/react-router'
import { DoorOpen } from 'lucide-react'
import { getUserDisplayName, useAuthStore } from '@/stores/auth-store'
import { useNavGroups } from '@/hooks/use-nav-groups'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { Rol, useHasRole } from '@/features/auth/roles'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

export function AppSidebar() {
  const user = useAuthStore((state) => state.auth.user)
  const navGroups = useNavGroups()
  const { setOpenMobile } = useSidebar()
  const puedeRegistrarIngreso = useHasRole(Rol.ADMINISTRADOR, Rol.ENCARGADO)
  return (
    <Sidebar collapsible='icon' variant='floating'>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {puedeRegistrarIngreso && (
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip='Registrar ingreso'
                  className='justify-center bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground'
                >
                  <Link to='/ingresos' onClick={() => setOpenMobile(false)}>
                    <DoorOpen />
                    <span className='font-semibold'>Registrar ingreso</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
        {navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={
            user
              ? { name: getUserDisplayName(user), email: user.rol, avatar: '' }
              : sidebarData.user
          }
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

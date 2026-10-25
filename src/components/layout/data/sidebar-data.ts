import {
  Bug,
  HelpCircle,
  KeyRound,
  LayoutDashboard,
  ListTodo,
  MessagesSquare,
  Package,
  Settings,
  SlidersHorizontal,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import { Rol } from '@/features/auth/roles'
import { type NavGroup, type SidebarData } from '../types'

const demoGroup: NavGroup = {
  title: 'Plantilla (demo)',
  items: [
    { title: 'Tasks', url: '/tasks', icon: ListTodo },
    { title: 'Apps', url: '/apps', icon: Package },
    { title: 'Chats', url: '/chats', icon: MessagesSquare },
    { title: 'Settings', url: '/settings', icon: Settings },
    { title: 'Errors', url: '/errors/not-found', icon: Bug },
    { title: 'Help Center', url: '/help-center', icon: HelpCircle },
  ],
}

export const sidebarData: SidebarData = {
  user: {
    name: '',
    email: '',
    avatar: '',
  },
  teams: [
    {
      name: 'Gestión de Almuerzos',
      logo: UtensilsCrossed,
      plan: 'Restaurante institucional',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [{ title: 'Inicio', url: '/', icon: LayoutDashboard }],
    },
    {
      title: 'Administración',
      items: [
        {
          title: 'Empleados',
          url: '/users',
          icon: Users,
          roles: [Rol.ADMINISTRADOR, Rol.ENCARGADO],
        },
        {
          title: 'Configuración',
          url: '/configuracion',
          icon: SlidersHorizontal,
          roles: [Rol.ADMINISTRADOR],
        },
      ],
    },
    {
      title: 'Mi cuenta',
      items: [
        {
          title: 'Cambiar contraseña',
          url: '/cuenta/contrasena',
          icon: KeyRound,
        },
      ],
    },
    ...(import.meta.env.DEV ? [demoGroup] : []),
  ],
}

import {
  CalendarDays,
  ChartColumn,
  ClipboardCheck,
  KeyRound,
  LayoutDashboard,
  Receipt,
  SlidersHorizontal,
  UserRound,
  Users,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react'
import { Rol } from '@/features/auth/roles'
import { type SidebarData } from '../types'

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
      items: [
        { title: 'Inicio', url: '/', icon: LayoutDashboard },
        {
          title: 'Mi pensión',
          url: '/pension',
          icon: Wallet,
          roles: [Rol.EMPLEADO],
        },
      ],
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
          title: 'Menú del día',
          url: '/menu',
          icon: CalendarDays,
          roles: [Rol.ADMINISTRADOR],
        },
        {
          title: 'Lista de ingreso',
          url: '/ingresos',
          icon: ClipboardCheck,
          roles: [Rol.ADMINISTRADOR, Rol.ENCARGADO],
        },
        {
          title: 'Pensiones',
          url: '/pension',
          icon: Receipt,
          roles: [Rol.ADMINISTRADOR, Rol.ENCARGADO],
        },
        {
          title: 'Reportes',
          url: '/reportes',
          icon: ChartColumn,
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
          title: 'Mi perfil',
          url: '/perfil',
          icon: UserRound,
        },
        {
          title: 'Cambiar contraseña',
          url: '/cuenta/contrasena',
          icon: KeyRound,
        },
      ],
    },
  ],
}

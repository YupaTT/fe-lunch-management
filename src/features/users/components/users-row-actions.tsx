import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { KeyRound, Power, PowerOff, UserPen, Users } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Rol } from '@/features/auth/roles'
import { type Usuario } from '../data/schema'
import { useUsers } from './users-provider'

export function UsersRowActions({ row }: { row: Row<Usuario> }) {
  const { setOpen, setCurrentRow } = useUsers()
  const currentUserId = useAuthStore((state) => state.auth.user?.id)
  const usuario = row.original
  const isSelf = usuario.id === currentUserId
  const isInactive = usuario.estado === 'INACTIVO'
  const isEmpleado = usuario.usuarioRol.some(
    ({ rol }) => rol.rol === Rol.EMPLEADO
  )

  const openDialog = (type: Parameters<typeof setOpen>[0]) => {
    setCurrentRow(usuario)
    setOpen(type)
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='size-8 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon />
          <span className='sr-only'>Abrir acciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-52'>
        <DropdownMenuItem onClick={() => openDialog('edit')}>
          <UserPen />
          Editar
        </DropdownMenuItem>
        {isEmpleado && (
          <DropdownMenuItem onClick={() => openDialog('familiares')}>
            <Users />
            Familiares
          </DropdownMenuItem>
        )}
        {!isInactive && (
          <DropdownMenuItem onClick={() => openDialog('restore-password')}>
            <KeyRound />
            Restablecer contraseña
          </DropdownMenuItem>
        )}
        {!isSelf && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant={isInactive ? 'default' : 'destructive'}
              onClick={() => openDialog('toggle-status')}
            >
              {isInactive ? <Power /> : <PowerOff />}
              {isInactive ? 'Activar' : 'Desactivar'}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

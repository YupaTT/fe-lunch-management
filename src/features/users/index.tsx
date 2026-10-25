import { getRouteApi } from '@tanstack/react-router'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/layout/page-header'
import { Rol, useHasRole } from '@/features/auth/roles'
import { UsersDialogs } from './components/users-dialogs'
import { UsersProvider, useUsers } from './components/users-provider'
import { UsersTable } from './components/users-table'

const route = getRouteApi('/_authenticated/users/')

function CreateUserButton() {
  const { setOpen } = useUsers()
  return (
    <Button onClick={() => setOpen('create')}>
      <UserPlus />
      Registrar empleado
    </Button>
  )
}

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const canManage = useHasRole(Rol.ADMINISTRADOR)

  return (
    <UsersProvider>
      <AppHeader fixed />

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PageHeader
          title='Empleados'
          description='Empleados registrados, su rol y sus familiares.'
          actions={canManage && <CreateUserButton />}
        />
        <UsersTable search={search} navigate={navigate} />
      </Main>

      {canManage && <UsersDialogs />}
    </UsersProvider>
  )
}

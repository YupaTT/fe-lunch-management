import { Rol, useHasRole } from '@/features/auth/roles'
import { MiPension } from './mi-pension'
import { Pensiones } from './pensiones'

// El empleado gestiona la pensión de su hogar; administración ve la de todos
export function PaginaPension() {
  const esEmpleado = useHasRole(Rol.EMPLEADO)
  return esEmpleado ? <MiPension /> : <Pensiones />
}

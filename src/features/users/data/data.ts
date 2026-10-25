import { type UsuarioEstado } from './schema'

export const estadoStyles = new Map<UsuarioEstado, string>([
  ['ACTIVO', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['INACTIVO', 'bg-neutral-300/40 border-neutral-300'],
  ['PENDIENTE', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
])

export const estadoLabels: Record<UsuarioEstado, string> = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
  PENDIENTE: 'Pendiente',
}

export const estadoOptions = Object.entries(estadoLabels).map(
  ([value, label]) => ({ value, label })
)

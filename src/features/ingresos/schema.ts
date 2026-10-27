import { type Parentesco } from '@/features/familiares/schema'
import { type EstadoReserva } from '@/features/reservas/schema'

export type Ingreso = {
  id: string
  idPersona: string
  nombres: string
  primerApellido: string | null
  segundoApellido: string | null
  parentesco: Parentesco | null
  titular: {
    idUsuario: string
    nombres: string
    primerApellido: string | null
    segundoApellido: string | null
  }
  modalidad: 'POR_DIA' | 'PENSION'
  estado: EstadoReserva
  fechaIngreso: string | null
}

export type ListaIngreso = {
  fecha: string
  totalRaciones: number
  ingresaron: { total: number; filas: Ingreso[] }
  faltan: { total: number; filas: Ingreso[] }
}

export const modalidadLabels: Record<Ingreso['modalidad'], string> = {
  POR_DIA: 'Por día',
  PENSION: 'Pensión',
}

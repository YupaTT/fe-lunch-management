import { type Parentesco } from '@/features/familiares/schema'

export type EstadoReserva = 'RESERVADO' | 'CANCELADO' | 'ASISTIO' | 'NO_ASISTIO'

export const estadoReservaLabels: Record<EstadoReserva, string> = {
  RESERVADO: 'Reservado',
  CANCELADO: 'Cancelado',
  ASISTIO: 'Asistió',
  NO_ASISTIO: 'No asistió',
}

export type Reserva = {
  id: string
  fecha: string
  idPersona: string
  nombres: string
  primerApellido: string | null
  segundoApellido: string | null
  parentesco: Parentesco | null
  modalidad: 'POR_DIA' | 'PENSION'
  estado: EstadoReserva
  precio: string
  // Hora de ingreso; el backend aún no la incluye en GET /reservas
  fechaIngreso?: string | null
}

// Persona por la que el titular puede reservar: él mismo (parentesco null) o un familiar activo
export type Beneficiario = {
  idPersona: string
  parentesco: Parentesco | null
  nombres: string
  primerApellido: string | null
  segundoApellido: string | null
}
